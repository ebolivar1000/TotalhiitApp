/**
 * Tipos e interfaces del módulo Escáner de Etiquetas de TOTALHIIT.
 */

export type NivelPuntaje = 'excelente' | 'bueno' | 'mediocre' | 'malo';

export type NivelRiesgoAditivo = 'sin_riesgo' | 'precaucion' | 'evitar';

export interface AditivoAnalizado {
  codigo: string; // ej: "E330", "E621", "INS 102"
  nombre: string;
  categoria: string; // "Conservante", "Colorante", "Edulcorante", "Emulsionante", etc.
  nivelRiesgo: NivelRiesgoAditivo;
  explicacion: string;
  consensoCientifico?: string;
}

export type TipoOctogono =
  | 'exceso_azucares'
  | 'exceso_grasas_totales'
  | 'exceso_grasas_saturadas'
  | 'exceso_sodio'
  | 'exceso_calorias';

export interface OctogonoArgentina {
  tipo: TipoOctogono;
  titulo: string; // ej: "EXCESO EN AZÚCARES" o "ALTO EN AZÚCARES"
  normativa: string; // ej: "Ley 27.642", "NOM-051", "Ley 20.606", "Res. 2492"
  activo: boolean;
  umbralSuperado: string; // ej: "18.5% kcal de azúcares libres (límite: 10%)"
  organismo?: string; // ej: "Secretaría de Salud", "Ministerio de Salud", "MinSalud", "OPS/OMS"
  paisCodigo?: string; // ej: "MX", "AR", "CO", "CL", "PE", "UY", "ES", "OPS"
}

export type OctogonoAdvertencia = OctogonoArgentina;

export interface LeyendaPrecautoria {
  tipo: 'edulcorantes' | 'cafeina';
  texto: string; // ej: "CONTIENE EDULCORANTES: NO RECOMENDABLE EN NIÑOS/AS"
  activa: boolean;
}

export interface NutrientesPor100 {
  caloriasKcal: number;
  azucaresG: number;
  grasasTotalesG: number;
  grasasSaturadasG: number;
  sodioMg: number;
  fibraG?: number;
  proteinasG?: number;
  salG?: number;
  porPorcion?: {
    tamanioPorcion?: string;
    caloriasKcal?: number;
    azucaresG?: number;
    grasasTotalesG?: number;
    grasasSaturadasG?: number;
    sodioMg?: number;
    proteinasG?: number;
  };
}

export interface EquivalenciaCotidiana {
  cucharaditasAzucar: number; // 1 cucharadita ≈ 4g
  gramosSal: number; // 1g sodio = 2.5g sal
  fraseEquivalenciaAzucar?: string;
  fraseEquivalenciaSal?: string;
}

export interface MotivoPuntaje {
  tipo: 'positivo' | 'neutro' | 'negativo';
  icono: string;
  titulo: string;
  descripcion: string;
}

export interface PuntajeSalud {
  puntos: number; // 0 - 100
  nivel: NivelPuntaje;
  colorClase: string; // clases tailwind de color
  colorHex: string;
  fraseResumen: string;
  motivos: MotivoPuntaje[];
  desglose: {
    nutricional: number; // 0 - 60
    procesamientoNova: number; // 0 - 25
    aditivos: number; // 0 - 15
  };
  equivalencias: EquivalenciaCotidiana;
  octogonos: OctogonoArgentina[];
  leyendas: LeyendaPrecautoria[];
  paisNormativa?: {
    codigo: string;
    nombre: string;
    bandera: string;
    normativa: string;
    organismo: string;
  };
}

export interface AlternativaSaludable {
  codigoBarras: string;
  nombre: string;
  marca?: string;
  imagenUrl?: string;
  puntaje: number;
  nivel: NivelPuntaje;
  categoria?: string;
}

export interface ProductoEscaneado {
  codigoBarras: string;
  nombre: string;
  marca?: string;
  categoria?: string;
  categoriaTags?: string[];
  imagenUrl?: string;
  imagenNutricionUrl?: string;
  nutriScoreGrade?: 'a' | 'b' | 'c' | 'd' | 'e';
  novaGroup?: 1 | 2 | 3 | 4;
  ecoScoreGrade?: 'a' | 'b' | 'c' | 'd' | 'e';
  ingredientesTexto?: string;
  alergenos?: string[];
  trazasAlergenos?: string[];
  aditivos: AditivoAnalizado[];
  nutrientes: NutrientesPor100;
  esLiquido?: boolean;
  puntaje: PuntajeSalud;
  alternativas?: AlternativaSaludable[];
  fuente: 'openfoodfacts' | 'ocr_manual' | 'local_cache' | 'catalogo_local' | 'ia_vision';
  fechaEscaneo: number; // timestamp ms
  favorito?: boolean;
  datosIncompletos?: boolean;
  perfilInferido?: boolean;
  mensajeInferencia?: string;
  editadoPorUsuario?: boolean;
  explicacionIa?: string;
  iaVisionMetadata?: {
    modelo: string;
    fecha: number;
    tokensAproximados?: number;
  };
  paisOrigen?: {
    codigo: string;
    nombre: string;
    bandera: string;
  };
}

export interface PreferenciasEscaner {
  id?: string;
  userId: string;
  alergenos: string[]; // ej: ["gluten", "lactosa", "frutos secos", "soja", "huevo"]
  dietas: string[]; // ej: ["vegetariana", "vegana", "sin_gluten"]
  objetivosSalud: string[]; // ej: ["bajar_azucar", "bajar_sodio", "alta_proteina", "evitar_ultraprocesados"]
  paisNormativa?: string; // 'auto' | 'MX' | 'CO' | 'CL' | 'AR' | 'PE' | 'UY' | 'ES' | 'OPS'
  geminiApiKey?: string; // Clave de Google AI Studio (Free Tier: 1.500 consultas/día gratis)
  createdAt: number;
  updatedAt: number;
}
