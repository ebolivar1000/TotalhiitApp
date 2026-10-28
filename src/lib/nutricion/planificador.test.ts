import { describe, expect, it } from 'vitest';
import { obtenerReceta, CATALOGO_RECETAS } from './recetas';
import { generarPlan, recetasParaComida, reemplazarSlot } from './planificador';

const OPCIONES = { alergenos: [], exclusiones: [], presupuesto: undefined, objetivo: null };

describe('planificador semanal (FASE 9)', () => {
  it('es determinista: dos corridas con las mismas opciones dan el mismo plan', () => {
    const a = generarPlan(OPCIONES);
    const b = generarPlan(OPCIONES);
    expect(b).toEqual(a);
    expect(a.length).toBeGreaterThan(0);
  });

  it('cubre los 7 días para cada comida con recetas de la categoría correcta', () => {
    const slots = generarPlan(OPCIONES);
    for (const comida of ['desayuno', 'almuerzo', 'cena', 'snack'] as const) {
      const delTipo = slots.filter((s) => s.comida === comida);
      expect(delTipo).toHaveLength(7);
      for (const slot of delTipo) {
        const receta = obtenerReceta(slot.recetaId)!;
        const categoriasValidas =
          comida === 'snack' ? ['snack', 'bebida', 'postre'] : [comida];
        expect(categoriasValidas).toContain(receta.categoria);
      }
    }
  });

  it('rota recetas cuando hay más de una disponible', () => {
    const slots = generarPlan(OPCIONES);
    const cenas = slots.filter((s) => s.comida === 'cena').map((s) => s.recetaId);
    expect(new Set(cenas).size).toBeGreaterThan(1);
  });

  it('recetasParaComida respeta alérgenos y exclusiones (reglas duras del motor)', () => {
    const candidatas = recetasParaComida(CATALOGO_RECETAS, 'desayuno', {
      alergenos: ['lacteos', 'frutos_secos'],
      exclusiones: ['banana'],
      presupuesto: 'bajo',
      objetivo: null,
    });
    for (const receta of candidatas) {
      expect(receta.alergenos.some((a) => ['lacteos', 'frutos_secos'].includes(a))).toBe(false);
      expect(receta.ingredientes.some((i) => i.nombre.toLowerCase().includes('banana'))).toBe(false);
    }
  });

  it('omite el slot de una comida sin candidatas (p. ej. catálogo vacío)', () => {
    const slots = generarPlan(OPCIONES, []);
    expect(slots).toHaveLength(0);
  });

  it('reemplaza un slot sin tocar el resto', () => {
    const slots = generarPlan(OPCIONES);
    const cenaDia3 = slots.find((s) => s.dia === 3 && s.comida === 'cena')!.recetaId;
    const reemplazados = reemplazarSlot(slots, 2, 'cena', 'r9');
    expect(reemplazados).toHaveLength(slots.length);
    expect(reemplazados.find((s) => s.dia === 2 && s.comida === 'cena')?.recetaId).toBe('r9');
    expect(reemplazados.find((s) => s.dia === 3 && s.comida === 'cena')?.recetaId).toBe(cenaDia3);
    expect(reemplazados.filter((s) => s.dia === 2 && s.comida === 'cena')).toHaveLength(1);
  });
});
