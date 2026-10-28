import type { UseFormReturn } from 'react-hook-form';
import {
  equipamientos,
  ETIQUETAS_NIVEL_ACTIVIDAD,
  ETIQUETAS_OBJETIVO,
  generos,
  nivelesActividad,
  nivelesExperiencia,
  presupuestos,
  type TipoObjetivo,
} from '../../lib/datos/entidades';
import type { FormPerfil } from '../../lib/datos/formulario-esquema';
import { Campo, ChipsMulti, ChipInput, EntradaTexto, RadioCards, Selector } from '../ui';

export const ALERGENOS_COMUNES = [
  'Maní',
  'Nueces y frutos secos',
  'Gluten (trigo)',
  'Lactosa',
  'Huevo',
  'Soja',
  'Pescado',
  'Mariscos',
  'Sésamo',
  'Mostaza',
] as const;

const GENERO_OPCIONES = generos.map((g) => ({
  valor: g,
  etiqueta: g === 'no_binario' ? 'No binario' : g === 'prefiero_no_decir' ? 'Prefiero no decir' : g.charAt(0).toUpperCase() + g.slice(1),
}));

const NIVEL_OPCIONES = nivelesActividad.map((n) => ({ valor: n, etiqueta: ETIQUETAS_NIVEL_ACTIVIDAD[n] }));

const EXPERIENCIA_OPCIONES = nivelesExperiencia.map((n) => ({
  valor: n,
  etiqueta: n.charAt(0).toUpperCase() + n.slice(1),
}));

export const EQUIPAMIENTO_OPCIONES = equipamientos.map((e) => ({
  valor: e,
  etiqueta:
    e === 'peso_corporal'
      ? 'Solo peso corporal'
      : e === 'banda_elastica'
        ? 'Banda elástica'
        : e.charAt(0).toUpperCase() + e.slice(1),
}));

export const PRESUPUESTO_OPCIONES = presupuestos.map((p) => ({
  valor: p,
  etiqueta: p === 'bajo' ? 'Ajustado' : p === 'medio' ? 'Medio' : 'Flexible',
}));

const TIEMPO_OPCIONES = [15, 30, 45, 60, 90].map((m) => ({ valor: String(m), etiqueta: `${m} minutos` }));

const OBJETIVO_ICONOS: Record<TipoObjetivo, string> = {
  masa_muscular: '💪',
  perder_grasa: '🔥',
  recomposicion: '⚖️',
  mantenimiento: '🏃‍♀️',
  descanso: '😴',
  resistencia: '🫁',
  bienestar: '✨',
};

const OPCIONES_OBJETIVO = (Object.keys(ETIQUETAS_OBJETIVO) as TipoObjetivo[]).map((t) => ({
  valor: t,
  etiqueta: ETIQUETAS_OBJETIVO[t],
  icono: OBJETIVO_ICONOS[t],
}));

type FormPerfilApi = UseFormReturn<FormPerfil>;

