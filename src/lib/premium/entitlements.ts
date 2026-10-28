import { z } from 'zod';

/**
 * FASE 10 — Roles, Entitlements y Control de Acceso.
 *
 * REGLAS INVIOLABLES DE NEGOCIO:
 * 1. El módulo menstrual básico (`menstrual_basico`) es SIEMPRE GRATIS.
 * 2. La exportación total de datos (`exportar_datos`) y borrado (`borrar_datos`) son SIEMPRE GRATIS.
 * 3. Las calculadoras de salud básicas son SIEMPRE GRATIS.
 * 4. La validación de permisos de acceso a contenido premium se ejecuta SIEMPRE
 *    en el backend (nunca solo ocultando botones en la interfaz).
 */

export const rolUsuarioSchema = z.enum(['invitado', 'usuario', 'premium', 'admin']);
export type RolUsuario = z.infer<typeof rolUsuarioSchema>;

export const planSuscripcionSchema = z.enum(['gratis', 'mensual', 'anual', 'vitalicio']);
export type PlanSuscripcion = z.infer<typeof planSuscripcionSchema>;

export const recursoAppSchema = z.enum([
  // Recursos siempre gratuitos (garantizados por diseño)
  'menstrual_basico',
  'exportar_datos',
  'borrar_datos',
  'calculadoras_salud',
  'entrenamientos_basicos',
  'recetas_basicas',
  'progreso_basico',
  // Recursos premium (sujetos a suscripción o rol admin)
  'entrenamientos_premium',
  'recetas_avanzadas',
  'plan_nutricion_personalizado',
  'analitica_avanzada',
  // Recursos exclusivos de administración
  'panel_administracion',
  'gestion_usuarios',
]);
export type RecursoApp = z.infer<typeof recursoAppSchema>;

export interface TokenClaims {
  sub: string;             // ID de usuario
  email?: string;
  rol: RolUsuario;
  plan: PlanSuscripcion;
  expiraEpochSegundos: number; // UNIX timestamp
  entitlementsActivos?: RecursoApp[];
}

export interface ResultadoPermiso {
  permitido: boolean;
  codigo: 'OK' | 'NO_AUTORIZADO' | 'TOKEN_EXPIRADO' | 'REQUIERE_PREMIUM' | 'REQUIERE_ADMIN';
  motivo: string;
}

/**
 * Conjunto de recursos que son incondicionalmente gratuitos por principios del proyecto.
 */
export const RECURSOS_SIEMPRE_GRATIS: ReadonlySet<RecursoApp> = new Set([
  'menstrual_basico',
  'exportar_datos',
  'borrar_datos',
  'calculadoras_salud',
  'entrenamientos_basicos',
  'recetas_basicas',
  'progreso_basico',
]);

/**
 * Verifica si un usuario tiene acceso a un recurso según su rol y plan en el cliente.
 * Se usa para adaptar la UI (mostrar insignias premium, invitar a suscripción, etc.).
 */
export function tieneAcceso(rol: RolUsuario, plan: PlanSuscripcion, recurso: RecursoApp): boolean {
  // 1. Recursos gratuitos universales: siempre permitidos
  if (RECURSOS_SIEMPRE_GRATIS.has(recurso)) {
    return true;
  }

  // 2. Administrador: acceso total a todo
  if (rol === 'admin') {
    return true;
  }

  // 3. Recursos exclusivos de admin
  if (recurso === 'panel_administracion' || recurso === 'gestion_usuarios') {
    return false;
  }

  // 4. Recursos premium: requiere rol premium o plan activo no gratuito
  const tienePlanPremium = plan === 'mensual' || plan === 'anual' || plan === 'vitalicio';
  const esUsuarioPremium = rol === 'premium';

  return tienePlanPremium || esUsuarioPremium;
}

/**
 * Genera el mapa completo de entitlements para un usuario dado.
 */
export function obtenerMatrizEntitlements(
  rol: RolUsuario,
  plan: PlanSuscripcion
): Record<RecursoApp, boolean> {
  const recursos = recursoAppSchema.options;
  const mapa = {} as Record<RecursoApp, boolean>;
  for (const recurso of recursos) {
    mapa[recurso] = tieneAcceso(rol, plan, recurso);
  }
  return mapa;
}

/**
 * Contrato de validación del lado servidor (Backend Worker / API).
 *
 * Esta función modela y verifica la regla estricta de seguridad:
 * NINGÚN cliente puede acceder a un recurso premium o protegido sin que el servidor
 * verifique la firma, expiración y claims del token antes de entregar el payload.
 */
export function validarPermisoServidor(
  claims: TokenClaims | null | undefined,
  recurso: RecursoApp,
  ahoraEpochSegundos: number = Math.floor(Date.now() / 1000)
): ResultadoPermiso {
  // 1. REGLA DURA: Las funciones básicas esenciales y derechos de datos son siempre gratis
  if (RECURSOS_SIEMPRE_GRATIS.has(recurso)) {
    return {
      permitido: true,
      codigo: 'OK',
      motivo: 'Recurso de libre acceso garantizado.',
    };
  }

  // 2. Para recursos protegidos se requiere un token válido
  if (!claims) {
    return {
      permitido: false,
      codigo: 'NO_AUTORIZADO',
      motivo: 'Autenticación requerida para acceder a este recurso.',
    };
  }

  // 3. Verificar expiración del token
  if (claims.expiraEpochSegundos <= ahoraEpochSegundos) {
    return {
      permitido: false,
      codigo: 'TOKEN_EXPIRADO',
      motivo: 'El token de sesión ha expirado. Por favor inicie sesión nuevamente.',
    };
  }

  // 4. Recursos de administración
  if (recurso === 'panel_administracion' || recurso === 'gestion_usuarios') {
    if (claims.rol === 'admin') {
      return { permitido: true, codigo: 'OK', motivo: 'Autorizado como administrador.' };
    }
    return {
      permitido: false,
      codigo: 'REQUIERE_ADMIN',
      motivo: 'Permisos insuficientes. Requiere rol de administrador.',
    };
  }

  // 5. Recursos premium
  const tienePlanPremium =
    claims.plan === 'mensual' || claims.plan === 'anual' || claims.plan === 'vitalicio';
  const esRolPremium = claims.rol === 'premium' || claims.rol === 'admin';

  if (esRolPremium || tienePlanPremium) {
    return {
      permitido: true,
      codigo: 'OK',
      motivo: 'Autorizado con suscripción premium activa.',
    };
  }

  return {
    permitido: false,
    codigo: 'REQUIERE_PREMIUM',
    motivo: 'Este recurso requiere una membresía TOTALHIIT Premium activa.',
  };
}
