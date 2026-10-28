import { Link } from 'react-router';
import { BotonPrimario, Tarjeta } from '../componentes/ui';
import { ETIQUETAS_OBJETIVO } from '../lib/datos/entidades';
import { usePerfil } from '../hooks/usePerfil';

export default function Inicio() {
  const { cargando, perfil, objetivo } = usePerfil();

  if (cargando) return null;

  if (!perfil) {
    return (
      <main className="safe-area-inferior mx-auto max-w-md px-4 pb-24 pt-6">
        <div className="text-center">
          <p className="font-marca text-4xl text-marca-magenta">TOTALHIIT</p>
          <p className="mt-2 text-sm text-zinc-500">Entrenamiento y nutrición para mujeres +40</p>
        </div>
        <Tarjeta className="mt-6 text-center">
          <p className="text-2xl" aria-hidden="true">
            💜
          </p>
          <h1 className="mt-2 text-lg font-bold text-zinc-900">Empecemos</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Configurá tu perfil para recibir entrenamientos y recetas pensadas para vos.
          </p>
          <Link to="/onboarding" className="mt-4 inline-block">
            <BotonPrimario>Completar mi perfil</BotonPrimario>
          </Link>
        </Tarjeta>
      </main>
    );
  }

  return (
    <main className="safe-area-inferior mx-auto max-w-md space-y-4 px-4 pb-24 pt-6">
      <div>
        <p className="text-sm text-zinc-500">Hola,</p>
        <h1 className="text-2xl font-bold text-zinc-900">{perfil.alias} 👋</h1>
      </div>

      {objetivo && (
        <Tarjeta className="bg-marca-crema">
          <p className="text-xs font-bold uppercase tracking-wide text-marca-magenta-oscuro">Tu objetivo</p>
          <p className="mt-1 text-lg font-bold text-zinc-900">{ETIQUETAS_OBJETIVO[objetivo.tipo]}</p>
          <p className="mt-1 text-xs text-zinc-600">Se adapta a lo que hacés en Nutrición y Entrenamientos.</p>
        </Tarjeta>
      )}

      <Tarjeta>
        <p className="text-xs font-bold uppercase tracking-wide text-marca-magenta">Entrenamiento</p>
        <p className="mt-1 text-sm text-zinc-600">
          Próximamente: rutinas HIIT adaptadas con el equipamiento que marcaste en tu perfil.
        </p>
      </Tarjeta>

      <Tarjeta>
        <p className="text-xs font-bold uppercase tracking-wide text-marca-magenta">Nutrición</p>
        <p className="mt-1 text-sm text-zinc-600">
          Próximamente: recetas adaptadas a tus alérgenos, tu tiempo de cocina y tu presupuesto.
        </p>
      </Tarjeta>
    </main>
  );
}
