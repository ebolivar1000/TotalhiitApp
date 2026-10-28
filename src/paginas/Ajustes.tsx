import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { BotonSecundario, Tarjeta } from '../componentes/ui';
import { borrarDatosPersonales, exportarDatos } from '../lib/datos/repositorio';
import { VERSIONES_CONSENTIMIENTO } from '../lib/datos/entidades';
import { fechaHoyIso } from '../lib/utilidades/fechas';
import { LLAVE_ONBOARDING_SALTADO, usePerfil } from '../hooks/usePerfil';

export default function Ajustes() {
  const { cargando, perfil, recargar } = usePerfil();
  const navigate = useNavigate();
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);

  const exportar = async () => {
    const datos = await exportarDatos();
    const contenido = JSON.stringify(datos, null, 2);
    const url = URL.createObjectURL(new Blob([contenido], { type: 'application/json' }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `totalhiit-datos-${fechaHoyIso()}.json`;
    enlace.click();
    URL.revokeObjectURL(url);
  };

  const borrar = async () => {
    localStorage.removeItem(LLAVE_ONBOARDING_SALTADO);
    await borrarDatosPersonales();
    await recargar();
    navigate('/onboarding', { replace: true });
  };

  return (
    <main className="safe-area-inferior mx-auto max-w-md space-y-4 px-4 pb-24 pt-6">
      <h1 className="text-2xl font-bold text-zinc-900">Ajustes</h1>

      <Tarjeta>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-marca-magenta">Perfil</h2>
        {cargando ? (
          <p className="text-sm text-zinc-500">Cargando…</p>
        ) : perfil ? (
          <div className="space-y-2">
            <p className="text-sm text-zinc-600">
              Hola, <strong>{perfil.alias}</strong>.
            </p>
            <Link to="/perfil/editar" className="inline-block text-sm font-semibold text-marca-magenta">
              Editar mis datos →
            </Link>
          </div>
        ) : (
          <Link to="/onboarding" className="inline-block text-sm font-semibold text-marca-magenta">
            Completar mi perfil →
          </Link>
        )}
      </Tarjeta>

      <Tarjeta>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-marca-magenta">Mis datos</h2>
        <p className="mb-3 text-sm text-zinc-600">
          Todo se guarda solo en este dispositivo. Podés llevártelo cuando quieras.
        </p>
        <div className="space-y-3">
          <BotonSecundario onClick={() => void exportar()} className="w-full">
            Exportar mis datos (JSON)
          </BotonSecundario>
          {confirmandoBorrado ? (
            <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-semibold text-red-700">
                Esto borra perfil, objetivos, preferencias y consentimientos de forma definitiva. ¿Segura?
              </p>
              <div className="flex gap-2">
                <BotonSecundario onClick={() => setConfirmandoBorrado(false)} className="flex-1 border-red-300">
                  Cancelar
                </BotonSecundario>
                <button
                  type="button"
                  onClick={() => void borrar()}
                  className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
                >
                  Borrar todo
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmandoBorrado(true)}
              className="w-full rounded-xl border border-red-300 bg-white px-5 py-3 font-semibold text-red-600 hover:bg-red-50"
            >
              Borrar mis datos
            </button>
          )}
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-marca-magenta">Privacidad</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-zinc-600">
          <li>Tus datos no se suben a ningún servidor.</li>
          <li>Las funciones de salud son opt-in y revocables desde acá.</li>
          <li>Consentimientos activos: {VERSIONES_CONSENTIMIENTO.perfil ? 'perfil v1' : '—'}, salud general v1, menstrual v1.</li>
          <li>Al borrar tus datos también se revocan los consentimientos.</li>
        </ul>
      </Tarjeta>

      <Tarjeta>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-marca-magenta">Acerca de</h2>
        <p className="text-sm text-zinc-600">
          <strong className="font-marca text-marca-magenta">TOTALHIIT</strong> v0.1.0
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Entrenamiento y nutrición para mujeres +40. Este aviso aplica siempre: consulta a profesionales de la salud
          antes de cambiar tu rutina o tu alimentación.
        </p>
      </Tarjeta>
    </main>
  );
}
