import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db, NOMBRE_DB } from './db';
import type { AlmacenClave } from '../ciclo/cifrado';
import type { EntradaPerfil } from './entidades';

/** Node no tiene localStorage: stub en memoria para la clave de cifrado del ciclo. */
const memoriaClave = new Map<string, string>();
(globalThis as unknown as { localStorage: AlmacenClave }).localStorage = {
  getItem: (clave) => memoriaClave.get(clave) ?? null,
  setItem: (clave, valor) => void memoriaClave.set(clave, valor),
  removeItem: (clave) => void memoriaClave.delete(clave),
};
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
  registrarSesion,
  sesionesDeUsuario,
  sesionesDeWorkout,
  alternarFavorito,
  esFavorito,
  favoritosDe,
  registrarPreparacion,
  preparacionesDe,
  preparacionesDeReceta,
  guardarEntradaDiaria,
  obtenerEntradaDiaria,
  entradasDiarias,
  entradasEntre,
  guardarRegistroCiclo,
  borrarRegistroCiclo,
  borrarTodosRegistrosCiclo,
  registrosCicloCifrados,
  registrosCicloLegibles,
  guardarPlanSemanal,
  obtenerPlanSemanal,
  planesDeUsuario,
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
    await registrarSesion({ userId: perfil.id, workoutId: 'w1-c1', fecha: '2026-10-28' });
    await alternarFavorito(perfil.id, 'sesion', 'w1-c1');
    await registrarPreparacion({ userId: perfil.id, recetaId: 'r5', fecha: '2026-10-28', porciones: 2 });
    await guardarEntradaDiaria(perfil.id, '2026-10-28', { pesoKg: 70, vasosAgua: 5 });
    await guardarRegistroCiclo(perfil.id, '2026-10-28', { flujo: 'abundante', sintomas: ['cólicos'] });
    await guardarPlanSemanal(perfil.id, '2026-10-26', [{ dia: 0, comida: 'desayuno', recetaId: 'r1' }], 2);

    const datos = await exportarDatos();
    expect(datos['app']).toBe('totalhiit-app');
    expect(datos['version']).toBe(6);
    expect((datos['perfiles'] as unknown[]).length).toBe(1);
    expect((datos['objetivos'] as unknown[]).length).toBe(1);
    expect((datos['sesiones'] as unknown[]).length).toBe(1);
    expect((datos['favoritos'] as unknown[]).length).toBe(1);
    expect((datos['preparaciones'] as unknown[]).length).toBe(1);
    expect((datos['entradasDiario'] as unknown[]).length).toBe(1);
    // El ciclo aparece con cifrado: nada de contenido íntimo en claro.
    expect((datos['ciclo'] as unknown[]).length).toBe(1);
    expect(JSON.stringify(datos)).not.toContain('abundante');
    expect(JSON.stringify(datos)).not.toContain('cólicos');
    expect((datos['planes'] as unknown[]).length).toBe(1);

    await borrarDatosPersonales();
    expect(await db.perfiles.count()).toBe(0);
    expect(await db.objetivos.count()).toBe(0);
    expect(await db.preferencias.count()).toBe(0);
    expect(await db.consentimientos.count()).toBe(0);
    expect(await db.sesiones.count()).toBe(0);
    expect(await db.favoritos.count()).toBe(0);
    expect(await db.preparaciones.count()).toBe(0);
    expect(await db.entradasDiario.count()).toBe(0);
    expect(await db.ciclo.count()).toBe(0);
    expect(await db.planes.count()).toBe(0);
  });
});

describe('sesiones y favoritos (FASE 4)', () => {
  it('registra sesiones, las lista por fecha y las filtra por workout', async () => {
    const perfil = await guardarPerfil(entradaPerfil);
    const s1 = await registrarSesion({ userId: perfil.id, workoutId: 'w1-c1', fecha: '2026-10-27', duracionRealMin: 25 });
    const s2 = await registrarSesion({ userId: perfil.id, workoutId: 'w1-c2', fecha: '2026-10-28', duracionRealMin: 28 });
    expect(s1.completado).toBe(true);
    expect(s2.id).not.toBe(s1.id);

    const todas = await sesionesDeUsuario(perfil.id);
    expect(todas).toHaveLength(2);
    expect(todas[0]?.workoutId).toBe('w1-c2');

    const deW1 = await sesionesDeWorkout(perfil.id, 'w1-c1');
    expect(deW1).toHaveLength(1);
    expect(deW1[0]?.duracionRealMin).toBe(25);
  });

  it('alterna favoritos y consulta estado', async () => {
    const perfil = await guardarPerfil(entradaPerfil);
    expect(await esFavorito(perfil.id, 'sesion', 'w1-c1')).toBe(false);
    expect(await alternarFavorito(perfil.id, 'sesion', 'w1-c1')).toBe(true);
    expect(await esFavorito(perfil.id, 'sesion', 'w1-c1')).toBe(true);
    expect(await alternarFavorito(perfil.id, 'sesion', 'w1-c1')).toBe(false);
    expect(await esFavorito(perfil.id, 'sesion', 'w1-c1')).toBe(false);

    await alternarFavorito(perfil.id, 'sesion', 'w1-c2');
    await alternarFavorito(perfil.id, 'receta', 'r1');
    expect((await favoritosDe(perfil.id, 'sesion')).map((f) => f.refId)).toEqual(['w1-c2']);
    expect(await favoritosDe(perfil.id, 'receta')).toHaveLength(1);
  });
});

