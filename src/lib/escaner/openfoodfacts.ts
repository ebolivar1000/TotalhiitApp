import { clasificarAditivo } from './aditivos';
import { buscarEnCatalogoLocal } from './catalogoLocal';
import { detectarPaisPorCodigo } from './paises';
import { calcularPuntajeSalud } from './puntaje';
import type { AlternativaSaludable, NutrientesPor100, ProductoEscaneado } from './tipos';

const URL_BASE_OFF = 'https://world.openfoodfacts.org';
const TIMEOUT_MS = 4000;
const USER_AGENT_APP = 'TotalHIIT-App/1.0.12 (https://totalhiit.pages.dev; contact@totalhiit.com)';

export const ATRIBUCION_OPEN_FOOD_FACTS = {
  nombre: 'Open Food Facts',
  licencia: 'Open Database License (ODbL) y Database Contents License (DbCL)',
  url: 'https://openfoodfacts.org',
  mensaje: 'Datos nutricionales provistos por la base de datos libre y colaborativa Open Food Facts.',
};

export interface RespuestaOFFProduct {
  status: number;
  status_verbose?: string;
  code?: string;
  product?: Record<string, unknown>;
}

/**
 * Extrae un valor numérico de nutrientes buscando en múltiples claves posibles de Open Food Facts.
 */
function leerNutriente(
  nutriments: Record<string, unknown>,
  claves100g: string[],
  clavesServing?: string[],
  porcionG?: number,
): number {
  for (const k of claves100g) {
    const val = nutriments[k];
    if (val !== undefined && val !== null && val !== '') {
      const num = Number(val);
      if (!isNaN(num)) return num;
    }
  }

  // Si no está informado por 100g pero sí por porción y conocemos el tamaño de porción
  if (clavesServing && porcionG && porcionG > 0) {
    for (const sk of clavesServing) {
      const val = nutriments[sk];
      if (val !== undefined && val !== null && val !== '') {
        const num = Number(val);
        if (!isNaN(num)) {
          return Math.round((num / porcionG) * 100 * 10) / 10;
        }
      }
    }
  }

  return 0;
}

/**
 * Realiza una petición HTTP a Open Food Facts con timeout.
 */
async function peticionOFF(url: string): Promise<RespuestaOFFProduct | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': USER_AGENT_APP,
      },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as RespuestaOFFProduct;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/**
 * Consulta la información nutricional de un código de barras.
 * 1. Primero verifica el catálogo local curado de Argentina (0 ms, offline).
 * 2. Si no está en catálogo local, consulta la API de Open Food Facts con reintentos y variantes de código.
 */
