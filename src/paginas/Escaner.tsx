import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import VisorCamara from '../componentes/escaner/VisorCamara';
import { BotonPrimario, BotonSecundario, EntradaTexto, Tarjeta } from '../componentes/ui';
import { consultarOpenFoodFacts } from '../lib/escaner/openfoodfacts';
import { guardarProducto, obtenerProducto } from '../lib/escaner/repositorio';
import { crearProductoDesdeOcr, extraerNutrientesDeTexto } from '../lib/escaner/ocr';

export default function Escaner() {
  const navigate = useNavigate();
  const [modalManual, setModalManual] = useState(false);
  const [codigoManual, setCodigoManual] = useState('');
  const [modalOcr, setModalOcr] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Formulario para OCR / Carga Manual de Tabla Nutricional
  const [formOcr, setFormOcr] = useState({
    nombre: '',
    marca: '',
    codigoBarras: '',
    calorias: '',
    azucares: '',
    grasasTotales: '',
    grasasSaturadas: '',
    sodio: '',
    fibra: '',
    proteinas: '',
    ingredientes: '',
    esLiquido: false,
  });

  // Procesar código detectado por la cámara o ingresado manualmente
  const procesarCodigo = async (codigo: string) => {
    const cod = codigo.trim();
    if (!cod) return;

    setCargando(true);
    setMensajeError(null);

    try {
      // 1. Revisar si ya está en caché local de IndexedDB
      const enCache = await obtenerProducto(cod);
      if (enCache) {
        setCargando(false);
        navigate(`/escaner/producto/${cod}`);
        return;
      }

      // 2. Consultar Open Food Facts
      const res = await consultarOpenFoodFacts(cod);
      if (res.exito && res.producto) {
        await guardarProducto(res.producto);
        setCargando(false);
        navigate(`/escaner/producto/${cod}`);
        return;
      }

      // 3. Si no existe en la base, ofrecer carga manual / OCR
      setCargando(false);
      setMensajeError(
        res.mensaje || 'Producto no encontrado. Puedes registrarlo con los datos de su etiqueta.',
      );
      setFormOcr((prev) => ({ ...prev, codigoBarras: cod }));
      setModalOcr(true);
    } catch {
      setCargando(false);
      setMensajeError('Error de conexión al consultar el producto. Intenta nuevamente.');
    }
  };

  const manejarEnvioManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (codigoManual.trim()) {
      setModalManual(false);
      void procesarCodigo(codigoManual);
    }
  };

  // Manejar subida de foto de etiqueta / tabla nutricional
  const manejarFotoSubida = (file: File) => {
    // Si sube foto, se abre el modal guiado y se lee el nombre del archivo
    setModalOcr(true);
    setFormOcr((prev) => ({
      ...prev,
      nombre: prev.nombre || file.name.replace(/\.[^/.]+$/, ''),
    }));
  };

  // Guardar producto manual / OCR
  const guardarProductoManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = crearProductoDesdeOcr({
      nombre: formOcr.nombre || 'Producto personalizado',
      marca: formOcr.marca,
      codigoBarras: formOcr.codigoBarras,
      esLiquido: formOcr.esLiquido,
      nutrientes: {
        caloriasKcal: parseFloat(formOcr.calorias) || 0,
        azucaresG: parseFloat(formOcr.azucares) || 0,
        grasasTotalesG: parseFloat(formOcr.grasasTotales) || 0,
        grasasSaturadasG: parseFloat(formOcr.grasasSaturadas) || 0,
        sodioMg: parseFloat(formOcr.sodio) || 0,
        fibraG: parseFloat(formOcr.fibra) || 0,
        proteinasG: parseFloat(formOcr.proteinas) || 0,
      },
      ingredientesTexto: formOcr.ingredientes,
    });

    await guardarProducto(prod);
    setModalOcr(false);
    navigate(`/escaner/producto/${prod.codigoBarras}`);
  };

  return (
    <main className="safe-area-superior mx-auto max-w-md space-y-4 px-4 pb-28 pt-4">
      {/* Cabecera de Navegación del Escáner */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50"
        >
          ←
        </Link>
        <div className="text-center">
          <h1 className="text-base font-black uppercase tracking-wide text-zinc-900">
            Escáner de Alimentos
          </h1>
          <p className="text-[11px] font-semibold text-zinc-500">
            Enfoca el código de barras
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Link
            to="/escaner/historial"
            title="Historial y Favoritos"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-base shadow-sm hover:bg-zinc-50 active:scale-95"
          >
            📋
          </Link>
          <Link
            to="/escaner/preferencias"
            title="Mis Preferencias Nutricionales"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-base shadow-sm hover:bg-zinc-50 active:scale-95"
          >
            ⚙️
          </Link>
        </div>
      </div>

      {/* Mensaje de Carga / Error */}
      {cargando && (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-marca-magenta/30 bg-pink-50 p-3.5 text-xs font-bold text-marca-magenta animate-pulse shadow-sm">
          <span className="text-lg">🔍</span>
          <span>Analizando producto en Open Food Facts…</span>
        </div>
      )}

      {mensajeError && !cargando && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 shadow-sm">
          <p className="font-bold">Aviso del Escáner:</p>
          <p className="mt-0.5">{mensajeError}</p>
        </div>
      )}

      {/* Visor de Cámara con detección en tiempo real */}
      <VisorCamara
        onCodigoDetectado={(cod) => void procesarCodigo(cod)}
        onIngresoManual={() => setModalManual(true)}
        onFotoSubida={manejarFotoSubida}
      />

      {/* Guía Rápida de Uso en Supermercado */}
      <Tarjeta className="p-4 text-xs">
        <h2 className="font-bold uppercase tracking-wider text-marca-magenta text-[11px]">
          Cómo usar en el supermercado
        </h2>
        <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-[11px] text-zinc-700">
          <div className="rounded-xl bg-zinc-50 p-2 border border-zinc-100">
            <span className="text-lg">📸</span>
            <p className="mt-1 font-bold text-zinc-900">1. Apunta</p>
            <p className="text-[10px] text-zinc-500">Al código de barras del envase</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-2 border border-zinc-100">
            <span className="text-lg">⏱️</span>
            <p className="mt-1 font-bold text-zinc-900">2. En 3 seg</p>
            <p className="text-[10px] text-zinc-500">Nota 0-100 y octógonos</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-2 border border-zinc-100">
            <span className="text-lg">🌱</span>
            <p className="mt-1 font-bold text-zinc-900">3. Alternativas</p>
            <p className="text-[10px] text-zinc-500">Opciones más sanas del estante</p>
          </div>
        </div>
      </Tarjeta>

      {/* MODAL: Ingreso manual de código de barras */}
      {modalManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <Tarjeta className="w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <h3 className="text-sm font-bold text-zinc-900">Ingreso Manual de Código</h3>
              <button
                type="button"
                onClick={() => setModalManual(false)}
                className="text-lg font-bold text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={manejarEnvioManual} className="space-y-3">
              <p className="text-xs text-zinc-600">
                Ingresa los números que figuran debajo del código de barras (ej. 7791234567890):
              </p>
              <EntradaTexto
                type="tel"
                inputMode="numeric"
                autoFocus
                placeholder="Ej: 7791234567890"
                value={codigoManual}
                onChange={(e) => setCodigoManual(e.target.value)}
                className="text-center font-mono text-lg tracking-widest"
              />

              <div className="flex gap-2 pt-2">
                <BotonSecundario
                  type="button"
                  onClick={() => setModalManual(false)}
                  className="flex-1 text-xs"
                >
                  Cancelar
                </BotonSecundario>
                <BotonPrimario type="submit" className="flex-1 text-xs">
                  Consultar →
                </BotonPrimario>
              </div>
            </form>
          </Tarjeta>
        </div>
      )}

      {/* MODAL: Carga Manual / Fallback OCR de Tabla Nutricional */}
      {modalOcr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs">
          <Tarjeta className="max-h-[90vh] w-full max-w-md overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Evaluar por Etiqueta Nutricional</h3>
                <p className="text-[11px] text-zinc-500">Ingresa los valores por 100g para calcular la nota</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOcr(false)}
                className="text-lg font-bold text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={guardarProductoManual} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700">Nombre del producto *</label>
                <EntradaTexto
                  required
                  placeholder="Ej: Galletitas de Avena y Miel"
                  value={formOcr.nombre}
                  onChange={(e) => setFormOcr({ ...formOcr, nombre: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-zinc-700">Marca (opcional)</label>
                  <EntradaTexto
                    placeholder="Ej: Quaker"
                    value={formOcr.marca}
                    onChange={(e) => setFormOcr({ ...formOcr, marca: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700">Código de barras</label>
                  <EntradaTexto
                    placeholder="Opcional"
                    value={formOcr.codigoBarras}
                    onChange={(e) => setFormOcr({ ...formOcr, codigoBarras: e.target.value })}
                  />
                </div>
              </div>

              {/* Selector Líquido vs Sólido */}
              <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-2.5 border border-zinc-200">
                <input
                  type="checkbox"
                  id="chkLiquido"
                  checked={formOcr.esLiquido}
                  onChange={(e) => setFormOcr({ ...formOcr, esLiquido: e.target.checked })}
                  className="h-4 w-4 rounded accent-marca-magenta"
                />
                <label htmlFor="chkLiquido" className="font-semibold text-zinc-800">
                  Es una bebida o alimento líquido (por 100 ml)
                </label>
              </div>

              {/* Valores Nutricionales por 100g/ml */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 space-y-2">
                <p className="font-bold text-zinc-900">Valores por cada 100 {formOcr.esLiquido ? 'ml' : 'g'}:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-zinc-600">Calorías (kcal)</label>
                    <EntradaTexto
                      type="number"
                      step="any"
                      placeholder="0"
                      value={formOcr.calorias}
                      onChange={(e) => setFormOcr({ ...formOcr, calorias: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-zinc-600">Azúcares (g)</label>
                    <EntradaTexto
                      type="number"
                      step="any"
                      placeholder="0"
                      value={formOcr.azucares}
                      onChange={(e) => setFormOcr({ ...formOcr, azucares: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-zinc-600">Grasas Totales (g)</label>
                    <EntradaTexto
                      type="number"
                      step="any"
                      placeholder="0"
                      value={formOcr.grasasTotales}
                      onChange={(e) => setFormOcr({ ...formOcr, grasasTotales: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-zinc-600">Grasas Saturadas (g)</label>
                    <EntradaTexto
                      type="number"
                      step="any"
                      placeholder="0"
                      value={formOcr.grasasSaturadas}
                      onChange={(e) => setFormOcr({ ...formOcr, grasasSaturadas: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-zinc-600">Sodio (mg)</label>
                    <EntradaTexto
                      type="number"
                      step="any"
                      placeholder="0"
                      value={formOcr.sodio}
                      onChange={(e) => setFormOcr({ ...formOcr, sodio: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-zinc-600">Proteínas (g)</label>
                    <EntradaTexto
                      type="number"
                      step="any"
                      placeholder="0"
                      value={formOcr.proteinas}
                      onChange={(e) => setFormOcr({ ...formOcr, proteinas: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Pegar texto de ingredientes */}
              <div>
                <label className="font-semibold text-zinc-700">Ingredientes o aditivos (opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Ej: Harina de trigo, azúcar, aceite vegetal, INS 500, tartrazina..."
                  value={formOcr.ingredientes}
                  onChange={(e) => {
                    const txt = e.target.value;
                    const parsed = extraerNutrientesDeTexto(txt);
                    setFormOcr((prev) => ({
                      ...prev,
                      ingredientes: txt,
                      calorias: parsed.caloriasKcal ? String(parsed.caloriasKcal) : prev.calorias,
                      azucares: parsed.azucaresG ? String(parsed.azucaresG) : prev.azucares,
                      grasasTotales: parsed.grasasTotalesG ? String(parsed.grasasTotalesG) : prev.grasasTotales,
                      grasasSaturadas: parsed.grasasSaturadasG ? String(parsed.grasasSaturadasG) : prev.grasasSaturadas,
                      sodio: parsed.sodioMg ? String(parsed.sodioMg) : prev.sodio,
                      proteinas: parsed.proteinasG ? String(parsed.proteinasG) : prev.proteinas,
                    }));
                  }}
                  className="w-full rounded-xl border border-zinc-300 p-2.5 text-xs outline-none focus:border-marca-magenta"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <BotonSecundario
                  type="button"
                  onClick={() => setModalOcr(false)}
                  className="flex-1 text-xs"
                >
                  Cancelar
                </BotonSecundario>
                <BotonPrimario type="submit" className="flex-1 text-xs">
                  Calcular Puntaje →
                </BotonPrimario>
              </div>
            </form>
          </Tarjeta>
        </div>
      )}
    </main>
  );
}
