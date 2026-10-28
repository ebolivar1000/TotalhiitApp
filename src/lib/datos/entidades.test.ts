import { describe, expect, it } from 'vitest';
import { userProfileSchema, nutritionPreferencesSchema, userGoalSchema } from './entidades';

const basePerfil = {
  id: 'p1',
  alias: 'Valen',
  fechaNacimiento: '1990-05-10',
  pesoKg: 68,
  estaturaCm: 165,
  nivelActividad: 'moderado',
  experiencia: 'principiante',
  equipamiento: ['mancuernas'],
  createdAt: 1,
  updatedAt: 1,
} as const;

describe('userProfileSchema', () => {
  it('acepta un perfil válido sin género (opcional, minimización)', () => {
    const r = userProfileSchema.safeParse(basePerfil);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.genero).toBeUndefined();
  });

  it('rechaza menores de 18 años', () => {
    const menor = { ...basePerfil, fechaNacimiento: '2010-01-01' };
    expect(userProfileSchema.safeParse(menor).success).toBe(false);
  });

  it('rechaza pesos y estaturas fuera de rango', () => {
    expect(userProfileSchema.safeParse({ ...basePerfil, pesoKg: 10 }).success).toBe(false);
    expect(userProfileSchema.safeParse({ ...basePerfil, pesoKg: 999 }).success).toBe(false);
    expect(userProfileSchema.safeParse({ ...basePerfil, estaturaCm: 30 }).success).toBe(false);
  });

  it('rechaza alias vacío o con más de 40 caracteres', () => {
    expect(userProfileSchema.safeParse({ ...basePerfil, alias: '  ' }).success).toBe(false);
    expect(userProfileSchema.safeParse({ ...basePerfil, alias: 'x'.repeat(41) }).success).toBe(false);
  });

  it('rechaza fechas con formato inválido', () => {
    expect(userProfileSchema.safeParse({ ...basePerfil, fechaNacimiento: '1990/05/10' }).success).toBe(false);
  });
});

describe('nutritionPreferencesSchema', () => {
  it('aplica defaults de alergenos, exclusiones y porciones', () => {
    const r = nutritionPreferencesSchema.parse({
      id: 'pref1',
      userId: 'p1',
      createdAt: 1,
      updatedAt: 1,
    });
    expect(r.alergenos).toEqual([]);
    expect(r.exclusiones).toEqual([]);
    expect(r.porcionesHabituales).toBe(2);
  });

  it('rechaza porciones fuera de 1–12 y alérgenos vacíos', () => {
    const base = { id: 'p', userId: 'p1', createdAt: 1, updatedAt: 1 };
    expect(nutritionPreferencesSchema.safeParse({ ...base, porcionesHabituales: 0 }).success).toBe(false);
    expect(nutritionPreferencesSchema.safeParse({ ...base, porcionesHabituales: 13 }).success).toBe(false);
    expect(nutritionPreferencesSchema.safeParse({ ...base, alergenos: [''] }).success).toBe(false);
  });
});

describe('userGoalSchema', () => {
  it('acepta objetivo activo sin fecha de fin', () => {
    const r = userGoalSchema.safeParse({ id: 'g1', userId: 'p1', tipo: 'mantenimiento', desde: '2026-10-28' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.activo).toBe(1);
  });

  it('rechaza tipos de objetivo desconocidos', () => {
    expect(
      userGoalSchema.safeParse({ id: 'g1', userId: 'p1', tipo: 'otro', desde: '2026-10-28' }).success,
    ).toBe(false);
  });
});
