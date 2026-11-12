import type { LeyendaPrecautoria, NutrientesPor100, OctogonoArgentina } from './tipos';

/**
 * Módulo de cálculo de sellos de advertencia negros según la Ley Nacional 27.642
 * (Promoción de la Alimentación Saludable - Etiquetado Frontal en Argentina),
 * basada en el Sistema de Perfil de Nutrientes de la OPS/OMS.
 */

export interface OpcionesOctogono {
  esLiquido?: boolean;
  contieneEdulcorantes?: boolean;
  contieneCafeina?: boolean;
  ingredientesTexto?: string;
  aditivosCodigos?: string[];
  esExceptuadoPorLey?: boolean;
}

const EDULCORANTES_CONOCIDOS = [
  'e950', // acesulfamo
  'e951', // aspartamo
  'e952', // ciclamato
  'e954', // sacarina
  'e955', // sucralosa
  'e960', // stevia
  'e965', // maltitol
  'e420', // sorbitol
  'e967', // xilitol
  'e968', // eritritol
];

const PALABRAS_CLAVE_EDULCORANTES = [
  'edulcorante',
  'sucralosa',
  'aspartamo',
  'acesulfamo',
  'stevia',
  'estevia',
  'ciclamato',
  'sacarina',
  'maltitol',
  'sorbitol',
  'eritritol',
  'polialcohol',
];

const PALABRAS_CLAVE_CAFEINA = [
  'cafeina',
  'cafeína',
  'taurina',
  'extracto de cafe',
  'extracto de café',
  'guarana',
  'guaraná',
];

