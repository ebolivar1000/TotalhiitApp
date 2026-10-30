/**
 * FASE 6/9 — Generación de PDF A4 (pdf-lib).
 * - generarPdfReceta: receta individual (ingredientes escalados, pasos, tabla
 *   nutricional, notas de fuentes).
 * - generarPdfPlan (FASE 9): plan semanal de comidas día por día.
 * Ambos incluyen: logo opcional, y MARCA DE AGUA TOTALHIIT semitransparente en
 * TODAS las páginas + pie con numeración (reutilizable en FASE 10+).
 * Fuentes estándar (WinAnsi): se sanea el texto para acentos/ñ correctos.
 */

import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { SlotPlan } from '../datos/entidades';
import { sumarDias } from '../progreso/metricas';
import type { Receta } from './recetas';
import { escalarReceta, formatearCantidad } from './motor';
import { ETIQUETAS_CATEGORIA_RECETA } from './recetas';
import { DIAS_SEMANA, ETIQUETAS_COMIDA_PLAN } from './planificador';

const MAGENTA = rgb(0.69, 0, 0.314);
const TEXTO = rgb(0.24, 0.24, 0.27);
const TEXTO_SUAVE = rgb(0.45, 0.45, 0.48);
const RELLENO_CLARO = rgb(0.958, 0.958, 0.961);
const BORDE = rgb(0.87, 0.87, 0.89);

const ANCHO = 595.28;
const ALTO = 841.89;
const MARGEN = 46;

export interface OpcionesPdf {
  logoBytes?: Uint8Array;
  fecha?: Date;
}

/** Quita o sustituye caracteres que WinAnsi no puede codificar (emojis, flechas…). */
function sanitizar(t: string): string {
  return t
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2013|\u2014/g, '-')
    .replace(/[^\u0000-\u00FF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function wrapText(texto: string, font: PDFFont, size: number, anchoMaximo: number): string[] {
  const palabras = sanitizar(texto).split(/\s+/).filter(Boolean);
  const lineas: string[] = [];
  let actual = '';
  for (const palabra of palabras) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (font.widthOfTextAtSize(prueba, size) <= anchoMaximo) {
      actual = prueba;
    } else {
      if (actual) lineas.push(actual);
      actual = palabra;
    }
  }
  if (actual) lineas.push(actual);
  return lineas.length > 0 ? lineas : [''];
}

/** Estampa la marca de agua y el pie en todas las páginas. Devuelve cuántas estampó. */
export function estamparMarcaAgua(doc: PDFDocument, font: PDFFont): number {
  let estampadas = 0;
  const paginas = doc.getPages();
  paginas.forEach((page: PDFPage, indice: number) => {
    const { width, height } = page.getSize();
    const texto = 'TOTALHIIT';
    const tamano = 58;
    const anchoTexto = font.widthOfTextAtSize(texto, tamano);
    page.drawText(texto, {
      x: (width - anchoTexto) / 2 - 60,
      y: height / 2 - 70,
      size: tamano,
      font,
      color: MAGENTA,
      opacity: 0.08,
      rotate: degrees(45),
    });
    page.drawText('TOTALHIIT · entrenamiento y nutrición +40', {
      x: MARGEN,
      y: 26,
      size: 8,
      font,
      color: TEXTO_SUAVE,
      opacity: 0.7,
    });
    const numero = `${indice + 1} / ${paginas.length}`;
    page.drawText(numero, {
      x: width - MARGEN - font.widthOfTextAtSize(numero, 8),
      y: 26,
      size: 8,
      font,
      color: TEXTO_SUAVE,
    });
    estampadas++;
  });
  return estampadas;
}

/** Marco de página compartido: cursor de contenido, saltos y helpers de texto. */
async function crearMarco(doc: PDFDocument) {
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page = doc.addPage([ANCHO, ALTO]);
  let y = ALTO - MARGEN;

  const nueva = () => {
    page = doc.addPage([ANCHO, ALTO]);
    y = ALTO - MARGEN;
  };
  const espacio = (necesario: number) => {
    if (y - necesario < MARGEN + 40) nueva();
  };
  const escribir = (
    texto: string,
    opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; sangria?: number; interlineado?: number } = {},
  ) => {
    const { size = 10, bold = false, color = TEXTO, sangria = 0, interlineado = size * 1.4 } = opts;
    const fuente = bold ? fontBold : font;
    for (const linea of wrapText(texto, fuente, size, ANCHO - MARGEN * 2 - sangria)) {
      espacio(interlineado);
      page.drawText(linea, { x: MARGEN + sangria, y: y - size, size, font: fuente, color });
      y -= interlineado;
    }
  };
  const seccion = (titulo: string) => {
    espacio(38);
    page.drawText(sanitizar(titulo), { x: MARGEN, y: y - 14, size: 14, font: fontBold, color: MAGENTA });
    y -= 24;
  };
  const cabecera = async (subtitulo: string, logoBytes?: Uint8Array) => {
    let x = MARGEN;
    if (logoBytes) x += await incrustarLogo(doc, page, y, logoBytes);
    page.drawText('TOTALHIIT', { x, y: y - 17, size: 22, font: fontBold, color: MAGENTA });
    page.drawText('entrenamiento y nutrición +40', { x, y: y - 32, size: 10, font, color: TEXTO_SUAVE });
    y -= 52;
    escribir(subtitulo, { size: 11, color: TEXTO_SUAVE });
    y -= 6;
  };

  return {
    doc,
    font,
    fontBold,
    get page() {
      return page;
    },
    get y() {
      return y;
    },
    set y(valor: number) {
      y = valor;
    },
    nueva,
    espacio,
    escribir,
    seccion,
    cabecera,
  };
}

