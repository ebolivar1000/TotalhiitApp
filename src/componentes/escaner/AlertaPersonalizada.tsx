import type { TipoObjetivo } from '../../lib/datos/entidades';
import type { NutrientesPor100, PreferenciasEscaner } from '../../lib/escaner/tipos';

interface AlertaPersonalizadaProps {
  alergenosProducto: string[];
  trazasProducto?: string[];
  ingredientesTexto?: string;
  nutrientes: NutrientesPor100;
  preferenciasUsuario?: {
    alergenos?: string[];
    exclusiones?: string[];
    escanerPrefs?: PreferenciasEscaner;
    objetivo?: TipoObjetivo;
  };
}

export default function AlertaPersonalizada({
  alergenosProducto = [],
  trazasProducto = [],
  ingredientesTexto = '',
  nutrientes,
  preferenciasUsuario,
}: AlertaPersonalizadaProps) {
  if (!preferenciasUsuario) return null;

  const alergenosRegistrados = [
    ...(preferenciasUsuario.alergenos || []),
    ...(preferenciasUsuario.exclusiones || []),
    ...(preferenciasUsuario.escanerPrefs?.alergenos || []),
  ].map((a) => a.toLowerCase().trim());

  const dietasRegistradas = (preferenciasUsuario.escanerPrefs?.dietas || []).map((d) =>
    d.toLowerCase().trim(),
  );

  const textoComparar = (
    alergenosProducto.join(' ') +
    ' ' +
    trazasProducto.join(' ') +
    ' ' +
    ingredientesTexto
  ).toLowerCase();

  // 1. Detección de Alérgenos críticos
  const alergenosDetectados: string[] = [];
  for (const a of alergenosRegistrados) {
    if (a && textoComparar.includes(a)) {
      alergenosDetectados.push(a);
    }
  }

  // 2. Detección de dietas (Vegana / Vegetariana)
  const esVegana = dietasRegistradas.includes('vegana') || dietasRegistradas.includes('vegano');
  const esVegetariana =
    dietasRegistradas.includes('vegetariana') || dietasRegistradas.includes('vegetariano');
  let conflictoDieta: string | null = null;

  if (esVegana || esVegetariana) {
    const ingredientesAnimales = [
      'carne',
      'pollo',
      'pescado',
      'cerdo',
      'gelatina',
      'grasa bovina',
      'grasa animal',
    ];
    const ingredientesLacteosHuevos = ['leche', 'huevo', 'suero de leche', 'caseina', 'miel'];

    if (ingredientesAnimales.some((i) => textoComparar.includes(i))) {
      conflictoDieta = 'Contiene ingredientes de origen animal (incompatible con tu dieta vegetal)';
    } else if (esVegana && ingredientesLacteosHuevos.some((i) => textoComparar.includes(i))) {
      conflictoDieta = 'Contiene derivados lácteos o huevo (incompatible con dieta vegana)';
    }
  }

  // 3. Alineación con Objetivos TotalHIIT
  const objetivo = preferenciasUsuario.objetivo;
  let mensajeObjetivo: { tipo: 'positivo' | 'alerta'; texto: string } | null = null;

  if (objetivo === 'perder_grasa') {
    if (nutrientes.azucaresG > 10 || nutrientes.caloriasKcal > 380) {
      mensajeObjetivo = {
        tipo: 'alerta',
        texto: 'Precaución para tu meta de Reducir grasa: Alta densidad calórica o azúcares.',
      };
    } else if (nutrientes.azucaresG <= 2 && nutrientes.fibraG && nutrientes.fibraG >= 3) {
      mensajeObjetivo = {
        tipo: 'positivo',
        texto: '¡Favorable para tu meta de Reducir grasa! Bajo azúcar y rica en fibra saciante.',
      };
    }
  } else if (objetivo === 'masa_muscular') {
    if (nutrientes.proteinasG && nutrientes.proteinasG >= 10) {
      mensajeObjetivo = {
        tipo: 'positivo',
        texto: `¡Excelente para Aumentar masa muscular! Aporta ${nutrientes.proteinasG.toFixed(1)}g de proteína.`,
      };
    }
  }

  const tieneAlertas = alergenosDetectados.length > 0 || conflictoDieta || mensajeObjetivo;
  if (!tieneAlertas) return null;

  return (
    <div className="space-y-2">
      {/* ALERTA CRÍTICA DE ALÉRGENOS */}
      {alergenosDetectados.length > 0 && (
        <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-4 text-xs shadow-md animate-pulse">
          <div className="flex items-center gap-2 font-black text-red-900">
            <span className="text-xl">⚠️</span>
            <span className="uppercase tracking-wide">Alerta de Alérgeno Detectado</span>
          </div>
          <p className="mt-1 leading-relaxed text-red-800">
            Este producto contiene o puede contener:{' '}
            <strong className="uppercase underline">
              {alergenosDetectados.join(', ')}
            </strong>
            , registrado en tus preferencias de salud.
          </p>
        </div>
      )}

      {/* ALERTA DE DIETA */}
      {conflictoDieta && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <span className="text-lg">🌱</span>
            <span>Aviso de Dieta Personalizada</span>
          </div>
          <p className="mt-1 text-amber-800">{conflictoDieta}.</p>
        </div>
      )}

      {/* ALINEACIÓN CON OBJETIVO TOTALHIIT */}
      {mensajeObjetivo && (
        <div
          className={`rounded-2xl p-3 text-xs border shadow-sm ${
            mensajeObjetivo.tipo === 'positivo'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
              : 'border-orange-300 bg-orange-50 text-orange-950'
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            <span>{mensajeObjetivo.tipo === 'positivo' ? '🎯' : '⚡'}</span>
            <span>Alineación con tu meta de TOTALHIIT</span>
          </div>
          <p className="mt-0.5 leading-relaxed">{mensajeObjetivo.texto}</p>
        </div>
      )}
    </div>
  );
}
