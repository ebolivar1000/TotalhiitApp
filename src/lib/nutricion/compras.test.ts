import { describe, expect, it } from 'vitest';
import type { Receta, Ingrediente } from './recetas';
import type { SlotPlan } from '../datos/entidades';
import { consolidarCompras } from './compras';

function recetaFalsa(id: string, ingredientes: Ingrediente[]): Receta {
  return {
    id,
    nombre: id,
    descripcion: '',
    categoria: 'almuerzo',
    tiempoMin: 20,
    porcionesBase: 2,
    presupuesto: 'bajo',
    ingredientes,
    pasos: ['Paso uno', 'Paso dos'],
    macrosPorPorcion: { kcal: 400, proteinaG: 30, carbohidratosG: 40, grasasG: 10, fibraG: 5 },
    alergenos: [],
  } as unknown as Receta;
}

const resolver = (id: string) => ({ a: recetasA, b: recetasB } as Record<string, Receta>)[id];
const recetasA = recetaFalsa('a', [
  { nombre: 'Pechuga de pollo', cantidad: 300, unidad: 'g' },
  { nombre: 'Arroz', cantidad: 200, unidad: 'g' },
  { nombre: 'Perejil', cantidad: null, unidad: 'manojo' },
]);
const recetasB = recetaFalsa('b', [
  { nombre: 'pechuga de pollo', cantidad: 150, unidad: 'g' }, // misma clave (mayúsculas)
  { nombre: 'Arroz', cantidad: 100, unidad: 'taza' }, // distinta unidad → línea aparte
  { nombre: 'Perejil', cantidad: null, unidad: 'manojo' },
]);

const slots: SlotPlan[] = [
  { dia: 0, comida: 'almuerzo', recetaId: 'a' },
  { dia: 1, comida: 'almuerzo', recetaId: 'b' },
  { dia: 2, comida: 'cena', recetaId: 'inexistente' }, // se ignora sin romper
];

describe('lista de compras consolidada (FASE 9)', () => {
  it('suma ingredientes iguales por nombre+unidad y separa unidades distintas', () => {
    const items = consolidarCompras(slots, resolver, 2);
    const pollo = items.find((i) => i.nombre.toLowerCase().includes('pechuga'))!;
    expect(pollo.cantidad).toBe(450); // 300 + 150 (escalado 2 porciones = factor 1)
    const arrozG = items.find((i) => i.unidad === 'g')!;
    expect(arrozG.cantidad).toBe(200);
    const arrozTaza = items.find((i) => i.unidad === 'taza')!;
    expect(arrozTaza.cantidad).toBe(100);
  });

  it('lista los ingredientes "a gusto" una sola vez, sin cantidad', () => {
    const items = consolidarCompras(slots, resolver, 2);
    const perejil = items.find((i) => i.nombre.toLowerCase().includes('perejil'))!;
    expect(perejil.aGusto).toBe(true);
    expect(perejil.cantidad).toBe(0);
  });

  it('escala las cantidades con las porciones del plan', () => {
    const items = consolidarCompras([{ dia: 0, comida: 'almuerzo', recetaId: 'a' }], resolver, 4);
    const pollo = items.find((i) => i.nombre.toLowerCase().includes('pechuga'))!;
    expect(pollo.cantidad).toBe(600); // 300 base × 4/2
  });

  it('ignora recetas inexistentes y ordena alfabéticamente', () => {
    const items = consolidarCompras(slots, resolver, 2);
    expect(items).toHaveLength(4);
    const nombres = items.map((i) => i.nombre.toLowerCase());
    expect(nombres).toEqual([...nombres].sort((a, b) => a.localeCompare(b, 'es')));
  });
});
