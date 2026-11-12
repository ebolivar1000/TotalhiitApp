import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { EntradaTexto, Tarjeta } from '../componentes/ui';
import { listarFavoritos, listarHistorial, vaciarHistorial } from '../lib/escaner/repositorio';
import type { NivelPuntaje, ProductoEscaneado } from '../lib/escaner/tipos';

const BADGES_NIVEL: Record<NivelPuntaje, string> = {
  excelente: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  bueno: 'bg-lime-100 text-lime-800 border-lime-300',
  mediocre: 'bg-amber-100 text-amber-800 border-amber-300',
  malo: 'bg-red-100 text-red-800 border-red-300',
};

export default function HistorialEscaner() {
  const [tab, setTab] = useState<'historial' | 'favoritos'>('historial');
  const [productos, setProductos] = useState<ProductoEscaneado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroNivel, setFiltroNivel] = useState<NivelPuntaje | 'todos'>('todos');

  const recargar = async () => {
    setCargando(true);
    try {
      if (tab === 'historial') {
        const h = await listarHistorial(100);
        setProductos(h);
      } else {
        const favs = await listarFavoritos();
        setProductos(favs);
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void recargar();
  }, [tab]);

  const productosFiltrados = productos.filter((p) => {
    const coincideTexto =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.marca && p.marca.toLowerCase().includes(busqueda.toLowerCase())) ||
      p.codigoBarras.includes(busqueda);

    const coincideNivel =
      filtroNivel === 'todos' || p.puntaje.nivel === filtroNivel;

    return coincideTexto && coincideNivel;
  });

  const manejarVaciarHistorial = async () => {
    if (confirm('¿Deseas vaciar el historial de escaneos? (Tus favoritos se conservarán)')) {
      await vaciarHistorial(true);
      await recargar();
    }
  };

  return (
    <main className="safe-area-superior mx-auto max-w-md space-y-4 px-4 pb-28 pt-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <Link
          to="/escaner"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50"
        >
          ←
        </Link>
        <div className="text-center">
          <h1 className="text-base font-black uppercase tracking-wide text-zinc-900">
            Historial de Alimentos
          </h1>
          <p className="text-[11px] font-semibold text-zinc-500">
            Disponible 100% sin conexión (offline)
          </p>
        </div>
        <Link
          to="/escaner"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-base shadow-sm hover:bg-zinc-50"
          title="Abrir cámara"
        >
          📷
        </Link>
      </div>

      {/* Selector de Pestañas: Historial vs Favoritos */}
      <div className="flex rounded-2xl bg-zinc-200/80 p-1">
        <button
          type="button"
          onClick={() => setTab('historial')}
          className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
            tab === 'historial'
              ? 'bg-white text-marca-magenta shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          🕒 Todos los Escaneos
        </button>
        <button
          type="button"
          onClick={() => setTab('favoritos')}
          className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
            tab === 'favoritos'
              ? 'bg-white text-marca-magenta shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          ❤️ Favoritos Guardados
        </button>
      </div>

      {/* Buscador y Filtros */}
      <div className="space-y-2">
        <EntradaTexto
          placeholder="Buscar por nombre, marca o código…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="text-xs"
        />

        {/* Filtro por nivel de puntaje */}
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {(['todos', 'excelente', 'bueno', 'mediocre', 'malo'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setFiltroNivel(lvl)}
              className={`rounded-full px-2.5 py-1 font-bold capitalize transition ${
                filtroNivel === lvl
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {lvl === 'todos' ? 'Todos' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Productos */}
      {cargando ? (
        <Tarjeta className="p-8 text-center text-xs text-zinc-500 animate-pulse">
          Cargando productos almacenados…
        </Tarjeta>
      ) : productosFiltrados.length === 0 ? (
        <Tarjeta className="p-8 text-center space-y-2">
          <span className="text-3xl">🛒</span>
          <p className="text-sm font-bold text-zinc-800">
            {tab === 'favoritos'
              ? 'No tienes productos en favoritos'
              : 'No hay productos en el historial'}
          </p>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            {tab === 'favoritos'
              ? 'Toca el corazón en cualquier producto para guardarlo en tu lista de compras frecuente.'
              : 'Apunta tu cámara a cualquier código de barras para comenzar a registrar tu historial.'}
          </p>
          <div className="pt-2">
            <Link
              to="/escaner"
              className="inline-block rounded-xl bg-marca-magenta px-4 py-2 text-xs font-bold text-white shadow hover:bg-marca-magenta-oscuro"
            >
              📷 Ir a Escanear
            </Link>
          </div>
        </Tarjeta>
      ) : (
        <div className="space-y-2">
          {productosFiltrados.map((p) => (
            <Link
              key={p.codigoBarras}
              to={`/escaner/producto/${p.codigoBarras}`}
              className="group flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-3 shadow-2xs transition hover:border-marca-magenta hover:shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                {p.imagenUrl ? (
                  <img
                    src={p.imagenUrl}
                    alt={p.nombre}
                    className="h-12 w-12 shrink-0 rounded-xl object-contain bg-zinc-50 border border-zinc-100 p-0.5"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-xl">
                    🥗
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-900 truncate group-hover:text-marca-magenta">
                    {p.nombre}
                  </p>
                  {p.marca && (
                    <p className="text-[11px] text-zinc-500 font-medium truncate">{p.marca}</p>
                  )}
                  <p className="text-[10px] text-zinc-400">
                    {new Date(p.fechaEscaneo).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-black border ${
                    BADGES_NIVEL[p.puntaje.nivel]
                  }`}
                >
                  {p.puntaje.puntos}/100
                </span>
                <span className="text-zinc-400 text-xs">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Botón para vaciar historial */}
      {tab === 'historial' && productos.length > 0 && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => void manejarVaciarHistorial()}
            className="text-[11px] font-semibold text-zinc-500 hover:text-red-600 underline"
          >
            🗑️ Vaciar historial de escaneos
          </button>
        </div>
      )}
    </main>
  );
}
