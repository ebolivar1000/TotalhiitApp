import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../datos/db';
import {
  agregarSuscriptor,
  alternarEstadoSuscriptor,
  cambiarClaveAdmin,
  eliminarSuscriptor,
  esSuscriptorActivo,
  guardarAnuncio,
  obtenerAnuncioActivo,
  restablecerClaveAdminPorEmail,
  verificarClaveAdmin,
} from './admin-servicio';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe('modulo de administracion (FASE 12)', () => {
  it('valida la clave de acceso de administrador', () => {
    expect(verificarClaveAdmin('totalhiit2026')).toBe(true);
    expect(verificarClaveAdmin('clave_incorrecta')).toBe(false);
  });

  it('los correos de administracion tienen acceso activo por defecto', async () => {
    expect(await esSuscriptorActivo('caribialabs@gmail.com')).toBe(true);
    expect(await esSuscriptorActivo('CARIBIALABS@GMAIL.COM')).toBe(true);
    expect(await esSuscriptorActivo('ebolivar1000@gmail.com')).toBe(true);
    expect(await esSuscriptorActivo('alguien_sin_pago@gmail.com')).toBe(false);
  });

  it('agrega un nuevo suscriptor y valida su acceso activo', async () => {
    await agregarSuscriptor({
      email: 'alumna.total40@gmail.com',
      nombre: 'Lucía Alumna',
      plan: 'total40',
    });

    expect(await esSuscriptorActivo('alumna.total40@gmail.com')).toBe(true);
    expect(await esSuscriptorActivo('ALUMNA.TOTAL40@gmail.com')).toBe(true);
  });

  it('permite pausar y reactivar la suscripcion', async () => {
    const s = await agregarSuscriptor({ email: 'pausada@gmail.com' });
    expect(await esSuscriptorActivo('pausada@gmail.com')).toBe(true);

    await alternarEstadoSuscriptor(s.id);
    expect(await esSuscriptorActivo('pausada@gmail.com')).toBe(false);

    await alternarEstadoSuscriptor(s.id);
    expect(await esSuscriptorActivo('pausada@gmail.com')).toBe(true);
  });

  it('permite eliminar a un suscriptor', async () => {
    const s = await agregarSuscriptor({ email: 'temporal@gmail.com' });
    expect(await esSuscriptorActivo('temporal@gmail.com')).toBe(true);

    await eliminarSuscriptor(s.id);
    expect(await esSuscriptorActivo('temporal@gmail.com')).toBe(false);
  });

  it('crea y recupera anuncios activos para las usuarias', async () => {
    expect(await obtenerAnuncioActivo()).toBeNull();

    await guardarAnuncio({
      tipo: 'promocion',
      titulo: '¡Promo Mes Aniversario!',
      mensaje: '50% de descuento en el plan anual de nutrición.',
      activo: true,
    });

    const activo = await obtenerAnuncioActivo();
    expect(activo).not.toBeNull();
    expect(activo?.titulo).toBe('¡Promo Mes Aniversario!');
  });

  it('permite cambiar la clave de administracion y verificar con la nueva clave', () => {
    expect(verificarClaveAdmin('totalhiit2026')).toBe(true);

    const res = cambiarClaveAdmin('nuevaClaveSegura2026');
    expect(res.exito).toBe(true);
    expect(verificarClaveAdmin('totalhiit2026')).toBe(false);
    expect(verificarClaveAdmin('nuevaClaveSegura2026')).toBe(true);

    // No permite claves demasiado cortas
    const corto = cambiarClaveAdmin('123');
    expect(corto.exito).toBe(false);
  });

  it('permite restablecer la clave a traves de un email maestro autorizado', () => {
    cambiarClaveAdmin('claveOlvidadaxxx');
    expect(verificarClaveAdmin('totalhiit2026')).toBe(false);

    // Email no autorizado falla
    const intentoFallido = restablecerClaveAdminPorEmail('hacker@gmail.com');
    expect(intentoFallido.exito).toBe(false);

    // Email maestro autorizado restablece la clave por defecto
    const res = restablecerClaveAdminPorEmail('caribialabs@gmail.com');
    expect(res.exito).toBe(true);
    expect(verificarClaveAdmin('totalhiit2026')).toBe(true);
  });
});
