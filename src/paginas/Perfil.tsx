import { Link } from 'react-router';
import { EQUIPAMIENTO_OPCIONES, PRESUPUESTO_OPCIONES } from '../componentes/formulario/Secciones';
import { BotonPrimario, Tarjeta } from '../componentes/ui';
import { ETIQUETAS_NIVEL_ACTIVIDAD, ETIQUETAS_OBJETIVO } from '../lib/datos/entidades';
import { edadCumplida } from '../lib/utilidades/fechas';
import { usePerfil } from '../hooks/usePerfil';

function EtiquetaDato({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-100 py-2 last:border-0">
      <span className="text-sm text-zinc-500">{rotulo}</span>
      <span className="text-sm font-semibold text-zinc-800">{valor}</span>
    </div>
  );
}

const etiquetaEquipamiento = (valor: string) =>
  EQUIPAMIENTO_OPCIONES.find((o) => o.valor === valor)?.etiqueta ?? valor;

export default function Perfil() {
  const { cargando, perfil, preferencias, objetivo } = usePerfil();

  if (cargando) return null;

  if (!perfil) {
    return (
      <main className="mx-auto max-w-md px-4 pb-32 pt-6 text-center">
        <Tarjeta>
          <p className="text-2xl" aria-hidden="true">
            👋
          </p>
          <h1 className="mt-2 text-xl font-bold text-zinc-900">Todavía no configuraste tu perfil</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Completalo para personalizar tus entrenamientos y recetas.
          </p>
          <Link to="/onboarding" className="mt-4 inline-block">
            <BotonPrimario>Completar mi perfil</BotonPrimario>
          </Link>
        </Tarjeta>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 pb-32 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Mi perfil</h1>
        <Link to="/perfil/editar" className="text-sm font-semibold text-marca-magenta">
          Editar
        </Link>
      </div>

      <Tarjeta>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-marca-magenta">Datos personales</h2>
        <EtiquetaDato rotulo="Nombre" valor={perfil.alias} />
        <EtiquetaDato rotulo="Edad" valor={`${edadCumplida(perfil.fechaNacimiento)} años`} />
        <EtiquetaDato rotulo="Peso" valor={`${perfil.pesoKg} kg`} />
        <EtiquetaDato rotulo="Estatura" valor={`${perfil.estaturaCm} cm`} />
        <EtiquetaDato rotulo="Actividad" valor={ETIQUETAS_NIVEL_ACTIVIDAD[perfil.nivelActividad]} />
        <EtiquetaDato rotulo="Experiencia" valor={perfil.experiencia.charAt(0).toUpperCase() + perfil.experiencia.slice(1)} />
        <EtiquetaDato
          rotulo="Equipamiento"
          valor={perfil.equipamiento.map(etiquetaEquipamiento).join(', ') || '—'}
        />
        {perfil.paisRegion && <EtiquetaDato rotulo="Región" valor={perfil.paisRegion} />}
      </Tarjeta>

      <Tarjeta>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-marca-magenta">Objetivo</h2>
        {objetivo ? (
          <>
            <EtiquetaDato rotulo="Actual" valor={ETIQUETAS_OBJETIVO[objetivo.tipo]} />
            <EtiquetaDato rotulo="Desde" valor={new Date(objetivo.desde).toLocaleDateString('es-AR')} />
          </>
        ) : (
          <p className="text-sm text-zinc-500">Sin objetivo activo. Elegilo en “Editar”.</p>
        )}
      </Tarjeta>

      <Tarjeta>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-marca-magenta">Preferencias de nutrición</h2>
        <EtiquetaDato
          rotulo="Alérgenos"
          valor={preferencias?.alergenos.length ? preferencias.alergenos.join(', ') : 'Ninguno'}
        />
        <EtiquetaDato
          rotulo="Exclusiones"
          valor={preferencias?.exclusiones.length ? preferencias.exclusiones.join(', ') : 'Ninguna'}
        />
        {preferencias?.tiempoCocinaMaxMin && (
          <EtiquetaDato rotulo="Tiempo de cocina" valor={`Hasta ${preferencias.tiempoCocinaMaxMin} min`} />
        )}
        {preferencias?.presupuesto && (
          <EtiquetaDato
            rotulo="Presupuesto"
            valor={PRESUPUESTO_OPCIONES.find((o) => o.valor === preferencias.presupuesto)?.etiqueta ?? preferencias.presupuesto}
          />
        )}
        {preferencias && <EtiquetaDato rotulo="Porciones" valor={`${preferencias.porcionesHabituales} personas`} />}
      </Tarjeta>
    </main>
  );
}
