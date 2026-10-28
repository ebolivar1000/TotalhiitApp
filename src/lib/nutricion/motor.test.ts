import { describe, expect, it } from 'vitest';
import { CATALOGO_RECETAS, recetaSchema, obtenerReceta, type CategoriaReceta } from './recetas';
import {
  contieneAlergeno,
  escalarReceta,
  filtrarRecetas,
  formatearCantidad,
  ordenarPorObjetivo,
  presupuestosPermitidos,
} from './motor';

const cat = CATALOGO_RECETAS;
const filtroBase = { alergenos: [], exclusiones: [] };

describe('catálogo de recetas', () => {
  it('todas las recetas cumplen el esquema', () => {
    for (const r of cat) {
      const resultado = recetaSchema.safeParse(r);
      expect(resultado.success, `receta ${r.id}`).toBe(true);
    }
  });

  it('tiene 12 recetas con ids únicos y las 6 categorías', () => {
    expect(cat).toHaveLength(12);
    expect(new Set(cat.map((r) => r.id)).size).toBe(12);
    const categorias = new Set<CategoriaReceta>(cat.map((r) => r.categoria));
    expect(categorias.size).toBe(6);
  });

  it('busca receta por id', () => {
    expect(obtenerReceta('r5')?.nombre).toContain('Pollo');
    expect(obtenerReceta('no-existe')).toBeUndefined();
  });
});

describe('motor — REGLA DURA de alérgenos (prueba obligatoria)', () => {
  it('nunca sugiere una receta con un alérgeno declarado (case-insensitive)', () => {
    const sinLactosa = filtrarRecetas(cat, { alergenos: ['lactosa'], exclusiones: [] });
    expect(sinLactosa).toHaveLength(cat.length - 4); // r1, r2, r9, r12
    expect(sinLactosa.every((r) => !r.alergenos.some((a) => a.toLowerCase() === 'lactosa'))).toBe(true);

    const sinGluten = filtrarRecetas(cat, { alergenos: ['GLUTEN (TRIGO)'], exclusiones: [] });
    expect(sinGluten.some((r) => r.id === 'r1')).toBe(false);
    expect(sinGluten.every((r) => !contieneAlergeno(r, ['gluten (trigo)']))).toBe(true);
  });

  it('ninguna combinación de alérgenos deja pasar una receta peligrosa', () => {
    const todos = filtrarRecetas(cat, {
      alergenos: ['Lactosa', 'Huevo', 'Gluten (trigo)', 'Pescado', 'Soja', 'Nueces y frutos secos'],
      exclusiones: [],
    });
    expect(todos.every((r) => r.alergenos.length === 0)).toBe(true);
    expect(todos.map((r) => r.id)).toEqual(['r3', 'r5', 'r8']);
  });
});

describe('motor — exclusiones y filtros', () => {
  it('excluye alimentos por nombre de ingrediente (parcial e insensible a mayúsculas)', () => {
    const sinAtun = filtrarRecetas(cat, { ...filtroBase, exclusiones: ['ATÚN'] });
    expect(sinAtun.some((r) => r.id === 'r4')).toBe(false);
    expect(sinAtun).toHaveLength(cat.length - 1);
  });

  it('filtra por tiempo máximo', () => {
    const rapidas = filtrarRecetas(cat, { ...filtroBase, tiempoMaxMin: 15 });
    expect(rapidas.every((r) => r.tiempoMin <= 15)).toBe(true);
    expect(rapidas.length).toBeGreaterThanOrEqual(4);
  });

  it('presupuesto como escalera', () => {
    expect(presupuestosPermitidos('bajo')).toEqual(['bajo']);
    expect(presupuestosPermitidos('medio')).toEqual(['bajo', 'medio']);
    expect(presupuestosPermitidos(undefined)).toEqual(['bajo', 'medio', 'alto']);

    const bajo = filtrarRecetas(cat, { ...filtroBase, presupuesto: 'bajo' });
    expect(bajo.every((r) => r.presupuesto === 'bajo')).toBe(true);
    expect(bajo).toHaveLength(8);

    const medio = filtrarRecetas(cat, { ...filtroBase, presupuesto: 'medio' });
    expect(medio.every((r) => r.presupuesto !== 'alto')).toBe(true);
  });

  it('filtra por categoría', () => {
    const cenas = filtrarRecetas(cat, { ...filtroBase, categoria: 'cena' });
    expect(cenas.map((r) => r.id).sort()).toEqual(['r11', 'r5', 'r6', 'r7']);
  });

  it('filtra por ingrediente disponible', () => {
    const conEspinaca = filtrarRecetas(cat, { ...filtroBase, ingrediente: 'espinaca' });
    expect(conEspinaca.map((r) => r.id).sort()).toEqual(['r2', 'r3']);
  });

  it('combina reglas duras con filtros', () => {
    const combo = filtrarRecetas(cat, {
      alergenos: ['Lactosa'],
      exclusiones: [],
      tiempoMaxMin: 10,
      presupuesto: 'bajo',
    });
    expect(combo.map((r) => r.id)).toEqual(['r3']);
  });
});

describe('motor — orden y escalado de porciones', () => {
  it('ordena compatibles con el objetivo primero, luego por tiempo', () => {
    const orden = ordenarPorObjetivo(cat, 'perder_grasa');
    const primeras = orden.slice(0, 6);
    expect(primeras.every((r) => r.objetivosCompatibles.includes('perder_grasa'))).toBe(true);
    for (let i = 1; i < primeras.length; i++) {
      expect(primeras[i]!.tiempoMin).toBeGreaterThanOrEqual(primeras[i - 1]!.tiempoMin);
    }
  });

  it('reescala cantidades y macros totales a 2 porciones', () => {
    const r5 = obtenerReceta('r5')!;
    expect(r5.porcionesBase).toBe(4);
    const escalada = escalarReceta(r5, 2);
    const pollo = escalada.ingredientes.find((i) => i.nombre === 'Pechuga de pollo');
    expect(pollo?.cantidad).toBe(300);
    expect(escalada.macrosTotales.kcal).toBe(780);
    expect(escalada.macrosTotales.proteinaG).toBe(68);
  });

  it('mantiene el factor 1 con las porciones base', () => {
    const r3 = obtenerReceta('r3')!;
    const misma = escalarReceta(r3, 1);
    expect(misma.ingredientes.find((i) => i.nombre === 'Espinaca fresca')?.cantidad).toBe(50);
    expect(misma.macrosTotales.kcal).toBe(180);
  });

  it('deja en null los ingredientes "a gusto"', () => {
    const escalada = escalarReceta(obtenerReceta('r2')!, 2);
    const sal = escalada.ingredientes.find((i) => i.unidad === 'a gusto');
    expect(sal?.cantidad).toBeNull();
  });
});

describe('formatearCantidad', () => {
  it('muestra decimales al estilo es-AR', () => {
    expect(formatearCantidad(1)).toBe('1');
    expect(formatearCantidad(0.5)).toBe('0,5');
    expect(formatearCantidad(120)).toBe('120');
  });
});
