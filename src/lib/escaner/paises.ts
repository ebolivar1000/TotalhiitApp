/**
 * Módulo de detección de país de origen y normativas de etiquetado frontal
 * para países hispanoparlantes (América Latina y España) según prefijos GS1.
 */

export interface InfoPaisNormativa {
  codigo: string; // 'MX', 'AR', 'CO', 'CL', 'PE', 'UY', 'ES', 'OPS'
  nombre: string;
  bandera: string;
  normativa: string;
  organismo: string;
  prefijoSello: 'EXCESO EN' | 'EXCESO' | 'ALTO EN' | 'EVALUACIÓN';
  leyendaCafeina: string;
  leyendaEdulcorante: string;
  usaNutriScorePrincipal?: boolean;
}

export const PAIS_OPS_BASE: InfoPaisNormativa = {
  codigo: 'OPS',
  nombre: 'Hispanoamérica / OPS',
  bandera: '🌎',
  normativa: 'Modelo Nutricional OPS/OMS',
  organismo: 'Organización Panamericana de la Salud',
  prefijoSello: 'EXCESO EN',
  leyendaCafeina: 'CONTIENE CAFEÍNA: EVITAR EN NIÑOS/AS',
  leyendaEdulcorante: 'CONTIENE EDULCORANTES: NO RECOMENDABLE EN NIÑOS/AS',
};

export const PAISES_NORMATIVAS: Record<string, InfoPaisNormativa> = {
  MX: {
    codigo: 'MX',
    nombre: 'México',
    bandera: '🇲🇽',
    normativa: 'NOM-051',
    organismo: 'Secretaría de Salud',
    prefijoSello: 'EXCESO',
    leyendaCafeina: 'CONTIENE CAFEÍNA: EVITAR EN NIÑOS',
    leyendaEdulcorante: 'CONTIENE EDULCORANTES: NO RECOMENDABLE EN NIÑOS',
  },
  AR: {
    codigo: 'AR',
    nombre: 'Argentina',
    bandera: '🇦🇷',
    normativa: 'Ley 27.642',
    organismo: 'Ministerio de Salud',
    prefijoSello: 'EXCESO EN',
    leyendaCafeina: 'CONTIENE CAFEÍNA: EVITAR EN NIÑOS/AS',
    leyendaEdulcorante: 'CONTIENE EDULCORANTES: NO RECOMENDABLE EN NIÑOS/AS',
  },
  CO: {
    codigo: 'CO',
    nombre: 'Colombia',
    bandera: '🇨🇴',
    normativa: 'Res. 2492 / Ley 2120',
    organismo: 'MinSalud Colombia',
    prefijoSello: 'EXCESO EN',
    leyendaCafeina: 'CONTIENE CAFEÍNA: NO RECOMENDABLE EN NIÑOS',
    leyendaEdulcorante: 'CONTIENE EDULCORANTES: NO RECOMENDABLE EN NIÑOS',
  },
  CL: {
    codigo: 'CL',
    nombre: 'Chile',
    bandera: '🇨🇱',
    normativa: 'Ley 20.606',
    organismo: 'Ministerio de Salud',
    prefijoSello: 'ALTO EN',
    leyendaCafeina: 'CONTIENE CAFEÍNA',
    leyendaEdulcorante: 'CONTIENE EDULCORANTES',
  },
  PE: {
    codigo: 'PE',
    nombre: 'Perú',
    bandera: '🇵🇪',
    normativa: 'Ley 30021',
    organismo: 'Ministerio de Salud',
    prefijoSello: 'ALTO EN',
    leyendaCafeina: 'CONTIENE CAFEÍNA',
    leyendaEdulcorante: 'CONTIENE EDULCORANTES',
  },
  UY: {
    codigo: 'UY',
    nombre: 'Uruguay',
    bandera: '🇺🇾',
    normativa: 'Decreto 272/018',
    organismo: 'Ministerio de Salud Pública',
    prefijoSello: 'EXCESO',
    leyendaCafeina: 'CONTIENE CAFEÍNA',
    leyendaEdulcorante: 'CONTIENE EDULCORANTES',
  },
  ES: {
    codigo: 'ES',
    nombre: 'España',
    bandera: '🇪🇸',
    normativa: 'Nutri-Score / AESAN',
    organismo: 'AESAN / Min. Consumo',
    prefijoSello: 'EVALUACIÓN',
    leyendaCafeina: 'Contiene cafeína',
    leyendaEdulcorante: 'Contiene edulcorantes',
    usaNutriScorePrincipal: true,
  },
  OPS: PAIS_OPS_BASE,
};

