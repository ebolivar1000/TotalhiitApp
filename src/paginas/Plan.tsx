import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { BotonPrimario, BotonSecundario, Selector, Tarjeta } from '../componentes/ui';
import { COMIDAS_PLAN, type ComidaPlan, type PlanSemanal } from '../lib/datos/entidades';
import { obtenerPlanSemanal, guardarPlanSemanal } from '../lib/datos/repositorio';
import { CATALOGO_RECETAS, obtenerReceta } from '../lib/nutricion/recetas';
import { formatearCantidad } from '../lib/nutricion/motor';
import {
  DIAS_SEMANA,
  ETIQUETAS_COMIDA_PLAN,
  generarPlan,
  recetasParaComida,
  reemplazarSlot,
  type OpcionesPlan,
} from '../lib/nutricion/planificador';
import { consolidarCompras } from '../lib/nutricion/compras';
import { lunesDeSemana, sumarDias } from '../lib/progreso/metricas';
import { fechaHoyIso } from '../lib/utilidades/fechas';
import { usePerfil } from '../hooks/usePerfil';
import BannerSeccion from '../componentes/BannerSeccion';

const fechaCorta = (iso: string) => iso.slice(5).split('-').reverse().join('/');

export default function Plan() {
  const { cargando, perfil, preferencias, objetivo } = usePerfil();
  const semanaInicio = useMemo(() => lunesDeSemana(fechaHoyIso()), []);
  const [plan, setPlan] = useState<PlanSemanal | undefined>();
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [mostrandoCompras, setMostrandoCompras] = useState(false);
  const [generandoPdf, setGenerandoPdf] = useState(false);

  const opciones = useMemo<OpcionesPlan>(
    () => ({
      alergenos: preferencias?.alergenos,
      exclusiones: preferencias?.exclusiones,
      presupuesto: preferencias?.presupuesto,
      objetivo: objetivo?.tipo,
    }),
    [preferencias, objetivo],
  );

  const userId = perfil?.id ?? 'usuario_invitado';

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const existente = await obtenerPlanSemanal(userId, semanaInicio);
        if (!activo) return;
        if (existente && existente.slots && existente.slots.length > 0) {
          setPlan(existente);
        } else {
          // Generación automática inicial para que la usuaria siempre vea su plan de inmediato
          const porciones = preferencias?.porcionesHabituales ?? 2;
          const slots = generarPlan(opciones);
          const nuevo: PlanSemanal = {
            id: `plan_${userId}_${semanaInicio}`,
            userId,
            semanaInicio,
            slots,
            porciones,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          if (activo) setPlan(nuevo);
          void guardarPlanSemanal(userId, semanaInicio, slots, porciones).catch(() => {});
        }
      } catch (err) {
        console.error('Error al inicializar plan semanal:', err);
        // Fallback en memoria si IndexedDB tiene algún inconveniente
        const slots = generarPlan(opciones);
        if (activo) {
          setPlan({
            id: `plan_mem_${semanaInicio}`,
            userId,
            semanaInicio,
            slots,
            porciones: 2,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      } finally {
        if (activo) setCargandoDatos(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [userId, semanaInicio, opciones, preferencias]);

  const generar = async (etiqueta: string) => {
    const porciones = preferencias?.porcionesHabituales ?? 2;
    const slots = generarPlan(opciones);
    try {
      const guardado = await guardarPlanSemanal(userId, semanaInicio, slots, porciones);
      setPlan(guardado);
    } catch {
      setPlan({
        id: `plan_mem_${semanaInicio}`,
        userId,
        semanaInicio,
        slots,
        porciones,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    setMensaje(etiqueta);
  };

  const cambiar = async (dia: number, comida: ComidaPlan, recetaId: string) => {
    if (!plan || !recetaId) return;
    const slots = reemplazarSlot(plan.slots, dia, comida, recetaId);
    try {
      const guardado = await guardarPlanSemanal(userId, plan.semanaInicio, slots, plan.porciones);
      setPlan(guardado);
    } catch {
      setPlan({ ...plan, slots });
    }
    setMensaje('Comida actualizada.');
  };

  const compras = useMemo(
    () => (plan ? consolidarCompras(plan.slots, obtenerReceta, plan.porciones) : []),
    [plan],
  );
  const conCantidad = compras.filter((item) => !item.aGusto);
  const aGusto = compras.filter((item) => item.aGusto);

  const descargar = async () => {
    if (!plan) return;
    setGenerandoPdf(true);
    try {
      const { generarPdfPlan, descargarPdf, nombreArchivoPdfPlan, cargarLogoPdf } = await import('../lib/nutricion/pdf');
      const logo = await cargarLogoPdf();
      const bytes = await generarPdfPlan(plan, obtenerReceta, { logoBytes: logo });
      await descargarPdf(bytes, nombreArchivoPdfPlan(plan.semanaInicio));
      setMensaje('¡PDF del plan descargado con éxito! Revisa tus descargas o archivos.');
    } catch {
      setMensaje('No se pudo generar el PDF. Intenta de nuevo.');
    } finally {
      setGenerandoPdf(false);
    }
  };

  return (
    <main className="safe-area-superior mx-auto max-w-md space-y-4 px-4 pb-48 pt-6">
      {/* Banner moderno con imagen de Valentina */}
      <BannerSeccion
        etiqueta="Organización Nutricional"
        titulo="Plan Semanal de Comidas"
        subtitulo="Menú estructurado para los 7 días adaptado a tus alérgenos y requerimientos."
        imagenSrc="/images/banner-plan.jpg"
        insignia="Plan 7 Días"
      />

      {!perfil && (
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-pink-200 bg-pink-50/80 p-3 text-xs text-pink-900 shadow-sm">
          <span>✨ Modo invitado: viendo menú sugerido. Puedes personalizar alérgenos al completar tu perfil.</span>
          <Link to="/onboarding" className="shrink-0 font-bold text-marca-magenta underline">
            Perfil →
          </Link>
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold text-zinc-900">Menú Semanal</h1>
        <p className="text-sm text-zinc-500">
          {fechaCorta(semanaInicio)} al {fechaCorta(sumarDias(semanaInicio, 6))} · sugerido por tu objetivo y
          preferencias.
        </p>
      </div>

      {cargando || cargandoDatos ? (
        <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-marca-magenta border-t-transparent" />
          <p className="text-sm font-semibold text-zinc-700">Preparando tu menú semanal…</p>
          <p className="text-xs text-zinc-400">Distribuyendo las mejores recetas para los 7 días</p>
        </div>
      ) : !plan ? (
        /* Estado sin plan con imagen y tarjeta visual rica (NUNCA pantalla en blanco) */
        <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm">
          <div className="relative h-44 w-full overflow-hidden bg-zinc-900">
            <img
              src="/images/valentina/valen-plan-comidas.jpg"
              alt="Plan Semanal de Nutrición"
              className="h-full w-full object-cover filter brightness-[0.85]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <span className="rounded-full bg-marca-magenta px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                Nutrición Antiinflamatoria
              </span>
              <h2 className="mt-1 text-base font-black">Planifica tu semana de comidas</h2>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <p className="text-xs text-zinc-600 leading-relaxed">
              Desayuno, almuerzo, cena y snack organizados para los 7 días de la semana, respetando tus alérgenos y tus metas físicas.
            </p>

            <ul className="mt-3 space-y-1.5 text-xs text-zinc-700">
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> 7 días con 4 comidas diarias balanceadas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> Lista de compras automática consolidada
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> Descarga del plan en PDF para guardar o imprimir
              </li>
            </ul>

            <BotonPrimario className="mt-4 w-full" onClick={() => void generar('¡Tu menú semanal ha sido generado con éxito! 🥗')}>
              ✨ Generar mi menú de 7 días
            </BotonPrimario>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <BotonSecundario
              className="px-2 text-xs font-bold"
              onClick={() => void generar('Plan regenerado (los cambios manuales se rehicieron).')}
            >
              🔄 Regenerar
            </BotonSecundario>
            <BotonSecundario className="px-2 text-xs font-bold" onClick={() => setMostrandoCompras((v) => !v)}>
              {mostrandoCompras ? 'Ocultar compras' : '🛒 Compras'}
            </BotonSecundario>
            <BotonPrimario className="px-2 text-xs font-bold" disabled={generandoPdf} onClick={() => void descargar()}>
              {generandoPdf ? 'Generando…' : '📄 Descargar PDF'}
            </BotonPrimario>
          </div>

          {mensaje && <p className="text-center text-xs font-semibold text-green-700">{mensaje}</p>}

          {mostrandoCompras && (
            <Tarjeta>
              <h2 className="font-bold text-zinc-900">
                Lista de compras ({plan.porciones} {plan.porciones === 1 ? 'porción' : 'porciones'} por receta)
              </h2>
              <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                {conCantidad.map((item) => (
                  <li key={`${item.nombre}-${item.unidad}`} className="flex justify-between border-b border-zinc-100 pb-1">
                    <span>{item.nombre}</span>
                    <span className="font-semibold text-zinc-900">
                      {formatearCantidad(item.cantidad)} {item.unidad}
                    </span>
                  </li>
                ))}
              </ul>
              {aGusto.length > 0 && (
                <>
                  <p className="mt-3 text-xs font-semibold uppercase text-zinc-500">A gusto</p>
                  <p className="text-sm text-zinc-700">{aGusto.map((item) => item.nombre).join(' · ')}</p>
                </>
              )}
              {compras.length === 0 && <p className="text-sm text-zinc-500">Tu plan todavía no tiene comidas.</p>}
            </Tarjeta>
          )}

          {[0, 1, 2, 3, 4, 5, 6].map((dia) => (
            <Tarjeta key={dia}>
              <h2 className="font-bold text-zinc-900">
                {DIAS_SEMANA[dia]} <span className="text-sm font-normal text-zinc-500">· {fechaCorta(sumarDias(semanaInicio, dia))}</span>
              </h2>
              <div className="mt-2 space-y-3">
                {COMIDAS_PLAN.map((comida) => {
                  const slot = plan.slots.find((s) => s.dia === dia && s.comida === comida);
                  const candidatas = recetasParaComida(CATALOGO_RECETAS, comida, opciones);
                  return (
                    <div key={comida} className="flex items-center gap-2">
                      <span className="w-20 shrink-0 text-xs font-semibold text-zinc-500">
                        {ETIQUETAS_COMIDA_PLAN[comida]}
                      </span>
                      <div className="min-w-0 flex-1">
                        <Selector
                          opciones={candidatas.map((r) => ({ valor: r.id, etiqueta: `${r.nombre} · ${r.tiempoMin} min` }))}
                          incluirVacio={slot ? undefined : 'Sin sugerencia'}
                          value={slot?.recetaId ?? ''}
                          onChange={(e) => void cambiar(dia, comida, e.target.value)}
                        />
                      </div>
                      {slot && (
                        <Link to={`/nutricion/${slot.recetaId}`} className="shrink-0 text-xs font-semibold text-marca-magenta">
                          ver →
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </Tarjeta>
          ))}
        </>
      )}

      <p className="text-center text-[11px] text-zinc-400">
        Macros aproximados (USDA FoodData Central). El plan es orientativo y no reemplaza el consejo de
        profesionales de la salud.
      </p>

      <div className="h-20 w-full shrink-0" aria-hidden="true" />
    </main>
  );
}
