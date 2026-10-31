import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { BotonPrimario, BotonSecundario, Tarjeta } from '../componentes/ui';
import { ETIQUETAS_OBJETIVO, type RecipePreparation } from '../lib/datos/entidades';
import { alternarFavorito, esFavorito, preparacionesDeReceta, registrarPreparacion } from '../lib/datos/repositorio';
import { ETIQUETAS_CATEGORIA_RECETA, ICONO_CATEGORIA_RECETA, obtenerReceta } from '../lib/nutricion/recetas';
import { escalarReceta, formatearCantidad } from '../lib/nutricion/motor';
import { generarPdfReceta, descargarPdf, nombreArchivoPdf, cargarLogoPdf } from '../lib/nutricion/pdf';
import { fechaHoyIso } from '../lib/utilidades/fechas';
import { usePerfil } from '../hooks/usePerfil';
import { useSuscripcion } from '../hooks/useSuscripcion';

const ETIQUETAS_PRESUPUESTO: Record<string, string> = { bajo: 'Ajustado', medio: 'Medio', alto: 'Flexible' };

function Macro({ valor, unidad, rotulo }: { valor: number; unidad: string; rotulo: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 p-2.5 text-center">
      <p className="text-lg font-extrabold text-zinc-900">
        {formatearCantidad(valor)}
        <span className="text-[11px] font-semibold text-zinc-400"> {unidad}</span>
      </p>
      <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{rotulo}</p>
    </div>
  );
}

