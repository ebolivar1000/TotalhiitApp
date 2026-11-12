import type { AditivoAnalizado, NivelRiesgoAditivo } from './tipos';

/**
 * Diccionario pedagógico de aditivos alimentarios frecuentes.
 * Basado en clasificaciones de seguridad de la EFSA (Autoridad Europea de Seguridad Alimentaria)
 * y JECFA (Comité Mixto FAO/OMS de Expertos en Aditivos Alimentarios).
 *
 * Enfoque: Científico, pedagógico y sin alarmismo. Aclara que los aditivos autorizados
 * son legales, pero algunos tienen consumos máximos recomendados o advertencias específicas.
 */
interface InfoAditivoBase {
  nombre: string;
  categoria: string;
  nivelRiesgo: NivelRiesgoAditivo;
  explicacion: string;
  consensoCientifico: string;
}

const CATALOGO_ADITIVOS: Record<string, InfoAditivoBase> = {
  // ─── Edulcorantes ───────────────────────────────────────────
  e950: {
    nombre: 'Acesulfamo K',
    categoria: 'Edulcorante artificial',
    nivelRiesgo: 'precaucion',
    explicacion: 'Endulzante artificial sin calorías. Seguro en dosis autorizadas, pero se aconseja no abusar.',
    consensoCientifico: 'Aprobado por EFSA/FDA con ingesta diaria admisible (IDA) de 9 mg/kg.',
  },
  e951: {
    nombre: 'Aspartamo',
    categoria: 'Edulcorante artificial',
    nivelRiesgo: 'precaucion',
    explicacion: 'Edulcorante sintético muy común. Personas con fenilcetonuria deben evitarlo.',
    consensoCientifico: 'Evaluado por la OMS/IARC como posiblemente carcinógeno (Grupo 2B), pero seguro dentro de la IDA actual (40 mg/kg).',
  },
  e952: {
    nombre: 'Ciclamato',
    categoria: 'Edulcorante artificial',
    nivelRiesgo: 'precaucion',
    explicacion: 'Endulzante intenso. Prohibido en EE.UU. pero admitido en Argentina y Europa bajo límites estrictos.',
    consensoCientifico: 'Se recomienda moderar su consumo.',
  },
  e954: {
    nombre: 'Sacarina',
    categoria: 'Edulcorante artificial',
    nivelRiesgo: 'precaucion',
    explicacion: 'Uno de los edulcorantes más antiguos. Aporte calórico nulo, consumo moderado aconsejado.',
    consensoCientifico: 'Consumo seguro hasta 5 mg/kg de peso al día.',
  },
  e955: {
    nombre: 'Sucralosa',
    categoria: 'Edulcorante derivado del azúcar',
    nivelRiesgo: 'sin_riesgo',
    explicacion: 'Edulcorante derivado de la sacarosa. No aporta calorías ni altera la glucosa sanguínea.',
    consensoCientifico: 'Excelente perfil de seguridad según EFSA y OMS.',
  },
  e960: {
    nombre: 'Glucósidos de esteviol (Stevia)',
    categoria: 'Edulcorante natural',
    nivelRiesgo: 'sin_riesgo',
    explicacion: 'Extracto natural purificado de la planta stevia. Seguro y sin aporte calórico.',
    consensoCientifico: 'Considerado seguro y una de las mejores opciones no calóricas.',
  },
  e420: {
    nombre: 'Sorbitol',
    categoria: 'Polialcohol edulcorante',
    nivelRiesgo: 'sin_riesgo',
    explicacion: 'Polialcohol natural usado en gomas y productos sin azúcar. Puede tener efecto laxante en exceso.',
    consensoCientifico: 'Seguro, sin toxicidad conocida. Advertencia digestiva en dosis altas.',
  },
  e965: {
    nombre: 'Maltitol',
    categoria: 'Polialcohol edulcorante',
    nivelRiesgo: 'sin_riesgo',
    explicacion: 'Sustituto del azúcar común. Impacto moderado en glucemia; consumo excesivo puede causar gases.',
    consensoCientifico: 'Seguro para consumo general.',
  },

  // ─── Colorantes ─────────────────────────────────────────────
  e102: {
    nombre: 'Tartrazina (Amarillo 5)',
    categoria: 'Colorante artificial azoico',
    nivelRiesgo: 'evitar',
    explicacion: 'Colorante amarillo brillante sintético. Puede inducir reacciones alérgicas o hiperactividad infantil.',
    consensoCientifico: 'En la UE exige advertencia en etiqueta: "puede tener efectos negativos sobre la actividad y atención de los niños".',
  },
  e110: {
    nombre: 'Amarillo Ocaso FCF (Amarillo 6)',
    categoria: 'Colorante artificial azoico',
    nivelRiesgo: 'evitar',
    explicacion: 'Colorante anaranjado artificial vinculado a intolerancias en personas sensibles.',
    consensoCientifico: 'Límite diario reducido por la EFSA.',
  },
  e129: {
    nombre: 'Rojo Allura AC (Rojo 40)',
    categoria: 'Colorante artificial azoico',
    nivelRiesgo: 'evitar',
    explicacion: 'Colorante rojo sintético común en snacks y golosinas. Se aconseja minimizar su presencia.',
    consensoCientifico: 'Vigilado por autoridades sanitarias europeas.',
  },
  e133: {
    nombre: 'Azul Brillante FCF',
    categoria: 'Colorante artificial',
    nivelRiesgo: 'precaucion',
    explicacion: 'Colorante sintético azul. Escasa absorción intestinal, pero conviene moderar en niños.',
    consensoCientifico: 'Aprobado internacionalmente dentro de márgenes establecidos.',
  },
  e150d: {
    nombre: 'Caramelo de sulfito amónico (Caramelo IV)',
    categoria: 'Colorante caramelo',
    nivelRiesgo: 'precaucion',
    explicacion: 'Colorante marrón usado ampliamente en gaseosas cola. En su proceso industrial genera 4-MEI.',
    consensoCientifico: 'La EFSA fijó un límite seguro de 300 mg/kg que las bebidas comerciales respetan.',
  },
  e160a: {
    nombre: 'Betacaroteno',
    categoria: 'Colorante natural / Provitamina A',
    nivelRiesgo: 'sin_riesgo',
    explicacion: 'Pigmento natural presente en zanahorias y calabazas. Excelente alternativa a colorantes sintéticos.',
    consensoCientifico: 'Completamente seguro y precursor de vitamina A.',
  },
  e162: {
    nombre: 'Rojo de remolacha (Betanina)',
    categoria: 'Colorante natural',
    nivelRiesgo: 'sin_riesgo',
    explicacion: 'Extracto natural de remolacha roja.',
    consensoCientifico: 'Inocuo y seguro.',
  },

  // ─── Conservantes ───────────────────────────────────────────
  e200: {
    nombre: 'Ácido sórbico',
    categoria: 'Conservante antimicrobiano',
    nivelRiesgo: 'sin_riesgo',
    explicacion: 'Conservante que previene el crecimiento de hongos y levaduras en quesos y panes.',
    consensoCientifico: 'Altamente metabolizado por el cuerpo sin acumulación.',
  },
  e202: {
    nombre: 'Sorbato de potasio',
    categoria: 'Conservante antimicrobiano',
    nivelRiesgo: 'sin_riesgo',
    explicacion: 'Uno de los conservantes más seguros y utilizados para proteger alimentos contra hongos.',
    consensoCientifico: 'Evaluado repetidamente como seguro por la OMS y EFSA.',
  },
  e211: {
    nombre: 'Benzoato de sodio',
    categoria: 'Conservante antifúngico',
    nivelRiesgo: 'precaucion',
    explicacion: 'Conservante común en gaseosas y aderezos ácidos. Si se combina con vitamina C puede formar trazas de benceno.',
    consensoCientifico: 'Autorizado con límites de concentración estrictos.',
  },
  e220: {
    nombre: 'Dióxido de azufre (Sulfitos)',
    categoria: 'Conservante y antioxidante',
    nivelRiesgo: 'precaucion',
    explicacion: 'Empleado en vinos, vinagres y frutas secas. Puede provocar reacciones asmáticas en personas sensibles.',
    consensoCientifico: 'Es un alérgeno de declaración obligatoria.',
  },
  e250: {
    nombre: 'Nitrito de sodio',
    categoria: 'Conservante de fiambres y embutidos',
    nivelRiesgo: 'evitar',
    explicacion: 'Previene el botulismo en carnes procesadas, pero genera nitrosaminas potencialmente dañinas al calentarse.',
    consensoCientifico: 'La OMS recomienda reducir al mínimo el consumo de carnes curadas con nitritos.',
  },
  e251: {
    nombre: 'Nitrato de sodio',
    categoria: 'Conservante cárnico',
    nivelRiesgo: 'evitar',
    explicacion: 'Usado para curar carnes y embutidos. Su transformación interna en nitritos aconseja moderación estricta.',
    consensoCientifico: 'Mismo criterio que nitrito de sodio según IARC/OMS.',
  },

  // ─── Potenciadores del Sabor ────────────────────────────────
  e621: {
    nombre: 'Glutamato monosódico (GMS)',
    categoria: 'Potenciador del sabor (Umami)',
    nivelRiesgo: 'precaucion',
    explicacion: 'Aminoácido que intensifica el sabor umami. Seguro para la mayoría, aunque fomenta el sobreconsumo de ultraprocesados.',
    consensoCientifico: 'Seguro según la EFSA, pero su presencia indica alta palatabilidad industrial.',
  },

  // ─── Antioxidantes y Reguladores de Acidez ───────────────────
  e300: {
    nombre: 'Ácido ascórbico (Vitamina C)',
    categoria: 'Antioxidante natural',
    nivelRiesgo: 'sin_riesgo',
    explicacion: 'Vitamina C que previene la oxidación de los alimentos. Totalmente saludable.',
    consensoCientifico: 'Beneficioso e inocuo.',
  },
  e306: {
    nombre: 'Extracto rico en tocoferoles (Vitamina E)',
    categoria: 'Antioxidante natural',
    nivelRiesgo: 'sin_riesgo',
    explicacion: 'Vitamina E natural que protege los aceites y grasas contra el enranciamiento.',
    consensoCientifico: 'Inocuo y seguro.',
  },
  e322: {
    nombre: 'Lecitinas (de soja o girasol)',
    categoria: 'Emulsionante natural',
    nivelRiesgo: 'sin_riesgo',
    explicacion: 'Fosfolípido natural que permite mezclar agua y grasa (en chocolates y mayonesas).',
    consensoCientifico: 'Totalmente seguro. Solo personas con alergia severa a la soja deben verificar la fuente.',
  },
  e330: {
    nombre: 'Ácido cítrico',
    categoria: 'Regulador de acidez y antioxidante',
    nivelRiesgo: 'sin_riesgo',
    explicacion: 'Ácido orgánico idéntico al de los cítricos (limón, naranja). Aporta frescura y preserva.',
    consensoCientifico: 'Completamente seguro e inofensivo.',
  },
  e331: {
    nombre: 'Citratos de sodio',
    categoria: 'Regulador de acidez',
    nivelRiesgo: 'sin_riesgo',
    explicacion: 'Sal del ácido cítrico. Regula la acidez y mejora la textura.',
    consensoCientifico: 'Seguro y ampliamente tolerado.',
  },
  e320: {
    nombre: 'BHA (Butilhidroxianisol)',
    categoria: 'Antioxidante sintético',
    nivelRiesgo: 'precaucion',
    explicacion: 'Antioxidante artificial en grasas industriales. Existen dudas sobre su acumulación a largo plazo.',
    consensoCientifico: 'Sujeto a reevaluación periódica de la EFSA con IDA estricta.',
  },
  e321: {
    nombre: 'BHT (Butilhidroxitolueno)',
    categoria: 'Antioxidante sintético',
    nivelRiesgo: 'precaucion',
    explicacion: 'Antioxidante industrial sintético. Se prefiere optar por productos con vitamina E o C.',
    consensoCientifico: 'Uso restringido en alimentos para bebés y niños.',
  },

  // ─── Espesantes, Estabilizantes y Emulsionantes ──────────────
  e407: {
    nombre: 'Carragenina / Carragenanos',
    categoria: 'Espesante de algas',
    nivelRiesgo: 'precaucion',
    explicacion: 'Espesante extraído de algas marinas. Estudios recientes sugieren precaución en personas con colon irritable.',
    consensoCientifico: 'Autorizado en grado alimentario, pero la EFSA investiga su impacto en la microbiota.',
  },
  e412: {
    nombre: 'Goma guar',
    categoria: 'Espesante natural / Fibra soluble',
    nivelRiesgo: 'sin_riesgo',
    explicacion: 'Fibra vegetal soluble proveniente de semillas de guar. Aporta textura cremosa.',
    consensoCientifico: 'Seguro y actúa como fibra dietética.',
  },
  e415: {
    nombre: 'Goma xantana',
    categoria: 'Espesante natural por fermentación',
    nivelRiesgo: 'sin_riesgo',
    explicacion: 'Polisacárido natural muy usado en recetas sin gluten para dar elasticidad a las masas.',
    consensoCientifico: 'Completamente seguro y de gran utilidad celíaca.',
  },
  e440: {
    nombre: 'Pectina',
    categoria: 'Gelificante natural de frutas',
    nivelRiesgo: 'sin_riesgo',
    explicacion: 'Fibra natural presente en manzanas y cítricos. Se usa en mermeladas y yogures.',
    consensoCientifico: 'Saludable y prebiótica.',
  },
  e471: {
    nombre: 'Monoglicéridos y diglicéridos de ácidos grasos',
    categoria: 'Emulsionante industrial',
    nivelRiesgo: 'precaucion',
    explicacion: 'Emulsionante en panadería industrial y galletitas. Marca distintiva de alimentos ultraprocesados.',
    consensoCientifico: 'Toxicológicamente seguro, pero vinculado a productos altamente procesados.',
  },
};

