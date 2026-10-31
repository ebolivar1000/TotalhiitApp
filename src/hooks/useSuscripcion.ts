import { useEffect, useState } from 'react';
import { usePerfil } from './usePerfil';
import { esSuscriptorActivo, estaAutenticadoAdmin, obtenerAnuncioActivo } from '../lib/admin/admin-servicio';
import { obtenerSesionActual } from '../lib/auth/auth';
import type { AnuncioAdmin } from '../lib/datos/db';

/**
 * Determina si una cadena corresponde a un correo electrónico con formato válido.
 */
export function esEmailValido(email?: string | null): boolean {
  if (!email) return false;
  const norm = email.trim().toLowerCase();
  return norm.length >= 5 && norm.includes('@') && norm.includes('.');
}

export function useSuscripcion() {
  const { perfil, cargando: cargandoPerfil } = usePerfil();
  const [esSuscriptor, setEsSuscriptor] = useState<boolean>(false);
  const [emailValidado, setEmailValidado] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(true);
  const [anuncio, setAnuncio] = useState<AnuncioAdmin | null>(null);

  const sesion = typeof window !== 'undefined' ? obtenerSesionActual() : undefined;
  const emailCandidato = perfil?.emailGoogle || (sesion && sesion.rol !== 'invitado' ? sesion.email : undefined);

  useEffect(() => {
    let activo = true;

    async function verificar() {
      setCargando(true);
      try {
        const esAdmin = estaAutenticadoAdmin();
        const tieneEmailValido = esEmailValido(emailCandidato);
        const activoEnDb = await esSuscriptorActivo(emailCandidato);

        // Si tiene email validado en su perfil, está en la base de suscriptores, o es admin -> Acceso completo
        const tieneAcceso = esAdmin || activoEnDb || tieneEmailValido;
        const anuncioVigente = await obtenerAnuncioActivo();

        if (activo) {
          setEsSuscriptor(tieneAcceso);
          setEmailValidado(tieneEmailValido || esAdmin || activoEnDb);
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
  }, [emailCandidato, cargandoPerfil]);

  return {
    esSuscriptor,
    emailValidado,
    cargando: cargando || cargandoPerfil,
    emailGoogle: emailCandidato,
    anuncio,
  };
}
