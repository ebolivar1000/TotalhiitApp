import { useCallback, useEffect, useState } from 'react';
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

/** Carga (y permite recargar) el perfil local principal con su objetivo activo. */
export function usePerfil() {
  const [estado, setEstado] = useState<EstadoPerfil>({ cargando: true });

  const recargar = useCallback(async () => {
    const perfil = await perfilPrincipal();
    if (!perfil) {
      setEstado({ cargando: false });
      return;
    }
    const [preferencias, objetivo] = await Promise.all([
      obtenerPreferencias(perfil.id),
      objetivoActivo(perfil.id),
    ]);
    setEstado({ cargando: false, perfil, preferencias, objetivo });
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  return { ...estado, recargar };
}
