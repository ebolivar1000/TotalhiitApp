import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { BotonSecundario, Tarjeta } from '../componentes/ui';
import { borrarDatosPersonales, exportarDatos } from '../lib/datos/repositorio';
import { VERSIONES_CONSENTIMIENTO } from '../lib/datos/entidades';
import { fechaHoyIso } from '../lib/utilidades/fechas';
import { LLAVE_ONBOARDING_COMPLETADO, LLAVE_ONBOARDING_SALTADO, usePerfil } from '../hooks/usePerfil';
import { cerrarSesion, obtenerSesionActual, type SesionAuth } from '../lib/auth/auth';
import { consultarActualizacion, VERSION_ACTUAL, type ResultadoActualizacion } from '../lib/version/actualizador';

const LLAVE_SYNC_NUBE = 'totalhiit_sync_nube';
const LLAVE_CICLO_SOLO_LOCAL = 'totalhiit_ciclo_solo_local';

export default function Ajustes() {
  const { cargando, perfil, recargar } = usePerfil();
  const navigate = useNavigate();
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);
  const [sesion, setSesion] = useState<SesionAuth>(() => obtenerSesionActual());
  const [mensajeSesion, setMensajeSesion] = useState('');

  // Persistencia del estado de sincronización en la nube (Item 7)
  const [syncNube, setSyncNubeState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(LLAVE_SYNC_NUBE) === 'true';
  });

  const [cicloSoloLocal, setCicloSoloLocalState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const val = localStorage.getItem(LLAVE_CICLO_SOLO_LOCAL);
    return val === null ? true : val === 'true';
  });

  const setSyncNube = (val: boolean) => {
    setSyncNubeState(val);
    localStorage.setItem(LLAVE_SYNC_NUBE, String(val));
  };

  const setCicloSoloLocal = (val: boolean) => {
    setCicloSoloLocalState(val);
    localStorage.setItem(LLAVE_CICLO_SOLO_LOCAL, String(val));
  };

  const [estadoActualizacion, setEstadoActualizacion] = useState<ResultadoActualizacion | null>(null);
  const [buscandoActualizacion, setBuscandoActualizacion] = useState(false);

  const verificarVersion = async () => {
    setBuscandoActualizacion(true);
    const res = await consultarActualizacion();
    setEstadoActualizacion(res);
    setBuscandoActualizacion(false);
  };

  const handleCerrarSesion = () => {
    const sesionInvitada = cerrarSesion();
    setSesion(sesionInvitada);
    setMensajeSesion('Has cerrado sesión correctamente. Tus entrenamientos y datos locales siguen a salvo.');
    setTimeout(() => setMensajeSesion(''), 5000);
  };

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
    localStorage.removeItem(LLAVE_ONBOARDING_COMPLETADO);
    await borrarDatosPersonales();
    await recargar();
    navigate('/onboarding', { replace: true });
  };

  return (
    <main className="safe-area-superior mx-auto max-w-md space-y-4 px-4 pb-48 pt-6">
      <div className="flex items-center justify-between pb-1">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95"
        >
          ← Volver al Inicio
        </button>
      </div>

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

      {/* FASE 10: Cuenta, Membresía y Sincronización */}
      <Tarjeta>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-marca-magenta">Cuenta y Membresía</h2>
        <div className="space-y-2 text-sm text-zinc-600">
          <p>
            Estado: <strong>{sesion.rol === 'invitado' ? 'Modo Invitado (100% local)' : sesion.email}</strong>
          </p>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-800">Plan TOTALHIIT:</span>
              <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-bold text-zinc-700 uppercase">
                {sesion.plan === 'gratis' ? 'Gratis' : sesion.plan}
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              El módulo menstrual básico, las calculadoras y la exportación de datos son <strong>siempre gratuitos</strong>.
              Las suscripciones premium se habilitarán próximamente sin cobros sorpresa.
            </p>
          </div>

          {mensajeSesion && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-2.5 text-xs font-semibold text-green-800">
              ✓ {mensajeSesion}
            </div>
          )}

          {/* Botón de Cerrar Sesión (Item 6) */}
          <button
            type="button"
            onClick={handleCerrarSesion}
            className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95"
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-marca-magenta">Sincronización y Respaldo</h2>
        <div className="space-y-3 text-sm text-zinc-600">
          <label className="flex items-center justify-between cursor-pointer">
            <span>Sincronización en la nube:</span>
            <input
              type="checkbox"
              checked={syncNube}
              onChange={(e) => setSyncNube(e.target.checked)}
              className="h-5 w-5 rounded border-zinc-300 text-marca-magenta focus:ring-marca-magenta"
            />
          </label>
          <p className="text-xs text-zinc-500">
            {syncNube
              ? 'La sincronización está activa para tus entrenamientos, recetas y registros generales.'
              : 'Modo local-first activo: tus datos residen únicamente en la memoria de este dispositivo.'}
          </p>

          <div className="rounded-xl border border-marca-magenta/20 bg-pink-50/50 p-3">
            <label className="flex items-center justify-between cursor-pointer font-medium text-zinc-800">
              <span>Privacidad de ciclo menstrual:</span>
              <input
                type="checkbox"
                checked={cicloSoloLocal}
                onChange={(e) => setCicloSoloLocal(e.target.checked)}
                className="h-5 w-5 rounded border-zinc-300 text-marca-magenta focus:ring-marca-magenta"
              />
            </label>
            <p className="mt-1 text-xs text-zinc-600">
              {cicloSoloLocal
                ? '🔒 Tus datos íntimos de ciclo se conservan estrictamente en este dispositivo (máxima privacidad).'
                : '🔑 Sincronización Zero-Knowledge: los datos de ciclo se cifran en tu navegador con tu PIN antes de viajar.'}
            </p>
          </div>
        </div>
      </Tarjeta>

      <Tarjeta>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-marca-magenta">
            Actualización de la App
          </h2>
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-marca-magenta">
            v{VERSION_ACTUAL}
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-600">
          Puedes actualizar la app con un solo clic sin perder tus datos, entrenamientos ni configuraciones.
        </p>

        <div className="mt-3 space-y-2">
          {estadoActualizacion && (
            <div
              className={`rounded-xl p-3 text-xs ${
                estadoActualizacion.disponible
                  ? 'border border-green-200 bg-green-50 text-green-900'
                  : 'border border-zinc-200 bg-zinc-50 text-zinc-700'
              }`}
            >
              <p className="font-semibold">{estadoActualizacion.mensaje}</p>
              {estadoActualizacion.versionRemota?.novedades &&
                estadoActualizacion.versionRemota.novedades.length > 0 && (
                  <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[11px] text-zinc-600">
                    {estadoActualizacion.versionRemota.novedades.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                )}
            </div>
          )}

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <BotonSecundario
              onClick={() => void verificarVersion()}
              disabled={buscandoActualizacion}
              className="min-h-[44px] flex-1 text-xs font-bold"
            >
              {buscandoActualizacion ? '🔍 Verificando en el servidor…' : '🔍 Buscar actualización'}
            </BotonSecundario>

            <button
              type="button"
              onClick={() => {
                const url = `https://totalhiit-app.caribialabs.workers.dev/totalhiit.apk?_t=${Date.now()}`;
                window.open(url, '_system');
              }}
              className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-marca-magenta px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-marca-magenta-oscuro active:scale-95 text-center"
            >
              ⬇️ Descargar APK Oficial (v{VERSION_ACTUAL})
            </button>
          </div>

          {estadoActualizacion?.disponible && (
            <button
              type="button"
              onClick={() => {
                const url = `https://totalhiit-app.caribialabs.workers.dev/totalhiit.apk?_t=${Date.now()}`;
                window.open(url, '_system');
              }}
              className="mt-2 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow transition hover:bg-emerald-700 active:scale-95 text-center"
            >
              📲 Descargar e instalar versión v{estadoActualizacion.versionRemota?.version ?? 'nueva'}
            </button>
          )}

          <p className="text-[11px] leading-relaxed text-zinc-500">
            💡 <strong>Instalación segura:</strong> Al descargar el archivo APK y abrirlo en tu celular, Android lo instalará automáticamente sobre la versión existente, conservando intactos tus entrenamientos, recetas y progreso.
          </p>
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-marca-magenta">Mis datos</h2>
        <p className="mb-3 text-sm text-zinc-600">
          Todo se guarda solo en este dispositivo. Puedes exportarlos cuando quieras.
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
          <li>Tus datos no se suben a ningún servidor sin tu consentimiento.</li>
          <li>Las funciones de salud son opcionales y revocables desde aquí.</li>
          <li>Consentimientos activos: {VERSIONES_CONSENTIMIENTO.perfil ? 'perfil v1' : '—'}, salud general v1, menstrual v1.</li>
          <li>Al borrar tus datos también se revocan los consentimientos.</li>
        </ul>
        <div className="mt-3 border-t border-zinc-100 pt-2">
          <Link to="/privacidad" className="text-xs font-semibold text-marca-magenta hover:underline">
            Ver Política de Privacidad completa →
          </Link>
        </div>
      </Tarjeta>

      <Tarjeta>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-marca-magenta">Acerca de</h2>
        <p className="text-sm text-zinc-600">
          <strong className="font-marca text-marca-magenta">TOTALHIIT</strong> v{VERSION_ACTUAL}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Entrenamiento y nutrición para mujeres +40. Este aviso aplica siempre: consulta a profesionales de la salud
          antes de cambiar tu rutina o tu alimentación.
        </p>
      </Tarjeta>

      <div className="pt-2 text-center">
        <Link to="/admin" className="text-xs text-zinc-400 hover:text-marca-magenta">
          👑 Panel de Administración
        </Link>
      </div>

      <div className="h-20 w-full shrink-0" aria-hidden="true" />
    </main>
  );
}
