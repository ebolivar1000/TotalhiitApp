import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BotonPrimario, EntradaTexto, Tarjeta } from '../componentes/ui';
import { ETIQUETAS_NIVEL_ACTIVIDAD, ETIQUETAS_OBJETIVO } from '../lib/datos/entidades';
import { calcularBMR } from '../lib/salud/bmr';
import { calcularTDEE, ETIQUETAS_FACTOR_TDEE } from '../lib/salud/tdee';
import { calcularIMC, rangoPesoSaludable, LIMITACIONES_IMC } from '../lib/salud/imc';
import { calcularAguaDiaria } from '../lib/salud/hidratacion';
import { calcularProteinaDiaria } from '../lib/salud/proteina';
import { edadCumplida } from '../lib/utilidades/fechas';
import { usePerfil } from '../hooks/usePerfil';
import BannerSeccion from '../componentes/BannerSeccion';

const numero = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

const COLOR_CATEGORIA: Record<string, string> = {
  'Bajo peso': '#60a5fa',
  'Peso saludable': '#22c55e',
  Sobrepeso: '#f59e0b',
  Obesidad: '#ef4444',
};

const SEGMENTOS = [
  { hasta: 18.5, color: '#60a5fa', ancho: 17.5 },
  { hasta: 25, color: '#22c55e', ancho: 32.5 },
  { hasta: 30, color: '#f59e0b', ancho: 25 },
  { hasta: Infinity, color: '#ef4444', ancho: 25 },
];

function MedidorIMC({ imc }: { imc: number }) {
  const pos = Math.min(100, Math.max(0, ((imc - 15) / 20) * 100));
  return (
    <div className="relative mt-4">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full">
        {SEGMENTOS.map((s) => (
          <div key={s.hasta} style={{ width: `${s.ancho}%`, backgroundColor: s.color }} />
        ))}
      </div>
      <div
        className="absolute -top-1 h-4.5 w-4.5 -translate-x-1/2 rounded-full border-[3px] border-white bg-marca-magenta shadow-md transition-all duration-500"
        style={{ left: `${pos}%` }}
      />
      <div className="mt-1.5 flex justify-between text-[10px] font-medium text-white/70">
        <span>15</span>
        <span>18,5</span>
        <span>25</span>
        <span>30</span>
        <span>35+</span>
      </div>
    </div>
  );
}

function ValorCard({
  icono,
  titulo,
  valor,
  unidad,
  pie,
}: {
  icono: string;
  titulo: string;
  valor: string;
  unidad: string;
  pie: string;
}) {
  return (
    <Tarjeta className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="text-lg">
          {icono}
        </span>
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{titulo}</p>
      </div>
      <p className="text-3xl font-extrabold text-zinc-900">
        {valor}
        <span className="ml-1 text-sm font-semibold text-zinc-400">{unidad}</span>
      </p>
      <p className="mt-auto text-xs leading-snug text-zinc-500">{pie}</p>
    </Tarjeta>
  );
}

