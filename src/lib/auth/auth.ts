import { z } from 'zod';
import { rolUsuarioSchema, planSuscripcionSchema, type RolUsuario, type PlanSuscripcion } from '../premium/entitlements';

/**
 * FASE 10 — Servicio de Autenticación, Sesión e Identidad.
 *
 * Principios:
 * 1. Offline-first: Si no hay usuario autenticado, la app corre en modo "invitado"
 *    usando el almacenamiento IndexedDB local sin bloquear ninguna función básica.
 * 2. Roles estrictos: 'invitado', 'usuario', 'premium', 'admin'.
 * 3. Seguridad: Las contraseñas exigen complejidad mínima (mín. 8 caracteres, número o símbolo).
 * 4. Almacenamiento seguro de sesión local.
 */

export const LLAVE_ALMACEN_SESION = 'totalhiit.auth.sesion';

export const credencialesLoginSchema = z.object({
  email: z.string().email('Debe ser un correo electrónico válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});
export type CredencialesLogin = z.infer<typeof credencialesLoginSchema>;

export const credencialesRegistroSchema = z.object({
  email: z.string().email('Debe ser un correo electrónico válido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[0-9!@#$%^&*]/, 'Debe contener al menos un número o símbolo'),
  alias: z.string().min(2, 'El alias debe tener al menos 2 caracteres'),
});
export type CredencialesRegistro = z.infer<typeof credencialesRegistroSchema>;

export const sesionAuthSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email().optional(),
  alias: z.string().min(1),
  rol: rolUsuarioSchema,
  plan: planSuscripcionSchema,
  token: z.string().min(1),
  expiraEpochSegundos: z.number().int(),
  syncHabilitado: z.boolean(),
  ultimoSyncAt: z.string().nullable().optional(),
});
export type SesionAuth = z.infer<typeof sesionAuthSchema>;

export interface AlmacenSesion {
  getItem(clave: string): string | null;
  setItem(clave: string, valor: string): void;
  removeItem(clave: string): void;
}

function resolverAlmacen(): AlmacenSesion | undefined {
  try {
    if (typeof localStorage !== 'undefined' && localStorage) return localStorage;
  } catch {
    return undefined;
  }
  return undefined;
}

/**
 * Crea una sesión por defecto para modo Invitado (offline-first local).
 */
export function crearSesionInvitado(userId: string = 'usuario-local-principal'): SesionAuth {
  return {
    userId,
    alias: 'Invitada',
    rol: 'invitado',
    plan: 'gratis',
    token: `guest_${userId}`,
    expiraEpochSegundos: Math.floor(Date.now() / 1000) + 365 * 24 * 3600, // 1 año
    syncHabilitado: false,
    ultimoSyncAt: null,
  };
}

/**
 * Verifica si una sesión sigue vigente por tiempo.
 */
export function esSesionValida(
  sesion: SesionAuth | null | undefined,
  ahoraEpoch: number = Math.floor(Date.now() / 1000)
): boolean {
  if (!sesion) return false;
  return sesion.expiraEpochSegundos > ahoraEpoch;
}

/**
 * Obtiene la sesión actual persistida, o devuelve la sesión de Invitado si no hay sesión activa.
 */
export function obtenerSesionActual(almacen?: AlmacenSesion): SesionAuth {
  const dest = almacen ?? resolverAlmacen();
  if (!dest) return crearSesionInvitado();

  const crudo = dest.getItem(LLAVE_ALMACEN_SESION);
  if (!crudo) return crearSesionInvitado();

  try {
    const parseado = JSON.parse(crudo);
    const validado = sesionAuthSchema.parse(parseado);
    if (!esSesionValida(validado)) {
      dest.removeItem(LLAVE_ALMACEN_SESION);
      return crearSesionInvitado();
    }
    return validado;
  } catch {
    dest.removeItem(LLAVE_ALMACEN_SESION);
    return crearSesionInvitado();
  }
}

/**
 * Guarda una sesión validada en el almacenamiento persistente.
 */
export function guardarSesion(sesion: SesionAuth, almacen?: AlmacenSesion): void {
  const dest = almacen ?? resolverAlmacen();
  if (!dest) return;
  const validada = sesionAuthSchema.parse(sesion);
  dest.setItem(LLAVE_ALMACEN_SESION, JSON.stringify(validada));
}

/**
 * Cierra la sesión activa y restaura el modo Invitado local.
 */
export function cerrarSesion(almacen?: AlmacenSesion): SesionAuth {
  const dest = almacen ?? resolverAlmacen();
  dest?.removeItem(LLAVE_ALMACEN_SESION);
  return crearSesionInvitado();
}

/**
 * Genera un token y sesión estructurados para respuestas de autenticación.
 */
export function crearSesionUsuario(
  params: {
    userId: string;
    email: string;
    alias: string;
    rol?: RolUsuario;
    plan?: PlanSuscripcion;
    duracionHoras?: number;
    syncHabilitado?: boolean;
  }
): SesionAuth {
  const duracion = params.duracionHoras ?? 24 * 7; // 7 días por defecto
  const expiraEpochSegundos = Math.floor(Date.now() / 1000) + duracion * 3600;

  return {
    userId: params.userId,
    email: params.email,
    alias: params.alias,
    rol: params.rol ?? 'usuario',
    plan: params.plan ?? 'gratis',
    token: `th_${params.userId}_${Date.now()}`,
    expiraEpochSegundos,
    syncHabilitado: params.syncHabilitado ?? true,
    ultimoSyncAt: null,
  };
}
