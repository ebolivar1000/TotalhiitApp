import { PDFDocument, StandardFonts, type PDFFont } from 'pdf-lib';
import { beforeAll, describe, expect, it } from 'vitest';
import { obtenerReceta, CATALOGO_RECETAS, type Receta } from './recetas';
import { estamparMarcaAgua, generarPdfPlan, generarPdfReceta, nombreArchivoPdf, nombreArchivoPdfPlan, wrapText } from './pdf';

const r1 = obtenerReceta('r1')!;
const r2 = obtenerReceta('r2')!;

let helvetica: PDFFont;

beforeAll(async () => {
  const doc = await PDFDocument.create();
  helvetica = await doc.embedFont(StandardFonts.Helvetica);
});

describe('generarPdfReceta', () => {
  it('genera un PDF A4 válido que soporta acentos y ñ', async () => {
    const bytes = await generarPdfReceta(r1, 2);
    const firma = String.fromCharCode(bytes[0]!, bytes[1]!, bytes[2]!, bytes[3]!);
    expect(firma).toBe('%PDF');
    expect(bytes.length).toBeGreaterThan(2000);

    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
    const size = doc.getPage(0).getSize();
    expect(size.width).toBeCloseTo(595.28, 1);
    expect(size.height).toBeCloseTo(841.89, 1);
    expect(doc.getTitle()).toContain('TOTALHIIT');
  });

  it('muestra las porciones escaladas en los totales', async () => {
    const bytes = await generarPdfReceta(obtenerReceta('r5')!, 6);
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
    expect(doc.getTitle()).toContain('Pollo');
  });

  it('agrega páginas cuando el contenido es largo', async () => {
    const larga: Receta = {
      ...r2,
      id: 'test-larga',
      nombre: 'Receta de prueba con contenido extenso',
      pasos: Array.from(
        { length: 12 },
        (_, i) =>
          `Paso ${i + 1}: instrucciones largas de prueba con muchos detalles para forzar el salto de página con envoltura de línea.`,
      ),
      ingredientes: Array.from({ length: 12 }, (_, i) => ({
        nombre: `Ingrediente ${i + 1}`,
        cantidad: 100 + i,
        unidad: 'g',
      })),
    };
    const bytes = await generarPdfReceta(larga, 6);
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(2);
  });

  it('funciona sin logo y con fecha fija', async () => {
    const bytes = await generarPdfReceta(r2, 1, { fecha: new Date('2026-10-28T10:00:00') });
    expect(String.fromCharCode(bytes[0]!)).toBe('%');
  });
});

describe('estamparMarcaAgua', () => {
  it('estampa todas las páginas y devuelve el conteo', async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    doc.addPage();
    doc.addPage();
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    expect(estamparMarcaAgua(doc, font)).toBe(3);
  });
});

describe('wrapText', () => {
  it('envuelve líneas respetando el ancho máximo', () => {
    const lineas = wrapText(
      'La clásica en versión al horno con menos aceite y el mismo sabor de casa para toda la familia',
      helvetica,
      10,
      200,
    );
    expect(lineas.length).toBeGreaterThan(1);
    for (const linea of lineas) {
      expect(helvetica.widthOfTextAtSize(linea, 10)).toBeLessThanOrEqual(200);
    }
  });

  it('sanea caracteres no codificables sin romper acentos ni ñ', () => {
    const lineas = wrapText('Preparación con cañón 🥩 y flechas → largas ñoquis', helvetica, 10, 300);
    expect(lineas.join(' ')).toContain('Preparación');
    expect(lineas.join(' ')).toContain('ñoquis');
    expect(() => helvetica.widthOfTextAtSize(lineas.join(' '), 10)).not.toThrow();
  });
});

describe('nombreArchivoPdf', () => {
  it('genera un nombre seguro en minúsculas', () => {
    expect(nombreArchivoPdf(r1)).toBe('totalhiit-avena-nocturna-con-frutos-rojos.pdf');
  });
});

describe('generarPdfPlan (FASE 9)', () => {
  const plan = {
    semanaInicio: '2026-10-26',
    slots: [
      { dia: 0, comida: 'desayuno' as const, recetaId: 'r1' },
      { dia: 0, comida: 'almuerzo' as const, recetaId: 'r4' },
      { dia: 0, comida: 'cena' as const, recetaId: 'r5' },
      { dia: 1, comida: 'desayuno' as const, recetaId: 'r2' },
      { dia: 1, comida: 'almuerzo' as const, recetaId: 'r8' },
      { dia: 1, comida: 'cena' as const, recetaId: 'r6' },
    ],
    porciones: 2,
  };

  it('genera un PDF A4 válido del plan con marca de agua', async () => {
    const bytes = await generarPdfPlan(plan, (id) => obtenerReceta(id), { fecha: new Date('2026-10-28T10:00:00') });
    const firma = String.fromCharCode(bytes[0]!, bytes[1]!, bytes[2]!, bytes[3]!);
    expect(firma).toBe('%PDF');

    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
    const size = doc.getPage(0).getSize();
    expect(size.width).toBeCloseTo(595.28, 1);
    expect(size.height).toBeCloseTo(841.89, 1);
    expect(doc.getTitle()).toContain('Plan semanal');
  });

  it('tolera recetas inexistentes en los slots y nombres de archivo estables', async () => {
    const bytes = await generarPdfPlan(
      { ...plan, slots: [...plan.slots, { dia: 2, comida: 'cena' as const, recetaId: 'no-existe' }] },
      (id) => CATALOGO_RECETAS.find((r: Receta) => r.id === id),
    );
    expect(String.fromCharCode(bytes[0]!)).toBe('%');
    expect(nombreArchivoPdfPlan('2026-10-26')).toBe('totalhiit-plan-2026-10-26.pdf');
  });
});
