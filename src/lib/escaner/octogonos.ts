import { detectarPaisPorCodigo, type InfoPaisNormativa } from './paises';
import type { LeyendaPrecautoria, NutrientesPor100, OctogonoArgentina } from './tipos';

/**
 * Módulo de cálculo de sellos de advertencia frontales para países hispanoparlantes
 * (México NOM-051, Argentina Ley 27.642, Chile Ley 20.606, Colombia Res. 2492, Perú Ley 30021, etc.),
 * basados en el Perfil de Nutrientes de la Organización Panamericana de la Salud (OPS/OMS).
 */

export interface OpcionesOctogono {
  esLiquido?: boolean;
  contieneEdulcorantes?: boolean;
  contieneCafeina?: boolean;
  ingredientesTexto?: string;
  aditivosCodigos?: string[];
  esExceptuadoPorLey?: boolean;
  codigoBarras?: string;
  paisPreferido?: string;
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
  paisInfo: InfoPaisNormativa;
} {
  const pais = detectarPaisPorCodigo(opciones.codigoBarras || '', opciones.paisPreferido);

  // Según el art. 9 de la Ley 27.642 / NOM-051 y pautas OPS,
  // los aceites vegetales puros y azúcar común están exceptuados del rotulado frontal.
  if (opciones.esExceptuadoPorLey) {
    return {
      octogonos: [],
      leyendas: [],
      tieneSellos: false,
      paisInfo: pais,
    };
  }

  const { caloriasKcal, azucaresG, grasasTotalesG, grasasSaturadasG, sodioMg } = nutrientes;
  const esLiquido = Boolean(opciones.esLiquido);
  const octogonos: OctogonoArgentina[] = [];

  const energiaTotal = Math.max(0, caloriasKcal);
  const prefijo = pais.prefijoSello;

  // 1. EXCESO EN AZÚCARES
  // Umbral OPS/LATAM: azúcares libres/totales ≥ 10% del total de energía (1g azúcar = 4 kcal)
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

  const tituloAzucar =
    prefijo === 'ALTO EN'
      ? 'ALTO EN AZÚCARES'
      : prefijo === 'EXCESO'
        ? 'EXCESO AZÚCARES'
        : 'EXCESO EN AZÚCARES';

  octogonos.push({
    tipo: 'exceso_azucares',
    titulo: tituloAzucar,
    normativa: pais.normativa,
    organismo: pais.organismo,
    paisCodigo: pais.codigo,
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

  const tituloGrasas =
    prefijo === 'ALTO EN'
      ? 'ALTO EN GRASAS'
      : prefijo === 'EXCESO'
        ? 'EXCESO GRASAS TOTALES'
        : 'EXCESO EN GRASAS TOTALES';

  octogonos.push({
    tipo: 'exceso_grasas_totales',
    titulo: tituloGrasas,
    normativa: pais.normativa,
    organismo: pais.organismo,
    paisCodigo: pais.codigo,
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

  const tituloGrasasSat =
    prefijo === 'ALTO EN'
      ? 'ALTO EN GRASAS SATURADAS'
      : prefijo === 'EXCESO'
        ? 'EXCESO GRASAS SATURADAS'
        : 'EXCESO EN GRASAS SATURADAS';

  octogonos.push({
    tipo: 'exceso_grasas_saturadas',
    titulo: tituloGrasasSat,
    normativa: pais.normativa,
    organismo: pais.organismo,
    paisCodigo: pais.codigo,
    activo: excesoGrasasSat,
    umbralSuperado: umbralGrasasSatStr || 'Dentro del límite',
  });

  // 4. EXCESO EN SODIO
  // Umbral: Sodio ≥ 1 mg por kcal, o en sólidos ≥ 300 mg / 100g (líquidos ≥ 50 mg / 100ml)
  let excesoSodio = false;
  let umbralSodioStr = '';
  if (sodioMg > 0) {
    const ratioSodioCalorias = energiaTotal > 0 ? sodioMg / energiaTotal : 0;
    if (ratioSodioCalorias >= 1 || sodioMg >= 300) {
      excesoSodio = true;
      umbralSodioStr =
        ratioSodioCalorias >= 1
          ? `${sodioMg} mg sodio (${ratioSodioCalorias.toFixed(1)} mg/kcal ≥ límite 1 mg/kcal)`
          : `${sodioMg} mg sodio / 100g (límite: 300 mg)`;
    }
  }

  const tituloSodio =
    prefijo === 'ALTO EN'
      ? 'ALTO EN SODIO'
      : prefijo === 'EXCESO'
        ? 'EXCESO SODIO'
        : 'EXCESO EN SODIO';

  octogonos.push({
    tipo: 'exceso_sodio',
    titulo: tituloSodio,
    normativa: pais.normativa,
    organismo: pais.organismo,
    paisCodigo: pais.codigo,
    activo: excesoSodio,
    umbralSuperado: umbralSodioStr || 'Dentro del límite',
  });

  // 5. EXCESO EN CALORÍAS
  // Umbral: Sólidos ≥ 275 kcal/100g | Líquidos ≥ 70 kcal/100ml (solo si contiene azúcares o grasas con exceso)
  const tieneSellosCriticos = excesoAzucares || excesoGrasas || excesoGrasasSat;
  const limiteCalorias = esLiquido ? 70 : 275;
  let excesoCalorias = false;
  let umbralCaloriasStr = '';

  if (tieneSellosCriticos && energiaTotal >= limiteCalorias) {
    excesoCalorias = true;
    umbralCaloriasStr = `${energiaTotal} kcal/100${esLiquido ? 'ml' : 'g'} (límite: ${limiteCalorias} kcal)`;
  }

  const tituloCalorias =
    prefijo === 'ALTO EN'
      ? 'ALTO EN CALORÍAS'
      : prefijo === 'EXCESO'
        ? 'EXCESO CALORÍAS'
        : 'EXCESO EN CALORÍAS';

  octogonos.push({
    tipo: 'exceso_calorias',
    titulo: tituloCalorias,
    normativa: pais.normativa,
    organismo: pais.organismo,
    paisCodigo: pais.codigo,
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
    texto: pais.leyendaEdulcorante,
    activa: tieneEdulcorante,
  });

  // Chequeo de Cafeína
  const tieneCafeinaTexto = PALABRAS_CLAVE_CAFEINA.some((palabra) =>
    textoIngredientes.includes(palabra),
  );
  const tieneCafeina = Boolean(opciones.contieneCafeina) || tieneCafeinaTexto;

  leyendas.push({
    tipo: 'cafeina',
    texto: pais.leyendaCafeina,
    activa: tieneCafeina,
  });

  const octogonosActivos = octogonos.filter((o) => o.activo);

  return {
    octogonos: octogonosActivos,
    leyendas: leyendas.filter((l) => l.activa),
    tieneSellos: octogonosActivos.length > 0 || leyendas.some((l) => l.activa),
    paisInfo: pais,
  };
}

export const calcularSellosAdvertencia = calcularOctogonosArgentina;