export function calcularOctogonosArgentina(
  nutrientes: NutrientesPor100,
  opciones: OpcionesOctogono = {},
): {
  octogonos: OctogonoArgentina[];
  leyendas: LeyendaPrecautoria[];
  tieneSellos: boolean;
} {
  // Según el art. 9 de la Ley 27.642 y su Decreto Reglamentario 151/2022,
  // los aceites vegetales y azúcar común están exceptuados del rotulado frontal.
  if (opciones.esExceptuadoPorLey) {
    return {
      octogonos: [],
      leyendas: [],
      tieneSellos: false,
    };
  }

  const { caloriasKcal, azucaresG, grasasTotalesG, grasasSaturadasG, sodioMg } = nutrientes;
  const esLiquido = Boolean(opciones.esLiquido);
  const octogonos: OctogonoArgentina[] = [];

  const energiaTotal = Math.max(0, caloriasKcal);

  // 1. EXCESO EN AZÚCARES
  // Umbral Ley 27.642: azúcares libres/totales ≥ 10% del total de energía (1g azúcar = 4 kcal)
  let excesoAzucares = false;
  let umbralAzucaresStr = '';
  if (energiaTotal > 0 && azucaresG > 0) {
    const kcalAzucares = azucaresG * 4;
    const porcentajeAzucares = (kcalAzucares / energiaTotal) * 100;
    if (porcentajeAzucares >= 10) {
      excesoAzucares = true;
      umbralAzucaresStr = `${porcentajeAzucares.toFixed(1)}% kcal de azúcares (límite: 10%)`;
    }
  }

  octogonos.push({
    tipo: 'exceso_azucares',
    titulo: 'EXCESO EN AZÚCARES',
    normativa: 'Ley 27.642',
    activo: excesoAzucares,
    umbralSuperado: umbralAzucaresStr || 'Dentro del límite',
  });

  // 2. EXCESO EN GRASAS TOTALES
  // Umbral: Grasas totales ≥ 30% del total de energía (1g grasa = 9 kcal)
  let excesoGrasas = false;
  let umbralGrasasStr = '';
  if (energiaTotal > 0 && grasasTotalesG > 0) {
    const kcalGrasas = grasasTotalesG * 9;
    const porcentajeGrasas = (kcalGrasas / energiaTotal) * 100;
    if (porcentajeGrasas >= 30) {
      excesoGrasas = true;
      umbralGrasasStr = `${porcentajeGrasas.toFixed(1)}% kcal de grasas (límite: 30%)`;
    }
  }

  octogonos.push({
    tipo: 'exceso_grasas_totales',
    titulo: 'EXCESO EN GRASAS TOTALES',
    normativa: 'Ley 27.642',
    activo: excesoGrasas,
    umbralSuperado: umbralGrasasStr || 'Dentro del límite',
  });

  // 3. EXCESO EN GRASAS SATURADAS
  // Umbral: Grasas saturadas ≥ 10% del total de energía (1g grasa sat = 9 kcal)
  let excesoGrasasSat = false;
  let umbralGrasasSatStr = '';
  if (energiaTotal > 0 && grasasSaturadasG > 0) {
    const kcalGrasasSat = grasasSaturadasG * 9;
    const porcentajeGrasasSat = (kcalGrasasSat / energiaTotal) * 100;
    if (porcentajeGrasasSat >= 10) {
      excesoGrasasSat = true;
      umbralGrasasSatStr = `${porcentajeGrasasSat.toFixed(1)}% kcal grasas saturadas (límite: 10%)`;
    }
  }

  octogonos.push({
    tipo: 'exceso_grasas_saturadas',
    titulo: 'EXCESO EN GRASAS SATURADAS',
    normativa: 'Ley 27.642',
    activo: excesoGrasasSat,
    umbralSuperado: umbralGrasasSatStr || 'Dentro del límite',
  });

  // 4. EXCESO EN SODIO
  // Umbral: Sodio ≥ 1 mg por kcal, o en productos sólidos/líquidos ≥ 300 mg / 100g
  let excesoSodio = false;
  let umbralSodioStr = '';
  if (sodioMg > 0) {
    const ratioSodioCalorias = energiaTotal > 0 ? sodioMg / energiaTotal : 0;
    if (ratioSodioCalorias >= 1 || sodioMg >= 300) {
      excesoSodio = true;
      umbralSodioStr =
        ratioSodioCalorias >= 1
          ? `${ratioSodioCalorias.toFixed(2)} mg/kcal (límite: 1 mg/kcal)`
          : `${sodioMg} mg/100g (límite: 300 mg/100g)`;
    }
  }

  octogonos.push({
    tipo: 'exceso_sodio',
    titulo: 'EXCESO EN SODIO',
    normativa: 'Ley 27.642',
    activo: excesoSodio,
    umbralSuperado: umbralSodioStr || 'Dentro del límite',
  });

  // 5. EXCESO EN CALORÍAS
  // Umbral: Solo se aplica si tiene AL MENOS UN sello de azúcares, grasas o sodio:
  // Sólidos: ≥ 275 kcal / 100g | Líquidos: ≥ 70 kcal / 100ml
  const tieneSellosCriticos = excesoAzucares || excesoGrasas || excesoGrasasSat || excesoSodio;
  const limiteCalorias = esLiquido ? 70 : 275;
  let excesoCalorias = false;
  let umbralCaloriasStr = '';

  if (tieneSellosCriticos && energiaTotal >= limiteCalorias) {
    excesoCalorias = true;
    umbralCaloriasStr = `${energiaTotal} kcal/100${esLiquido ? 'ml' : 'g'} (límite: ${limiteCalorias} kcal)`;
  }

  octogonos.push({
    tipo: 'exceso_calorias',
    titulo: 'EXCESO EN CALORÍAS',
    normativa: 'Ley 27.642',
    activo: excesoCalorias,
    umbralSuperado: umbralCaloriasStr || 'Dentro del límite',
  });

  // 6. LEYENDAS PRECAUTORIAS RECTANGULARES
  const leyendas: LeyendaPrecautoria[] = [];

  // Chequeo de Edulcorantes
  const textoIngredientes = (opciones.ingredientesTexto || '').toLowerCase();
  const codigosAditivos = (opciones.aditivosCodigos || []).map((c) => c.toLowerCase());

  const tieneEdulcoranteAditivo = codigosAditivos.some((c) =>
    EDULCORANTES_CONOCIDOS.some((ed) => c.includes(ed)),
  );
  const tieneEdulcoranteTexto = PALABRAS_CLAVE_EDULCORANTES.some((palabra) =>
    textoIngredientes.includes(palabra),
  );
  const tieneEdulcorante =
    Boolean(opciones.contieneEdulcorantes) || tieneEdulcoranteAditivo || tieneEdulcoranteTexto;

  leyendas.push({
    tipo: 'edulcorantes',
    texto: 'CONTIENE EDULCORANTES: NO RECOMENDABLE EN NIÑOS/AS',
    activa: tieneEdulcorante,
  });

  // Chequeo de Cafeína
  const tieneCafeinaTexto = PALABRAS_CLAVE_CAFEINA.some((palabra) =>
    textoIngredientes.includes(palabra),
  );
  const tieneCafeina = Boolean(opciones.contieneCafeina) || tieneCafeinaTexto;

  leyendas.push({
    tipo: 'cafeina',
    texto: 'CONTIENE CAFEÍNA: EVITAR EN NIÑOS/AS',
    activa: tieneCafeina,
  });

  const octogonosActivos = octogonos.filter((o) => o.activo);

  return {
    octogonos: octogonosActivos,
    leyendas: leyendas.filter((l) => l.activa),
    tieneSellos: octogonosActivos.length > 0 || leyendas.some((l) => l.activa),
  };
}