describe('preparaciones de recetas (FASE 5)', () => {
  it('registra, lista por fecha y filtra por receta', async () => {
    const perfil = await guardarPerfil(entradaPerfil);
    const p1 = await registrarPreparacion({ userId: perfil.id, recetaId: 'r5', fecha: '2026-10-27', porciones: 2 });
    const p2 = await registrarPreparacion({ userId: perfil.id, recetaId: 'r3', fecha: '2026-10-28', porciones: 1 });
    expect(p1.id).not.toBe(p2.id);

    const todas = await preparacionesDe(perfil.id);
    expect(todas).toHaveLength(2);
    expect(todas[0]?.recetaId).toBe('r3');

    const deR5 = await preparacionesDeReceta(perfil.id, 'r5');
    expect(deR5).toHaveLength(1);
    expect(deR5[0]?.porciones).toBe(2);
  });
});

describe('nombre de base', () => {
  it('es estable para actualizaciones futuras', () => {
    expect(NOMBRE_DB).toBe('totalhiit-app');
  });
});

describe('registro diario (FASE 7)', () => {
  it('crea una entrada por día y mantiene id/createdAt al actualizar', async () => {
    const perfil = await guardarPerfil(entradaPerfil);
    const primera = await guardarEntradaDiaria(perfil.id, '2026-10-28', { pesoKg: 70, energiaNivel: 3 });
    expect(primera.id).toBeTruthy();
    expect(primera.createdAt).toBeGreaterThan(0);

    const actualizada = await guardarEntradaDiaria(perfil.id, '2026-10-28', {
      vasosAgua: 6,
      notas: 'Mucha energía',
    });
    expect(actualizada.id).toBe(primera.id); // upsert
    expect(actualizada.createdAt).toBe(primera.createdAt);
    expect(actualizada.pesoKg).toBe(70); // conserva campos previos
    expect(actualizada.energiaNivel).toBe(3);
    expect(actualizada.vasosAgua).toBe(6);
    expect(actualizada.notas).toBe('Mucha energía');

    const otraDia = await guardarEntradaDiaria(perfil.id, '2026-10-29', { vasosAgua: 4 });
    expect(otraDia.id).not.toBe(primera.id);
  });

  it('quita los campos enviados como undefined o vacíos', async () => {
    const perfil = await guardarPerfil(entradaPerfil);
    await guardarEntradaDiaria(perfil.id, '2026-10-28', { pesoKg: 70, notas: 'algo' });
    const limpiada = await guardarEntradaDiaria(perfil.id, '2026-10-28', { pesoKg: undefined, notas: '' });
    expect(limpiada.pesoKg).toBeUndefined();
    expect(limpiada.notas).toBeUndefined();
  });

  it('lista de más reciente a más vieja con límite opcional', async () => {
    const perfil = await guardarPerfil(entradaPerfil);
    await guardarEntradaDiaria(perfil.id, '2026-10-26', { vasosAgua: 3 });
    await guardarEntradaDiaria(perfil.id, '2026-10-28', { vasosAgua: 5 });
    await guardarEntradaDiaria(perfil.id, '2026-10-27', { vasosAgua: 4 });

    const todas = await entradasDiarias(perfil.id);
    expect(todas.map((e) => e.fecha)).toEqual(['2026-10-28', '2026-10-27', '2026-10-26']);

    const ultimas = await entradasDiarias(perfil.id, 2);
    expect(ultimas).toHaveLength(2);
    expect(ultimas[0]?.fecha).toBe('2026-10-28');
  });

  it('consulta por rango inclusivo', async () => {
    const perfil = await guardarPerfil(entradaPerfil);
    await guardarEntradaDiaria(perfil.id, '2026-10-26', { vasosAgua: 3 });
    await guardarEntradaDiaria(perfil.id, '2026-10-28', { vasosAgua: 5 });
    await guardarEntradaDiaria(perfil.id, '2026-10-29', { vasosAgua: 6 });

    const rango = await entradasEntre(perfil.id, '2026-10-26', '2026-10-28');
    expect(rango).toHaveLength(2);
    expect((await obtenerEntradaDiaria(perfil.id, '2026-10-28'))?.vasosAgua).toBe(5);
    expect(await obtenerEntradaDiaria(perfil.id, '2026-10-30')).toBeUndefined();
  });
});

