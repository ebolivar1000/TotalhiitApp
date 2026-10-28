/** FASE 7 — gráficos de tendencia mínimos en SVG/divs (sin librerías externas). */

export interface PuntoSerie {
  etiqueta: string;
  valor: number;
}

export function GraficoLinea({
  puntos,
  color = '#b00050',
  formato = (v: number) => String(Math.round(v * 10) / 10),
}: {
  puntos: PuntoSerie[];
  color?: string;
  formato?: (v: number) => string;
}) {
  if (puntos.length === 0) {
    return <p className="text-sm text-zinc-500">Sin datos todavía. Los registros de esta semana arman la línea.</p>;
  }
  const ancho = 320;
  const alto = 130;
  const padX = 30;
  const padY = 16;
  const valores = puntos.map((p) => p.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = max - min || 1;
  const x = (i: number) => padX + (i * (ancho - padX * 2)) / Math.max(puntos.length - 1, 1);
  const y = (v: number) => padY + (1 - (v - min) / rango) * (alto - padY * 2);
  const linea = puntos.map((p, i) => `${x(i)},${y(p.valor)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-label="Gráfico de tendencia" className="w-full">
      <polyline
        points={linea}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {puntos.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.valor)} r={3.5} fill={color} />
      ))}
      <text x={ancho - padX} y={12} fontSize={10} textAnchor="end" fill="#3f3f46">
        {formato(max)}
      </text>
      <text x={ancho - padX} y={y(min) - 5} fontSize={10} textAnchor="end" fill="#71717a">
        {formato(min)}
      </text>
      <text x={padX} y={alto - 2} fontSize={9} fill="#71717a">
        {puntos[0]!.etiqueta}
      </text>
      <text x={ancho - padX} y={alto - 2} fontSize={9} textAnchor="end" fill="#71717a">
        {puntos[puntos.length - 1]!.etiqueta}
      </text>
    </svg>
  );
}

export interface BarraSerie extends PuntoSerie {
  /** true = día sin dato (se dibuja atenuado a la base). */
  vacio?: boolean;
}

export function GraficoBarras({
  barras,
  maximo,
  formato = (v: number) => String(Math.round(v * 10) / 10),
}: {
  barras: BarraSerie[];
  maximo?: number;
  formato?: (v: number) => string;
}) {
  if (barras.length === 0) {
    return <p className="text-sm text-zinc-500">Sin datos todavía.</p>;
  }
  const tope = maximo ?? Math.max(...barras.map((b) => b.valor), 1);
  return (
    <div className="flex items-end gap-1.5" role="img" aria-label="Gráfico de barras">
      {barras.map((b, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <span className="text-[10px] font-semibold text-zinc-600">
            {b.vacio ? '·' : formato(b.valor)}
          </span>
          <div
            className={`w-full rounded-t-md ${b.vacio ? 'bg-zinc-100' : 'bg-marca-magenta/80'}`}
            style={{ height: `${Math.max((b.valor / tope) * 64, 4)}px` }}
          />
          <span className="truncate text-[10px] text-zinc-500">{b.etiqueta}</span>
        </div>
      ))}
    </div>
  );
}
