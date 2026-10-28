import { describe, expect, it } from 'vitest';
import { CATALOGO_SESIONES, workoutSchema } from './sesiones';
import { filtrarSesiones, ordenarPorObjetivo } from './filtros';

describe('catálogo de sesiones', () => {
  it('todas las sesiones cumplen el esquema', () => {
    for (const s of CATALOGO_SESIONES) {
      const r = workoutSchema.safeParse(s);
      expect(r.success, `sesión ${s.id}`).toBe(true);
    }
  });

  it('tiene 15 sesiones con ids únicos', () => {
    expect(CATALOGO_SESIONES).toHaveLength(15);
    expect(new Set(CATALOGO_SESIONES.map((s) => s.id)).size).toBe(15);
  });
});

describe('filtrarSesiones', () => {
  const cat = CATALOGO_SESIONES;

  it('regla dura: nunca sugiere equipo que no está disponible', () => {
    const soloCorporal = filtrarSesiones(cat, { equipamiento: ['peso_corporal'] });
    expect(soloCorporal.every((s) => !s.equipo.includes('mancuernas'))).toBe(true);
    expect(soloCorporal.length).toBe(cat.length - 5);

    const conMancuernas = filtrarSesiones(cat, { equipamiento: ['peso_corporal', 'mancuernas'] });
    expect(conMancuernas).toHaveLength(cat.length);
  });

  it('sin equipamiento informado solo muestra peso corporal', () => {
    const sinEquipo = filtrarSesiones(cat, {});
    expect(sinEquipo.every((s) => s.equipo.every((e) => e === 'peso_corporal'))).toBe(true);
  });

  it('filtra por duración máxima', () => {
    const cortas = filtrarSesiones(cat, { equipamiento: ['peso_corporal', 'mancuernas'], duracionMaxMin: 20 });
    expect(cortas.every((s) => s.duracionMin <= 20)).toBe(true);
    expect(cortas.length).toBeGreaterThanOrEqual(3);
  });

  it('filtra por categoría', () => {
    const movilidad = filtrarSesiones(cat, { equipamiento: ['peso_corporal', 'mancuernas'], categoria: 'movilidad' });
    expect(movilidad.map((s) => s.id)).toEqual(['w1-c1', 'stretch-1', 'stretch-2']);
  });

  it('filtra por nivel', () => {
    const principiante = filtrarSesiones(cat, { equipamiento: ['peso_corporal', 'mancuernas'], nivel: 'principiante' });
    expect(principiante.every((s) => s.nivel === 'principiante')).toBe(true);
    const intermedio = filtrarSesiones(cat, { equipamiento: ['peso_corporal', 'mancuernas'], nivel: 'intermedio' });
    expect(intermedio.length).toBeGreaterThan(0);
  });

  it('filtra por objetivo compatible', () => {
    const grasa = filtrarSesiones(cat, { equipamiento: ['peso_corporal', 'mancuernas'], objetivo: 'perder_grasa' });
    expect(grasa.length).toBeGreaterThan(0);
    expect(grasa.every((s) => s.objetivosCompatibles.includes('perder_grasa'))).toBe(true);
  });

  it('combina filtros', () => {
    const combo = filtrarSesiones(cat, {
      equipamiento: ['peso_corporal'],
      duracionMaxMin: 30,
      categoria: 'cardio',
    });
    expect(combo.every((s) => s.duracionMin <= 30 && s.categorias.includes('cardio'))).toBe(true);
  });
});

describe('ordenarPorObjetivo', () => {
  it('pone primero las compatibles con el objetivo y ordena por duración', () => {
    const orden = ordenarPorObjetivo(CATALOGO_SESIONES, 'descanso');
    expect(orden[0]?.duracionMin).toBeLessThanOrEqual(orden[orden.length - 1]?.duracionMin ?? 999);
    const primerasCompatibles = orden.slice(0, 4).every((s) => s.objetivosCompatibles.includes('descanso'));
    expect(primerasCompatibles).toBe(true);
  });
});
