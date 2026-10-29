import { useEffect, useState } from 'react';
import { usePerfil } from './usePerfil';
import { esSuscriptorActivo, obtenerAnuncioActivo } from '../lib/admin/admin-servicio';
import type { AnuncioAdmin } from '../lib/datos/db';

export function useSuscripcion() {
  const { perfil, cargando: cargandoPerfil } = usePerfil();
  const [esSuscriptor, setEsSuscriptor] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(true);
  const [anuncio, setAnuncio] = useState<AnuncioAdmin | null>(null);

  useEffect(() => {
    let activo = true;

    async function verificar() {
      setCargando(true);
      try {
        const tieneAcceso = await esSuscriptorActivo(perfil?.emailGoogle);
        const anuncioVigente = await obtenerAnuncioActivo();
        if (activo) {
          setEsSuscriptor(tieneAcceso);
          setAnuncio(anuncioVigente);
        }
      } catch (e) {
        console.error('Error al verificar suscripción:', e);
      } finally {
        if (activo) setCargando(false);
      }
    }

    if (!cargandoPerfil) {
      void verificar();
    }

    return () => {
      activo = false;
    };
  }, [perfil?.emailGoogle, cargandoPerfil]);

  return {
    esSuscriptor,
    cargando: cargando || cargandoPerfil,
    emailGoogle: perfil?.emailGoogle,
    anuncio,
  };
}