export function SeccionDatos({ form }: { form: FormPerfilApi }) {
  const { register, formState, watch, setValue } = form;
  const errores = formState.errors;
  const equipamiento = watch('equipamiento');
  return (
    <div className="space-y-4">
      <Campo etiqueta="¿Cómo te llamamos?" htmlFor="alias" error={errores.alias?.message}>
        <EntradaTexto id="alias" placeholder="Tu nombre o alias" {...register('alias')} />
      </Campo>
      <Campo
        etiqueta="Fecha de nacimiento"
        htmlFor="fechaNacimiento"
        error={errores.fechaNacimiento?.message}
        ayuda="La usamos para calcular tu edad. La app es para personas de 18 años o más."
      >
        <EntradaTexto id="fechaNacimiento" type="date" {...register('fechaNacimiento')} />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Peso (kg)" htmlFor="pesoKg" error={errores.pesoKg?.message}>
          <EntradaTexto id="pesoKg" type="number" inputMode="decimal" step="0.1" {...register('pesoKg', { valueAsNumber: true })} />
        </Campo>
        <Campo etiqueta="Estatura (cm)" htmlFor="estaturaCm" error={errores.estaturaCm?.message}>
          <EntradaTexto id="estaturaCm" type="number" inputMode="numeric" {...register('estaturaCm', { valueAsNumber: true })} />
        </Campo>
      </div>
      <Campo etiqueta="Nivel de actividad física" htmlFor="nivelActividad" error={errores.nivelActividad?.message}>
        <Selector id="nivelActividad" opciones={NIVEL_OPCIONES} {...register('nivelActividad')} />
      </Campo>
      <Campo etiqueta="Experiencia entrenando" htmlFor="experiencia" error={errores.experiencia?.message}>
        <Selector id="experiencia" opciones={EXPERIENCIA_OPCIONES} {...register('experiencia')} />
      </Campo>
      <Campo
        etiqueta="Equipamiento disponible"
        error={errores.equipamiento?.message}
        ayuda="Elegí todo lo que tengas a mano. Podés cambiarlo después."
      >
        <ChipsMulti opciones={EQUIPAMIENTO_OPCIONES} valor={equipamiento} onChange={(n) => setValue('equipamiento', n as FormPerfil['equipamiento'], { shouldValidate: true })} />
      </Campo>
      <Campo etiqueta="Género (opcional)" htmlFor="genero" error={errores.genero?.message} ayuda="Opcional. Lo pedimos solo si alguna función lo llega a necesitar, nunca lo inferimos.">
        <Selector id="genero" opciones={GENERO_OPCIONES} incluirVacio="Prefiero no decir" {...register('genero')} />
      </Campo>
      <Campo etiqueta="País o región (opcional)" htmlFor="paisRegion" ayuda="Para adaptar ingredientes a tu zona.">
        <EntradaTexto id="paisRegion" placeholder="Ej: Argentina" {...register('paisRegion')} />
      </Campo>
    </div>
  );
}

export function SeccionObjetivo({ form }: { form: FormPerfilApi }) {
  const { watch, setValue, formState } = form;
  const tipo = watch('tipo');
  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-600">Elegí tu objetivo principal. Podés cambiarlo cuando quieras sin perder tu historial.</p>
      <RadioCards opciones={OPCIONES_OBJETIVO} valor={tipo} onChange={(v) => setValue('tipo', v as FormPerfil['tipo'], { shouldValidate: true })} />
      {formState.errors.tipo?.message && <p className="text-xs font-semibold text-red-600">{formState.errors.tipo.message}</p>}
    </div>
  );
}

export function SeccionPreferencias({ form }: { form: FormPerfilApi }) {
  const { register, formState, watch, setValue } = form;
  const errores = formState.errors;
  const alergenos = watch('alergenos');
  const exclusiones = watch('exclusiones');
  return (
    <div className="space-y-4">
      <Campo etiqueta="Alérgenos e intolerancias" error={errores.alergenos?.message} ayuda="El motor de recetas jamás te sugerirá algo con estos ingredientes.">
        <ChipInput opcionesSugeridas={ALERGENOS_COMUNES} valor={alergenos} onChange={(n) => setValue('alergenos', n, { shouldValidate: true })} placeholder="Ej: Ajoba…" />
      </Campo>
      <Campo etiqueta="Alimentos que querés excluir" error={errores.exclusiones?.message} ayuda="Por gusto, preferencia o dieta. Ej: cerdo, bebidas gaseosas.">
        <ChipInput opcionesSugeridas={['Cerdo', 'Embutidos', 'Frituras', 'Bebidas gaseosas']} valor={exclusiones} onChange={(n) => setValue('exclusiones', n, { shouldValidate: true })} />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="Tiempo para cocinar" htmlFor="tiempoCocina" ayuda="Máximo por comida.">
          <Selector
            id="tiempoCocina"
            opciones={TIEMPO_OPCIONES}
            incluirVacio="Sin límite"
            {...register('tiempoCocinaMaxMin', { setValueAs: (v: string) => (v === '' ? undefined : Number(v)) })}
          />
        </Campo>
        <Campo etiqueta="Porciones habituales" htmlFor="porciones" error={errores.porcionesHabituales?.message}>
          <EntradaTexto id="porciones" type="number" inputMode="numeric" min={1} max={12} {...register('porcionesHabituales', { valueAsNumber: true })} />
        </Campo>
      </div>
      <Campo etiqueta="Presupuesto de compra" htmlFor="presupuesto">
        <Selector
          id="presupuesto"
          opciones={PRESUPUESTO_OPCIONES}
          incluirVacio="Prefiero no decirlo"
          {...register('presupuesto', { setValueAs: (v: string) => (v === '' ? undefined : v) })}
        />
      </Campo>
    </div>
  );
}
