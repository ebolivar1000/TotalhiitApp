import 'fake-indexeddb/auto';
import { describe, expect, it, beforeEach } from 'vitest';
import { recargarPerfilGlobal, LLAVE_ONBOARDING_SALTADO, LLAVE_ONBOARDING_COMPLETADO } from './usePerfil';
import { db } from '../lib/datos/db';
import { guardarPerfil, registrarObjetivo } from '../lib/datos/repositorio';

const memoria = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (clave: string) => memoria.get(clave) ?? null,
  setItem: (clave: string, valor: string) => void memoria.set(clave, valor),
  removeItem: (clave: string) => void memoria.delete(clave),
  clear: () => void memoria.clear(),
  length: 0,
  key: () => null,
};

describe('usePerfil hook and reactive global store', () => {
  beforeEach(async () => {
    await db.perfiles.clear();
    await db.objetivos.clear();
    await db.preferencias.clear();
    localStorage.clear();
  });

  it('inicia cargando y recarga el perfil reactivo cuando se guarda un perfil', async () => {
    // Inicialmente no hay perfil
    const estadoInicial = await recargarPerfilGlobal();
    expect(estadoInicial.cargando).toBe(false);
    expect(estadoInicial.perfil).toBeUndefined();

    // Guardamos un perfil y objetivo
    const nuevo = await guardarPerfil({
      alias: 'Carla',
      fechaNacimiento: '1980-05-12',
      pesoKg: 68,
      estaturaCm: 165,
      nivelActividad: 'moderado',
      experiencia: 'intermedio',
      equipamiento: ['peso_corporal'],
    });
    await registrarObjetivo(nuevo.id, 'masa_muscular');

    // Recargar perfil global
    const estadoActualizado = await recargarPerfilGlobal();
    expect(estadoActualizado.cargando).toBe(false);
    expect(estadoActualizado.perfil?.alias).toBe('Carla');
    expect(estadoActualizado.objetivo?.tipo).toBe('masa_muscular');
  });

  it('exporta las llaves de onboarding correctas', () => {
    expect(LLAVE_ONBOARDING_SALTADO).toBe('totalhiit.onboarding.saltado');
    expect(LLAVE_ONBOARDING_COMPLETADO).toBe('totalhiit.onboarding.completado');
  });
});