export async function consultarOpenFoodFacts(
  codigoBarras: string,
  paisPreferido?: string,
): Promise<{ exito: boolean; producto?: ProductoEscaneado; mensaje?: string }> {
  const codigoLimpio = codigoBarras.trim().replace(/\D/g, '');
  if (!codigoLimpio || codigoLimpio.length < 6 || codigoLimpio.length > 14) {
    return { exito: false, mensaje: 'El código de barras debe ser numérico (EAN-8, EAN-13 o UPC).' };
  }

  // ─── 1. RESOLUCIÓN INSTANTÁNEA EN CATÁLOGO LOCAL CURADO ──────
  const prodLocal = buscarEnCatalogoLocal(codigoLimpio, paisPreferido);
  if (prodLocal) {
    return { exito: true, producto: prodLocal };
  }

  // ─── 2. CONSULTA EN OPEN FOOD FACTS (API v2 / v0) ────────────
  const campos = [
    'code',
    'product_name',
    'product_name_es',
    'brands',
    'categories_tags',
    'image_url',
    'image_front_url',
    'image_nutrition_url',
    'nutriscore_grade',
    'nova_group',
    'ecoscore_grade',
    'ingredients_text',
    'ingredients_text_es',
    'allergens_tags',
    'traces_tags',
    'additives_tags',
    'nutriments',
    'serving_size',
    'serving_quantity',
  ].join(',');

  // Probar variantes de código (directo, con 0 adelante si es 12 dígitos, o sin 0 si es 13)
  const codigosAProbar = [codigoLimpio];
  if (codigoLimpio.length === 12) codigosAProbar.push(`0${codigoLimpio}`);
  if (codigoLimpio.length === 13 && codigoLimpio.startsWith('0')) {
    codigosAProbar.push(codigoLimpio.slice(1));
  }

  let data: RespuestaOFFProduct | null = null;
  let codigoEncontrado = codigoLimpio;

  for (const cod of codigosAProbar) {
    const urlV2 = `${URL_BASE_OFF}/api/v2/product/${cod}.json?fields=${campos}&app_name=TotalHIIT&app_version=1.0.12`;
    data = await peticionOFF(urlV2);
    if (data && data.status === 1 && data.product) {
      codigoEncontrado = cod;
      break;
    }

    // Fallback a endpoint v0 si v2 no lo encontró
    const urlV0 = `${URL_BASE_OFF}/api/v0/product/${cod}.json`;
    data = await peticionOFF(urlV0);
    if (data && data.status === 1 && data.product) {
      codigoEncontrado = cod;
      break;
    }
  }

  if (!data || data.status !== 1 || !data.product) {
    return {
      exito: false,
      mensaje: 'Producto no encontrado en Open Food Facts. Puedes registrar su etiqueta manualmente o con foto.',
    };
  }

  const prod = data.product;
  const nutriments = (prod.nutriments as Record<string, unknown>) || {};
  const porcionG = Number(nutriments['serving_quantity']) || parseFloat(String(prod.serving_size || '')) || 0;

  let caloriasKcal = leerNutriente(
    nutriments,
    ['energy-kcal_100g', 'energy-kcal_value', 'energy-kcal'],
    ['energy-kcal_serving'],
    porcionG,
  );
  if (!caloriasKcal && nutriments['energy_100g']) {
    caloriasKcal = Math.round(Number(nutriments['energy_100g']) / 4.184);
  }

  let azucaresG = leerNutriente(nutriments, ['sugars_100g', 'sugars_value', 'sugars'], ['sugars_serving'], porcionG);
  let grasasTotalesG = leerNutriente(nutriments, ['fat_100g', 'fat_value', 'fat'], ['fat_serving'], porcionG);
  let grasasSaturadasG = leerNutriente(
    nutriments,
    ['saturated-fat_100g', 'saturated-fat_value', 'saturated-fat'],
    ['saturated-fat_serving'],
    porcionG,
  );

  let sodioMg = leerNutriente(nutriments, ['sodium_100g', 'sodium_value', 'sodium'], ['sodium_serving'], porcionG);
  if (sodioMg > 0 && sodioMg < 10) {
    // Si viene en gramos (ej: 0.4g de sodio), convertir a miligramos
    sodioMg = Math.round(sodioMg * 1000);
  } else if (!sodioMg && nutriments['salt_100g']) {
    const sal = Number(nutriments['salt_100g']) || 0;
    sodioMg = Math.round((sal / 2.5) * 1000);
  }

  const fibraG = leerNutriente(nutriments, ['fiber_100g', 'fiber_value', 'fiber'], ['fiber_serving'], porcionG);
  const proteinasG = leerNutriente(
    nutriments,
    ['proteins_100g', 'proteins_value', 'proteins'],
    ['proteins_serving'],
    porcionG,
  );
  const salG =
    leerNutriente(nutriments, ['salt_100g', 'salt_value', 'salt'], ['salt_serving'], porcionG) ||
    (sodioMg > 0 ? (sodioMg / 1000) * 2.5 : 0);

  const nombre = String(prod.product_name_es || prod.product_name || 'Producto sin nombre').trim();
  const marca = String(prod.brands || '').trim();
  const categoriaTags = Array.isArray(prod.categories_tags) ? (prod.categories_tags as string[]) : [];

  // ─── 3. DETECCIÓN INTELIGENTE DE PRODUCTOS SIN TABLA CARGADA EN OFF ─
  // Caso emblemático: Aceites y Rocíos vegetales cargados sin nutriments
  const textoCompleto = `${nombre} ${marca} ${categoriaTags.join(' ')}`.toLowerCase();
  const esAceite =
    textoCompleto.includes('aceite') ||
    textoCompleto.includes('oil') ||
    textoCompleto.includes('fritolim') ||
    textoCompleto.includes('rocio vegetal') ||
    textoCompleto.includes('rocío vegetal') ||
    textoCompleto.includes('girasol') ||
    textoCompleto.includes('oliva') ||
    textoCompleto.includes('canola');

  let perfilInferido = false;
  let mensajeInferencia: string | undefined = undefined;

  if (esAceite && grasasTotalesG === 0) {
    // Un aceite o rocío vegetal es ~92% a 100% lípido; jamás puede tener 0% de grasa.
    const esSpray =
      textoCompleto.includes('fritolim') ||
      textoCompleto.includes('aerosol') ||
      textoCompleto.includes('spray') ||
      textoCompleto.includes('rocio');

    grasasTotalesG = esSpray ? 92 : 100;
    grasasSaturadasG = 12;
    caloriasKcal = Math.round(grasasTotalesG * 9); // 828 kcal o 900 kcal
    azucaresG = 0;
    sodioMg = 0;
    perfilInferido = true;
    mensajeInferencia =
      'Open Food Facts no tenía cargada la tabla de este aceite. Estimamos los valores típicos (~100g de grasa). Puedes editarlos con tu envase.';
    if (!categoriaTags.some((c) => c.includes('oil') || c.includes('aceite'))) {
      categoriaTags.push('en:vegetable-oils');
    }
  }

  const tieneCalorias = caloriasKcal > 0;
  const tieneGrasas = grasasTotalesG > 0;
  const tieneProteinas = proteinasG > 0;
  const tieneAzucares = azucaresG > 0;
  const datosIncompletos =
    (!tieneCalorias && !tieneGrasas && !tieneProteinas && !tieneAzucares) || perfilInferido;

  if (datosIncompletos && !mensajeInferencia) {
    mensajeInferencia =
      'Open Food Facts tiene registrado el producto pero la comunidad aún no completó la tabla nutricional (figura en 0). Puedes completarla editando los valores.';
  }

  const nutrientes: NutrientesPor100 = {
    caloriasKcal,
    azucaresG,
    grasasTotalesG,
    grasasSaturadasG,
    sodioMg,
    fibraG,
    proteinasG,
    salG,
  };

  const esLiquido = categoriaTags.some(
    (c) =>
      c.includes('beverage') ||
      c.includes('drink') ||
      c.includes('soda') ||
      c.includes('juice') ||
      c.includes('milk') ||
      c.includes('water') ||
      c.includes('bebida'),
  );

  const additivesTags = Array.isArray(prod.additives_tags) ? (prod.additives_tags as string[]) : [];
  const aditivosAnalizados = additivesTags.map((t) => clasificarAditivo(t));

  const novaRaw = Number(prod.nova_group);
  const novaGroup = (novaRaw >= 1 && novaRaw <= 4 ? novaRaw : esAceite ? 2 : undefined) as
    | 1
    | 2
    | 3
    | 4
    | undefined;

  const nutriScoreRaw = String(prod.nutriscore_grade || '').toLowerCase();
  const nutriScoreGrade = ['a', 'b', 'c', 'd', 'e'].includes(nutriScoreRaw)
    ? (nutriScoreRaw as 'a' | 'b' | 'c' | 'd' | 'e')
    : undefined;

  const ecoScoreRaw = String(prod.ecoscore_grade || '').toLowerCase();
  const ecoScoreGrade = ['a', 'b', 'c', 'd', 'e'].includes(ecoScoreRaw)
    ? (ecoScoreRaw as 'a' | 'b' | 'c' | 'd' | 'e')
    : undefined;

  const pais = detectarPaisPorCodigo(codigoEncontrado, paisPreferido);

  const puntaje = calcularPuntajeSalud({
    nutrientes,
    novaGroup,
    aditivosAnalizados,
    categoriaTags,
    esLiquido,
    ingredientesTexto: String(prod.ingredients_text_es || prod.ingredients_text || ''),
    codigoBarras: codigoEncontrado,
    paisPreferido,
  });

  const productoFinal: ProductoEscaneado = {
    codigoBarras: codigoEncontrado,
    nombre,
    marca: marca || undefined,
    categoria: categoriaTags[categoriaTags.length - 1]?.replace(/^en:/, '').replace(/-/g, ' ') || 'Alimento',
    categoriaTags,
    imagenUrl: (prod.image_front_url || prod.image_url) as string | undefined,
    imagenNutricionUrl: prod.image_nutrition_url as string | undefined,
    nutriScoreGrade,
    novaGroup,
    ecoScoreGrade,
    ingredientesTexto: (prod.ingredients_text_es || prod.ingredients_text) as string | undefined,
    alergenos: Array.isArray(prod.allergens_tags)
      ? (prod.allergens_tags as string[]).map((a) => a.replace(/^en:/, '').replace(/-/g, ' '))
      : [],
    trazasAlergenos: Array.isArray(prod.traces_tags)
      ? (prod.traces_tags as string[]).map((t) => t.replace(/^en:/, '').replace(/-/g, ' '))
      : [],
    aditivos: aditivosAnalizados,
    nutrientes,
    esLiquido,
    puntaje,
    fuente: 'openfoodfacts',
    fechaEscaneo: Date.now(),
    datosIncompletos,
    perfilInferido,
    mensajeInferencia,
    paisOrigen: {
      codigo: pais.codigo,
      nombre: pais.nombre,
      bandera: pais.bandera,
    },
  };

  return { exito: true, producto: productoFinal };
}

