/**
 * Servicio de Visión por Inteligencia Artificial para el Escáner de TOTALHIIT.
 * Analiza fotografías de tablas nutricionales y listas de ingredientes utilizando
 * Google Gemini Flash (Multimodal).
 *
 * Características clave:
 * - Capa Gratuita: Google Gemini Free Tier ofrece hasta 1.500 consultas diarias gratis.
 * - Seguridad de facturación: Si se alcanza la cuota máxima (HTTP 429), se detiene
 *   de inmediato informando a la usuaria sin generar ningún cobro automático imprevisto.
 * - Compresión en cliente: Reduce fotos de 5-10 MB a ~100-150 KB antes del envío.
 * - Enfoque Trash Panda + TOTAL+40: Traduce términos químicos a lenguaje cotidiano.
 */

import { clasificarAditivo } from './aditivos';
import { extraerAditivosDeIngredientes } from './ocr';
import { detectarPaisPorCodigo, resolverInfoPais } from './paises';
import { calcularPuntajeSalud } from './puntaje';
import type { NutrientesPor100, ProductoEscaneado } from './tipos';

export interface RespuestaGeminiNutricion {
  nombre: string;
  marca?: string;
  categoria?: string;
  esLiquido?: boolean;
  nutrientes: {
    caloriasKcal: number;
    azucaresG: number;
    grasasTotalesG: number;
    grasasSaturadasG: number;
    sodioMg: number;
    fibraG?: number;
    proteinasG?: number;
  };
  ingredientesTexto?: string;
  explicacionSimple: string;
  alertaAlergenos?: string[];
  nivelProcesamientoNova?: 1 | 2 | 3 | 4;
}

export type TipoErrorIa =
  | 'SIN_API_KEY'
  | 'CUOTA_EXCEDIDA'
  | 'ERROR_RED'
  | 'FORMATO_INVALIDO'
  | 'FOTO_ILEGIBLE';

export interface ResultadoAnalisisIa {
  ok: boolean;
  producto?: ProductoEscaneado;
  explicacionSimple?: string;
  errorTipo?: TipoErrorIa;
  mensaje?: string;
}

const STORAGE_KEY_GEMINI = 'totalhiit_gemini_api_key';

/**
 * Obtiene la API key configurada (desde localStorage o variable de entorno de Vite).
 */
export function obtenerApiKeyGemini(): string {
  if (typeof localStorage !== 'undefined') {
    const guardada = localStorage.getItem(STORAGE_KEY_GEMINI);
    if (guardada?.trim()) return guardada.trim();
  }
  const envKey = (import.meta as unknown as { env?: { VITE_GEMINI_API_KEY?: string } }).env?.VITE_GEMINI_API_KEY;
  return envKey?.trim() || '';
}

/**
 * Guarda o actualiza la API key de Gemini en el almacenamiento local.
 */
export function guardarApiKeyGemini(key: string): void {
  if (typeof localStorage !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY_GEMINI, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_GEMINI);
    }
  }
}

/**
 * Comprime y redimensiona una imagen en el navegador para optimizar el envío por red.
 */
export async function comprimirImagen(
  archivo: File | Blob,
  maxDimension = 1024,
  calidad = 0.8,
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    // Si estamos en entorno Node (ej: pruebas unitarias sin DOM Image)
    if (typeof window === 'undefined' || typeof Image === 'undefined') {
      const reader = new FileReader();
      reader.onloadend = () => {
        const raw = reader.result as string;
        const [header, data] = raw.split(',');
        const mime = header?.match(/:(.*?);/)?.[1] || 'image/jpeg';
        resolve({ base64: data || '', mimeType: mime });
      };
      reader.onerror = reject;
      reader.readAsDataURL(archivo);
      return;
    }

    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No se pudo inicializar el lienzo para comprimir la imagen'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', calidad);
      const base64 = dataUrl.split(',')[1] || '';
      resolve({ base64, mimeType: 'image/jpeg' });
    };
    img.onerror = () => reject(new Error('No se pudo cargar la imagen para su procesamiento'));

    const objectUrl = URL.createObjectURL(archivo);
    img.src = objectUrl;
  });
}

