/**
 * FASE 6 — Generación de PDF A4 de recetas (pdf-lib).
 * Incluye: logo, título, meta, ingredientes escalados a las porciones,
 * preparación, tabla nutricional (por porción y totales), nota de valores
 * aproximados con fuentes, y MARCA DE AGUA TOTALHIIT semitransparente en
 * TODAS las páginas (reutilizable para el plan semanal de FASE 9).
 * Fuentes estándar (WinAnsi): se sanea el texto para acentos/ñ correctos.
 */

import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { Receta } from './recetas';
import { escalarReceta, formatearCantidad } from './motor';
import { ETIQUETAS_CATEGORIA_RECETA } from './recetas';

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

/** Estampa la marca de agua en todas las páginas. Devuelve cuántas estampó. */
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
    // Pie de página discreto + numeración
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
    espacio(34);
    page.drawText(sanitizar(titulo), { x: MARGEN, y: y - 12, size: 12, font: fontBold, color: MAGENTA });
    y -= 22;
  };

  // Encabezado con logo opcional
  let x = MARGEN;
  if (opciones.logoBytes) x += await incrustarLogo(doc, page, y, opciones.logoBytes);
  page.drawText('TOTALHIIT', { x, y: y - 15, size: 19, font: fontBold, color: MAGENTA });
  page.drawText('entrenamiento y nutrición +40', { x, y: y - 28, size: 8, font, color: TEXTO_SUAVE });
  y -= 46;

  // Título y meta
  escribir(receta.nombre, { size: 17, bold: true });
  y -= 2;
  const meta = `${ETIQUETAS_CATEGORIA_RECETA[receta.categoria]} · ${receta.tiempoMin} min · porciones escalables · ${fecha.toLocaleDateString('es-AR')}`;
  escribir(meta, { size: 9, color: TEXTO_SUAVE });
  y -= 6;
  escribir(receta.descripcion, { size: 9.5, color: TEXTO_SUAVE });
  y -= 6;

  // Ingredientes escalados
  const escalada = escalarReceta(receta, porciones);
  seccion(`Ingredientes (${porciones} ${porciones === 1 ? 'porción' : 'porciones'})`);
  for (const ing of escalada.ingredientes) {
    const cantidad = ing.cantidad === null ? 'a gusto' : `${formatearCantidad(ing.cantidad)} ${ing.unidad}`;
    escribir(`• ${ing.nombre} — ${cantidad}`, { size: 10, sangria: 4 });
  }
  y -= 4;

  // Preparación
  seccion('Preparación');
  receta.pasos.forEach((paso, indice) => {
    espacio(16);
    page.drawText(`${indice + 1}.`, { x: MARGEN, y: y - 10, size: 10, font: fontBold, color: MAGENTA });
    const lineas = wrapText(paso, font, 10, ANCHO - MARGEN * 2 - 18);
    for (const linea of lineas) {
      espacio(14);
      page.drawText(linea, { x: MARGEN + 18, y: y - 10, size: 10, font, color: TEXTO });
      y -= 14;
    }
    y -= 2;
  });
  if (receta.sustituciones) {
    escribir(`Sustituciones: ${receta.sustituciones}`, { size: 9, color: TEXTO_SUAVE });
    y -= 2;
  }
  if (receta.conservacion) {
    escribir(`Conservación: ${receta.conservacion}`, { size: 9, color: TEXTO_SUAVE });
    y -= 2;
  }

  // Tabla nutricional
  espacio(120);
  seccion('Información nutricional (valores aproximados)');
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
  const altoFila = 20;
  filas.forEach((fila, indiceFila) => {
    espacio(altoFila + 2);
    const yFila = y - altoFila;
    if (indiceFila === 0) {
      page.drawRectangle({ x: MARGEN, y: yFila, width: ANCHO - MARGEN * 2, height: altoFila, color: RELLENO_CLARO, borderColor: BORDE, borderWidth: 0.7 });
    } else {
      page.drawRectangle({ x: MARGEN, y: yFila, width: ANCHO - MARGEN * 2, height: altoFila, borderColor: BORDE, borderWidth: 0.7 });
    }
    page.drawRectangle({ x: MARGEN + colLabel - 0.35, y: yFila, width: 0.7, height: altoFila, color: BORDE });
    fila.forEach((celda, indiceCol) => {
      const cx = MARGEN + (indiceCol === 0 ? 6 : colLabel + (indiceCol - 1) * colW + 5);
      const fuente = indiceFila === 0 || indiceCol === 0 ? fontBold : font;
      page.drawText(celda, { x: cx, y: yFila + 6, size: 8.5, font: fuente, color: indiceFila === 0 ? TEXTO : TEXTO });
      y = yFila;
    });
  });
  y -= 18;

  // Notas legales y de fuentes
  escribir(
    'Los valores nutricionales son aproximados y fueron elaborados con tablas de composición de alimentos de dominio público (USDA FoodData Central).',
    { size: 8, color: TEXTO_SUAVE },
  );
  escribir(
    'Este material es orientativo y no reemplaza el consejo, diagnóstico o tratamiento de profesionales de la salud.',
    { size: 8, color: TEXTO_SUAVE },
  );
  escribir(`Generado el ${fecha.toLocaleDateString('es-AR')} por la app TOTALHIIT. Uso personal.`, {
    size: 8,
    color: TEXTO_SUAVE,
  });

  // Marca de agua + pie en TODAS las páginas
  estamparMarcaAgua(doc, fontBold);

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

/** Descarga el PDF en el navegador (Android WebView y Safari lo muestran/comparten). */
export function descargarPdf(bytes: Uint8Array, nombreArchivo: string): void {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
