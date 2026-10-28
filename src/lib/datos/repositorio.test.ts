import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db, NOMBRE_DB } from './db';
import type { EntradaPerfil } from './entidades';
import {
  borrarDatosPersonales,
  exportarDatos,
  guardarPerfil,
  guardarPreferencias,
  obtenerPerfil,
  obtenerPreferencias,
  objetivoActivo,
  obtenerObjetivos,
  otorgarConsentimiento,
  perfilPrincipal,
  revocarConsentimiento,
  tieneConsentimiento,
  registrarObjetivo,
  aplicarCambiosPerfil,
} from './repositorio';

const entradaPerfil: EntradaPerfil = {
  alias: 'Valen',
  fechaNacimiento: '1990-05-10',
  pesoKg: 68,
  estaturaCm: 165,
  nivelActividad: 'moderado',
  experiencia: 'principiante',
  equipamiento: ['mancuernas'],
};

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe('perfiles', () => {
  it('crea y recupera un perfil', async () => {
    const perfil = await guardarPerfil(entradaPerfil);
    expect(perfil.id).toBeTruthy();
    const leido = await obtenerPerfil(perfil.id);
    expect(leido?.alias).toBe('Valen');
    expect((await perfilPrincipal())?.id).toBe(perfil.id);
  });

  it('actualiza sin duplicar y conserva createdAt', async () => {
    const creado = await guardarPerfil(entradaPerfil);
    await new Promise((r) => setTimeout(r, 5));
    const editado = await guardarPerfil({ ...entradaPerfil, alias: 'Valen B.' }, creado.id);
    expect(editado.id).toBe(creado.id);
    expect(editado.createdAt).toBe(creado.createdAt);
    expect(editado.updatedAt).toBeGreaterThan(creado.updatedAt);
    expect(await db.perfiles.count()).toBe(1);
  });

  it('aplicarCambiosPerfil valida existencia', async () => {
    const creado = await guardarPerfil(entradaPerfil);
    const cambiado = await aplicarCambiosPerfil(creado.id, { pesoKg: 70 });
    expect(cambiado.pesoKg).toBe(70);
    await expect(aplicarCambiosPerfil('no-existe', { pesoKg: 70 })).rejects.toThrow('Perfil no encontrado');
  });
});

describe('objetivos con vigencia', () => {
  it('cambiar objetivo cierra el anterior con hasta y deja uno activo', async () => {
    const perfil = await guardarPerfil(entradaPerfil);
    const g1 = await registrarObjetivo(perfil.id, 'perder_grasa');
    const g2 = await registrarObjetivo(perfil.id, 'masa_muscular');

    const activo = await objetivoActivo(perfil.id);
    expect(activo?.tipo).toBe('masa_muscular');

    const historial = await obtenerObjetivos(perfil.id);
    expect(historial).toHaveLength(2);
    const anterior = historial.find((g) => g.id === g1.id);
    expect(anterior?.activo).toBe(0);
    expect(anterior?.hasta).toBeTruthy();
    expect(g2.activo).toBe(1);
  });
});

describe('preferencias', () => {
  it('crea y luego actualiza la fila del usuario', async () => {
    const perfil = await guardarPerfil(entradaPerfil);
    const p1 = await guardarPreferencias(perfil.id, { alergenos: ['Maní'], exclusiones: [], porcionesHabituales: 2 });
    const p2 = await guardarPreferencias(perfil.id, { alergenos: ['Maní', 'Lactosa'], exclusiones: [], porcionesHabituales: 4 });
    expect(p2.id).toBe(p1.id);
    expect((await obtenerPreferencias(perfil.id))?.alergenos).toEqual(['Maní', 'Lactosa']);
    expect(await db.preferencias.count()).toBe(1);
  });
});

describe('consentimientos', () => {
  it('otorgar, verificar y revocar', async () => {
    const perfil = await guardarPerfil(entradaPerfil);
    expect(await tieneConsentimiento(perfil.id, 'perfil')).toBe(false);
    await otorgarConsentimiento(perfil.id, 'perfil');
    expect(await tieneConsentimiento(perfil.id, 'perfil')).toBe(true);
    await revocarConsentimiento(perfil.id, 'perfil');
    expect(await tieneConsentimiento(perfil.id, 'perfil')).toBe(false);
  });

  it('versiones registradas según módulo', async () => {
    const perfil = await guardarPerfil(entradaPerfil);
    const c = await otorgarConsentimiento(perfil.id, 'salud_general');
    expect(c.version).toBe('v1');
  });
});

describe('exportación y borrado', () => {
  it('exporta todo y borra definitivamente', async () => {
    const perfil = await guardarPerfil(entradaPerfil);
    await registrarObjetivo(perfil.id, 'bienestar');
    await guardarPreferencias(perfil.id, { alergenos: [], exclusiones: [], porcionesHabituales: 3 });
    await otorgarConsentimiento(perfil.id, 'perfil');

    const datos = await exportarDatos();
    expect(datos['app']).toBe('totalhiit-app');
    expect((datos['perfiles'] as unknown[]).length).toBe(1);
    expect((datos['objetivos'] as unknown[]).length).toBe(1);

    await borrarDatosPersonales();
    expect(await db.perfiles.count()).toBe(0);
    expect(await db.objetivos.count()).toBe(0);
    expect(await db.preferencias.count()).toBe(0);
    expect(await db.consentimientos.count()).toBe(0);
  });
});

describe('nombre de base', () => {
  it('es estable para actualizaciones futuras', () => {
    expect(NOMBRE_DB).toBe('totalhiit-app');
  });
});
