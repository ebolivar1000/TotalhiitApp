import { useCallback, useEffect, useSyncExternalStore } from 'react';
import type { UserGoal, UserProfile, NutritionPreferences } from '../lib/datos/entidades';
import { objetivoActivo, obtenerPreferencias, perfilPrincipal } from '../lib/datos/repositorio';

export interface EstadoPerfil {
  cargando: boolean;
  perfil?: UserProfile;
  preferencias?: NutritionPreferences;
  objetivo?: UserGoal;
}

/** localStorage: el usuario saltó el onboarding y no quiere que se le vuelva a pedir. */
export const LLAVE_ONBOARDING_SALTADO = 'totalhiit.onboarding.saltado';
/** localStorage: el usuario completó el onboarding satisfactoriamente. */
export const LLAVE_ONBOARDING_COMPLETADO = 'totalhiit.onboarding.completado';

let estadoGlobal: EstadoPerfil = { cargando: true };
const oyentes = new Set<() => void>();

function notificarOyentes() {
  for (const oyente of oyentes) {
    oyente();
  }
}

function suscribir(cb: () => void) {
  oyentes.add(cb);
  return () => {
    oyentes.delete(cb);
  };
}

function obtenerInstantanea(): EstadoPerfil {
  return estadoGlobal;
}

export async function recargarPerfilGlobal(): Promise<EstadoPerfil> {
  try {
    const perfil = await perfilPrincipal();
    if (!perfil) {
      estadoGlobal = { cargando: false, perfil: undefined, preferencias: undefined, objetivo: undefined };
      notificarOyentes();
      return estadoGlobal;
    }
    const [preferencias, objetivo] = await Promise.all([
      obtenerPreferencias(perfil.id),
      objetivoActivo(perfil.id),
    ]);
    estadoGlobal = { cargando: false, perfil, preferencias, objetivo };
    notificarOyentes();
    return estadoGlobal;
  } catch (error) {
    console.error('Error al recargar perfil global:', error);
    estadoGlobal = { cargando: false, perfil: undefined };
    notificarOyentes();
    return estadoGlobal;
  }
}

/** Carga (y permite recargar) el perfil local principal con estado reactivo compartido en toda la app. */
export function usePerfil(): EstadoPerfil & { recargar: () => Promise<EstadoPerfil> } {
  const estado = useSyncExternalStore<EstadoPerfil>(suscribir, obtenerInstantanea, () => ({
    cargando: true,
  }));

  useEffect(() => {
    if (estado.cargando) {
      void recargarPerfilGlobal();
    }
  }, [estado.cargando]);

  const recargar = useCallback(async () => {
    return await recargarPerfilGlobal();
  }, []);

  return { ...estado, recargar };
}
