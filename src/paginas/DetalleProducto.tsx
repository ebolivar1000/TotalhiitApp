import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import AlertaPersonalizada from '../componentes/escaner/AlertaPersonalizada';
import AlternativasSaludables from '../componentes/escaner/AlternativasSaludables';
import DetalleExpandible from '../componentes/escaner/DetalleExpandible';
import ListaMotivos from '../componentes/escaner/ListaMotivos';
import ModalEditarNutrientes from '../componentes/escaner/ModalEditarNutrientes';
import OctogonosArgentina from '../componentes/escaner/OctogonosArgentina';
import SemaforoNutrientes from '../componentes/escaner/SemaforoNutrientes';
import TarjetaPuntaje from '../componentes/escaner/TarjetaPuntaje';
import { BotonPrimario, Tarjeta } from '../componentes/ui';
import { usePerfil } from '../hooks/usePerfil';
import { ATRIBUCION_OPEN_FOOD_FACTS, buscarAlternativasSaludables, consultarOpenFoodFacts } from '../lib/escaner/openfoodfacts';
import { alternarFavorito, guardarProducto, obtenerPreferenciasEscaner, obtenerProducto } from '../lib/escaner/repositorio';
import type { PreferenciasEscaner, ProductoEscaneado } from '../lib/escaner/tipos';

