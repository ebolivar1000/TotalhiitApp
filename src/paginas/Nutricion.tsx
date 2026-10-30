import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { EntradaTexto, Tarjeta } from '../componentes/ui';
import type { Favorito, PlanSemanal, RecipePreparation } from '../lib/datos/entidades';
import { COMIDAS_PLAN, ETIQUETAS_OBJETIVO } from '../lib/datos/entidades';
import { alternarFavorito, favoritosDe, obtenerPlanSemanal, preparacionesDe } from '../lib/datos/repositorio';
import {
  CATALOGO_RECETAS,
  ETIQUETAS_CATEGORIA_RECETA,
  ICONO_CATEGORIA_RECETA,
  obtenerReceta,
  type CategoriaReceta,
} from '../lib/nutricion/recetas';
import { filtrarRecetas, ordenarPorObjetivo } from '../lib/nutricion/motor';
import { DIAS_SEMANA, ETIQUETAS_COMIDA_PLAN, generarPlan } from '../lib/nutricion/planificador';
import { lunesDeSemana } from '../lib/progreso/metricas';
import { fechaHoyIso } from '../lib/utilidades/fechas';
import { usePerfil } from '../hooks/usePerfil';
import { useSuscripcion } from '../hooks/useSuscripcion';
import BannerSeccion from '../componentes/BannerSeccion';

const ICONO_COMIDA: Record<string, string> = {
  desayuno: '🌅',
  almuerzo: '🥗',
  cena: '🍲',
  snack: '🍎',
};

