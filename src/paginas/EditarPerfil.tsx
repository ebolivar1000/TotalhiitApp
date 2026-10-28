import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { guardarPerfil, guardarPreferencias, registrarObjetivo } from '../lib/datos/repositorio';
import {
  esquemaPerfilFormulario,
  valoresInicialesPerfil,
  type FormPerfil,
} from '../lib/datos/formulario-esquema';
import { usePerfil } from '../hooks/usePerfil';
import { SeccionDatos, SeccionObjetivo, SeccionPreferencias } from '../componentes/formulario/Secciones';
import { BotonPrimario, BotonSecundario, Tarjeta } from '../componentes/ui';

export default function EditarPerfil() {
  const { cargando, perfil, preferencias, objetivo, recargar } = usePerfil();
  const navigate = useNavigate();
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState('');

  const form = useForm<FormPerfil>({
    resolver: zodResolver(esquemaPerfilFormulario) as Resolver<FormPerfil>,
    defaultValues: valoresInicialesPerfil,
    mode: 'onTouched',
  });

  useEffect(() => {
    if (!cargando && !perfil) navigate('/onboarding', { replace: true });
  }, [cargando, perfil, navigate]);

  useEffect(() => {
    if (!perfil) return;
    form.reset({
      alias: perfil.alias,
      fechaNacimiento: perfil.fechaNacimiento,
      pesoKg: perfil.pesoKg,
      estaturaCm: perfil.estaturaCm,
      genero: perfil.genero,
      nivelActividad: perfil.nivelActividad,
      experiencia: perfil.experiencia,
      equipamiento: [...perfil.equipamiento],
      paisRegion: perfil.paisRegion ?? '',
      tipo: objetivo?.tipo,
      alergenos: preferencias?.alergenos ?? [],
      exclusiones: preferencias?.exclusiones ?? [],
      tiempoCocinaMaxMin: preferencias?.tiempoCocinaMaxMin,
      presupuesto: preferencias?.presupuesto,
      porcionesHabituales: preferencias?.porcionesHabituales ?? 2,
      acepta18: true,
      aceptaAviso: true,
    } as unknown as FormPerfil);
  }, [perfil, preferencias, objetivo, form]);

  const finalizar = form.handleSubmit(async (d) => {
    if (!perfil) return;
    setGuardando(true);
    setErrorGuardado('');
    try {
      await guardarPerfil(
        {
          alias: d.alias,
          fechaNacimiento: d.fechaNacimiento,
          pesoKg: d.pesoKg,
          estaturaCm: d.estaturaCm,
          genero: d.genero || undefined,
          nivelActividad: d.nivelActividad,
          experiencia: d.experiencia,
          equipamiento: d.equipamiento,
          paisRegion: d.paisRegion || undefined,
        },
        perfil.id,
      );
      if (d.tipo !== objetivo?.tipo) await registrarObjetivo(perfil.id, d.tipo);
      await guardarPreferencias(perfil.id, {
        alergenos: d.alergenos,
        exclusiones: d.exclusiones,
        tiempoCocinaMaxMin: d.tiempoCocinaMaxMin,
        presupuesto: d.presupuesto,
        porcionesHabituales: d.porcionesHabituales,
      });
      await recargar();
      navigate('/perfil');
    } catch {
      setErrorGuardado('No se pudieron guardar los cambios. Revisa los campos e intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  });

  if (cargando || !perfil) return null;

  return (
    <main className="mx-auto max-w-md px-4 pb-48 pt-6">
      <h1 className="mb-4 text-2xl font-bold text-zinc-900">Editar perfil</h1>
      <div className="space-y-4">
        <Tarjeta>
          <h2 className="mb-4 text-lg font-bold text-zinc-900">Tus datos</h2>
          <SeccionDatos form={form} />
        </Tarjeta>
        <Tarjeta>
          <h2 className="mb-4 text-lg font-bold text-zinc-900">Tu objetivo</h2>
          <SeccionObjetivo form={form} />
          <p className="mt-2 text-xs text-zinc-500">
            Al cambiar el objetivo se cierra el anterior (queda en tu historial) y se abre el nuevo con la fecha de hoy.
          </p>
        </Tarjeta>
        <Tarjeta>
          <h2 className="mb-4 text-lg font-bold text-zinc-900">Tus preferencias</h2>
          <SeccionPreferencias form={form} />
        </Tarjeta>
        {errorGuardado && <p className="text-sm font-semibold text-red-600">{errorGuardado}</p>}
        <div className="flex gap-3">
          <BotonSecundario onClick={() => navigate('/perfil')} disabled={guardando} className="flex-1">
            Cancelar
          </BotonSecundario>
          <BotonPrimario onClick={() => void finalizar()} disabled={guardando} className="flex-1">
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </BotonPrimario>
        </div>
      </div>
      <div className="h-20 w-full shrink-0" aria-hidden="true" />
    </main>
  );
}
