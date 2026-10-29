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

  useEffect(() => {
    if (!perfil) {
      setCargandoDatos(false);
      return;
    }
    void (async () => {
      setPlan(await obtenerPlanSemanal(perfil.id, semanaInicio));
      setCargandoDatos(false);
    })();
  }, [perfil, semanaInicio]);

  if (cargando || cargandoDatos) return null;

  if (!perfil) {
    return (
      <main className="mx-auto max-w-md px-4 pb-48 pt-6 text-center">
        <Tarjeta>
          <p className="text-sm text-zinc-600">Completa tu perfil para organizar tu plan.</p>
          <Link to="/onboarding" className="mt-3 inline-block text-sm font-semibold text-marca-magenta">
            Ir al onboarding
          </Link>
        </Tarjeta>
      </main>
    );
  }

  const generar = async (etiqueta: string) => {
    const porciones = preferencias?.porcionesHabituales ?? 2;
    const slots = generarPlan(opciones);
    const guardado = await guardarPlanSemanal(perfil.id, semanaInicio, slots, porciones);
    setPlan(guardado);
    setMensaje(etiqueta);
  };

  const cambiar = async (dia: number, comida: ComidaPlan, recetaId: string) => {
    if (!plan || !recetaId) return;
    const slots = reemplazarSlot(plan.slots, dia, comida, recetaId);
    const guardado = await guardarPlanSemanal(perfil.id, plan.semanaInicio, slots, plan.porciones);
    setPlan(guardado);
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
    <main className="mx-auto max-w-md space-y-4 px-4 pb-48 pt-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Plan semanal</h1>
        <p className="text-sm text-zinc-500">
          {fechaCorta(semanaInicio)} al {fechaCorta(sumarDias(semanaInicio, 6))} · sugerido por tu objetivo y
          preferencias (sin IA).
        </p>
      </div>

      {!plan ? (
        <Tarjeta className="text-center">
          <p className="text-3xl" aria-hidden="true">
            🍽️
          </p>
          <h2 className="mt-2 font-bold text-zinc-900">Organiza tu menú de la semana</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Desayuno, almuerzo, cena y snack para los 7 días, respetando tus alérgenos, tu presupuesto y tu
            objetivo. Después puedes cambiar cualquier comida.
          </p>
          <BotonPrimario className="mt-4 w-full" onClick={() => void generar('Plan generado. Cambia lo que quieras.')}>
            Generar mi plan
          </BotonPrimario>
        </Tarjeta>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <BotonSecundario
              className="px-2 text-sm"
              onClick={() => void generar('Plan regenerado (los cambios manuales se rehicieron).')}
            >
              Regenerar
            </BotonSecundario>
            <BotonSecundario className="px-2 text-sm" onClick={() => setMostrandoCompras((v) => !v)}>
              {mostrandoCompras ? 'Ocultar compras' : 'Compras'}
            </BotonSecundario>
            <BotonPrimario className="px-2 text-sm" disabled={generandoPdf} onClick={() => void descargar()}>
              {generandoPdf ? 'Generando…' : '📄 Descargar en PDF'}
            </BotonPrimario>
          </div>

          {mensaje && <p className="text-center text-sm font-semibold text-green-700">{mensaje}</p>}

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
