import { clasificarAditivo } from './aditivos';
import { calcularPuntajeSalud } from './puntaje';
import type { NutrientesPor100, ProductoEscaneado } from './tipos';

/**
 * Parser heurístico y robusto de tablas nutricionales e ingredientes.
 * Extrae valores numéricos por 100g/ml a partir del texto OCR de la etiqueta.
 */
export function extraerNutrientesDeTexto(texto: string): Partial<NutrientesPor100> {
  const t = texto.toLowerCase();

  const extraerNumero = (regex: RegExp): number | undefined => {
    const match = t.match(regex);
    if (match && match[1]) {
      const num = parseFloat(match[1].replace(',', '.'));
      return isNaN(num) ? undefined : num;
    }
    return undefined;
  };

  // Calorías (kcal)
  const caloriasKcal =
    extraerNumero(/(?:valor energ[eé]tico|calor[ií]as?|energ[ií]a)[^\d]*(\d+(?:[\.,]\d+)?)\s*kcal/) ||
    extraerNumero(/(\d+(?:[\.,]\d+)?)\s*kcal/);

  // Azúcares
  const azucaresG =
    extraerNumero(/az[uú]cares?(?:\s+totales)?[:\s]*(\d+(?:[\.,]\d+)?)\s*g/) ||
    extraerNumero(/de los cuales az[uú]cares[:\s]*(\d+(?:[\.,]\d+)?)\s*g/);

  // Grasas Totales
  const grasasTotalesG =
    extraerNumero(/grasas?(?:\s+totales)?[:\s]*(\d+(?:[\.,]\d+)?)\s*g/) ||
    extraerNumero(/l[ií]pidos?(?:\s+totales)?[:\s]*(\d+(?:[\.,]\d+)?)\s*g/);

  // Grasas Saturadas
  const grasasSaturadasG =
    extraerNumero(/grasas?\s+saturadas?[:\s]*(\d+(?:[\.,]\d+)?)\s*g/) ||
    extraerNumero(/de las cuales saturadas[:\s]*(\d+(?:[\.,]\d+)?)\s*g/);

  // Sodio (mg o g)
  let sodioMg = extraerNumero(/sodio[:\s]*(\d+(?:[\.,]\d+)?)\s*mg/);
  if (sodioMg === undefined) {
    const sodioG = extraerNumero(/sodio[:\s]*(\d+(?:[\.,]\d+)?)\s*g/);
    if (sodioG !== undefined) {
      sodioMg = Math.round(sodioG * 1000);
    }
  }
  if (sodioMg === undefined) {
    const salG = extraerNumero(/sal[:\s]*(\d+(?:[\.,]\d+)?)\s*g/);
    if (salG !== undefined) {
      sodioMg = Math.round((salG / 2.5) * 1000);
    }
  }

  // Fibra
  const fibraG =
    extraerNumero(/fibra(?:\s+alimentaria|\s+diet[eé]tica)?[:\s]*(\d+(?:[\.,]\d+)?)\s*g/);

  // Proteínas
  const proteinasG = extraerNumero(/prote[ií]nas?[:\s]*(\d+(?:[\.,]\d+)?)\s*g/);

  return {
    caloriasKcal: caloriasKcal || 0,
    azucaresG: azucaresG || 0,
    grasasTotalesG: grasasTotalesG || 0,
    grasasSaturadasG: grasasSaturadasG || 0,
    sodioMg: sodioMg || 0,
    fibraG: fibraG || 0,
    proteinasG: proteinasG || 0,
  };
}

/**
 * Extrae códigos INS o números E a partir de una lista de ingredientes en texto.
 */
export function extraerAditivosDeIngredientes(textoIngredientes: string): string[] {
  const codigosEncontrados = new Set<string>();
  const t = textoIngredientes.toLowerCase();

  // Patrón INS: "ins 102", "ins102", "ins 330"
  const regexIns = /ins\s*(\d{3,4}[a-z]?)/gi;
  let matchIns: RegExpExecArray | null;
  while ((matchIns = regexIns.exec(t)) !== null) {
    codigosEncontrados.add(`e${matchIns[1]}`);
  }

  // Patrón E: "e-102", "e330", "e 621"
  const regexE = /\be[-\s]?(\d{3,4}[a-z]?)\b/gi;
  let matchE: RegExpExecArray | null;
  while ((matchE = regexE.exec(t)) !== null) {
    codigosEncontrados.add(`e${matchE[1]}`);
  }

  // Nombres comunes directos
  if (t.includes('tartrazina')) codigosEncontrados.add('e102');
  if (t.includes('aspartamo')) codigosEncontrados.add('e951');
  if (t.includes('acesulfamo')) codigosEncontrados.add('e950');
  if (t.includes('sucralosa')) codigosEncontrados.add('e955');
  if (t.includes('glutamato')) codigosEncontrados.add('e621');
  if (t.includes('nitrito de sodio')) codigosEncontrados.add('e250');
  if (t.includes('benzoato de sodio')) codigosEncontrados.add('e211');
  if (t.includes('sorbato de potasio')) codigosEncontrados.add('e202');
  if (t.includes('acido citrico') || t.includes('ácido cítrico')) codigosEncontrados.add('e330');

  return Array.from(codigosEncontrados);
}

/**
 * Crea una ficha de producto escaneado a partir de los datos ingresados o detectados por OCR.
 */
export function crearProductoDesdeOcr(params: {
  nombre: string;
  marca?: string;
  codigoBarras?: string;
  nutrientes: NutrientesPor100;
  ingredientesTexto?: string;
  esLiquido?: boolean;
}): ProductoEscaneado {
  const { nombre, marca, codigoBarras, nutrientes, ingredientesTexto = '', esLiquido = false } = params;

  const codigosAditivos = extraerAditivosDeIngredientes(ingredientesTexto);
  const aditivosAnalizados = codigosAditivos.map((c) => clasificarAditivo(c));

  const puntaje = calcularPuntajeSalud({
    nutrientes,
    aditivosAnalizados,
    esLiquido,
    ingredientesTexto,
  });

  const codigoFinal =
    codigoBarras?.trim() || `manual_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  return {
    codigoBarras: codigoFinal,
    nombre: nombre.trim() || 'Producto evaluado por etiqueta',
    marca: marca?.trim() || undefined,
    categoria: esLiquido ? 'Bebida' : 'Alimento preparado',
    ingredientesTexto: ingredientesTexto.trim() || undefined,
    aditivos: aditivosAnalizados,
    nutrientes,
    esLiquido,
    puntaje,
    fuente: 'ocr_manual',
    fechaEscaneo: Date.now(),
  };
}