/**
 * Busca hasta 3 alternativas más saludables dentro de la misma categoría de producto.
 */
export async function buscarAlternativasSaludables(
  categoriaTag: string,
  codigoActual: string,
): Promise<AlternativaSaludable[]> {
  if (!categoriaTag) return [];

  const url = `${URL_BASE_OFF}/cgi/search.pl?action=process&tagtype_0=categories&tag_contains_0=contains&tag_0=${encodeURIComponent(
    categoriaTag,
  )}&sort_by=nutriscore_score&page_size=6&json=true&fields=code,product_name,product_name_es,brands,image_front_url,image_url,nutriscore_grade,nova_group,nutriments`;

  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];

    const data = await res.json();
    const productos = Array.isArray(data.products) ? data.products : [];

    const alternativas: AlternativaSaludable[] = [];

    for (const p of productos) {
      const code = String(p.code || '').trim();
      if (!code || code === codigoActual) continue;

      const nut = (p.nutriments as Record<string, unknown>) || {};
      const azucares = Number(nut['sugars_100g']) || 0;
      const grasasSat = Number(nut['saturated-fat_100g']) || 0;
      const calorias = Number(nut['energy-kcal_100g']) || 0;
      const fibra = Number(nut['fiber_100g']) || 0;
      const proteinas = Number(nut['proteins_100g']) || 0;
      const sodio = Number(nut['sodium_100g']) ? Number(nut['sodium_100g']) * 1000 : 0;

      const puntaje = calcularPuntajeSalud({
        nutrientes: {
          caloriasKcal: calorias,
          azucaresG: azucares,
          grasasTotalesG: Number(nut['fat_100g']) || 0,
          grasasSaturadasG: grasasSat,
          sodioMg: sodio,
          fibraG: fibra,
          proteinasG: proteinas,
        },
        novaGroup: p.nova_group as 1 | 2 | 3 | 4 | undefined,
      });

      alternativas.push({
        codigoBarras: code,
        nombre: String(p.product_name_es || p.product_name || 'Opción alternativa').trim(),
        marca: String(p.brands || '').trim() || undefined,
        imagenUrl: (p.image_front_url || p.image_url) as string | undefined,
        puntaje: puntaje.puntos,
        nivel: puntaje.nivel,
        categoria: categoriaTag.replace(/^en:/, '').replace(/-/g, ' '),
      });

      if (alternativas.length >= 3) break;
    }

    return alternativas.sort((a, b) => b.puntaje - a.puntaje);
  } catch {
    return [];
  }
}
