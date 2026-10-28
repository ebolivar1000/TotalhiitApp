import { describe, it, expect } from 'vitest';
import {
  credencialesLoginSchema,
  credencialesRegistroSchema,
  crearSesionInvitado,
  crearSesionUsuario,
  obtenerSesionActual,
  guardarSesion,
  cerrarSesion,
  esSesionValida,
  type AlmacenSesion,
} from './auth';

class AlmacenEnMemoria implements AlmacenSesion {
  private mapa = new Map<string, string>();
  getItem(clave: string) {
    return this.mapa.get(clave) ?? null;
  }
  setItem(clave: string, valor: string) {
    this.mapa.set(clave, valor);
  }
  removeItem(clave: string) {
    this.mapa.delete(clave);
  }
}

describe('FASE 10 — Autenticación, Roles y Manejo de Sesión', () => {
  describe('Validación de credenciales (Zod schemas)', () => {
    it('valida credenciales de login correctamente', () => {
      const valido = credencialesLoginSchema.safeParse({
        email: 'usuario@totalhiit.com',
        password: 'Password123!',
      });
      expect(valido.success).toBe(true);

      const emailInvalido = credencialesLoginSchema.safeParse({
        email: 'no-es-correo',
        password: 'Password123!',
      });
      expect(emailInvalido.success).toBe(false);

      const passCorta = credencialesLoginSchema.safeParse({
        email: 'usuario@totalhiit.com',
        password: '123',
      });
      expect(passCorta.success).toBe(false);
    });

    it('exige complejidad mínima en registro (mín 8 chars + número o símbolo)', () => {
      const registroValido = credencialesRegistroSchema.safeParse({
        email: 'nuevo@totalhiit.com',
        password: 'Totalhiit2026',
        alias: 'Valeria',
      });
      expect(registroValido.success).toBe(true);

      const sinNumeroNiSimbolo = credencialesRegistroSchema.safeParse({
        email: 'nuevo@totalhiit.com',
        password: 'sololetraslargas',
        alias: 'Valeria',
      });
      expect(sinNumeroNiSimbolo.success).toBe(false);

      const aliasCorto = credencialesRegistroSchema.safeParse({
        email: 'nuevo@totalhiit.com',
        password: 'Totalhiit2026',
        alias: 'V',
      });
      expect(aliasCorto.success).toBe(false);
    });
  });

  describe('Sesión y almacenamiento local-first', () => {
    it('inicia en modo Invitado si no hay sesión previa guardada', () => {
      const almacen = new AlmacenEnMemoria();
      const sesion = obtenerSesionActual(almacen);

      expect(sesion.rol).toBe('invitado');
      expect(sesion.plan).toBe('gratis');
      expect(sesion.syncHabilitado).toBe(false);
      expect(esSesionValida(sesion)).toBe(true);
    });

    it('guarda y recupera una sesión de usuario con rol y plan', () => {
      const almacen = new AlmacenEnMemoria();
      const nuevaSesion = crearSesionUsuario({
        userId: 'usr_premium_01',
        email: 'valeria@totalhiit.com',
        alias: 'Valeria M.',
        rol: 'premium',
        plan: 'anual',
        syncHabilitado: true,
      });

      guardarSesion(nuevaSesion, almacen);

      const recuperada = obtenerSesionActual(almacen);
      expect(recuperada.userId).toBe('usr_premium_01');
      expect(recuperada.rol).toBe('premium');
      expect(recuperada.plan).toBe('anual');
      expect(recuperada.syncHabilitado).toBe(true);
    });

    it('cierra sesión y restaura el modo invitado', () => {
      const almacen = new AlmacenEnMemoria();
      const sesion = crearSesionUsuario({
        userId: 'admin_01',
        email: 'admin@totalhiit.com',
        alias: 'Admin',
        rol: 'admin',
        plan: 'gratis',
      });
      guardarSesion(sesion, almacen);

      const sesionTrasCierre = cerrarSesion(almacen);
      expect(sesionTrasCierre.rol).toBe('invitado');

      const actual = obtenerSesionActual(almacen);
      expect(actual.rol).toBe('invitado');
    });

    it('descarta automáticamente sesiones corruptas o expiradas', () => {
      const almacen = new AlmacenEnMemoria();
      // Guardamos JSON inválido
      almacen.setItem('totalhiit.auth.sesion', '{ corrupto: true ');
      expect(obtenerSesionActual(almacen).rol).toBe('invitado');

      // Guardamos sesión con fecha vencida
      const expirada = crearSesionInvitado();
      expirada.expiraEpochSegundos = Math.floor(Date.now() / 1000) - 100;
      guardarSesion(expirada, almacen);

      expect(obtenerSesionActual(almacen).rol).toBe('invitado');
    });
  });
});
