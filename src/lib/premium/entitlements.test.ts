import { describe, it, expect } from 'vitest';
import {
  tieneAcceso,
  validarPermisoServidor,
  obtenerMatrizEntitlements,
  RECURSOS_SIEMPRE_GRATIS,
  type TokenClaims,
} from './entitlements';

describe('FASE 10 — Entitlements y Permisos del Servidor', () => {
  describe('Reglas de negocio universales (gratis garantizado)', () => {
    it('el módulo menstrual básico y la exportación de datos son SIEMPRE gratis para cualquier rol y plan', () => {
      // Caso: usuario invitado sin cuenta
      expect(tieneAcceso('invitado', 'gratis', 'menstrual_basico')).toBe(true);
      expect(tieneAcceso('invitado', 'gratis', 'exportar_datos')).toBe(true);
      expect(tieneAcceso('invitado', 'gratis', 'borrar_datos')).toBe(true);
      expect(tieneAcceso('invitado', 'gratis', 'calculadoras_salud')).toBe(true);

      // Caso: usuario registrado gratis
      expect(tieneAcceso('usuario', 'gratis', 'menstrual_basico')).toBe(true);
      expect(tieneAcceso('usuario', 'gratis', 'exportar_datos')).toBe(true);
    });

    it('el servidor aprueba recursos siempre gratis sin exigir token', () => {
      for (const recurso of RECURSOS_SIEMPRE_GRATIS) {
        const res = validarPermisoServidor(null, recurso);
        expect(res.permitido).toBe(true);
        expect(res.codigo).toBe('OK');
      }
    });
  });

  describe('Control de acceso en el cliente (UI / matrices)', () => {
    it('bloquea entrenamientos premium para usuarios gratis e invitados', () => {
      expect(tieneAcceso('invitado', 'gratis', 'entrenamientos_premium')).toBe(false);
      expect(tieneAcceso('usuario', 'gratis', 'entrenamientos_premium')).toBe(false);
      expect(tieneAcceso('usuario', 'gratis', 'plan_nutricion_personalizado')).toBe(false);
    });

    it('habilita entrenamientos y recetas avanzadas para plan mensual o anual', () => {
      expect(tieneAcceso('usuario', 'mensual', 'entrenamientos_premium')).toBe(true);
      expect(tieneAcceso('usuario', 'anual', 'plan_nutricion_personalizado')).toBe(true);
      expect(tieneAcceso('premium', 'gratis', 'entrenamientos_premium')).toBe(true);
    });

    it('el administrador tiene acceso a todo, incluido el panel de administración', () => {
      expect(tieneAcceso('admin', 'gratis', 'panel_administracion')).toBe(true);
      expect(tieneAcceso('admin', 'gratis', 'gestion_usuarios')).toBe(true);
      expect(tieneAcceso('admin', 'gratis', 'entrenamientos_premium')).toBe(true);

      // Un usuario premium NO tiene acceso al panel de admin
      expect(tieneAcceso('premium', 'anual', 'panel_administracion')).toBe(false);
    });

    it('obtenerMatrizEntitlements devuelve el mapa completo coherente', () => {
      const matriz = obtenerMatrizEntitlements('usuario', 'gratis');
      expect(matriz.menstrual_basico).toBe(true);
      expect(matriz.exportar_datos).toBe(true);
      expect(matriz.entrenamientos_premium).toBe(false);
      expect(matriz.panel_administracion).toBe(false);
    });
  });

  describe('Validación estricta de permisos en el Servidor (API Guard)', () => {
    const ahora = 1761660000;

    it('rechaza con NO_AUTORIZADO si se pide recurso premium sin token', () => {
      const res = validarPermisoServidor(null, 'entrenamientos_premium', ahora);
      expect(res.permitido).toBe(false);
      expect(res.codigo).toBe('NO_AUTORIZADO');
    });

    it('rechaza con TOKEN_EXPIRADO si el token ya venció', () => {
      const claimsExpiradas: TokenClaims = {
        sub: 'user_123',
        rol: 'premium',
        plan: 'anual',
        expiraEpochSegundos: ahora - 100, // expiró hace 100 segundos
      };

      const res = validarPermisoServidor(claimsExpiradas, 'entrenamientos_premium', ahora);
      expect(res.permitido).toBe(false);
      expect(res.codigo).toBe('TOKEN_EXPIRADO');
    });

    it('rechaza con REQUIERE_PREMIUM si el usuario tiene token válido pero sin membresía', () => {
      const claimsUsuarioGratis: TokenClaims = {
        sub: 'user_456',
        rol: 'usuario',
        plan: 'gratis',
        expiraEpochSegundos: ahora + 3600,
      };

      const res = validarPermisoServidor(claimsUsuarioGratis, 'entrenamientos_premium', ahora);
      expect(res.permitido).toBe(false);
      expect(res.codigo).toBe('REQUIERE_PREMIUM');
    });

    it('aprueba con OK cuando el token tiene suscripción premium activa', () => {
      const claimsPremium: TokenClaims = {
        sub: 'user_789',
        rol: 'usuario',
        plan: 'mensual',
        expiraEpochSegundos: ahora + 3600,
      };

      const res = validarPermisoServidor(claimsPremium, 'entrenamientos_premium', ahora);
      expect(res.permitido).toBe(true);
      expect(res.codigo).toBe('OK');
    });

    it('rechaza con REQUIERE_ADMIN si un usuario premium intenta acceder al panel de administración', () => {
      const claimsPremium: TokenClaims = {
        sub: 'user_789',
        rol: 'premium',
        plan: 'anual',
        expiraEpochSegundos: ahora + 3600,
      };

      const res = validarPermisoServidor(claimsPremium, 'panel_administracion', ahora);
      expect(res.permitido).toBe(false);
      expect(res.codigo).toBe('REQUIERE_ADMIN');
    });

    it('aprueba con OK si el rol es admin para panel_administracion', () => {
      const claimsAdmin: TokenClaims = {
        sub: 'admin_1',
        rol: 'admin',
        plan: 'gratis',
        expiraEpochSegundos: ahora + 3600,
      };

      const res = validarPermisoServidor(claimsAdmin, 'panel_administracion', ahora);
      expect(res.permitido).toBe(true);
      expect(res.codigo).toBe('OK');
    });
  });
});