export default function DetalleReceta() {
  const { id } = useParams<{ id: string }>();
  const { cargando, perfil, preferencias } = usePerfil();
  const { esSuscriptor } = useSuscripcion();
  const receta = id ? obtenerReceta(id) : undefined;
  const [porciones, setPorciones] = useState(2);
  const [favorita, setFavorita] = useState(false);
  const [historial, setHistorial] = useState<RecipePreparation[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [generandoPdf, setGenerandoPdf] = useState(false);

  useEffect(() => {
    if (!perfil || !receta) return;
    setPorciones(Math.min(6, Math.max(1, preferencias?.porcionesHabituales ?? 2)));
    void (async () => {
      const [fav, preps] = await Promise.all([
        esFavorito(perfil.id, 'receta', receta.id),
        preparacionesDeReceta(perfil.id, receta.id),
      ]);
      setFavorita(fav);
      setHistorial(preps);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil?.id, receta?.id]);

  if (cargando) return null;

  if (!receta || !perfil) {
    return (
      <main className="mx-auto max-w-md px-4 pb-32 pt-6 text-center">
        <Tarjeta>
          <p className="text-sm text-zinc-600">No encontramos esa receta.</p>
          <Link to="/nutricion" className="mt-3 inline-block text-sm font-semibold text-marca-magenta">
            Volver a nutrición
          </Link>
        </Tarjeta>
      </main>
    );
  }

  const escalada = escalarReceta(receta, porciones);

  const preparar = async () => {
    await registrarPreparacion({ userId: perfil.id, recetaId: receta.id, fecha: fechaHoyIso(), porciones });
    setHistorial(await preparacionesDeReceta(perfil.id, receta.id));
    setMensaje('¡Registrada! Disfruta tu plato 💜');
  };

  const alternarFav = async () => {
    const resultado = await alternarFavorito(perfil.id, 'receta', receta.id);
    setFavorita(resultado);
  };

  const descargar = async () => {
    if (!esSuscriptor) {
      setMensaje('Para usar esta función debes suscribirte al plan, Contáctanos');
      return;
    }

    setGenerandoPdf(true);
    setMensaje('');
    try {
      const logo = await cargarLogoPdf();
      const bytes = await generarPdfReceta(receta, porciones, { logoBytes: logo });
      const exito = await descargarPdf(bytes, nombreArchivoPdf(receta));
      if (exito) {
        setMensaje('¡PDF listo! El archivo se abrió para guardar o imprimir.');
      } else {
        setMensaje('No se pudo generar o descargar el PDF. Intenta de nuevo.');
      }
    } catch (err) {
      console.error('Error al generar PDF de receta:', err);
      setMensaje('No se pudo generar o descargar el PDF. Intenta de nuevo.');
    } finally {
      setGenerandoPdf(false);
    }
  };

  return (
    <main className="safe-area-superior mx-auto max-w-md space-y-4 px-4 pb-48 pt-6">
      <div>
        <Link
          to="/nutricion"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95"
        >
          ← Volver a Nutrición
        </Link>
      </div>

      {!esSuscriptor && (
        <Tarjeta className="border-purple-200 bg-purple-50">
          <p className="text-xs font-bold uppercase tracking-wide text-marca-magenta">Función Exclusiva</p>
          <p className="mt-1 text-xs text-zinc-700">
            Para descargar o imprimir los PDFs de recetas y planes debes validar tu correo o suscribirte al plan.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Link
              to="/perfil/editar"
              className="rounded-lg bg-marca-magenta px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-marca-magenta-oscuro"
            >
              Validar mi correo →
            </Link>
            <a
              href="https://wa.me/5491154188296?text=Hola%20Coach%20Valentina%2C%20quiero%20suscribirme%20al%20plan%20TOTALHIIT"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-marca-magenta/30 bg-white px-3 py-1.5 text-xs font-bold text-marca-magenta hover:bg-zinc-50"
            >
              💬 Contáctanos por WhatsApp
            </a>
          </div>
        </Tarjeta>
      )}

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-marca-magenta">
          {ICONO_CATEGORIA_RECETA[receta.categoria]} {ETIQUETAS_CATEGORIA_RECETA[receta.categoria]}
        </p>
        <h1 className="mt-0.5 text-xl font-bold text-zinc-900">{receta.nombre}</h1>
        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-semibold text-zinc-600">{receta.tiempoMin} min</span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">
            {ETIQUETAS_PRESUPUESTO[receta.presupuesto]}
          </span>
          {receta.alergenos.length === 0 ? (
            <span className="rounded-full bg-green-100 px-2 py-0.5 font-semibold text-green-700">
              Sin alérgenos comunes
            </span>
          ) : (
            receta.alergenos.map((a) => (
              <span key={a} className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                Contiene: {a}
              </span>
            ))
          )}
        </div>
      </div>

      <Tarjeta>
        <p className="text-sm leading-relaxed text-zinc-600">{receta.descripcion}</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          <Macro valor={receta.macrosPorPorcion.kcal} unidad="kcal" rotulo="kcal" />
          <Macro valor={receta.macrosPorPorcion.proteinaG} unidad="g" rotulo="Proteína" />
          <Macro valor={receta.macrosPorPorcion.carbohidratosG} unidad="g" rotulo="Carboh." />
          <Macro valor={receta.macrosPorPorcion.grasasG} unidad="g" rotulo="Grasas" />
        </div>
        <p className="mt-1.5 text-right text-[11px] text-zinc-500">Fibra: {receta.macrosPorPorcion.fibraG} g · por porción</p>
      </Tarjeta>

      <Tarjeta>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-marca-magenta">Porciones</h2>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              type="button"
              key={n}
              aria-pressed={porciones === n}
              onClick={() => setPorciones(n)}
              className={`h-9 w-9 rounded-full border text-sm font-semibold transition-colors ${
                porciones === n
                  ? 'border-marca-magenta bg-marca-magenta text-white'
                  : 'border-zinc-300 bg-white text-zinc-600'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Total para {porciones} {porciones === 1 ? 'porción' : 'porciones'}:{' '}
          <strong>
            {escalada.macrosTotales.kcal} kcal · {escalada.macrosTotales.proteinaG} g proteína
          </strong>
        </p>
      </Tarjeta>

      <Tarjeta>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-marca-magenta">Ingredientes</h2>
        <ul className="space-y-1.5">
          {escalada.ingredientes.map((i) => (
            <li key={i.nombre} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-zinc-700">{i.nombre}</span>
              <span className="shrink-0 font-semibold text-zinc-900">
                {i.cantidad === null ? 'A gusto' : `${formatearCantidad(i.cantidad)} ${i.unidad}`}
              </span>
            </li>
          ))}
        </ul>
      </Tarjeta>

      <Tarjeta>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-marca-magenta">Preparación</h2>
        <ol className="space-y-2.5">
          {receta.pasos.map((paso, indice) => (
            <li key={indice} className="flex gap-2.5 text-sm text-zinc-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-marca-crema text-[11px] font-bold text-marca-magenta-oscuro">
                {indice + 1}
              </span>
              <span>{paso}</span>
            </li>
          ))}
        </ol>
        {receta.sustituciones && (
          <p className="mt-3 rounded-xl bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-600">
            🔄 <strong>Sustituciones:</strong> {receta.sustituciones}
          </p>
        )}
        {receta.conservacion && (
          <p className="mt-2 text-xs text-zinc-500">🧊 Conservación: {receta.conservacion}</p>
        )}
      </Tarjeta>

      <div className="flex gap-3">
        <BotonPrimario onClick={() => void preparar()} className="flex-[2]">
          ✓ La preparé
        </BotonPrimario>
        <BotonSecundario onClick={() => void alternarFav()} className="flex-1">
          {favorita ? '⭐ Favorita' : '☆ Favorita'}
        </BotonSecundario>
      </div>
      {mensaje && (
        <div
          className={`rounded-2xl p-3 text-center text-xs font-bold shadow-sm ${
            mensaje.includes('Contáctanos')
              ? 'border border-amber-200 bg-amber-50 text-amber-900'
              : mensaje.includes('No se pudo')
              ? 'border border-red-200 bg-red-50 text-red-700'
              : 'border border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          <p>{mensaje}</p>
          {mensaje.includes('Contáctanos') && (
            <div className="mt-2.5 flex flex-wrap justify-center gap-2">
              <a
                href="https://wa.me/5491154188296?text=Hola%20Coach%20Valentina%2C%20quiero%20suscribirme%20al%20plan%20TOTALHIIT"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 active:scale-95"
              >
                💬 Contáctanos por WhatsApp
              </a>
              <Link
                to="/perfil/editar"
                className="inline-flex items-center gap-1.5 rounded-xl bg-marca-magenta px-3 py-2 text-xs font-bold text-white shadow hover:bg-marca-magenta-oscuro active:scale-95"
              >
                Validar mi correo
              </Link>
            </div>
          )}
        </div>
      )}

      <BotonSecundario onClick={() => void descargar()} disabled={generandoPdf} className="w-full">
        {generandoPdf ? 'Generando PDF…' : '📄 Descargar o Imprimir PDF'}
      </BotonSecundario>

      {historial.length > 0 && (
        <Tarjeta>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-marca-magenta">Preparaciones</h2>
          <ul className="space-y-1.5">
            {historial.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm text-zinc-700">
                <span>✓ {new Date(p.fecha).toLocaleDateString()}</span>
                <span className="text-xs text-zinc-500">{p.porciones} porciones</span>
              </li>
            ))}
          </ul>
        </Tarjeta>
      )}

      <Tarjeta>
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-marca-magenta">Ideal para</h2>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {receta.objetivosCompatibles.map((o) => (
            <span key={o} className="rounded-full bg-marca-crema px-2 py-0.5 font-semibold text-marca-magenta-oscuro">
              {ETIQUETAS_OBJETIVO[o]}
            </span>
          ))}
        </div>
      </Tarjeta>

      <p className="text-center text-xs text-zinc-400">
        Valores aproximados elaborados con tablas de dominio público (USDA FoodData Central). No constituyen
        indicación clínica; consulta a un profesional para planes personalizados.
      </p>

      <div className="h-20 w-full shrink-0" aria-hidden="true" />
    </main>
  );
}