export default function Nutricion() {
  const { cargando, perfil, preferencias, objetivo } = usePerfil();
  const { esSuscriptor } = useSuscripcion();
  const navigate = useNavigate();

  const [vista, setVista] = useState<'hoy' | 'catalogo'>('hoy');
  const [categoria, setCategoria] = useState<CategoriaReceta | null>(null);
  const [soloFavoritas, setSoloFavoritas] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [favoritas, setFavoritas] = useState<Set<string>>(new Set());
  const [preparadas, setPreparadas] = useState<RecipePreparation[]>([]);

  // Plan semanal para obtener las comidas de hoy
  const semanaInicio = useMemo(() => lunesDeSemana(fechaHoyIso()), []);
  const [planSemanal, setPlanSemanal] = useState<PlanSemanal | null>(null);

  const userId = perfil?.id ?? 'usuario_invitado';

  const recargar = async () => {
    if (!perfil) return;
    const [favs, preps] = await Promise.all([favoritosDe(perfil.id, 'receta'), preparacionesDe(perfil.id)]);
    setFavoritas(new Set(favs.map((f: Favorito) => f.refId)));
    setPreparadas(preps);
  };

  useEffect(() => {
    void recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil?.id]);

  useEffect(() => {
    void (async () => {
      try {
        let p = await obtenerPlanSemanal(userId, semanaInicio);
        if (!p) {
          const slots = generarPlan({
            alergenos: preferencias?.alergenos,
            exclusiones: preferencias?.exclusiones,
            presupuesto: preferencias?.presupuesto,
            objetivo: objetivo?.tipo,
          });
          p = {
            id: `plan_${userId}_${semanaInicio}`,
            userId,
            semanaInicio,
            slots,
            porciones: 2,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
        }
        setPlanSemanal(p ?? null);
      } catch {
        const slots = generarPlan({});
        setPlanSemanal({
          id: `plan_mem_${semanaInicio}`,
          userId,
          semanaInicio,
          slots,
          porciones: 2,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    })();
  }, [userId, semanaInicio, preferencias, objetivo]);

  // Día de la semana actual (0 = Lunes, ..., 6 = Domingo)
  const diaSemanaIndex = (new Date().getDay() + 6) % 7;
  const nombreDiaHoy = DIAS_SEMANA[diaSemanaIndex];

  // Comidas específicas programadas para hoy
  const comidasHoy = useMemo(() => {
    if (!planSemanal) return [];
    const slotsHoy = planSemanal.slots.filter((s) => s.dia === diaSemanaIndex);
    return COMIDAS_PLAN.map((c) => {
      const slot = slotsHoy.find((s) => s.comida === c);
      const receta = slot ? obtenerReceta(slot.recetaId) : undefined;
      return {
        comida: c,
        etiqueta: ETIQUETAS_COMIDA_PLAN[c],
        icono: ICONO_COMIDA[c] ?? '🍽️',
        receta,
      };
    });
  }, [planSemanal, diaSemanaIndex]);

  const conMotor = useMemo(
    () =>
      filtrarRecetas(CATALOGO_RECETAS, {
        alergenos: preferencias?.alergenos ?? [],
        exclusiones: preferencias?.exclusiones ?? [],
        tiempoMaxMin: preferencias?.tiempoCocinaMaxMin ?? null,
        presupuesto: preferencias?.presupuesto ?? null,
      }),
    [preferencias],
  );

  const filtradas = useMemo(() => {
    let lista = ordenarPorObjetivo(
      filtrarRecetas(conMotor, { categoria, ingrediente: busqueda.trim() || null }),
      objetivo?.tipo ?? null,
    );
    if (soloFavoritas) lista = lista.filter((r) => favoritas.has(r.id));
    return lista;
  }, [conMotor, categoria, busqueda, objetivo, soloFavoritas, favoritas]);

  const ocultasPorMotor = CATALOGO_RECETAS.length - conMotor.length;
  const conteoPreparadas = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const p of preparadas) mapa.set(p.recetaId, (mapa.get(p.recetaId) ?? 0) + 1);
    return mapa;
  }, [preparadas]);

  const alternarFav = async (id: string) => {
    if (!perfil) return;
    await alternarFavorito(perfil.id, 'receta', id);
    await recargar();
  };

  if (cargando) {
    return (
      <main className="safe-area-superior mx-auto max-w-md space-y-4 px-4 pb-48 pt-6">
        <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-marca-magenta border-t-transparent" />
          <p className="text-sm font-semibold text-zinc-700">Cargando recetas de nutrición…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="safe-area-superior mx-auto max-w-md space-y-4 px-4 pb-48 pt-6">
      {/* Banner moderno con fotografía gastronómica saludable */}
      <BannerSeccion
        etiqueta="Alimentación +40"
        titulo="Nutrición Antiinflamatoria"
        subtitulo="Recetas prácticas y deliciosas diseñadas para regular hormonas, saciarte y llenarte de vitalidad."
        imagenSrc="/images/banner-nutricion.jpg"
        insignia="Coach Valentina"
      />

      {/* SELECTOR DE VISTA: RECETAS PARA HOY VS CATÁLOGO COMPLETO */}
      <div className="grid grid-cols-2 rounded-2xl bg-zinc-200/80 p-1 text-xs shadow-inner">
        <button
          type="button"
          onClick={() => setVista('hoy')}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 font-bold transition-all ${
            vista === 'hoy' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <span>☀️ Recetas para hoy</span>
        </button>
        <button
          type="button"
          onClick={() => setVista('catalogo')}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 font-bold transition-all ${
            vista === 'catalogo' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <span>📚 Catálogo completo</span>
        </button>
      </div>

      {vista === 'hoy' ? (
        /* VISTA: RECETAS PARA HOY (ROTACIÓN DIARIA DEL PLAN) */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-lg font-black text-zinc-900">Tu menú para hoy ({nombreDiaHoy})</h2>
              <p className="text-xs text-zinc-500">4 comidas balanceadas y rotativas programadas para ti.</p>
            </div>
            <Link
              to="/plan"
              className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-marca-magenta shadow-xs hover:bg-zinc-50"
            >
              📅 Plan semanal
            </Link>
          </div>

          {comidasHoy.map((item) => {
            const r = item.receta;
            return (
              <Tarjeta key={item.comida} className="overflow-hidden">
                <div className="flex items-start justify-between border-b border-zinc-100 pb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-marca-magenta">
                    <span>{item.icono}</span>
                    <span>{item.etiqueta}</span>
                  </span>
                  {r && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
                      ⏱️ {r.tiempoMin} min
                    </span>
                  )}
                </div>

                {r ? (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/nutricion/${r.id}`)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/nutricion/${r.id}`)}
                    className="mt-3 flex cursor-pointer items-start gap-3"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-2xl shadow-xs">
                      <span>{ICONO_CATEGORIA_RECETA[r.categoria]}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-zinc-900 leading-snug">{r.nombre}</h3>
                      <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{r.descripcion}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-bold text-zinc-700">
                          {r.macrosPorPorcion.kcal} kcal
                        </span>
                        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700">
                          {r.macrosPorPorcion.proteinaG}g proteína
                        </span>
                        <span className="ml-auto font-bold text-marca-magenta text-xs">
                          Ver receta →
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-zinc-500">Sin sugerencia asignada para esta comida.</p>
                )}
              </Tarjeta>
            );
          })}

          <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50 p-4 shadow-xs">
            <div className="flex items-start gap-2.5">
              <span className="text-xl">💡</span>
              <div className="text-xs text-zinc-600 leading-relaxed">
                <p className="font-bold text-zinc-900">¿Cómo funcionan las recetas?</p>
                <p className="mt-0.5">
                  Las recetas <strong>cambian todos los días</strong> dentro de tu plan semanal (lunes a domingo) para darte variedad de nutrientes y regular tus hormonas. En la pestaña &quot;Catálogo completo&quot; puedes consultar y buscar todas las recetas en cualquier momento.
                </p>
              </div>
            </div>

            <Link
              to="/plan"
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-zinc-800"
            >
              <span>📅 Ver menú semanal de los 7 días y compras →</span>
            </Link>
          </div>
        </div>
      ) : (
        /* VISTA: CATÁLOGO COMPLETO CON FILTROS Y BÚSQUEDA */
        <>
          <div className="flex items-center justify-between gap-3 pt-1">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Catálogo de Recetas</h2>
              <p className="text-xs text-zinc-500">
                {objetivo ? `Priorizadas para: ${ETIQUETAS_OBJETIVO[objetivo.tipo]}` : 'Elige tu objetivo para priorizarlas'}
              </p>
            </div>
            <Link
              to="/perfil/editar"
              className="inline-flex min-h-[40px] items-center rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-marca-magenta shadow-sm transition hover:bg-zinc-50 active:scale-95"
            >
              Mis preferencias
            </Link>
          </div>

          {(preferencias?.alergenos.length ?? 0) > 0 && (
            <Tarjeta className="border-green-200 bg-green-50">
              <p className="text-xs leading-relaxed text-green-800">
                🛡️ El motor <strong>nunca</strong> sugiere recetas con tus alérgenos ({preferencias?.alergenos.join(', ')}) ni
                tus exclusiones. {ocultasPorMotor} receta{ocultasPorMotor === 1 ? ' oculta' : 's ocultas'} por tus preferencias.
              </p>
            </Tarjeta>
          )}

          <EntradaTexto
            placeholder="¿Qué tienes en casa? Ej: espinaca, pollo"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar por ingrediente"
          />

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            <button
              type="button"
              onClick={() => setCategoria(null)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${categoria === null ? 'border-marca-magenta bg-marca-crema font-semibold text-marca-magenta-oscuro' : 'border-zinc-300 bg-white text-zinc-600'}`}
            >
              Todas
            </button>
            {(Object.keys(ETIQUETAS_CATEGORIA_RECETA) as CategoriaReceta[]).map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCategoria(categoria === c ? null : c)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${categoria === c ? 'border-marca-magenta bg-marca-crema font-semibold text-marca-magenta-oscuro' : 'border-zinc-300 bg-white text-zinc-600'}`}
              >
                <span aria-hidden="true" className="mr-1">
                  {ICONO_CATEGORIA_RECETA[c]}
                </span>
                {ETIQUETAS_CATEGORIA_RECETA[c]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSoloFavoritas(!soloFavoritas)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${soloFavoritas ? 'border-marca-magenta bg-marca-crema font-semibold text-marca-magenta-oscuro' : 'border-zinc-300 bg-white text-zinc-600'}`}
            >
              ⭐ Favoritas
            </button>
          </div>

          <div className="space-y-3">
            {filtradas.map((r, idx) => {
              const esDemo = idx < 4;
              const bloqueada = !esSuscriptor && !esDemo;

              return (
                <Tarjeta key={r.id} className="relative">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/nutricion/${r.id}`)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/nutricion/${r.id}`)}
                    className="flex cursor-pointer items-start gap-3"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-marca-crema to-white text-2xl">
                      <span aria-hidden="true">{ICONO_CATEGORIA_RECETA[r.categoria]}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-zinc-900">{r.nombre}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{r.descripcion}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                        {esDemo && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">
                            ⭐ Demo
                          </span>
                        )}
                        {bloqueada && (
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 font-bold text-marca-magenta">
                            🔒 Suscriptoras
                          </span>
                        )}
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-semibold text-zinc-600">
                          {r.macrosPorPorcion.kcal} kcal
                        </span>
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">
                          {r.macrosPorPorcion.proteinaG} g prot.
                        </span>
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">{r.tiempoMin} min</span>
                        {objetivo && r.objetivosCompatibles.includes(objetivo.tipo) && (
                          <span className="rounded-full bg-marca-crema px-2 py-0.5 font-semibold text-marca-magenta-oscuro">
                            Para tu objetivo
                          </span>
                        )}
                        {(conteoPreparadas.get(r.id) ?? 0) > 0 && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-700">
                            ✓ Preparada {conteoPreparadas.get(r.id)}×
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={favoritas.has(r.id) ? 'Quitar de favoritas' : 'Agregar a favoritas'}
                    onClick={() => void alternarFav(r.id)}
                    className={`absolute right-3 top-3 text-xl transition-transform active:scale-90 ${favoritas.has(r.id) ? 'opacity-100' : 'opacity-30'}`}
                  >
                    {favoritas.has(r.id) ? '⭐' : '☆'}
                  </button>
                </Tarjeta>
              );
            })}
            {filtradas.length === 0 && (
              <Tarjeta className="text-center">
                <p className="text-sm text-zinc-500">No hay recetas con esos filtros. Prueba quitando alguno.</p>
              </Tarjeta>
            )}
          </div>
        </>
      )}

      <p className="text-center text-xs text-zinc-400">
        Valores nutricionales aproximados (elaborados con tablas de dominio público USDA FoodData Central).
        No constituyen indicación clínica.
      </p>

      <div className="h-20 w-full shrink-0" aria-hidden="true" />
    </main>
  );
}
