import { clasificarAditivo } from './aditivos';
import { calcularPuntajeSalud } from './puntaje';
import type { AlternativaSaludable, NutrientesPor100, ProductoEscaneado } from './tipos';

const URL_BASE_OFF = 'https://world.openfoodfacts.org';
const TIMEOUT_MS = 3500;
const USER_AGENT_APP = 'TotalHIIT-App/1.0.11 (https://totalhiit.pages.dev; contact@totalhiit.com)';

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
 * Consulta la API pública de Open Food Facts para un código de barras (EAN-13, EAN-8, UPC).
 */
export async function consultarOpenFoodFacts(
  codigoBarras: string,
): Promise<{ exito: boolean; producto?: ProductoEscaneado; mensaje?: string }> {
  const codigoLimpio = codigoBarras.trim().replace(/\s+/g, '');
  if (!codigoLimpio || !/^\d{6,14}$/.test(codigoLimpio)) {
    return { exito: false, mensaje: 'El código de barras debe ser numérico (EAN-8, EAN-13 o UPC).' };
  }

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
  ].join(',');

  const url = `${URL_BASE_OFF}/api/v2/product/${codigoLimpio}.json?fields=${campos}&app_name=TotalHIIT&app_version=1.0.11`;

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

    if (!res.ok) {
      if (res.status === 404) {
        return {
          exito: false,
          mensaje: 'El producto no fue encontrado en la base de Open Food Facts.',
        };
      }
      return {
        exito: false,
        mensaje: `Error al conectar con Open Food Facts (código HTTP ${res.status}).`,
      };
    }

    const data = (await res.json()) as RespuestaOFFProduct;

    if (data.status !== 1 || !data.product) {
      return {
        exito: false,
        mensaje: 'El producto no está catalogado aún en Open Food Facts.',
      };
    }

    const prod = data.product;
    const nutriments = (prod.nutriments as Record<string, unknown>) || {};

    const caloriasKcal =
      Number(nutriments['energy-kcal_100g']) ||
      Number(nutriments['energy-kcal']) ||
      (Number(nutriments['energy_100g']) ? Math.round(Number(nutriments['energy_100g']) / 4.184) : 0);

    const azucaresG = Number(nutriments['sugars_100g']) || 0;
    const grasasTotalesG = Number(nutriments['fat_100g']) || 0;
    const grasasSaturadasG = Number(nutriments['saturated-fat_100g']) || 0;
    const sodioMg =
      Number(nutriments['sodium_100g']) !== undefined && nutriments['sodium_100g'] !== null
        ? Math.round(Number(nutriments['sodium_100g']) * 1000)
        : Number(nutriments['salt_100g'])
          ? Math.round((Number(nutriments['salt_100g']) / 2.5) * 1000)
          : 0;

    const fibraG = Number(nutriments['fiber_100g']) || 0;
    const proteinasG = Number(nutriments['proteins_100g']) || 0;
    const salG = Number(nutriments['salt_100g']) || (sodioMg > 0 ? (sodioMg / 1000) * 2.5 : 0);

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

    const categoriaTags = Array.isArray(prod.categories_tags)
      ? (prod.categories_tags as string[])
      : [];

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

    const additivesTags = Array.isArray(prod.additives_tags)
      ? (prod.additives_tags as string[])
      : [];

    const aditivosAnalizados = additivesTags.map((t) => clasificarAditivo(t));

    const novaRaw = Number(prod.nova_group);
    const novaGroup = (novaRaw >= 1 && novaRaw <= 4 ? novaRaw : undefined) as
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

    const nombre =
      String(prod.product_name_es || prod.product_name || 'Producto sin nombre').trim();
    const marca = String(prod.brands || '').trim();

    const puntaje = calcularPuntajeSalud({
      nutrientes,
      novaGroup,
      aditivosAnalizados,
      categoriaTags,
      esLiquido,
      ingredientesTexto: String(prod.ingredients_text_es || prod.ingredients_text || ''),
    });

    const productoFinal: ProductoEscaneado = {
      codigoBarras: codigoLimpio,
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
    };

    return { exito: true, producto: productoFinal };
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === 'AbortError') {
      return {
        exito: false,
        mensaje: 'La consulta tardó más de 3.5 segundos. Verifica tu conexión a internet o reintenta.',
      };
    }
    return {
      exito: false,
      mensaje: 'Sin conexión con el servidor de Open Food Facts. Puedes ingresar los datos manualmente.',
    };
  }
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