async function incrustarLogo(doc: PDFDocument, page: PDFPage, y: number, logoBytes: Uint8Array): Promise<number> {
  try {
    let imagen;
    try {
      imagen = await doc.embedPng(logoBytes);
    } catch {
      imagen = await doc.embedJpg(logoBytes);
    }
    const escala = Math.min(34 / imagen.height, 110 / imagen.width);
    const { width, height } = imagen.scale(escala);
    page.drawImage(imagen, { x: MARGEN, y: y - height, width, height });
    return width + 10;
  } catch {
    return 0;
  }
}

const fechaCorta = (iso: string) => iso.slice(5).split('-').reverse().join('/');

export async function generarPdfReceta(
  receta: Receta,
  porciones: number,
  opciones: OpcionesPdf = {},
): Promise<Uint8Array> {
  const fecha = opciones.fecha ?? new Date();
  const doc = await PDFDocument.create();
  doc.setTitle(sanitizar(`TOTALHIIT - ${receta.nombre}`));
  doc.setAuthor('TOTALHIIT');
  doc.setCreator('App TOTALHIIT');
  const marco = await crearMarco(doc);

  await marco.cabecera(
    `${ETIQUETAS_CATEGORIA_RECETA[receta.categoria]} · ${receta.tiempoMin} min · ${fecha.toLocaleDateString('es-AR')}`,
    opciones.logoBytes,
  );

  marco.escribir(receta.nombre, { size: 20, bold: true });
  marco.y -= 4;
  marco.escribir(receta.descripcion, { size: 11.5, color: TEXTO_SUAVE });
  marco.y -= 8;

  // Ingredientes escalados
  const escalada = escalarReceta(receta, porciones);
  marco.seccion(`Ingredientes (${porciones} ${porciones === 1 ? 'porción' : 'porciones'})`);
  for (const ing of escalada.ingredientes) {
    const cantidad = ing.cantidad === null ? 'a gusto' : `${formatearCantidad(ing.cantidad)} ${ing.unidad}`;
    marco.escribir(`• ${ing.nombre} — ${cantidad}`, { size: 11.5, sangria: 4 });
  }
  marco.y -= 6;

  // Preparación
  marco.seccion('Preparación');
  receta.pasos.forEach((paso, indice) => {
    marco.espacio(18);
    marco.page.drawText(`${indice + 1}.`, { x: MARGEN, y: marco.y - 12, size: 12, font: marco.fontBold, color: MAGENTA });
    const lineas = wrapText(paso, marco.font, 11.5, ANCHO - MARGEN * 2 - 22);
    for (const linea of lineas) {
      marco.espacio(16);
      marco.page.drawText(linea, { x: MARGEN + 22, y: marco.y - 12, size: 11.5, font: marco.font, color: TEXTO });
      marco.y -= 16;
    }
    marco.y -= 4;
  });
  if (receta.sustituciones) {
    marco.escribir(`Sustituciones: ${receta.sustituciones}`, { size: 11, color: TEXTO_SUAVE });
    marco.y -= 4;
  }
  if (receta.conservacion) {
    marco.escribir(`Conservación: ${receta.conservacion}`, { size: 11, color: TEXTO_SUAVE });
    marco.y -= 4;
  }

  // Tabla nutricional
  marco.espacio(130);
  marco.seccion('Información nutricional (valores aproximados)');
  const colLabel = 110;
  const colW = (ANCHO - MARGEN * 2 - colLabel) / 5;
  const filas = [
    ['', 'kcal', 'Prot (g)', 'Carb (g)', 'Grasas (g)', 'Fibra (g)'],
    [
      'Por porción',
      String(receta.macrosPorPorcion.kcal),
      String(receta.macrosPorPorcion.proteinaG),
      String(receta.macrosPorPorcion.carbohidratosG),
      String(receta.macrosPorPorcion.grasasG),
      String(receta.macrosPorPorcion.fibraG),
    ],
    [
      `Total (${porciones})`,
      String(escalada.macrosTotales.kcal),
      String(escalada.macrosTotales.proteinaG),
      String(escalada.macrosTotales.carbohidratosG),
      String(escalada.macrosTotales.grasasG),
      String(escalada.macrosTotales.fibraG),
    ],
  ];
  const altoFila = 24;
  filas.forEach((fila, indiceFila) => {
    marco.espacio(altoFila + 2);
    const yFila = marco.y - altoFila;
    if (indiceFila === 0) {
      marco.page.drawRectangle({ x: MARGEN, y: yFila, width: ANCHO - MARGEN * 2, height: altoFila, color: RELLENO_CLARO, borderColor: BORDE, borderWidth: 0.7 });
    } else {
      marco.page.drawRectangle({ x: MARGEN, y: yFila, width: ANCHO - MARGEN * 2, height: altoFila, borderColor: BORDE, borderWidth: 0.7 });
    }
    marco.page.drawRectangle({ x: MARGEN + colLabel - 0.35, y: yFila, width: 0.7, height: altoFila, color: BORDE });
    fila.forEach((celda, indiceCol) => {
      const cx = MARGEN + (indiceCol === 0 ? 6 : colLabel + (indiceCol - 1) * colW + 5);
      const fuente = indiceFila === 0 || indiceCol === 0 ? marco.fontBold : marco.font;
      marco.page.drawText(celda, { x: cx, y: yFila + 7, size: 10, font: fuente, color: TEXTO });
      marco.y = yFila;
    });
  });
  marco.y -= 20;

  // Notas legales y de fuentes
  marco.escribir(
    'Los valores nutricionales son aproximados y fueron elaborados con tablas de composición de alimentos de dominio público (USDA FoodData Central).',
    { size: 9.5, color: TEXTO_SUAVE },
  );
  marco.escribir(
    'Este material es orientativo y no reemplaza el consejo, diagnóstico o tratamiento de profesionales de la salud.',
    { size: 9.5, color: TEXTO_SUAVE },
  );
  marco.escribir(`Generado el ${fecha.toLocaleDateString('es-AR')} por la app TOTALHIIT. Uso personal.`, {
    size: 9.5,
    color: TEXTO_SUAVE,
  });

  estamparMarcaAgua(doc, marco.fontBold);
  return doc.save();
}

