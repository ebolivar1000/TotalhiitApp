/**
 * FASE 9 — Lista de compras consolidada de la semana.
 * Suma los ingredientes de todas las recetas del plan escaladas a las porciones
 * del plan. Los ingredientes "a gusto" (sin cantidad) se listan aparte. La
 * clave de agrupación es nombre (insensible a mayúsculas) + unidad: mezclar
 * unidades en una sola línea sería un error.
 */

import type { SlotPlan } from '../datos/entidades';
import type { Receta } from './recetas';
import { escalarReceta } from './motor';

export interface ItemCompra {
  nombre: string;
  unidad: string;
  /** Suma total para la semana (0 cuando es "a gusto"). */
  cantidad: number;
  /** true = sin cantidad definida (se lista como "a gusto"). */
  aGusto: boolean;
}

export function consolidarCompras(
  slots: SlotPlan[],
  resolver: (id: string) => Receta | undefined,
  porciones: number,
): ItemCompra[] {
  const acumulado = new Map<string, ItemCompra>();
  for (const slot of slots) {
    const receta = resolver(slot.recetaId);
    if (!receta) continue;
    const escalada = escalarReceta(receta, porciones);
    for (const ing of escalada.ingredientes) {
      const clave = `${ing.nombre.toLowerCase().trim()}|${ing.unidad}`;
      const previo = acumulado.get(clave);
      if (ing.cantidad === null) {
        if (!previo) {
          acumulado.set(clave, { nombre: ing.nombre, unidad: ing.unidad, cantidad: 0, aGusto: true });
        }
        continue;
      }
      if (previo && !previo.aGusto) {
        acumulado.set(clave, { ...previo, cantidad: previo.cantidad + ing.cantidad });
      } else {
        acumulado.set(clave, { nombre: ing.nombre, unidad: ing.unidad, cantidad: ing.cantidad, aGusto: false });
      }
    }
  }
  return Array.from(acumulado.values()).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}