describe('ciclo menstrual con cifrado (FASE 8)', () => {
  it('guarda SOLO metadatos + datosCifrados: nada en claro en la DB', async () => {
    const perfil = await guardarPerfil(entradaPerfil);
    await guardarRegistroCiclo(perfil.id, '2026-10-28', {
      flujo: 'abundante',
      sintomas: ['cólicos', 'antojos'],
      notas: 'día difícil',
    });

    const cruda = await db.ciclo.toArray();
    expect(cruda).toHaveLength(1);
    const fila = JSON.stringify(cruda[0]);
    expect(fila).not.toContain('abundante');
    expect(fila).not.toContain('cólicos');
    expect(fila).not.toContain('día difícil');
    expect(cruda[0]?.datosCifrados).toContain('.');

    const legibles = await registrosCicloLegibles(perfil.id);
    expect(legibles).toHaveLength(1);
    expect(legibles[0]?.datos.flujo).toBe('abundante');
    expect(legibles[0]?.datos.sintomas).toEqual(['cólicos', 'antojos']);
    expect(legibles[0]?.datos.notas).toBe('día difícil');
  });

  it('upsert por día mantiene id/createdAt y reemplaza el payload cifrado', async () => {
    const perfil = await guardarPerfil(entradaPerfil);
    const primera = await guardarRegistroCiclo(perfil.id, '2026-10-28', { flujo: 'ligero', sintomas: [] });
    const segunda = await guardarRegistroCiclo(perfil.id, '2026-10-28', { flujo: 'medio', sintomas: ['acné'] });
    expect(segunda.id).toBe(primera.id);
    expect(segunda.createdAt).toBe(primera.createdAt);

    const legibles = await registrosCicloLegibles(perfil.id);
    expect(legibles).toHaveLength(1);
    expect(legibles[0]?.datos.flujo).toBe('medio');
    expect(legibles[0]?.datos.sintomas).toEqual(['acné']);
  });

  it('borra por día, todos los registros y aparece en la exportación cifrada', async () => {
    const perfil = await guardarPerfil(entradaPerfil);
    await guardarRegistroCiclo(perfil.id, '2026-10-26', { flujo: 'ligero', sintomas: [] });
    await guardarRegistroCiclo(perfil.id, '2026-10-28', { flujo: 'medio', sintomas: [] });

    await borrarRegistroCiclo(perfil.id, '2026-10-26');
    expect(await registrosCicloCifrados(perfil.id)).toHaveLength(1);

    await guardarRegistroCiclo(perfil.id, '2026-10-29', { flujo: 'abundante', sintomas: [] });
    await borrarTodosRegistrosCiclo(perfil.id);
    expect(await registrosCicloCifrados(perfil.id)).toHaveLength(0);

    await guardarRegistroCiclo(perfil.id, '2026-10-29', { flujo: 'abundante', sintomas: [] });
    const datos = await exportarDatos();
    expect((datos['ciclo'] as unknown[]).length).toBe(1);
    expect(JSON.stringify(datos)).not.toContain('abundante');
  });
});

describe('plan semanal (FASE 9)', () => {
  it('upsert por semana mantiene id/createdAt y reemplaza los slots', async () => {
    const perfil = await guardarPerfil(entradaPerfil);
    const primero = await guardarPlanSemanal(
      perfil.id,
      '2026-10-26',
      [
        { dia: 0, comida: 'desayuno', recetaId: 'r1' },
        { dia: 0, comida: 'almuerzo', recetaId: 'r4' },
      ],
      2,
    );
    expect(primero.createdAt).toBeGreaterThan(0);

    const reemplazado = await guardarPlanSemanal(
      perfil.id,
      '2026-10-26',
      [
        { dia: 0, comida: 'desayuno', recetaId: 'r2' },
        { dia: 0, comida: 'almuerzo', recetaId: 'r4' },
        { dia: 0, comida: 'cena', recetaId: 'r5' },
      ],
      4,
    );
    expect(reemplazado.id).toBe(primero.id);
    expect(reemplazado.createdAt).toBe(primero.createdAt);
    expect(reemplazado.slots).toHaveLength(3);
    expect(reemplazado.slots[0]?.recetaId).toBe('r2');
    expect(reemplazado.porciones).toBe(4);

    const otro = await guardarPlanSemanal(perfil.id, '2026-11-02', [{ dia: 0, comida: 'cena', recetaId: 'r6' }], 2);
    expect(otro.id).not.toBe(primero.id);
  });

  it('obtiene por semana y lista los planes del más nuevo al más viejo', async () => {
    const perfil = await guardarPerfil(entradaPerfil);
    await guardarPlanSemanal(perfil.id, '2026-10-26', [], 2);
    await guardarPlanSemanal(perfil.id, '2026-11-02', [], 2);
    expect((await obtenerPlanSemanal(perfil.id, '2026-10-26'))?.slots).toEqual([]);
    expect(await obtenerPlanSemanal(perfil.id, '2026-10-19')).toBeUndefined();
    const planes = await planesDeUsuario(perfil.id);
    expect(planes.map((p) => p.semanaInicio)).toEqual(['2026-11-02', '2026-10-26']);
  });
});