export interface DatosPlanPdf {
  semanaInicio: string;
  slots: SlotPlan[];
  porciones: number;
}

/** PDF del plan semanal (FASE 9): día por día con las comidas del plan. */
export async function generarPdfPlan(
  plan: DatosPlanPdf,
  resolver: (id: string) => Receta | undefined,
  opciones: OpcionesPdf = {},
): Promise<Uint8Array> {
  const fecha = opciones.fecha ?? new Date();
  const doc = await PDFDocument.create();
  doc.setTitle(sanitizar(`TOTALHIIT - Plan semanal ${plan.semanaInicio}`));
  doc.setAuthor('TOTALHIIT');
  doc.setCreator('App TOTALHIIT');
  const marco = await crearMarco(doc);

  await marco.cabecera(
    `Plan de comidas · ${fechaCorta(plan.semanaInicio)} al ${fechaCorta(sumarDias(plan.semanaInicio, 6))} · ${plan.porciones} ${plan.porciones === 1 ? 'porción' : 'porciones'} por receta`,
    opciones.logoBytes,
  );

  for (let dia = 0; dia < 7; dia++) {
    const delDia = plan.slots.filter((s) => s.dia === dia);
    if (delDia.length === 0) continue;
    marco.seccion(`${DIAS_SEMANA[dia]} · ${fechaCorta(sumarDias(plan.semanaInicio, dia))}`);
    for (const slot of delDia) {
      const receta = resolver(slot.recetaId);
      if (receta) {
        marco.escribir(
          `${ETIQUETAS_COMIDA_PLAN[slot.comida]}: ${receta.nombre} — ${receta.macrosPorPorcion.kcal} kcal/porción`,
          { size: 11.5, sangria: 4 },
        );
      } else {
        marco.escribir(`${ETIQUETAS_COMIDA_PLAN[slot.comida]}: (receta no disponible en el catálogo)`, {
          size: 11.5,
          sangria: 4,
          color: TEXTO_SUAVE,
        });
      }
    }
    marco.y -= 4;
  }

  marco.espacio(60);
  marco.escribir(
    'Los valores nutricionales de cada receta son aproximados (USDA FoodData Central, dominio público) y los totales de la semana dependen de las porciones que cocines.',
    { size: 9.5, color: TEXTO_SUAVE },
  );
  marco.escribir(
    'Este plan es orientativo y no reemplaza el consejo de profesionales de la salud. Puedes reemplazar cualquier comida desde la app.',
    { size: 9.5, color: TEXTO_SUAVE },
  );
  marco.escribir(`Generado el ${fecha.toLocaleDateString('es-AR')} por la app TOTALHIIT. Uso personal.`, {
    size: 9.5,
    color: TEXTO_SUAVE,
  });

  estamparMarcaAgua(doc, marco.fontBold);
  return doc.save();
}