const PROMPT_NUTRICION_IA = `Actúa como una experta en nutrición antiinflamatoria para mujeres mayores de 40 años (estilo TOTALHIIT y Coach Valentina).
Analiza esta imagen que contiene una etiqueta de alimento (tabla nutricional y/o lista de ingredientes).

Debes responder ÚNICAMENTE con un objeto JSON válido (sin formato Markdown adicional, sin backticks ni explicaciones externas) con la siguiente estructura:
{
  "nombre": "Nombre del producto inferido",
  "marca": "Marca del producto o Desconocida",
  "categoria": "Categoría (ej: Galletitas, Bebida, Aceite, Lácteo, Panificados, Snack, Conserva)",
  "esLiquido": false,
  "nutrientes": {
    "caloriasKcal": 250,
    "azucaresG": 12.5,
    "grasasTotalesG": 8.0,
    "grasasSaturadasG": 3.2,
    "sodioMg": 150,
    "fibraG": 2.0,
    "proteinasG": 4.5
  },
  "ingredientesTexto": "Texto completo o aproximado de ingredientes que logres leer",
  "explicacionSimple": "Traducción empática, directa y sin jerga técnica para una mujer de más de 40 años. Explica en 2 a 3 oraciones qué se va a comer realmente, usando metáforas cotidianas (ej: equivale a 3 cucharaditas de azúcar o media cucharadita de sal) y si conviene consumirlo a diario o con moderación para desinflamar.",
  "alertaAlergenos": ["gluten", "lactosa", "soja"],
  "nivelProcesamientoNova": 4
}

Reglas obligatorias:
1. Si un nutriente no figura visible, estima su valor razonable para la categoría (nunca dejes aceite con 0g de grasa).
2. Los valores de 'nutrientes' deben ser SIEMPRE por cada 100 gramos o 100 ml.
3. Si la imagen NO es de un alimento o es totalmente ilegible, devuelve: {"error": "FOTO_ILEGIBLE"}
`;

/**
 * Envía la imagen codificada a Google Gemini 1.5 Flash para extraer nutrientes y explicación cotidiana.
 */
