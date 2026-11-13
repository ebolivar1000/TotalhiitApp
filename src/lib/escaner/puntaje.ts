import { analizarListaAditivos } from './aditivos';
import { calcularOctogonosArgentina } from './octogonos';
import type {
  AditivoAnalizado,
  EquivalenciaCotidiana,
  MotivoPuntaje,
  NivelPuntaje,
  NutrientesPor100,
  PuntajeSalud,
} from './tipos';

export interface ParametrosPuntaje {
  nutrientes: NutrientesPor100;
  novaGroup?: 1 | 2 | 3 | 4;
  aditivosCodigos?: string[];
  aditivosAnalizados?: AditivoAnalizado[];
  categoriaTags?: string[];
  esLiquido?: boolean;
  ingredientesTexto?: string;
  codigoBarras?: string;
  paisPreferido?: string;
}

export function calcularPuntajeSalud(params: ParametrosPuntaje): PuntajeSalud {
  const { nutrientes, esLiquido = false } = params;
  const azucares = Math.max(0, nutrientes.azucaresG || 0);
  const grasasTot = Math.max(0, nutrientes.grasasTotalesG || 0);
  const grasasSat = Math.max(0, nutrientes.grasasSaturadasG || 0);
  const sodio = Math.max(0, nutrientes.sodioMg || 0);
  const calorias = Math.max(0, nutrientes.caloriasKcal || 0);
  const fibra = Math.max(0, nutrientes.fibraG || 0);
  const proteinas = Math.max(0, nutrientes.proteinasG || 0);

  // Aditivos analizados
  const aditivos =
    params.aditivosAnalizados ||
    (params.aditivosCodigos ? analizarListaAditivos(params.aditivosCodigos) : []);

  // Caso especial: Aceites vegetales puros y rocíos (oliva, girasol, maíz, etc.)
  const esAceitePuro =
    grasasTot >= 85 &&
    ((params.categoriaTags || []).some(
      (c) =>
        c.includes('oil') ||
        c.includes('aceite') ||
        c.includes('cooking-spray') ||
        c.includes('fats'),
    ) ||
      (params.ingredientesTexto || '').toLowerCase().includes('aceite'));

  // Octógonos y sellos de advertencia según la normativa del país o modelo OPS/OMS
  const { octogonos, leyendas, paisInfo } = calcularOctogonosArgentina(nutrientes, {
    esLiquido,
    aditivosCodigos: params.aditivosCodigos,
    ingredientesTexto: params.ingredientesTexto,
    esExceptuadoPorLey: esAceitePuro,
    codigoBarras: params.codigoBarras,
    paisPreferido: params.paisPreferido,
  });

  // ─── 1. COMPONENTE NUTRICIONAL (0 a 60 pts) ────────────────
  let puntosNutricionales = 40;

  if (esLiquido) {
    // Tratamiento específico para BEBIDAS (Líquidos):
    // El azúcar líquido se absorbe instantáneamente y no aporta saciedad
    if (azucares <= 0.5) {
      puntosNutricionales += 10; // Agua, infusiones sin azúcar
    } else if (azucares <= 2.5) {
      puntosNutricionales += 2;
    } else {
      // Fuertemente penalizado: gaseosas, jugos con azúcar añadido
      const exceso = azucares - 2.5;
      const deduccion = Math.min(35, exceso * 3.2);
      puntosNutricionales -= deduccion;
    }

    if (calorias > 25 && fibra < 1) {
      puntosNutricionales -= Math.min(12, ((calorias - 25) / 10) * 2);
    }

    // En bebidas no se premia por baja grasa ni bajo sodio a menos que aporte proteína real (ej. leche vegetal)
    if (proteinas >= 3) {
      puntosNutricionales += Math.min(8, proteinas * 1.5);
    }
  } else {
    // Tratamiento para ALIMENTOS SÓLIDOS:

    // Azúcares en sólidos (máx -22)
    if (azucares <= 2) {
      puntosNutricionales += 6;
    } else if (azucares <= 5) {
      puntosNutricionales += 2;
    } else {
      const exceso = azucares - 5;
      const deduccion = Math.min(24, exceso * 1.1);
      puntosNutricionales -= deduccion;
    }

    // Grasas Saturadas (máx -20)
    if (grasasSat <= 1.2) {
      puntosNutricionales += 4;
    } else if (grasasSat > 3) {
      const exceso = grasasSat - 3;
      const deduccion = Math.min(22, exceso * 2.0);
      puntosNutricionales -= deduccion;
    }

    // Sodio (máx -20)
    if (sodio <= 90) {
      puntosNutricionales += 4;
    } else if (sodio > 300) {
      const excesoCientos = (sodio - 300) / 100;
      const deduccion = Math.min(22, excesoCientos * 2.8);
      puntosNutricionales -= deduccion;
    }

    // Calorías excesivas en sólidos (> 350 kcal sin fibra)
    if (calorias > 350 && fibra < 3) {
      const factorExceso = (calorias - 350) / 35;
      puntosNutricionales -= Math.min(14, factorExceso * 2.2);
    }

    // Bonificación por Fibra (hasta +8)
    if (fibra >= 6) {
      puntosNutricionales += 8;
    } else if (fibra >= 3) {
      puntosNutricionales += 5;
    } else if (fibra >= 1.5) {
      puntosNutricionales += 2;
    }

    // Bonificación por Proteínas (hasta +8)
    if (proteinas >= 12) {
      puntosNutricionales += 8;
    } else if (proteinas >= 6) {
      puntosNutricionales += 5;
    } else if (proteinas >= 3) {
      puntosNutricionales += 2;
    }
  }

  if (esAceitePuro) {
    // Los aceites de calidad y rocíos son cardiosaludables (grasas insaturadas)
    puntosNutricionales = 48;
  }

  puntosNutricionales = Math.max(0, Math.min(60, Math.round(puntosNutricionales)));

  // ─── 2. COMPONENTE DE PROCESAMIENTO NOVA (0 a 25 pts) ──────
  let nova = params.novaGroup;
  if (!nova) {
    // Estimación empírica si no está reportado en Open Food Facts
    const cantAditivosEvitar = aditivos.filter((a) => a.nivelRiesgo === 'evitar').length;
    if (cantAditivosEvitar > 0 || aditivos.length >= 4) {
      nova = 4;
    } else if (aditivos.length >= 1) {
      nova = 3;
    } else if (grasasTot > 80 || azucares > 90) {
      nova = 2; // aceite, azúcar, manteca
    } else {
      nova = 1;
    }
  }

  let puntosNova = 0;
  switch (nova) {
    case 1:
      puntosNova = 25; // Alimento natural / mínimamente procesado
      break;
    case 2:
      puntosNova = 20; // Ingrediente culinario procesado (aceite, sal)
      break;
    case 3:
      puntosNova = 12; // Alimento procesado tradicional
      break;
    case 4:
    default:
      puntosNova = 0; // Alimento ultraprocesado industrial
      break;
  }

  // ─── 3. COMPONENTE DE ADITIVOS (0 a 15 pts) ────────────────
  let puntosAditivos = 15;
  const cantEvitar = aditivos.filter((a) => a.nivelRiesgo === 'evitar').length;
  const cantPrecaucion = aditivos.filter((a) => a.nivelRiesgo === 'precaucion').length;

  puntosAditivos -= cantEvitar * 8;
  puntosAditivos -= cantPrecaucion * 3;
  puntosAditivos = Math.max(0, Math.min(15, puntosAditivos));

  // ─── TOTAL Y NIVEL ─────────────────────────────────────────
  const puntosTotales = Math.max(
    0,
    Math.min(100, Math.round(puntosNutricionales + puntosNova + puntosAditivos)),
  );

  let nivel: NivelPuntaje = 'malo';
  let fraseResumen = '';
  let colorClase = '';
  let colorHex = '';

  if (puntosTotales >= 75) {
    nivel = 'excelente';
    fraseResumen = 'Excelente opción para tu día a día';
    colorClase = 'text-emerald-700 bg-emerald-50 border-emerald-500';
    colorHex = '#10b981';
  } else if (puntosTotales >= 50) {
    nivel = 'bueno';
    fraseResumen = 'Buena opción para consumo regular';
    colorClase = 'text-lime-700 bg-lime-50 border-lime-500';
    colorHex = '#84cc16';
  } else if (puntosTotales >= 25) {
    nivel = 'mediocre';
    fraseResumen = 'Consumo ocasional o con moderación';
    colorClase = 'text-amber-700 bg-amber-50 border-amber-500';
    colorHex = '#f59e0b';
  } else {
    nivel = 'malo';
    fraseResumen = 'Limitar o buscar alternativas más naturales';
    colorClase = 'text-red-700 bg-red-50 border-red-500';
    colorHex = '#ef4444';
  }

  // ─── EQUIVALENCIAS COTIDIANAS ──────────────────────────────
  const cucharaditasAzucar = Math.round((azucares / 4) * 10) / 10;
  const gramosSal = Math.round(((sodio / 1000) * 2.5) * 10) / 10;

  const equivalencias: EquivalenciaCotidiana = {
    cucharaditasAzucar,
    gramosSal,
    fraseEquivalenciaAzucar:
      azucares > 1
        ? `Aporta el equivalente a ~${cucharaditasAzucar} cucharadita${cucharaditasAzucar === 1 ? '' : 's'} de azúcar por 100g.`
        : 'Prácticamente sin azúcar añadida.',
    fraseEquivalenciaSal:
      gramosSal >= 0.3
        ? `Contiene el equivalente a ~${gramosSal} g de sal por 100g.`
        : 'Muy bajo contenido en sal.',
  };

  // ─── GENERACIÓN DE MOTIVOS (3 A 5 RAZONES EN LENGUAJE SIMPLE)
  const motivos: MotivoPuntaje[] = [];

  // Motivo de Azúcares
  const umbralAzucarAlto = esLiquido ? 4 : 8;
  if (azucares >= umbralAzucarAlto) {
    motivos.push({
      tipo: 'negativo',
      icono: '🍬',
      titulo: 'Muy alto en azúcar',
      descripcion: `Tiene ${cucharaditasAzucar} cucharaditas de azúcar por cada 100${esLiquido ? 'ml' : 'g'}. Eleva rápidamente la glucosa.`,
    });
  } else if (azucares <= 2) {
    motivos.push({
      tipo: 'positivo',
      icono: '✨',
      titulo: 'Bajo en azúcar',
      descripcion: 'Excelente para mantener niveles de energía estables sin picos de insulina.',
    });
  }

  // Motivo de Procesamiento NOVA
  if (nova === 4) {
    motivos.push({
      tipo: 'negativo',
      icono: '🏭',
      titulo: 'Alimento ultraprocesado (NOVA 4)',
      descripcion: 'Elaborado con procesos y aditivos industriales. Desplaza alimentos frescos reales.',
    });
  } else if (nova === 1) {
    motivos.push({
      tipo: 'positivo',
      icono: '🌱',
      titulo: 'Alimento natural (NOVA 1)',
      descripcion: 'Ingredientes frescos o mínimamente procesados, conservando todos sus nutrientes vivos.',
    });
  }

  // Motivo de Grasas Saturadas
  if (grasasSat > 4) {
    motivos.push({
      tipo: 'negativo',
      icono: '🧈',
      titulo: 'Elevadas grasas saturadas',
      descripcion: `Aporta ${grasasSat.toFixed(1)}g de grasa saturada por 100g. Conviene no abusar.`,
    });
  } else if (grasasSat <= 1 && grasasTot > 0) {
    motivos.push({
      tipo: 'positivo',
      icono: '🥑',
      titulo: 'Grasas saludables',
      descripcion: 'Bajo en grasas saturadas perjudiciales.',
    });
  }

  // Motivo de Sal / Sodio
  if (sodio > 400) {
    motivos.push({
      tipo: 'negativo',
      icono: '🧂',
      titulo: 'Alto en sodio',
      descripcion: `Aporta ${gramosSal}g de sal por 100g. Personas con presión alta deben moderar su ingesta.`,
    });
  } else if (sodio <= 100) {
    motivos.push({
      tipo: 'positivo',
      icono: '💧',
      titulo: 'Bajo en sodio',
      descripcion: 'Amigable con el sistema cardiovascular y la retención de líquidos.',
    });
  }

  // Motivo de Fibra
  if (fibra >= 3) {
    motivos.push({
      tipo: 'positivo',
      icono: '🌾',
      titulo: 'Buena fuente de fibra',
      descripcion: `Aporta ${fibra.toFixed(1)}g de fibra por 100g, favoreciendo la saciedad y la salud digestiva.`,
    });
  }

  // Motivo de Proteínas
  if (proteinas >= 8) {
    motivos.push({
      tipo: 'positivo',
      icono: '💪',
      titulo: 'Rico en proteínas',
      descripcion: `Contiene ${proteinas.toFixed(1)}g de proteína por 100g, ideal para mantener masa muscular activa.`,
    });
  }

  // Motivo de Aditivos Críticos
  if (cantEvitar > 0) {
    motivos.push({
      tipo: 'negativo',
      icono: '⚠️',
      titulo: `${cantEvitar} aditivo${cantEvitar > 1 ? 's' : ''} a evitar`,
      descripcion: 'Incluye colorantes sintéticos, nitritos u otros aditivos de consumo desaconsejado.',
    });
  } else if (aditivos.length === 0) {
    motivos.push({
      tipo: 'positivo',
      icono: '🌿',
      titulo: 'Sin aditivos artificiales',
      descripcion: 'Fórmula 100% limpia sin conservantes ni colorantes sintéticos agregados.',
    });
  }

  // Asegurar entre 3 y 5 motivos seleccionados
  const motivosFiltrados = motivos.slice(0, 5);

  return {
    puntos: puntosTotales,
    nivel,
    colorClase,
    colorHex,
    fraseResumen,
    motivos: motivosFiltrados,
    desglose: {
      nutricional: puntosNutricionales,
      procesamientoNova: puntosNova,
      aditivos: puntosAditivos,
    },
    equivalencias,
    octogonos,
    leyendas,
    paisNormativa: {
      codigo: paisInfo.codigo,
      nombre: paisInfo.nombre,
      bandera: paisInfo.bandera,
      normativa: paisInfo.normativa,
      organismo: paisInfo.organismo,
    },
  };
}