export default function DetalleProducto() {
  const { barcode } = useParams<{ barcode: string }>();
  const navigate = useNavigate();
  const { perfil, preferencias, objetivo } = usePerfil();

  const [producto, setProducto] = useState<ProductoEscaneado | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [esFavorito, setEsFavorito] = useState(false);
  const [escanerPrefs, setEscanerPrefs] = useState<PreferenciasEscaner | undefined>(undefined);
  const [modalEditar, setModalEditar] = useState(false);

  const manejarGuardarEdicion = async (prodActualizado: ProductoEscaneado) => {
    await guardarProducto(prodActualizado);
    setProducto(prodActualizado);
  };

  useEffect(() => {
    let cancelado = false;

    async function cargarProducto() {
      if (!barcode) {
        setError('Código de producto no especificado.');
        setCargando(false);
        return;
      }

      setCargando(true);
      setError(null);

      try {
        let prefPais: string | undefined = undefined;
        // Cargar preferencias del escáner si el usuario tiene sesión
        if (perfil?.id) {
          const ep = await obtenerPreferenciasEscaner(perfil.id);
          if (!cancelado) setEscanerPrefs(ep);
          prefPais = ep?.paisNormativa;
        }

        // 1. Intentar cargar desde caché local IndexedDB
        let prod = await obtenerProducto(barcode);

        // 2. Si no está en local, consultar Open Food Facts
        if (!prod) {
          const res = await consultarOpenFoodFacts(barcode, prefPais);
          if (res.exito && res.producto) {
            prod = res.producto;
            await guardarProducto(prod);
          } else {
            if (!cancelado) {
              setError(res.mensaje || 'No pudimos encontrar este producto.');
              setCargando(false);
            }
            return;
          }
        }

        if (cancelado) return;
        setProducto(prod);
        setEsFavorito(Boolean(prod.favorito));

        // 3. Si no tiene alternativas calculadas, buscarlas en segundo plano
        if (!prod.alternativas || prod.alternativas.length === 0) {
          const categoriaTag = prod.categoriaTags?.[0] || '';
          if (categoriaTag) {
            const alts = await buscarAlternativasSaludables(categoriaTag, prod.codigoBarras);
            if (!cancelado && alts.length > 0) {
              const actualizado = { ...prod, alternativas: alts };
              setProducto(actualizado);
              await guardarProducto(actualizado);
            }
          }
        }
      } catch {
        if (!cancelado) {
          setError('Ocurrió un error al cargar el producto.');
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    void cargarProducto();

    return () => {
      cancelado = true;
    };
  }, [barcode, perfil?.id]);

  const manejarAlternarFavorito = async () => {
    if (!producto) return;
    const nuevo = await alternarFavorito(producto.codigoBarras);
    setEsFavorito(nuevo);
  };

  const compartirProducto = async () => {
    if (!producto) return;
    const texto = `Mirá el análisis de ${producto.nombre} en TOTALHIIT: ${producto.puntaje.puntos}/100 (${producto.puntaje.fraseResumen}).`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${producto.nombre} - TOTALHIIT Escáner`,
          text: texto,
          url: window.location.href,
        });
      } catch {}
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  if (cargando) {
    return (
      <main className="safe-area-superior mx-auto max-w-md px-4 pb-28 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white"
          >
            ←
          </button>
          <p className="text-xs font-bold uppercase text-zinc-500">Evaluando producto…</p>
          <div className="h-10 w-10" />
        </div>

        <Tarjeta className="p-8 text-center space-y-3 animate-pulse">
          <span className="text-4xl">🔍</span>
          <h2 className="text-sm font-bold text-zinc-900">Calculando puntaje de salud…</h2>
          <p className="text-xs text-zinc-500">
            Analizando nutrientes, grado NOVA y aditivos con la base de Open Food Facts.
          </p>
        </Tarjeta>
      </main>
    );
  }

  if (error || !producto) {
    return (
      <main className="safe-area-superior mx-auto max-w-md px-4 pb-28 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <Link
            to="/escaner"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white"
          >
            ←
          </Link>
          <p className="text-xs font-bold uppercase text-zinc-500">Producto No Encontrado</p>
          <div className="h-10 w-10" />
        </div>

        <Tarjeta className="p-6 text-center space-y-3">
          <span className="text-4xl">📦</span>
          <h2 className="text-base font-bold text-zinc-900">No encontramos este producto</h2>
          <p className="text-xs text-zinc-600 leading-relaxed">
            {error || 'El código de barras no figura en la base de datos de Open Food Facts.'}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link to="/escaner">
              <BotonPrimario className="w-full text-xs">
                📷 Volver a Escanear otro código
              </BotonPrimario>
            </Link>
          </div>
        </Tarjeta>
      </main>
    );
  }

  return (
    <main className="safe-area-superior mx-auto max-w-md space-y-4 px-4 pb-28 pt-4">
      {/* Barra Superior con Acciones */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/escaner')}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95"
          title="Volver al escáner"
          aria-label="Volver"
        >
          ←
        </button>

        <div className="flex items-center gap-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Resultado de Escáner
          </p>
          <span className="rounded-full bg-amber-100 border border-amber-300 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-800">
            Beta
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => void manejarAlternarFavorito()}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border text-base shadow-sm transition active:scale-95 ${
              esFavorito
                ? 'border-red-300 bg-red-50 text-red-600'
                : 'border-zinc-200 bg-white text-zinc-400 hover:text-red-500'
            }`}
            title={esFavorito ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            aria-label="Favorito"
          >
            {esFavorito ? '❤️' : '🤍'}
          </button>

          <button
            type="button"
            onClick={() => void compartirProducto()}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-base text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95"
            title="Compartir resultado"
            aria-label="Compartir"
          >
            📤
          </button>
        </div>
      </div>

      {/* Ficha Principal de Identificación del Producto */}
      <Tarjeta className="p-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          {producto.imagenUrl ? (
            <img
              src={producto.imagenUrl}
              alt={producto.nombre}
              className="h-20 w-20 shrink-0 rounded-2xl border border-zinc-200 bg-zinc-50 object-contain p-1 shadow-2xs"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-pink-50/50 text-3xl">
              🛒
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600 uppercase">
                {producto.categoria || 'Alimento'}
              </span>
              {producto.paisOrigen && (
                <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                  {producto.paisOrigen.bandera} {producto.paisOrigen.nombre}
                </span>
              )}
            </div>
            <h1 className="mt-1 text-base font-black text-zinc-900 leading-snug line-clamp-2">
              {producto.nombre}
            </h1>
            {producto.marca && (
              <p className="text-xs font-semibold text-zinc-600 mt-0.5">{producto.marca}</p>
            )}
            <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
              EAN: {producto.codigoBarras}
            </p>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between border-t border-zinc-100 pt-2 text-[11px]">
          <span className="text-zinc-500 font-medium">
            {producto.editadoPorUsuario
              ? '✏️ Personalizado por ti'
              : `Fuente: ${producto.fuente === 'catalogo_local' ? 'Catálogo Local' : 'Open Food Facts'}`}
          </span>
          <button
            type="button"
            onClick={() => setModalEditar(true)}
            className="font-bold text-marca-magenta hover:underline cursor-pointer"
          >
            ✏️ Editar valores
          </button>
        </div>
      </Tarjeta>

      {/* Banner de Aviso: Valores Estimados o Incompletos */}
      {producto.perfilInferido && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 shadow-sm space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <span className="text-base">💡</span>
            <span>Valores Nutricionales Estimados</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            {producto.mensajeInferencia ||
              'Open Food Facts no tenía la tabla cargada. Estimamos los valores típicos de su categoría.'}
          </p>
          <button
            type="button"
            onClick={() => setModalEditar(true)}
            className="mt-1 font-bold text-marca-magenta underline text-xs cursor-pointer block"
          >
            ✏️ Toca aquí para ajustar los valores según tu envase
          </button>
        </div>
      )}

      {producto.datosIncompletos && !producto.perfilInferido && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 shadow-sm space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <span className="text-base">⚠️</span>
            <span>Tabla Nutricional No Informada</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Open Food Facts tiene registrado el producto pero la comunidad aún no completó la tabla nutricional (figura en 0).
          </p>
          <button
            type="button"
            onClick={() => setModalEditar(true)}
            className="mt-1 font-bold text-marca-magenta underline text-xs cursor-pointer block"
          >
            ✏️ Cargar datos nutricionales de este envase
          </button>
        </div>
      )}

      {/* 1. ALERTAS PERSONALIZADAS DE ALÉRGENOS / METAS (POR ENCIMA DE LA NOTA) */}
      <AlertaPersonalizada
        alergenosProducto={producto.alergenos || []}
        trazasProducto={producto.trazasAlergenos || []}
        ingredientesTexto={producto.ingredientesTexto || ''}
        nutrientes={producto.nutrientes}
        preferenciasUsuario={{
          alergenos: preferencias?.alergenos,
          exclusiones: preferencias?.exclusiones,
          escanerPrefs,
          objetivo: objetivo?.tipo,
        }}
      />

      {/* 2. EXPLICACIÓN EN PALABRAS SIMPLES DE LA IA (Trash Panda Style) */}
      {producto.explicacionIa && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <h3 className="font-bold text-sm text-zinc-900">En palabras simples</h3>
            </div>
            <span className="rounded-full bg-purple-100 border border-purple-300 px-2.5 py-0.5 text-[10px] font-black uppercase text-marca-magenta">
              IA Vision
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-700 leading-relaxed font-medium">
            {producto.explicacionIa}
          </p>
        </div>
      )}

      {/* 3. TARJETA PRINCIPAL DE PUNTAJE 0-100 CON FRASES Y BADGES */}
      <TarjetaPuntaje
        puntaje={producto.puntaje}
        nutriScore={producto.nutriScoreGrade}
        novaGroup={producto.novaGroup}
        ecoScore={producto.ecoScoreGrade}
      />

      {/* 3. SELLOS DE ADVERTENCIA FRONTAL SEGÚN PAÍS Y NORMATIVA */}
      <OctogonosArgentina
        octogonos={producto.puntaje.octogonos}
        leyendas={producto.puntaje.leyendas}
        paisInfo={producto.puntaje.paisNormativa}
        nutriScore={producto.nutriScoreGrade}
      />

      {/* 4. SEMÁFORO DE NUTRIENTES CON EQUIVALENCIAS COTIDIANAS */}
      <SemaforoNutrientes
        nutrientes={producto.nutrientes}
        equivalencias={producto.puntaje.equivalencias}
        esLiquido={producto.esLiquido}
        datosIncompletos={producto.datosIncompletos}
        perfilInferido={producto.perfilInferido}
      />

      {/* 5. LISTA DE MOTIVOS ("POR QUÉ TIENE ESTE PUNTAJE") */}
      <ListaMotivos motivos={producto.puntaje.motivos} />

      {/* 6. ALTERNATIVAS MÁS SALUDABLES (OPEN FOOD FACTS) */}
      {producto.alternativas && producto.alternativas.length > 0 && (
        <AlternativasSaludables
          alternativas={producto.alternativas}
          categoriaNombre={producto.categoria}
        />
      )}

      {/* 7. DETALLE TÉCNICO Y CIENTÍFICO EXPANDIBLE (TABLA, INGREDIENTES, ADITIVOS) */}
      <DetalleExpandible
        nutrientes={producto.nutrientes}
        ingredientesTexto={producto.ingredientesTexto}
        aditivos={producto.aditivos}
        esLiquido={producto.esLiquido}
      />

      {/* AVISO LEGAL Y SALUD OBLIGATORIO */}
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3.5 text-center text-[11px] text-zinc-500 leading-relaxed">
        <p className="font-semibold text-zinc-700">
          ⚠️ Aviso de salud orientativo
        </p>
        <p className="mt-0.5">
          Este análisis es exclusivamente informativo y pedagógico. No constituye diagnóstico médico ni reemplaza la consulta con un nutricionista o profesional de la salud. Para condiciones como diabetes o hipertensión, consulta siempre a tu médico.
        </p>
        <p className="mt-2 text-[10px] text-zinc-400">
          {ATRIBUCION_OPEN_FOOD_FACTS.mensaje}{' '}
          <a
            href={ATRIBUCION_OPEN_FOOD_FACTS.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-marca-magenta"
          >
            Open Food Facts
          </a>{' '}
          ({ATRIBUCION_OPEN_FOOD_FACTS.licencia}).
        </p>
      </div>

      {/* Botón flotante para escanear otro producto */}
      <div className="pt-2">
        <Link to="/escaner">
          <BotonPrimario className="w-full flex items-center justify-center gap-2">
            <span>📷</span>
            <span>Escanear otro producto</span>
          </BotonPrimario>
        </Link>
      </div>

      {/* Modal de edición / corrección de tabla nutricional */}
      <ModalEditarNutrientes
        abierto={modalEditar}
        alCerrar={() => setModalEditar(false)}
        producto={producto}
        alGuardar={(p) => void manejarGuardarEdicion(p)}
      />
    </main>
  );
}
