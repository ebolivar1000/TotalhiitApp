import type { ChangeEvent, ReactNode } from 'react';
import { useState } from 'react';

export function Tarjeta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-zinc-200 bg-white p-5 ${className}`}>{children}</div>;
}

export function Campo({
  etiqueta,
  htmlFor,
  error,
  ayuda,
  children,
}: {
  etiqueta: string;
  htmlFor?: string;
  error?: string;
  ayuda?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-zinc-700">
        {etiqueta}
      </label>
      {children}
      {ayuda && !error && <p className="text-xs text-zinc-500">{ayuda}</p>}
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}

const claseInput =
  'w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-base outline-none focus:border-marca-magenta focus:ring-2 focus:ring-marca-magenta/20';

export function EntradaTexto(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...resto } = props;
  return <input {...resto} className={`${claseInput} ${className}`} />;
}

export function Selector({
  opciones,
  incluirVacio,
  ...props
}: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  opciones: readonly { valor: string; etiqueta: string }[];
  incluirVacio?: string;
}) {
  return (
    <select {...props} className={claseInput}>
      {incluirVacio !== undefined && <option value="">{incluirVacio}</option>}
      {opciones.map((o) => (
        <option key={o.valor} value={o.valor}>
          {o.etiqueta}
        </option>
      ))}
    </select>
  );
}

export function BotonPrimario({
  children,
  className = '',
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      {...props}
      className={`rounded-xl bg-marca-magenta px-5 py-3 font-semibold text-white transition-colors hover:bg-marca-magenta-oscuro disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function BotonSecundario({
  children,
  className = '',
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      {...props}
      className={`rounded-xl border border-zinc-300 bg-white px-5 py-3 font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

interface Opcion {
  valor: string;
  etiqueta: string;
}

export function ChipsMulti({
  opciones,
  valor,
  onChange,
}: {
  opciones: readonly Opcion[];
  valor: string[];
  onChange: (nuevos: string[]) => void;
}) {
  const alternar = (v: string) => {
    onChange(valor.includes(v) ? valor.filter((x) => x !== v) : [...valor, v]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map((o) => {
        const activo = valor.includes(o.valor);
        return (
          <button
            type="button"
            key={o.valor}
            aria-pressed={activo}
            onClick={() => alternar(o.valor)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              activo
                ? 'border-marca-magenta bg-marca-crema font-semibold text-marca-magenta-oscuro'
                : 'border-zinc-300 bg-white text-zinc-600'
            }`}
          >
            {o.etiqueta}
          </button>
        );
      })}
    </div>
  );
}

export function ChipInput({
  opcionesSugeridas,
  valor,
  onChange,
  placeholder = 'Agregar otro…',
}: {
  opcionesSugeridas: readonly string[];
  valor: string[];
  onChange: (nuevos: string[]) => void;
  placeholder?: string;
}) {
  const [texto, setTexto] = useState('');
  const restantes = opcionesSugeridas.filter((o) => !valor.some((v) => v.toLowerCase() === o.toLowerCase()));
  const agregar = (v: string) => {
    const limpio = v.trim();
    if (limpio && !valor.some((x) => x.toLowerCase() === limpio.toLowerCase())) onChange([...valor, limpio]);
    setTexto('');
  };
  const cambiar = (e: ChangeEvent<HTMLInputElement>) => setTexto(e.target.value);
  return (
    <div className="space-y-2">
      {restantes.length > 0 && <ChipsMulti opciones={restantes.map((r) => ({ valor: r, etiqueta: r }))} valor={valor} onChange={onChange} />}
      <div className="flex gap-2">
        <EntradaTexto value={texto} onChange={cambiar} placeholder={placeholder} />
        <BotonSecundario type="button" onClick={() => agregar(texto)} className="shrink-0">
          Agregar
        </BotonSecundario>
      </div>
      {valor.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {valor.map((v) => (
            <span key={v} className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700">
              {v}
              <button type="button" aria-label={`Quitar ${v}`} onClick={() => onChange(valor.filter((x) => x !== v))} className="ml-2 font-bold text-zinc-500 hover:text-red-600">
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function RadioCards({
  opciones,
  valor,
  onChange,
}: {
  opciones: readonly (Opcion & { icono: string })[];
  valor?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {opciones.map((o) => (
        <button
          type="button"
          key={o.valor}
          aria-pressed={valor === o.valor}
          onClick={() => onChange(o.valor)}
          className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
            valor === o.valor ? 'border-marca-magenta bg-marca-crema' : 'border-zinc-200 bg-white'
          }`}
        >
          <span aria-hidden="true" className="text-2xl">
            {o.icono}
          </span>
          <span className={`text-sm ${valor === o.valor ? 'font-semibold text-marca-magenta-oscuro' : 'text-zinc-700'}`}>
            {o.etiqueta}
          </span>
        </button>
      ))}
    </div>
  );
}
