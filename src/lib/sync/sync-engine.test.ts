import { describe, it, expect } from 'vitest';
import {
  MotorSincronizacion,
  resolverConflictoLWW,
  validarSeguridadRegistro,
  type RegistroSincronizable,
  type AdaptadorServidorSync,
  type PaqueteSincronizacion,
} from './sync-engine';
import { cifrarConPin } from '../seguridad/pin-crypto';

describe('FASE 10 — Motor de Sincronización Local-First (Sync Engine)', () => {
  describe('Resolución de conflictos Last-Write-Wins (LWW)', () => {
    it('el registro remoto gana si su updatedAt es mayor', () => {
      const local: RegistroSincronizable = {
        id: 'peso_01',
        userId: 'usr_1',
        tipo: 'entradaDiario',
        datos: { pesoKg: 65.5 },
        updatedAt: 1000,
      };

      const remoto: RegistroSincronizable = {
        id: 'peso_01',
        userId: 'usr_1',
        tipo: 'entradaDiario',
        datos: { pesoKg: 65.0 },
        updatedAt: 2000, // Más reciente
      };

      const { ganador, origenGanador } = resolverConflictoLWW(local, remoto);
      expect(origenGanador).toBe('remoto');
      expect(ganador.datos).toEqual({ pesoKg: 65.0 });
    });

    it('el registro local gana si su updatedAt es mayor o igual', () => {
      const local: RegistroSincronizable = {
        id: 'meta_01',
        userId: 'usr_1',
        tipo: 'meta',
        datos: { objetivo: 'fuerza_resistencia' },
        updatedAt: 3000, // Más reciente
      };

      const remoto: RegistroSincronizable = {
        id: 'meta_01',
        userId: 'usr_1',
        tipo: 'meta',
        datos: { objetivo: 'salud_general' },
        updatedAt: 2500,
      };

      const { ganador, origenGanador } = resolverConflictoLWW(local, remoto);
      expect(origenGanador).toBe('local');
      expect(ganador.datos).toEqual({ objetivo: 'fuerza_resistencia' });
    });
  });

  describe('Aislamiento de seguridad y privacidad en datos íntimos', () => {
    it('rechaza sincronizar un registro de ciclo con datos en claro (violación de seguridad)', () => {
      const registroInseguro: RegistroSincronizable = {
        id: 'ciclo_01',
        userId: 'usr_1',
        tipo: 'cicloCifrado',
        datos: {
          flujo: 'abundante',
          sintomas: ['colicos'], // En claro -> debe fallar
        },
        updatedAt: Date.now(),
      };

      expect(() => validarSeguridadRegistro(registroInseguro)).toThrow(
        /Violación de seguridad: El registro íntimo/
      );
    });

    it('permite sincronizar un registro de ciclo protegido con sobre Zero-Knowledge', async () => {
      const sobre = await cifrarConPin('miPinSecreto123', {
        flujo: 'ligero',
        sintomas: ['fatiga'],
      });

      const registroSeguro: RegistroSincronizable = {
        id: 'ciclo_02',
        userId: 'usr_1',
        tipo: 'cicloCifrado',
        datos: {
          salt: sobre.salt,
          iv: sobre.iv,
          ciphertext: sobre.ciphertext,
        },
        updatedAt: Date.now(),
      };

      expect(() => validarSeguridadRegistro(registroSeguro)).not.toThrow();
    });
  });

  describe('Ciclo completo de sincronización cliente-servidor', () => {
    it('encola cambios offline, los envía y actualiza el timestamp del sync', async () => {
      const motor = new MotorSincronizacion();

      // Guardamos dos cambios locales offline
      motor.guardarLocal({
        id: 'perfil_01',
        userId: 'usr_valeria',
        tipo: 'perfil',
        datos: { alias: 'Valeria', pesoKg: 62 },
        updatedAt: 1000,
      });

      motor.guardarLocal({
        id: 'sesion_01',
        userId: 'usr_valeria',
        tipo: 'sesion',
        datos: { workoutId: 'sesion-01-activacion', completado: true },
        updatedAt: 1010,
      });

      expect(motor.obtenerLongitudCola()).toBe(2);

      // Adaptador simulado de servidor
      let paqueteRecibido: PaqueteSincronizacion | null = null;
      const servidorMock: AdaptadorServidorSync = {
        async sincronizar(paquete) {
          paqueteRecibido = paquete;
          return {
            servidorTimestamp: 2000,
            cambiosRemotos: [
              {
                id: 'perfil_01',
                userId: 'usr_valeria',
                tipo: 'perfil',
                datos: { alias: 'Valeria M.', pesoKg: 62 },
                updatedAt: 1500, // Servidor tiene versión más reciente de alias
              },
            ],
            aplicadosConExito: 2,
            conflictosLWW: 1,
          };
        },
      };

      const resultado = await motor.sincronizar('usr_valeria', servidorMock);

      expect(resultado.servidorTimestamp).toBe(2000);
      expect((paqueteRecibido as PaqueteSincronizacion | null)?.cambiosLocales.length).toBe(2);
      expect(motor.obtenerLongitudCola()).toBe(0); // Cola vaciada tras confirmación
      expect(motor.getUltimoSyncTimestamp()).toBe(2000);

      // Debe haber aplicado el cambio remoto de perfil_01 por LWW (updatedAt 1500 > 1000)
      const perfilActualizado = motor.obtenerLocal('perfil_01');
      expect(perfilActualizado?.datos.alias).toBe('Valeria M.');
    });

    it('procesa soft deletes (lápidas) correctamente', () => {
      const motor = new MotorSincronizacion();

      motor.guardarLocal({
        id: 'plan_01',
        userId: 'usr_1',
        tipo: 'plan',
        datos: { semanaInicio: '2026-10-26' },
        updatedAt: 1000,
      });

      expect(motor.listarLocalesActivos().length).toBe(1);

      motor.eliminarLocal('plan_01', 'usr_1', 'plan');

      const registro = motor.obtenerLocal('plan_01');
      expect(registro?.borrado).toBe(true);
      expect(motor.listarLocalesActivos().length).toBe(0);
      expect(motor.obtenerLongitudCola()).toBe(1); // Encolado para propagar al servidor
    });
  });
});
