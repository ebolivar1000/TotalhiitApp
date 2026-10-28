import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import {
  guardarPerfil,
  guardarPreferencias,
  otorgarConsentimiento,
  registrarObjetivo,
} from '../lib/datos/repositorio';
import { ETIQUETAS_OBJETIVO } from '../lib/datos/entidades';
import {
  esquemaPerfilFormulario,
  valoresInicialesPerfil,
  type FormPerfil,
} from '../lib/datos/formulario-esquema';
import { LLAVE_ONBOARDING_COMPLETADO, LLAVE_ONBOARDING_SALTADO, usePerfil } from '../hooks/usePerfil';
import { SeccionDatos, SeccionObjetivo, SeccionPreferencias } from '../componentes/formulario/Secciones';
import { BotonPrimario, BotonSecundario, Campo, Tarjeta } from '../componentes/ui';

const PASOS = ['Bienvenida', 'Tus datos', 'Tu objetivo', 'Tus preferencias', 'Confirmar'] as const;

const CAMPOS_POR_PASO: (keyof FormPerfil)[][] = [
  [],
  ['alias', 'fechaNacimiento', 'pesoKg', 'estaturaCm', 'genero', 'nivelActividad', 'experiencia', 'equipamiento', 'paisRegion'],
  ['tipo'],
  ['alergenos', 'exclusiones', 'tiempoCocinaMaxMin', 'presupuesto', 'porcionesHabituales'],
  ['acepta18', 'aceptaAviso'],
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { recargar } = usePerfil();
  const [paso, setPaso] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState('');
  const [errorValidacion, setErrorValidacion] = useState('');

  const form = useForm<FormPerfil>({
    resolver: zodResolver(esquemaPerfilFormulario) as Resolver<FormPerfil>,
    defaultValues: valoresInicialesPerfil,
    mode: 'onTouched',
  });
  const { register, formState } = form;
  const datos = form.watch();

  const saltar = () => {
    localStorage.setItem(LLAVE_ONBOARDING_SALTADO, '1');
    navigate('/', { replace: true });
  };

  const siguiente = async () => {
    setErrorValidacion('');
    const campos = CAMPOS_POR_PASO[paso] ?? [];
    if (campos.length === 0) {
      setPaso((p) => Math.min(p + 1, PASOS.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const esValido = await form.trigger(campos);
    if (esValido) {
      setPaso((p) => Math.min(p + 1, PASOS.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const errores = form.formState.errors;
      const nombresCampos: Record<string, string> = {
        alias: 'Nombre o alias',
        fechaNacimiento: 'Fecha de nacimiento (+18 años)',
        pesoKg: 'Peso en kg (mínimo 25 kg)',
        estaturaCm: 'Estatura en cm (mínimo 50 cm)',
        tipo: 'Objetivo principal',
        acepta18: 'Mayoría de edad (+18)',
        aceptaAviso: 'Aviso de salud',
      };

      const fallidos = campos
        .filter((c) => errores[c])
        .map((c) => nombresCampos[c] || c);

      const mensaje = fallidos.length > 0
        ? `Revisá estos campos: ${fallidos.join(', ')}.`
        : 'Por favor completá los campos obligatorios para avanzar.';

      setErrorValidacion(mensaje);

      // Auto-scroll al primer campo con error
      const primerError = campos.find((c) => errores[c]);
      if (primerError) {
        const elemento = document.getElementById(primerError as string);
        if (elemento) {
          elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
          elemento.focus();
        }
      }
    }
  };

  const finalizar = form.handleSubmit(
    async (d) => {
      setGuardando(true);
      setErrorGuardado('');
      setErrorValidacion('');
      try {
        const perfil = await guardarPerfil({
          alias: d.alias,
          fechaNacimiento: d.fechaNacimiento,
          pesoKg: d.pesoKg,
          estaturaCm: d.estaturaCm,
          genero: d.genero || undefined,
          nivelActividad: d.nivelActividad,
          experiencia: d.experiencia,
          equipamiento: d.equipamiento,
          paisRegion: d.paisRegion || undefined,
        });
        await registrarObjetivo(perfil.id, d.tipo);
        await guardarPreferencias(perfil.id, {
          alergenos: d.alergenos,
          exclusiones: d.exclusiones,
          tiempoCocinaMaxMin: d.tiempoCocinaMaxMin,
          presupuesto: d.presupuesto,
          porcionesHabituales: d.porcionesHabituales,
        });
        await otorgarConsentimiento(perfil.id, 'perfil');
        await otorgarConsentimiento(perfil.id, 'salud_general');
        localStorage.setItem(LLAVE_ONBOARDING_COMPLETADO, '1');
        localStorage.removeItem(LLAVE_ONBOARDING_SALTADO);
        await recargar();
        navigate('/', { replace: true });
      } catch (e) {
        console.error('Error al guardar datos de onboarding:', e);
        setErrorGuardado('No se pudieron guardar los datos. Revisá los campos e intentá de nuevo.');
      } finally {
        setGuardando(false);
      }
    },
    (errores) => {
      const nombresCampos: Record<string, string> = {
        alias: 'Nombre o alias',
        fechaNacimiento: 'Fecha de nacimiento (+18 años)',
        pesoKg: 'Peso en kg',
        estaturaCm: 'Estatura en cm',
        tipo: 'Objetivo principal',
        acepta18: 'Confirmación de mayoría de edad (+18)',
        aceptaAviso: 'Aceptación del aviso de salud',
      };
      const lista = Object.keys(errores)
        .map((k) => nombresCampos[k] || errores[k as keyof FormPerfil]?.message)
        .filter(Boolean);
      setErrorValidacion(
        lista.length > 0
          ? `Por favor revisá: ${lista.join(', ')}.`
          : 'Por favor aceptá los términos y completá los campos obligatorios para continuar.'
      );
    }
  );

  return (
    <main className="mx-auto max-w-md px-4 pb-48 pt-6">
      <div className="mb-2 text-center">
        <p className="font-marca text-3xl text-marca-magenta">TOTALHIIT</p>
        <p className="mt-1 text-sm text-zinc-500">
          Paso {paso + 1} de {PASOS.length} · {PASOS[paso]}
        </p>
      </div>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200">
        <div
          className="h-full rounded-full bg-marca-magenta transition-all"
          style={{ width: `${((paso + 1) / PASOS.length) * 100}%` }}
        />
      </div>

      {paso === 0 && (
        <div className="space-y-4">
          <Tarjeta className="text-center">
            <p className="text-2xl" aria-hidden="true">
              💜
            </p>
            <h1 className="mt-2 text-xl font-bold text-zinc-900">Bienvenida a TOTALHIIT</h1>
            <p className="mt-2 text-sm text-zinc-600">
              En unos minutos configuramos tu perfil para personalizar entrenamientos, recetas y seguimiento.
              Todo se guarda <strong>solo en este dispositivo</strong>: nada sale de tu teléfono sin que lo pidas.
            </p>
          </Tarjeta>
          <p className="text-center text-sm text-zinc-500">
            ¿Preferís explorar primero? Podés saltarlo y completarlo después desde Ajustes.
          </p>
        </div>
      )}

      {paso === 1 && (
        <Tarjeta>
          <h2 className="mb-4 text-lg font-bold text-zinc-900">Tus datos</h2>
          <SeccionDatos form={form} />
        </Tarjeta>
      )}

      {paso === 2 && (
        <Tarjeta>
          <h2 className="mb-4 text-lg font-bold text-zinc-900">Tu objetivo</h2>
          <SeccionObjetivo form={form} />
        </Tarjeta>
      )}

      {paso === 3 && (
        <Tarjeta>
          <h2 className="mb-4 text-lg font-bold text-zinc-900">Tus preferencias</h2>
          <SeccionPreferencias form={form} />
        </Tarjeta>
      )}

      {paso === 4 && (
        <div className="space-y-4">
          <Tarjeta>
            <h2 className="mb-3 text-lg font-bold text-zinc-900">Resumen</h2>
            <ul className="space-y-1 text-sm text-zinc-600">
              <li>
                <strong>Nombre:</strong> {datos.alias || '—'}
              </li>
              <li>
                <strong>Objetivo:</strong> {datos.tipo ? ETIQUETAS_OBJETIVO[datos.tipo] : '—'}
              </li>
              <li>
                <strong>Alérgenos:</strong> {datos.alergenos.length > 0 ? datos.alergenos.join(', ') : 'ninguno'}
              </li>
              <li>
                <strong>Exclusiones:</strong> {datos.exclusiones.length > 0 ? datos.exclusiones.join(', ') : 'ninguna'}
              </li>
            </ul>
          </Tarjeta>
          <Tarjeta>
            <h2 className="mb-3 text-lg font-bold text-zinc-900">Confirmaciones</h2>
            <div className="space-y-4">
              <Campo etiqueta="" error={formState.errors.acepta18?.message}>
                <label className="flex items-start gap-3 text-sm text-zinc-700">
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-[#b00050]" {...register('acepta18')} />
                  <span>Confirmo que soy mayor de 18 años.</span>
                </label>
              </Campo>
              <Campo
                etiqueta=""
                error={formState.errors.aceptaAviso?.message}
                ayuda="Aviso de salud: TOTALHIIT ofrece orientación general de fitness y nutrición. No reemplaza el diagnóstico, tratamiento o indicaciones de profesionales de la salud."
              >
                <label className="flex items-start gap-3 text-sm text-zinc-700">
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-[#b00050]" {...register('aceptaAviso')} />
                  <span>
                    Entiendo que esta app no reemplaza la consulta con profesionales de la salud, y acepto el aviso
                    para usar las funciones de entrenamiento, salud y nutrición.
                  </span>
                </label>
              </Campo>
            </div>
          </Tarjeta>
          {errorGuardado && <p className="text-center text-sm font-semibold text-red-600">{errorGuardado}</p>}
        </div>
      )}

      {/* Espaciador generoso para que el último campo nunca quede cubierto por la barra fija inferior */}
      <div className="h-36 w-full shrink-0" aria-hidden="true" />

      {/* Barra de navegación de pasos fija permanentemente en la parte inferior */}
      <div className="safe-area-inferior fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/95 px-4 pt-3 pb-3 shadow-2xl backdrop-blur">
        <div className="mx-auto max-w-md">
          {errorValidacion && (
            <div className="mb-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-center text-xs font-semibold text-red-700">
              ⚠️ {errorValidacion}
            </div>
          )}
          <div className="flex items-center gap-3">
            {paso > 0 ? (
              <BotonSecundario
                type="button"
                onClick={() => {
                  setErrorValidacion('');
                  setPaso((p) => p - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={guardando}
                className="flex-1"
              >
                Atrás
              </BotonSecundario>
            ) : (
              <BotonSecundario type="button" onClick={saltar} className="flex-1">
                Saltar
              </BotonSecundario>
            )}
            {paso < PASOS.length - 1 ? (
              <BotonPrimario type="button" onClick={() => void siguiente()} className="flex-1">
                Siguiente →
              </BotonPrimario>
            ) : (
              <BotonPrimario type="button" onClick={() => void finalizar()} disabled={guardando} className="flex-1">
                {guardando ? 'Guardando…' : 'Finalizar y empezar'}
              </BotonPrimario>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