export const LISTA_PAISES_DISPONIBLES: { id: string; etiqueta: string; bandera: string }[] = [
  { id: 'auto', etiqueta: 'Detectar según producto (Automático)', bandera: '🌎' },
  { id: 'MX', etiqueta: 'México (NOM-051)', bandera: '🇲🇽' },
  { id: 'CO', etiqueta: 'Colombia (Res. 2492 / Ley 2120)', bandera: '🇨🇴' },
  { id: 'CL', etiqueta: 'Chile (Ley 20.606)', bandera: '🇨🇱' },
  { id: 'AR', etiqueta: 'Argentina (Ley 27.642)', bandera: '🇦🇷' },
  { id: 'PE', etiqueta: 'Perú (Ley 30021)', bandera: '🇵🇪' },
  { id: 'UY', etiqueta: 'Uruguay (Decreto 272/018)', bandera: '🇺🇾' },
  { id: 'ES', etiqueta: 'España (Nutri-Score)', bandera: '🇪🇸' },
  { id: 'OPS', etiqueta: 'Internacional / Otros (Modelo OPS/OMS)', bandera: '🌎' },
];

/**
 * Resuelve la información normativa de un país a partir de su código ('MX', 'AR', etc.).
 */
export function resolverInfoPais(paisCodigo?: string): InfoPaisNormativa {
  if (paisCodigo && paisCodigo !== 'auto' && PAISES_NORMATIVAS[paisCodigo]) {
    return PAISES_NORMATIVAS[paisCodigo] ?? PAIS_OPS_BASE;
  }
  return PAIS_OPS_BASE;
}

/**
 * Detecta el país y normativa correspondiente a partir del prefijo numérico GS1 del código de barras.
 */
export function detectarPaisPorCodigo(codigoBarras: string, paisPreferido?: string): InfoPaisNormativa {
  // Si el usuario configuró explícitamente un país que no sea 'auto'
  if (paisPreferido && paisPreferido !== 'auto' && PAISES_NORMATIVAS[paisPreferido]) {
    return PAISES_NORMATIVAS[paisPreferido] ?? PAIS_OPS_BASE;
  }

  const limpio = codigoBarras.trim().replace(/\D/g, '');
  if (!limpio) return PAIS_OPS_BASE;

  // Prefijos de 3 dígitos GS1:
  if (limpio.startsWith('750')) return PAISES_NORMATIVAS.MX ?? PAIS_OPS_BASE; // México
  if (limpio.startsWith('779')) return PAISES_NORMATIVAS.AR ?? PAIS_OPS_BASE; // Argentina
  if (limpio.startsWith('770') || limpio.startsWith('771')) return PAISES_NORMATIVAS.CO ?? PAIS_OPS_BASE; // Colombia
  if (limpio.startsWith('780')) return PAISES_NORMATIVAS.CL ?? PAIS_OPS_BASE; // Chile
  if (limpio.startsWith('775')) return PAISES_NORMATIVAS.PE ?? PAIS_OPS_BASE; // Perú
  if (limpio.startsWith('773')) return PAISES_NORMATIVAS.UY ?? PAIS_OPS_BASE; // Uruguay
  if (limpio.startsWith('759')) return { ...PAIS_OPS_BASE, nombre: 'Venezuela', bandera: '🇻🇪' };
  if (limpio.startsWith('786')) return { ...PAIS_OPS_BASE, nombre: 'Ecuador', bandera: '🇪🇨' };
  if (limpio.startsWith('740')) return { ...PAIS_OPS_BASE, nombre: 'Guatemala', bandera: '🇬🇹' };
  if (limpio.startsWith('741')) return { ...PAIS_OPS_BASE, nombre: 'El Salvador', bandera: '🇸🇻' };
  if (limpio.startsWith('742')) return { ...PAIS_OPS_BASE, nombre: 'Honduras', bandera: '🇭🇳' };
  if (limpio.startsWith('743')) return { ...PAIS_OPS_BASE, nombre: 'Nicaragua', bandera: '🇳🇮' };
  if (limpio.startsWith('744')) return { ...PAIS_OPS_BASE, nombre: 'Costa Rica', bandera: '🇨🇷' };
  if (limpio.startsWith('745')) return { ...PAIS_OPS_BASE, nombre: 'Panamá', bandera: '🇵🇦' };
  if (limpio.startsWith('746')) return { ...PAIS_OPS_BASE, nombre: 'Rep. Dominicana', bandera: '🇩🇴' };
  if (limpio.startsWith('777')) return { ...PAIS_OPS_BASE, nombre: 'Bolivia', bandera: '🇧🇴' };
  if (limpio.startsWith('784')) return { ...PAIS_OPS_BASE, nombre: 'Paraguay', bandera: '🇵🇾' };

  // España: prefijo 84
  const prefijo2 = parseInt(limpio.slice(0, 2), 10);
  if (prefijo2 === 84) return PAISES_NORMATIVAS.ES ?? PAIS_OPS_BASE;

  return PAIS_OPS_BASE;
}
