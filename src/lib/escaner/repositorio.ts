import { db } from '../datos/db';
import type { PreferenciasEscaner, ProductoEscaneado } from './tipos';

/**
 * Guarda o actualiza un producto escaneado en el almacenamiento local IndexedDB.
 */
export async function guardarProducto(producto: ProductoEscaneado): Promise<void> {
  await db.productos_escaneados.put({
    ...producto,
    fechaEscaneo: producto.fechaEscaneo || Date.now(),
  });
}

/**
 * Recupera un producto escaneado por su código de barras.
 */
export async function obtenerProducto(
  codigoBarras: string,
): Promise<ProductoEscaneado | undefined> {
  const codigo = codigoBarras.trim();
  return db.productos_escaneados.get(codigo);
}

/**
 * Devuelve el historial de escaneos ordenado de más reciente a más antiguo.
 */
export async function listarHistorial(limite = 50): Promise<ProductoEscaneado[]> {
  return db.productos_escaneados
    .orderBy('fechaEscaneo')
    .reverse()
    .limit(limite)
    .toArray();
}

/**
 * Devuelve los productos marcados como favoritos por la usuaria.
 */
export async function listarFavoritos(): Promise<ProductoEscaneado[]> {
  const todos = await db.productos_escaneados.toArray();
  return todos
    .filter((p) => Boolean(p.favorito))
    .sort((a, b) => (b.fechaEscaneo || 0) - (a.fechaEscaneo || 0));
}

/**
 * Alterna el estado de favorito de un producto.
 */
export async function alternarFavorito(codigoBarras: string): Promise<boolean> {
  const prod = await obtenerProducto(codigoBarras);
  if (!prod) return false;

  const nuevoEstado = !prod.favorito;
  await db.productos_escaneados.update(codigoBarras, {
    favorito: nuevoEstado,
  });
  return nuevoEstado;
}

/**
 * Elimina un producto del historial local.
 */
export async function eliminarProducto(codigoBarras: string): Promise<void> {
  await db.productos_escaneados.delete(codigoBarras);
}

/**
 * Borra todo el historial de escaneos (conservando o no favoritos según parámetro).
 */
export async function vaciarHistorial(conservarFavoritos = true): Promise<void> {
  if (conservarFavoritos) {
    const noFavoritos = await db.productos_escaneados
      .filter((p) => !p.favorito)
      .primaryKeys();
    await db.productos_escaneados.bulkDelete(noFavoritos);
  } else {
    await db.productos_escaneados.clear();
  }
}

/**
 * Obtiene las preferencias específicas del escáner para una usuaria.
 */
export async function obtenerPreferenciasEscaner(
  userId: string,
): Promise<PreferenciasEscaner | undefined> {
  return db.preferencias_escaner.get(userId);
}

/**
 * Guarda o actualiza las preferencias del escáner (alérgenos, dietas, metas de ingredientes).
 */
export async function guardarPreferenciasEscaner(
  prefs: PreferenciasEscaner,
): Promise<void> {
  await db.preferencias_escaner.put({
    ...prefs,
    updatedAt: Date.now(),
  });
}
