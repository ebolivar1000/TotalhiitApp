import Dexie, { type EntityTable } from 'dexie';
import type {
  CicloRegistro,
  ConsentRecord,
  EntradaDiario,
  Favorito,
  NutritionPreferences,
  PlanSemanal,
  RecipePreparation,
  UserGoal,
  UserProfile,
  WorkoutSession,
} from './entidades';

export interface Suscriptor {
  id: string;
  email: string;
  nombre?: string;
  plan: 'mensual' | 'anual' | 'vitalicio' | 'total40';
  activo: number; // 1 | 0
  fechaAlta: string;
  notas?: string;
}

export interface AnuncioAdmin {
  id: string;
  tipo: 'promocion' | 'update' | 'aviso';
  titulo: string;
  mensaje: string;
  enlace?: string;
  activo: number; // 1 | 0
  fecha: string;
}

// -------------------------------------------------------------
// ENTIDADES TOTALHIIT CRM (Directorio, Ingresos, Egresos, Tasas)
// -------------------------------------------------------------

export interface PaisCRM {
  id: number;
  nombre: string;
  codigo_iso: string;
  bandera_emoji: string;
}

export interface MonedaCRM {
  codigo: 'USD' | 'EUR' | 'ARS' | string;
  nombre: string;
  simbolo: string;
}

export interface AlumnaCRM {
  codigo: string; // '0001', '0002'...
  nombre_completo: string;
  email?: string;
  telefono_whatsapp?: string;
  pais_id: number;
  moneda_preferida: 'USD' | 'EUR' | 'ARS';
  fecha_inicio: string; // 'YYYY-MM-DD'
  dia_de_pago: number; // 1 al 31 (día del mes para ciclo de cobro)
  activa: number; // 1 | 0
  notas?: string;
  creado_en?: string;
}

export interface IngresoCRM {
  id: string;
  tipo_ingreso: 'CUOTA_ALUMNA' | 'CONTRATACION_APP' | 'COLABORACION_MARCA' | 'OTRO_INGRESO';
  alumna_codigo?: string;
  cliente_o_marca?: string;
  concepto: string;
  fecha_pago: string; // 'YYYY-MM-DD'
  moneda_original: 'USD' | 'EUR' | 'ARS' | string;
  monto_original: number;
  tasa_a_usd: number;
  tasa_a_ars: number;
  usd_equivalente: number;
  ars_equivalente: number;
  mes_periodo: number; // 1-12
  anio_periodo: number; // 2026
  metodo_pago: string; // 'Transferencia', 'PayPal', 'Stripe', 'Efectivo', 'MercadoPago'
  comprobante_url?: string;
  estado: 'APROBADO' | 'PENDIENTE' | 'RECHAZADO';
  cargado_por: 'ADMIN' | 'ALUMNA_FORM';
  notas?: string;
  creado_en?: string;
}

export interface EgresoCRM {
  id: string;
  categoria: 'PUBLICIDAD' | 'IMPUESTOS' | 'EQUIPOS' | 'SOFTWARE_HOSTING' | 'OTRO_EGRESO';
  concepto: string;
  fecha: string; // 'YYYY-MM-DD'
  proveedor?: string;
  moneda_original: 'USD' | 'EUR' | 'ARS' | string;
  monto_original: number;
  tasa_a_usd: number;
  tasa_a_ars: number;
  usd_equivalente: number;
  ars_equivalente: number;
  mes_periodo: number;
  anio_periodo: number;
  metodo_pago: string;
  comprobante_url?: string;
  notas?: string;
  creado_en?: string;
}

export interface TasaCambioHistoricaCRM {
  id: string;
  fecha: string;
  moneda_origen: string;
  moneda_destino: string;
  tasa: number;
  fuente: string;
  creado_en?: string;
}

export const NOMBRE_DB = 'totalhiit-app';

export const db = new Dexie(NOMBRE_DB) as Dexie & {
  perfiles: EntityTable<UserProfile, 'id'>;
  objetivos: EntityTable<UserGoal, 'id'>;
  preferencias: EntityTable<NutritionPreferences, 'id'>;
  consentimientos: EntityTable<ConsentRecord, 'id'>;
  sesiones: EntityTable<WorkoutSession, 'id'>;
  favoritos: EntityTable<Favorito, 'id'>;
  preparaciones: EntityTable<RecipePreparation, 'id'>;
  entradasDiario: EntityTable<EntradaDiario, 'id'>;
  ciclo: EntityTable<CicloRegistro, 'id'>;
  planes: EntityTable<PlanSemanal, 'id'>;
  suscriptores: EntityTable<Suscriptor, 'id'>;
  anuncios: EntityTable<AnuncioAdmin, 'id'>;
  alumnas_crm: EntityTable<AlumnaCRM, 'codigo'>;
  ingresos_crm: EntityTable<IngresoCRM, 'id'>;
  egresos_crm: EntityTable<EgresoCRM, 'id'>;
  paises_crm: EntityTable<PaisCRM, 'id'>;
  tasas_crm: EntityTable<TasaCambioHistoricaCRM, 'id'>;
};

db.version(1).stores({
  perfiles: 'id, createdAt',
  objetivos: 'id, userId, [userId+activo]',
  preferencias: 'id, userId',
  consentimientos: 'id, userId, [userId+modulo]',
});

/** FASE 4: entrenamientos realizados y favoritos genéricos (sesiones/recetas). */
db.version(2).stores({
  sesiones: 'id, userId, workoutId, fecha',
  favoritos: 'id, userId, [userId+tipo]',
});

/** FASE 5: recetas preparadas. */
db.version(3).stores({
  preparaciones: 'id, userId, recetaId, fecha',
});

/** FASE 7: registro diario voluntario (peso, energía, ánimo, sueño, agua, notas). */
db.version(4).stores({
  entradasDiario: 'id, userId, fecha, [userId+fecha]',
});

/** FASE 8: ciclo menstrual — SOLO metadatos + payload cifrado (nunca en claro). */
db.version(5).stores({
  ciclo: 'id, userId, fecha, [userId+fecha]',
});

/** FASE 9: planes semanales de comidas. */
db.version(6).stores({
  planes: 'id, userId, semanaInicio, [userId+semanaInicio]',
});

/** FASE 12: módulo de administración de suscriptores y anuncios del sistema. */
db.version(7).stores({
  suscriptores: 'id, email, activo',
  anuncios: 'id, tipo, activo, fecha',
});

/** FASE CRM: Directorio multidivisa de alumnas, ingresos, egresos y tasas históricas */
db.version(8).stores({
  alumnas_crm: 'codigo, nombre_completo, pais_id, moneda_preferida, dia_de_pago, activa',
  ingresos_crm: 'id, tipo_ingreso, alumna_codigo, fecha_pago, mes_periodo, anio_periodo, estado',
  egresos_crm: 'id, categoria, fecha, mes_periodo, anio_periodo',
  paises_crm: 'id, nombre, codigo_iso',
  tasas_crm: 'id, fecha, [fecha+moneda_origen+moneda_destino]',
});