export async function analizarFotoConIa(opciones: {
  imagenBase64: string;
  mimeType?: string;
  apiKey?: string;
  paisNormativa?: string;
}): Promise<ResultadoAnalisisIa> {
  const apiKey = opciones.apiKey || obtenerApiKeyGemini();

  if (!apiKey) {
    return {
      ok: false,
      errorTipo: 'SIN_API_KEY',
      mensaje:
        'Se requiere una API Key de Google Gemini. Puedes obtener una gratis (hasta 1.500 fotos/día) en Google AI Studio e ingresarla en los Ajustes del Escáner.',
    };
  }

  const mime = opciones.mimeType || 'image/jpeg';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const cuerpoPeticion = {
      contents: [
        {
          parts: [
            { text: PROMPT_NUTRICION_IA },
            {
              inlineData: {
                mimeType: mime,
                data: opciones.imagenBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    };

    const respuesta = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cuerpoPeticion),
    });

    // Control de límite y cobro (Regla solicitada: Jamás cobrar sin aviso explícito)
    if (respuesta.status === 429) {
      return {
        ok: false,
        errorTipo: 'CUOTA_EXCEDIDA',
        mensaje:
          'Has alcanzado el límite gratuito de Google Gemini (1.500 consultas por día). La cuenta gratuita NO genera cobros automáticos imprevistos; el servicio se reanudará cuando se reinicie la cuota diaria.',
      };
    }

    if (!respuesta.ok) {
      const errorData = await respuesta.text().catch(() => '');
      return {
        ok: false,
        errorTipo: 'ERROR_RED',
        mensaje: `Error en el servicio de IA (${respuesta.status}): ${errorData.slice(0, 150) || 'Intente nuevamente más tarde.'}`,
      };
    }

    const dataJson = await respuesta.json();
    const textoRespuesta =
      dataJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (!textoRespuesta) {
      return {
        ok: false,
        errorTipo: 'FOTO_ILEGIBLE',
        mensaje: 'La IA no pudo extraer información clara de la imagen. Asegúrate de enfocar con buena luz.',
      };
    }

    let parsed: (RespuestaGeminiNutricion & { error?: string }) | null = null;
    try {
      parsed = JSON.parse(textoRespuesta);
    } catch {
      // Limpieza en caso de que incluya formato de bloque
      const cleaned = textoRespuesta.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    if (!parsed || parsed.error === 'FOTO_ILEGIBLE') {
      return {
        ok: false,
        errorTipo: 'FOTO_ILEGIBLE',
        mensaje:
          'No se detectó una tabla nutricional o lista de ingredientes legible. Intenta tomar la foto más cerca y sin reflejos.',
      };
    }

    // Normalizar nutrientes extraídos
    const nutrientesNorm: NutrientesPor100 = {
      caloriasKcal: Number(parsed.nutrientes?.caloriasKcal) || 0,
      azucaresG: Number(parsed.nutrientes?.azucaresG) || 0,
      grasasTotalesG: Number(parsed.nutrientes?.grasasTotalesG) || 0,
      grasasSaturadasG: Number(parsed.nutrientes?.grasasSaturadasG) || 0,
      sodioMg: Number(parsed.nutrientes?.sodioMg) || 0,
      fibraG: Number(parsed.nutrientes?.fibraG) || 0,
      proteinasG: Number(parsed.nutrientes?.proteinasG) || 0,
    };

    // Analizar aditivos presentes en el texto
    const codigosAditivos = extraerAditivosDeIngredientes(parsed.ingredientesTexto || '');
    const aditivosAnalizados = codigosAditivos.map((c) => clasificarAditivo(c));

    // Código generado para identificación local
    const codigoGenerado = `IA_${Date.now()}`;
    const paisNormativa = opciones.paisNormativa || 'auto';
    const paisInfo = paisNormativa !== 'auto'
      ? resolverInfoPais(paisNormativa)
      : detectarPaisPorCodigo(codigoGenerado);

    // Calcular nota de salud, octógonos y semáforos con el motor oficial de TOTALHIIT
    const puntaje = calcularPuntajeSalud({
      nutrientes: nutrientesNorm,
      aditivosAnalizados,
      esLiquido: Boolean(parsed.esLiquido),
      novaGroup: parsed.nivelProcesamientoNova || 4,
      ingredientesTexto: parsed.ingredientesTexto || '',
      codigoBarras: codigoGenerado,
      paisPreferido: paisNormativa,
    });

    const producto: ProductoEscaneado = {
      codigoBarras: codigoGenerado,
      nombre: parsed.nombre || 'Producto analizado con IA',
      marca: parsed.marca || 'Marca en etiqueta',
      categoria: parsed.categoria || 'Alimentos',
      esLiquido: Boolean(parsed.esLiquido),
      nutrientes: nutrientesNorm,
      ingredientesTexto: parsed.ingredientesTexto || '',
      alergenos: parsed.alertaAlergenos || [],
      aditivos: aditivosAnalizados,
      novaGroup: parsed.nivelProcesamientoNova || 4,
      puntaje,
      fuente: 'ia_vision',
      fechaEscaneo: Date.now(),
      explicacionIa: parsed.explicacionSimple,
      iaVisionMetadata: {
        modelo: 'gemini-1.5-flash',
        fecha: Date.now(),
      },
      paisOrigen: {
        codigo: paisInfo.codigo,
        nombre: paisInfo.nombre,
        bandera: paisInfo.bandera,
      },
    };

    return {
      ok: true,
      producto,
      explicacionSimple: parsed.explicacionSimple,
    };
  } catch (error) {
    return {
      ok: false,
      errorTipo: 'ERROR_RED',
      mensaje: error instanceof Error ? error.message : 'Error inesperado al conectar con el servicio de IA.',
    };
  }
}
