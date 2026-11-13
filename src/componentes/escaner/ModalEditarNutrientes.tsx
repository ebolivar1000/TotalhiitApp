import { useState } from 'react';
import { calcularPuntajeSalud } from '../../lib/escaner/puntaje';
import type { NutrientesPor100, ProductoEscaneado } from '../../lib/escaner/tipos';
import { BotonPrimario, BotonSecundario, EntradaTexto, Tarjeta } from '../ui';

interface ModalEditarNutrientesProps {
  abierto: boolean;
  alCerrar: () => void;
  producto: ProductoEscaneado;
  alGuardar: (productoActualizado: ProductoEscaneado) => void;
}

export default function ModalEditarNutrientes({
  abierto,
  alCerrar,
  producto,
  alGuardar,
}: ModalEditarNutrientesProps) {
  const [nombre, setNombre] = useState(producto.nombre);
  const [marca, setMarca] = useState(producto.marca || '');
  const [esLiquido, setEsLiquido] = useState(Boolean(producto.esLiquido));

  const [calorias, setCalorias] = useState(String(producto.nutrientes.caloriasKcal || ''));
  const [azucares, setAzucares] = useState(String(producto.nutrientes.azucaresG || ''));
  const [grasasTotales, setGrasasTotales] = useState(
    String(producto.nutrientes.grasasTotalesG || ''),
  );
  const [grasasSaturadas, setGrasasSaturadas] = useState(
    String(producto.nutrientes.grasasSaturadasG || ''),
  );
  const [sodio, setSodio] = useState(String(producto.nutrientes.sodioMg || ''));
  const [fibra, setFibra] = useState(String(producto.nutrientes.fibraG || ''));
  const [proteinas, setProteinas] = useState(String(producto.nutrientes.proteinasG || ''));

  if (!abierto) return null;

  const aplicarPlantilla = (p: {
    nombrePlantilla?: string;
    cal: number;
    az: number;
    gt: number;
    gs: number;
    sod: number;
    fib: number;
    prot: number;
    liq: boolean;
  }) => {
    setCalorias(String(p.cal));
    setAzucares(String(p.az));
    setGrasasTotales(String(p.gt));
    setGrasasSaturadas(String(p.gs));
    setSodio(String(p.sod));
    setFibra(String(p.fib));
    setProteinas(String(p.prot));
    setEsLiquido(p.liq);
  };

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();

    const calNum = parseFloat(calorias) || 0;
    const azNum = parseFloat(azucares) || 0;
    const gtNum = parseFloat(grasasTotales) || 0;
    const gsNum = parseFloat(grasasSaturadas) || 0;
    const sodNum = parseFloat(sodio) || 0;
    const fibNum = parseFloat(fibra) || 0;
    const protNum = parseFloat(proteinas) || 0;

    const nuevosNutrientes: NutrientesPor100 = {
      caloriasKcal: calNum,
      azucaresG: azNum,
      grasasTotalesG: gtNum,
      grasasSaturadasG: gsNum,
      sodioMg: sodNum,
      fibraG: fibNum,
      proteinasG: protNum,
      salG: sodNum > 0 ? (sodNum / 1000) * 2.5 : 0,
    };

    // Actualizar tags de aceite si corresponde
    const tags = [...(producto.categoriaTags || [])];
    const esAceite = gtNum >= 80 && (nombre.toLowerCase().includes('aceite') || tags.some((t) => t.includes('oil')));
    if (esAceite && !tags.some((t) => t.includes('oil') || t.includes('aceite'))) {
      tags.push('en:vegetable-oils');
    }

    const nuevoPuntaje = calcularPuntajeSalud({
      nutrientes: nuevosNutrientes,
      novaGroup: producto.novaGroup || (esAceite ? 2 : undefined),
      aditivosAnalizados: producto.aditivos,
      categoriaTags: tags,
      esLiquido,
      ingredientesTexto: producto.ingredientesTexto,
      codigoBarras: producto.codigoBarras,
    });

    const productoActualizado: ProductoEscaneado = {
      ...producto,
      nombre: nombre.trim() || producto.nombre,
      marca: marca.trim() || undefined,
      categoriaTags: tags,
      nutrientes: nuevosNutrientes,
      esLiquido,
      puntaje: nuevoPuntaje,
      datosIncompletos: false,
      perfilInferido: false,
      mensajeInferencia: undefined,
      editadoPorUsuario: true,
    };

    alGuardar(productoActualizado);
    alCerrar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs">
      <Tarjeta className="max-h-[92vh] w-full max-w-md overflow-y-auto space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Editar Tabla Nutricional</h3>
            <p className="text-[11px] text-zinc-500">
              Ajusta los valores por 100g/ml para recalcular la nota
            </p>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            className="text-lg font-bold text-zinc-400 hover:text-zinc-600"
          >
            ✕
          </button>
        </div>

        {/* Plantillas de auto-completado rápido */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Completado rápido con valores típicos:
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() =>
                aplicarPlantilla({
                  cal: 900,
                  az: 0,
                  gt: 100,
                  gs: 12,
                  sod: 0,
                  fib: 0,
                  prot: 0,
                  liq: false,
                })
              }
              className="rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-900 hover:bg-amber-100 transition"
            >
              🥑 Aceite Vegetal
            </button>
            <button
              type="button"
              onClick={() =>
                aplicarPlantilla({
                  cal: 450,
                  az: 28,
                  gt: 18,
                  gs: 7,
                  sod: 350,
                  fib: 3,
                  prot: 7,
                  liq: false,
                })
              }
              className="rounded-lg border border-zinc-300 bg-zinc-50 px-2 py-1 text-[10px] font-bold text-zinc-800 hover:bg-zinc-100 transition"
            >
              🍪 Galletitas dulces
            </button>
            <button
              type="button"
              onClick={() =>
                aplicarPlantilla({
                  cal: 42,
                  az: 10.5,
                  gt: 0,
                  gs: 0,
                  sod: 12,
                  fib: 0,
                  prot: 0,
                  liq: true,
                })
              }
              className="rounded-lg border border-red-300 bg-red-50 px-2 py-1 text-[10px] font-bold text-red-900 hover:bg-red-100 transition"
            >
              🥤 Gaseosa
            </button>
            <button
              type="button"
              onClick={() =>
                aplicarPlantilla({
                  cal: 58,
                  az: 4.8,
                  gt: 3,
                  gs: 1.8,
                  sod: 50,
                  fib: 0,
                  prot: 3.1,
                  liq: true,
                })
              }
              className="rounded-lg border border-blue-300 bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-900 hover:bg-blue-100 transition"
            >
              🥛 Leche / Yogur
            </button>
            <button
              type="button"
              onClick={() =>
                aplicarPlantilla({
                  cal: 365,
                  az: 1.1,
                  gt: 7.2,
                  gs: 1.3,
                  sod: 5,
                  fib: 9.8,
                  prot: 13.5,
                  liq: false,
                })
              }
              className="rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-900 hover:bg-emerald-100 transition"
            >
              🌾 Avena / Cereal
            </button>
            <button
              type="button"
              onClick={() =>
                aplicarPlantilla({
                  cal: 195,
                  az: 3.5,
                  gt: 18,
                  gs: 11,
                  sod: 280,
                  fib: 0,
                  prot: 5.5,
                  liq: false,
                })
              }
              className="rounded-lg border border-purple-300 bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-900 hover:bg-purple-100 transition"
            >
              🧀 Queso Untable
            </button>
          </div>
        </div>

        <form onSubmit={manejarEnvio} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-zinc-700">Nombre del producto</label>
            <EntradaTexto
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Aceite de Girasol"
            />
          </div>

          <div>
            <label className="font-semibold text-zinc-700">Marca (opcional)</label>
            <EntradaTexto
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Ej: Cocinero, Natura"
            />
          </div>

          {/* Selector Líquido vs Sólido */}
          <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-2.5 border border-zinc-200">
            <input
              type="checkbox"
              id="chkEditarLiquido"
              checked={esLiquido}
              onChange={(e) => setEsLiquido(e.target.checked)}
              className="h-4 w-4 rounded accent-marca-magenta"
            />
            <label htmlFor="chkEditarLiquido" className="font-semibold text-zinc-800">
              Es una bebida o líquido (evaluación por 100 ml)
            </label>
          </div>

          {/* Valores Nutricionales por 100g/ml */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 space-y-2">
            <p className="font-bold text-zinc-900">
              Valores por cada 100 {esLiquido ? 'ml' : 'g'}:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-zinc-600">Calorías (kcal)</label>
                <EntradaTexto
                  type="number"
                  step="any"
                  placeholder="0"
                  value={calorias}
                  onChange={(e) => setCalorias(e.target.value)}
                />
              </div>
              <div>
                <label className="text-zinc-600">Azúcares (g)</label>
                <EntradaTexto
                  type="number"
                  step="any"
                  placeholder="0"
                  value={azucares}
                  onChange={(e) => setAzucares(e.target.value)}
                />
              </div>
              <div>
                <label className="text-zinc-600">Grasas Totales (g)</label>
                <EntradaTexto
                  type="number"
                  step="any"
                  placeholder="0"
                  value={grasasTotales}
                  onChange={(e) => setGrasasTotales(e.target.value)}
                />
              </div>
              <div>
                <label className="text-zinc-600">Grasas Saturadas (g)</label>
                <EntradaTexto
                  type="number"
                  step="any"
                  placeholder="0"
                  value={grasasSaturadas}
                  onChange={(e) => setGrasasSaturadas(e.target.value)}
                />
              </div>
              <div>
                <label className="text-zinc-600">Sodio (mg)</label>
                <EntradaTexto
                  type="number"
                  step="any"
                  placeholder="0"
                  value={sodio}
                  onChange={(e) => setSodio(e.target.value)}
                />
              </div>
              <div>
                <label className="text-zinc-600">Proteínas (g)</label>
                <EntradaTexto
                  type="number"
                  step="any"
                  placeholder="0"
                  value={proteinas}
                  onChange={(e) => setProteinas(e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label className="text-zinc-600">Fibra dietética (g)</label>
                <EntradaTexto
                  type="number"
                  step="any"
                  placeholder="0"
                  value={fibra}
                  onChange={(e) => setFibra(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <BotonSecundario type="button" onClick={alCerrar} className="flex-1 text-xs">
              Cancelar
            </BotonSecundario>
            <BotonPrimario type="submit" className="flex-1 text-xs">
              Guardar y Recalcular
            </BotonPrimario>
          </div>
        </form>
      </Tarjeta>
    </div>
  );
}
