import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../datos/db';
import {
  alternarFavorito,
  eliminarProducto,
  guardarPreferenciasEscaner,
  guardarProducto,
  listarFavoritos,
  listarHistorial,
  obtenerPreferenciasEscaner,
  obtenerProducto,
} from './repositorio';
import type { ProductoEscaneado } from './tipos';

const PRODUCTO_MOCK: ProductoEscaneado = {
  codigoBarras: '7791234567890',
  nombre: 'Avena Arrollada Gruesa',
  marca: 'Campo Salud',
  categoria: 'Cereales',
  aditivos: [],
  nutrientes: {
    caloriasKcal: 360,
    azucaresG: 1,
    grasasTotalesG: 6,
    grasasSaturadasG: 1,
    sodioMg: 5,
    fibraG: 9,
    proteinasG: 13,
  },
  puntaje: {
    puntos: 92,
    nivel: 'excelente',
    colorClase: 'text-emerald-700 bg-emerald-50 border-emerald-500',
    colorHex: '#10b981',
    fraseResumen: 'Excelente opción para tu día a día',
    motivos: [],
    desglose: { nutricional: 52, procesamientoNova: 25, aditivos: 15 },
    equivalencias: { cucharaditasAzucar: 0.2, gramosSal: 0 },
    octogonos: [],
    leyendas: [],
  },
  fuente: 'openfoodfacts',
  fechaEscaneo: Date.now(),
  favorito: false,
};

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe('repositorio de escáner (Dexie v9)', () => {
  it('guarda y recupera un producto escaneado', async () => {
    await guardarProducto(PRODUCTO_MOCK);
    const recuperado = await obtenerProducto('7791234567890');

    expect(recuperado).toBeDefined();
    expect(recuperado?.nombre).toBe('Avena Arrollada Gruesa');
    expect(recuperado?.puntaje.puntos).toBe(92);
  });

  it('permite alternar favorito y listarlo en la sección de favoritos', async () => {
    await guardarProducto(PRODUCTO_MOCK);
    const esFav1 = await alternarFavorito('7791234567890');
    expect(esFav1).toBe(true);

    const favs = await listarFavoritos();
    expect(favs.length).toBe(1);
    expect(favs[0]?.codigoBarras).toBe('7791234567890');

    const esFav2 = await alternarFavorito('7791234567890');
    expect(esFav2).toBe(false);

    const favsVacios = await listarFavoritos();
    expect(favsVacios.length).toBe(0);
  });

  it('ordena el historial cronológicamente', async () => {
    await guardarProducto({
      ...PRODUCTO_MOCK,
      codigoBarras: '111',
      fechaEscaneo: 1000,
    });
    await guardarProducto({
      ...PRODUCTO_MOCK,
      codigoBarras: '222',
      fechaEscaneo: 2000,
    });

    const historial = await listarHistorial();
    expect(historial.length).toBe(2);
    expect(historial[0]?.codigoBarras).toBe('222'); // más reciente primero
  });

  it('elimina un producto del historial', async () => {
    await guardarProducto(PRODUCTO_MOCK);
    await eliminarProducto('7791234567890');
    const recuperado = await obtenerProducto('7791234567890');
    expect(recuperado).toBeUndefined();
  });

  it('guarda y recupera preferencias del escáner', async () => {
    await guardarPreferenciasEscaner({
      userId: 'user_123',
      alergenos: ['gluten', 'soja'],
      dietas: ['vegetariana'],
      objetivosSalud: ['bajar_azucar', 'alta_proteina'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const prefs = await obtenerPreferenciasEscaner('user_123');
    expect(prefs).toBeDefined();
    expect(prefs?.alergenos).toContain('gluten');
    expect(prefs?.objetivosSalud).toContain('alta_proteina');
  });
});