/**
 * Normaliza un código de aditivo procedente de Open Food Facts o texto de ingredientes.
 * Ej: "en:e330" -> "e330", "INS 102" -> "e102", "E-202" -> "e202"
 */
export function normalizarCodigoAditivo(raw: string): string {
  const limpio = (raw || '').toLowerCase().trim();
  const sinPrefijo = limpio.replace(/^(en:|es:|ins\s*)/, '').replace(/\s+/g, '');
  if (sinPrefijo.startsWith('e-')) {
    return `e${sinPrefijo.slice(2)}`;
  }
  if (!sinPrefijo.startsWith('e')) {
    return `e${sinPrefijo}`;
  }
  return sinPrefijo;
}

/**
 * Busca y clasifica un aditivo en nuestro catálogo pedagógico.
 */
export function clasificarAditivo(codigoRaw: string): AditivoAnalizado {
  const normalizado = normalizarCodigoAditivo(codigoRaw);
  const info = CATALOGO_ADITIVOS[normalizado];

  if (info) {
    return {
      codigo: normalizado.toUpperCase(),
      nombre: info.nombre,
      categoria: info.categoria,
      nivelRiesgo: info.nivelRiesgo,
      explicacion: info.explicacion,
      consensoCientifico: info.consensoCientifico,
    };
  }

  // Aditivo no listado específicamente: se analiza de manera genérica
  const codigoVisible = normalizado.toUpperCase();
  return {
    codigo: codigoVisible,
    nombre: `Aditivo ${codigoVisible}`,
    categoria: 'Aditivo alimentario autorizado',
    nivelRiesgo: 'sin_riesgo',
    explicacion: 'Aditivo legalmente autorizado para uso alimentario en dosis estándar.',
    consensoCientifico: 'Aprobado por el Código Alimentario y organismos sanitarios.',
  };
}

/**
 * Procesa una lista de códigos de aditivos y los ordena por severidad de riesgo.
 */
export function analizarListaAditivos(tags: string[] = []): AditivoAnalizado[] {
  const resultado: AditivoAnalizado[] = [];
  const vistos = new Set<string>();

  for (const t of tags) {
    const norm = normalizarCodigoAditivo(t);
    if (!vistos.has(norm)) {
      vistos.add(norm);
      resultado.push(clasificarAditivo(t));
    }
  }

  // Ordenar: 'evitar' primero, luego 'precaucion', finalmente 'sin_riesgo'
  const ordenPeso: Record<NivelRiesgoAditivo, number> = {
    evitar: 3,
    precaucion: 2,
    sin_riesgo: 1,
  };

  return resultado.sort((a, b) => ordenPeso[b.nivelRiesgo] - ordenPeso[a.nivelRiesgo]);
}