export function nombreArchivoPdf(receta: Receta): string {
  const slug = receta.nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return `totalhiit-${slug}.pdf`;
}

export function nombreArchivoPdfPlan(semanaInicio: string): string {
  return `totalhiit-plan-${semanaInicio}.pdf`;
}

/** Carga el logo para incrustar en los PDF (si falla, se genera sin logo). */
export async function cargarLogoPdf(): Promise<Uint8Array | undefined> {
  try {
    const respuesta = await fetch('/images/logo.png');
    if (!respuesta.ok) return undefined;
    return new Uint8Array(await respuesta.arrayBuffer());
  } catch {
    return undefined;
  }
}

/**
 * Convierte un Blob a base64 de manera asíncrona usando FileReader sin saturar la memoria.
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = reader.result as string;
      const base64 = res.includes(',') ? res.split(',')[1]! : res;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Descarga, comparte o abre el PDF generado para imprimir según la plataforma:
 * 1. En Capacitor (APK Android nativo): Guarda en caché interna y abre el diálogo nativo de Android (Imprimir, Guardar en Descargas, Drive, etc.).
 * 2. En Navegador móvil (Web Share API): Abre la hoja de compartir del sistema con el archivo adjunto.
 * 3. En Navegador de escritorio / web: Abre en pestaña para previsualización/impresión inmediata y descarga el archivo .pdf.
 */
export async function descargarPdf(bytes: Uint8Array, nombreArchivo: string): Promise<boolean> {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });

  // 1. Si estamos en Capacitor nativo (Android APK)
  if (
    typeof window !== 'undefined' &&
    Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.())
  ) {
    try {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const { Share } = await import('@capacitor/share');

      const base64Data = await blobToBase64(blob);

      const resultado = await Filesystem.writeFile({
        path: nombreArchivo,
        data: base64Data,
        directory: Directory.Cache,
      });

      try {
        await Share.share({
          title: nombreArchivo,
          url: resultado.uri,
          dialogTitle: 'Guardar, Imprimir o Abrir PDF',
        });
      } catch (shareErr) {
        // El usuario simplemente cerró el menú de compartir de Android
        console.info('Diálogo de compartir cerrado:', shareErr);
      }
      return true;
    } catch (err) {
      console.warn('Error en Filesystem de Capacitor, recurriendo a web fallback:', err);
    }
  }

  // 2. Si el navegador soporta Web Share con archivos (Chrome Android, Safari iOS)
  if (typeof navigator !== 'undefined' && typeof navigator.canShare === 'function') {
    try {
      const archivo = new File([blob], nombreArchivo, { type: 'application/pdf' });
      if (navigator.canShare({ files: [archivo] })) {
        await navigator.share({
          files: [archivo],
          title: nombreArchivo,
          text: 'Documento PDF de TOTALHIIT',
        });
        return true;
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return true;
      console.warn('Web Share no disponible o cancelado:', error);
    }
  }

  // 3. Descarga web tradicional y apertura para impresión inmediata (Chrome, Firefox, Safari)
  try {
    const url = URL.createObjectURL(blob);

    // Intenta abrir el PDF en una pestaña para permitir imprimir con Ctrl+P o botón de imprimir del navegador
    const ventana = typeof window !== 'undefined' ? window.open(url, '_blank') : null;

    // Dispara la descarga del archivo al almacenamiento local
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.target = '_blank';
    enlace.rel = 'noopener noreferrer';
    document.body.appendChild(enlace);
    enlace.click();

    setTimeout(() => {
      enlace.remove();
      if (!ventana) {
        URL.revokeObjectURL(url);
      }
    }, 60000);
    return true;
  } catch (error) {
    console.error('Error al descargar PDF:', error);
    return false;
  }
}