export default function Salud() {
  const { cargando, perfil, objetivo } = usePerfil();
  const [pesoTexto, setPesoTexto] = useState('');
  const [estaturaTexto, setEstaturaTexto] = useState('');

  useEffect(() => {
    if (perfil) {
      setPesoTexto(String(perfil.pesoKg));
      setEstaturaTexto(String(perfil.estaturaCm));
    }
  }, [perfil]);

  if (cargando) return null;

  if (!perfil) {
    return (
      <main className="mx-auto max-w-md px-4 pb-48 pt-6 text-center">
        <Tarjeta>
          <p className="text-2xl" aria-hidden="true">
            📊
          </p>
          <h1 className="mt-2 text-xl font-bold text-zinc-900">Calculadoras de salud</h1>
          <p className="mt-2 text-sm text-zinc-600">Completa tu perfil para calcularlas con tus datos.</p>
          <Link to="/onboarding" className="mt-4 inline-block">
            <BotonPrimario>Completar mi perfil</BotonPrimario>
          </Link>
        </Tarjeta>
      </main>
    );
  }

  const peso = Number.parseFloat(pesoTexto.replace(',', '.'));
  const estaturaCm = Number.parseFloat(estaturaTexto.replace(',', '.'));
  const estaturaM = Number.isFinite(estaturaCm) ? estaturaCm / 100 : Number.NaN;
  const edad = edadCumplida(perfil.fechaNacimiento);

  const imc = calcularIMC(peso, estaturaM);
  const rango = rangoPesoSaludable(estaturaM);
  const bmr = calcularBMR({ pesoKg: peso, estaturaCm, edad, genero: perfil.genero });
  const tdee = bmr && Number.isFinite(bmr) ? calcularTDEE(bmr, perfil.nivelActividad) : null;
  const agua = calcularAguaDiaria(peso);
  const proteina = objetivo ? calcularProteinaDiaria(peso, objetivo.tipo) : null;

  return (
    <main className="safe-area-superior mx-auto max-w-md space-y-4 px-4 pb-48 pt-6">
      {/* Banner moderno con imagen de Valentina */}
      <BannerSeccion
        etiqueta="Salud y Metabolismo"
        titulo="Tus Métricas de Salud"
        subtitulo="Cálculos de metabolismo basal, requerimiento hídrico y balance nutricional adaptados a ti."
        imagenSrc="/images/banner-salud.jpg"
        insignia="Bienestar Integral"
      />

      <Tarjeta>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-marca-magenta">Datos para el cálculo</h2>
          <Link to="/perfil/editar" className="text-xs font-semibold text-marca-magenta">
            Perfil
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="pesoSalud" className="text-xs font-semibold text-zinc-600">
              Peso (kg)
            </label>
            <EntradaTexto
              id="pesoSalud"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={pesoTexto}
              onChange={(e) => setPesoTexto(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="estaturaSalud" className="text-xs font-semibold text-zinc-600">
              Estatura (cm)
            </label>
            <EntradaTexto
              id="estaturaSalud"
              type="number"
              inputMode="numeric"
              value={estaturaTexto}
              onChange={(e) => setEstaturaTexto(e.target.value)}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Edad considerada: {edad} años · Actividad: {ETIQUETAS_NIVEL_ACTIVIDAD[perfil.nivelActividad]}
        </p>
      </Tarjeta>

      {imc ? (
        <div className="rounded-2xl bg-gradient-to-br from-marca-magenta to-marca-magenta-oscuro p-5 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-white/80">Índice de masa corporal</p>
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
              style={{ backgroundColor: COLOR_CATEGORIA[imc.categoria] ?? '#a1a1aa' }}
            >
              {imc.categoria}
            </span>
          </div>
          <p className="mt-1 text-5xl font-extrabold tracking-tight">{numero.format(imc.valor)}</p>
          <MedidorIMC imc={imc.valor} />
          {rango && (
            <p className="mt-3 text-xs text-white/80">
              Rango de peso saludable para tu estatura: <strong>{numero.format(rango.minimo)} – {numero.format(rango.maximo)} kg</strong>
            </p>
          )}
        </div>
      ) : (
        <Tarjeta className="border-amber-300 bg-amber-50">
          <p className="text-sm font-semibold text-amber-800">Ingresa peso y estatura válidos para ver tus cálculos.</p>
        </Tarjeta>
      )}

      {bmr !== null && tdee !== null && (
        <div className="grid grid-cols-2 gap-3">
          <ValorCard
            icono="🔥"
            titulo="Metabolismo basal"
            valor={numero.format(bmr)}
            unidad="kcal"
            pie="Energía mínima en reposo (Mifflin-St Jeor)."
          />
          <ValorCard
            icono="⚡"
            titulo="Gasto diario"
            valor={numero.format(tdee)}
            unidad="kcal"
            pie={ETIQUETAS_FACTOR_TDEE[perfil.nivelActividad]}
          />
        </div>
      )}

      {tdee !== null && (
        <div className="grid grid-cols-2 gap-3">
          <Tarjeta className="border-dashed text-center">
            <p className="text-xs font-semibold text-zinc-500">Si quieres bajar de peso</p>
            <p className="text-lg font-extrabold text-zinc-900">≈ {numero.format(tdee - 500)} kcal</p>
          </Tarjeta>
          <Tarjeta className="border-dashed text-center">
            <p className="text-xs font-semibold text-zinc-500">Si quieres aumentar masa</p>
            <p className="text-lg font-extrabold text-zinc-900">≈ {numero.format(tdee + 300)} kcal</p>
          </Tarjeta>
        </div>
      )}

      {agua !== null && (
        <div className="grid grid-cols-2 gap-3">
          <ValorCard
            icono="💧"
            titulo="Agua diaria"
            valor={numero.format(agua)}
            unidad="L"
            pie="Referencia: 35 ml por kg de peso."
          />
          <ValorCard
            icono="🥩"
            titulo="Proteína diaria"
            valor={proteina ? `${numero.format(proteina.minimo)}–${numero.format(proteina.ideal)}` : numero.format(Math.round(peso * 1.2))}
            unidad="g"
            pie={
              objetivo
                ? `Ajustada a tu objetivo: ${ETIQUETAS_OBJETIVO[objetivo.tipo]}.`
                : 'Base 1,2 g/kg. Elige un objetivo para afinarla.'
            }
          />
        </div>
      )}

      <Tarjeta className="bg-zinc-50">
        <p className="text-xs leading-relaxed text-zinc-500">{LIMITACIONES_IMC}</p>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          Todas las cifras de esta pantalla son orientativas y no constituyen un diagnóstico ni una
          indicación clínica.
        </p>
      </Tarjeta>

      <div className="h-20 w-full shrink-0" aria-hidden="true" />
    </main>
  );
}
