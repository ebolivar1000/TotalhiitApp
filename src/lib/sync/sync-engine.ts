import { z } from 'zod';
import type { SobrePinCifrado } from '../seguridad/pin-crypto';

/**
 * FASE 10 — Motor de Sincronización Local-First (Sync Engine).
 *
 * Principios:
 * 1. Local-First: La app opera primordialmente con IndexedDB local.
 * 2. Resolución de conflictos: Last-Write-Wins (LWW) basada en timestamps `updatedAt`.
 * 3. Soft deletes (lápidas): Permite propagar eliminaciones de registros entre dispositivos.
 * 4. Aislamiento de datos íntimos: Los registros de ciclo menstrual NUNCA se sincronizan
 *    en claro. Si se sincronizan, DEBEN estar en un sobre cifrado con PIN (Zero-Knowledge).
 * 5. Cola offline: Cambios producidos sin conexión se encolan para su envío posterior.
 */

export const tipoEntidadSyncSchema = z.enum([
  'perfil',
  'meta',
  'preferencias',
  'entradaDiario',
  'sesion',
  'plan',
  'preparacion',
  'cicloCifrado',
]);
export type TipoEntidadSync = z.infer<typeof tipoEntidadSyncSchema>;

export interface RegistroSincronizable {
  id: string;
  userId: string;
  tipo: TipoEntidadSync;
  datos: Record<string, unknown>;
  updatedAt: number; // Timestamp epoch ms
  borrado?: boolean;  // Soft delete tombstone
}

export interface PaqueteSincronizacion {
  userId: string;
  desdeTimestamp: number;
  cambiosLocales: RegistroSincronizable[];
}

export interface RespuestaSincronizacion {
  servidorTimestamp: number;
  cambiosRemotos: RegistroSincronizable[];
  aplicadosConExito: number;
  conflictosLWW: number;
}

export interface AdaptadorServidorSync {
  sincronizar(paquete: PaqueteSincronizacion): Promise<RespuestaSincronizacion>;
}

/**
 * Valida que un registro de ciclo no contenga texto en claro antes de sincronizar.
 * Garantiza cumplimiento estricto del modelo de amenazas (FASE 10).
 */
export function validarSeguridadRegistro(registro: RegistroSincronizable): void {
  if (registro.tipo === 'cicloCifrado') {
    const d = registro.datos as unknown as Partial<SobrePinCifrado>;
    const esSobreValido =
      typeof d.salt === 'string' &&
      typeof d.iv === 'string' &&
      typeof d.ciphertext === 'string';

    if (!esSobreValido) {
      throw new Error(
        `Violación de seguridad: El registro íntimo ${registro.id} no cuenta con cifrado Zero-Knowledge con PIN.`
      );
    }
  }
}

/**
 * Resuelve conflictos entre versión local y remota usando Last-Write-Wins (LWW).
 * Retorna el registro ganador.
 */
export function resolverConflictoLWW(
  local: RegistroSincronizable,
  remoto: RegistroSincronizable
): { ganador: RegistroSincronizable; origenGanador: 'local' | 'remoto' } {
  if (remoto.updatedAt > local.updatedAt) {
    return { ganador: remoto, origenGanador: 'remoto' };
  }
  return { ganador: local, origenGanador: 'local' };
}

/**
 * Motor de sincronización en memoria / cliente local.
 */
export class MotorSincronizacion {
  private colaOffline: Map<string, RegistroSincronizable> = new Map();
  private almacenLocal: Map<string, RegistroSincronizable> = new Map();
  private ultimoSyncTimestamp: number = 0;

  constructor(almacenInicial?: RegistroSincronizable[]) {
    if (almacenInicial) {
      for (const reg of almacenInicial) {
        this.almacenLocal.set(reg.id, reg);
      }
    }
  }

  /**
   * Registra o actualiza una entidad localmente y la añade a la cola offline de sincronización.
   */
  public guardarLocal(registro: RegistroSincronizable): void {
    validarSeguridadRegistro(registro);
    this.almacenLocal.set(registro.id, registro);
    this.colaOffline.set(registro.id, registro);
  }

  /**
   * Marca una entidad como eliminada localmente (soft delete).
   */
  public eliminarLocal(id: string, userId: string, tipo: TipoEntidadSync): void {
    const ahora = Date.now();
    const lapida: RegistroSincronizable = {
      id,
      userId,
      tipo,
      datos: {},
      updatedAt: ahora,
      borrado: true,
    };
    this.almacenLocal.set(id, lapida);
    this.colaOffline.set(id, lapida);
  }

  public obtenerLocal(id: string): RegistroSincronizable | undefined {
    return this.almacenLocal.get(id);
  }

  public listarLocalesActivos(): RegistroSincronizable[] {
    return Array.from(this.almacenLocal.values()).filter((r) => !r.borrado);
  }

  public obtenerLongitudCola(): number {
    return this.colaOffline.size;
  }

  public getUltimoSyncTimestamp(): number {
    return this.ultimoSyncTimestamp;
  }

  /**
   * Ejecuta el ciclo completo de sincronización con el backend:
   * 1. Prepara los cambios locales encolados.
   * 2. Envía el paquete al adaptador del servidor.
   * 3. Procesa las respuestas remotas aplicando Last-Write-Wins.
   * 4. Limpia la cola local de cambios confirmados.
   */
  public async sincronizar(
    userId: string,
    servidor: AdaptadorServidorSync
  ): Promise<RespuestaSincronizacion> {
    const cambiosLocales = Array.from(this.colaOffline.values());

    // Validar seguridad de cada cambio antes de enviar
    for (const cambio of cambiosLocales) {
      validarSeguridadRegistro(cambio);
    }

    const paquete: PaqueteSincronizacion = {
      userId,
      desdeTimestamp: this.ultimoSyncTimestamp,
      cambiosLocales,
    };

    const respuesta = await servidor.sincronizar(paquete);

    // Aplicar cambios remotos al almacenamiento local resolviendo conflictos
    for (const remoto of respuesta.cambiosRemotos) {
      const local = this.almacenLocal.get(remoto.id);
      if (!local) {
        this.almacenLocal.set(remoto.id, remoto);
      } else {
        const { ganador } = resolverConflictoLWW(local, remoto);
        this.almacenLocal.set(remoto.id, ganador);
      }
    }

    // Limpiar cola offline de los cambios locales confirmados
    for (const confirmado of cambiosLocales) {
      this.colaOffline.delete(confirmado.id);
    }

    this.ultimoSyncTimestamp = respuesta.servidorTimestamp;
    return respuesta;
  }
}
