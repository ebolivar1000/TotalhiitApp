import {
  db,
  type AlumnaCRM,
  type EgresoCRM,
  type IngresoCRM,
  type PaisCRM,
  type TasaCambioHistoricaCRM,
} from '../datos/db';

// ==============================================================================
// DATOS MAESTROS INICIALES EXTRAÍDOS DEL EXCEL TOTALHIIT (JUNIO 2026)
// ==============================================================================

export const PAISES_INICIALES: PaisCRM[] = [
  { id: 1, nombre: 'Estados Unidos', codigo_iso: 'US', bandera_emoji: '🇺🇸' },
  { id: 2, nombre: 'Argentina', codigo_iso: 'AR', bandera_emoji: '🇦🇷' },
  { id: 3, nombre: 'Alemania', codigo_iso: 'DE', bandera_emoji: '🇩🇪' },
  { id: 4, nombre: 'Finlandia', codigo_iso: 'FI', bandera_emoji: '🇫🇮' },
  { id: 5, nombre: 'Brasil', codigo_iso: 'BR', bandera_emoji: '🇧🇷' },
  { id: 6, nombre: 'Chile', codigo_iso: 'CL', bandera_emoji: '🇨🇱' },
  { id: 7, nombre: 'España', codigo_iso: 'ES', bandera_emoji: '🇪🇸' },
  { id: 8, nombre: 'México', codigo_iso: 'MX', bandera_emoji: '🇲🇽' },
];

export const ALUMNAS_INICIALES: AlumnaCRM[] = [
  { codigo: '0001', nombre_completo: 'Raquel Hernandez', pais_id: 1, moneda_preferida: 'USD', fecha_inicio: '2026-06-01', dia_de_pago: 1, activa: 1, email: 'raquel.hernandez@totalhiit.com', telefono_whatsapp: '+13055550101' },
  { codigo: '0002', nombre_completo: 'Jackie Boriziuk', pais_id: 2, moneda_preferida: 'ARS', fecha_inicio: '2026-06-01', dia_de_pago: 1, activa: 1, email: 'jackie.boriziuk@totalhiit.com', telefono_whatsapp: '+5491155550102' },
  { codigo: '0003', nombre_completo: 'Esther Guisado', pais_id: 3, moneda_preferida: 'EUR', fecha_inicio: '2026-06-01', dia_de_pago: 1, activa: 1, email: 'esther.guisado@totalhiit.com', telefono_whatsapp: '+4915155550103' },
  { codigo: '0004', nombre_completo: 'Magaly Jarquin', pais_id: 1, moneda_preferida: 'USD', fecha_inicio: '2026-06-01', dia_de_pago: 1, activa: 1, email: 'magaly.jarquin@totalhiit.com', telefono_whatsapp: '+13055550104' },
  { codigo: '0005', nombre_completo: 'Argelia belen Jarquin', pais_id: 1, moneda_preferida: 'USD', fecha_inicio: '2026-06-01', dia_de_pago: 1, activa: 1, email: 'argelia.jarquin@totalhiit.com', telefono_whatsapp: '+13055550105' },
  { codigo: '0006', nombre_completo: 'Paula Hoor', pais_id: 3, moneda_preferida: 'EUR', fecha_inicio: '2026-06-17', dia_de_pago: 17, activa: 1, email: 'paula.hoor@totalhiit.com', telefono_whatsapp: '+4915155550106' },
  { codigo: '0007', nombre_completo: 'Nataly Benitez', pais_id: 2, moneda_preferida: 'ARS', fecha_inicio: '2026-06-01', dia_de_pago: 1, activa: 1, email: 'nataly.benitez@totalhiit.com', telefono_whatsapp: '+5491155550107' },
  { codigo: '0008', nombre_completo: 'Marlin Lopez', pais_id: 1, moneda_preferida: 'USD', fecha_inicio: '2026-06-01', dia_de_pago: 1, activa: 1, email: 'marlin.lopez@totalhiit.com', telefono_whatsapp: '+13055550108' },
  { codigo: '0009', nombre_completo: 'Margareth Banegas', pais_id: 1, moneda_preferida: 'USD', fecha_inicio: '2026-06-01', dia_de_pago: 1, activa: 1, email: 'margareth.banegas@totalhiit.com', telefono_whatsapp: '+13055550109' },
  { codigo: '0010', nombre_completo: 'Adilia Rodriguez', pais_id: 1, moneda_preferida: 'USD', fecha_inicio: '2026-06-01', dia_de_pago: 1, activa: 1, email: 'adilia.rodriguez@totalhiit.com', telefono_whatsapp: '+13055550110' },
  { codigo: '0011', nombre_completo: 'Eileen Garcia', pais_id: 1, moneda_preferida: 'USD', fecha_inicio: '2026-06-01', dia_de_pago: 1, activa: 1, email: 'eileen.garcia@totalhiit.com', telefono_whatsapp: '+13055550111' },
  { codigo: '0012', nombre_completo: 'Sonia Valeriano', pais_id: 1, moneda_preferida: 'USD', fecha_inicio: '2026-06-01', dia_de_pago: 1, activa: 1, email: 'sonia.valeriano@totalhiit.com', telefono_whatsapp: '+13055550112' },
  { codigo: '0013', nombre_completo: 'Yolanda Montijo', pais_id: 1, moneda_preferida: 'USD', fecha_inicio: '2026-06-01', dia_de_pago: 1, activa: 1, email: 'yolanda.montijo@totalhiit.com', telefono_whatsapp: '+13055550113' },
  { codigo: '0014', nombre_completo: 'Abygail Garcia', pais_id: 2, moneda_preferida: 'ARS', fecha_inicio: '2026-06-01', dia_de_pago: 1, activa: 1, email: 'abygail.garcia@totalhiit.com', telefono_whatsapp: '+5491155550114' },
  { codigo: '0015', nombre_completo: 'Manuela Sarome', pais_id: 2, moneda_preferida: 'ARS', fecha_inicio: '2026-06-01', dia_de_pago: 1, activa: 1, email: 'manuela.sarome@totalhiit.com', telefono_whatsapp: '+5491155550115' },
  { codigo: '0016', nombre_completo: 'Lousa Basili', pais_id: 3, moneda_preferida: 'EUR', fecha_inicio: '2026-06-01', dia_de_pago: 1, activa: 1, email: 'lousa.basili@totalhiit.com', telefono_whatsapp: '+4915155550116' },
  { codigo: '0017', nombre_completo: 'Monica Barber', pais_id: 1, moneda_preferida: 'USD', fecha_inicio: '2026-06-01', dia_de_pago: 1, activa: 1, email: 'monica.barber@totalhiit.com', telefono_whatsapp: '+13055550117' },
  { codigo: '0018', nombre_completo: 'Karla Kuusella', pais_id: 4, moneda_preferida: 'EUR', fecha_inicio: '2026-06-01', dia_de_pago: 1, activa: 1, email: 'karla.kuusella@totalhiit.com', telefono_whatsapp: '+358405550118' },
  { codigo: '0019', nombre_completo: 'Frania Lähdemäki', pais_id: 4, moneda_preferida: 'EUR', fecha_inicio: '2026-06-01', dia_de_pago: 1, activa: 1, email: 'frania.lahdemaki@totalhiit.com', telefono_whatsapp: '+358405550119' },
  { codigo: '0020', nombre_completo: 'Jessica Ledesma', pais_id: 1, moneda_preferida: 'USD', fecha_inicio: '2026-06-01', dia_de_pago: 1, activa: 1, email: 'jessica.ledesma@totalhiit.com', telefono_whatsapp: '+13055550120' },
  { codigo: '0021', nombre_completo: 'Mariela Decuzzi', pais_id: 2, moneda_preferida: 'ARS', fecha_inicio: '2026-06-01', dia_de_pago: 1, activa: 1, email: 'mariela.decuzzi@totalhiit.com', telefono_whatsapp: '+5491155550121' },
  { codigo: '0022', nombre_completo: 'Susana Costa', pais_id: 2, moneda_preferida: 'ARS', fecha_inicio: '2026-06-01', dia_de_pago: 1, activa: 1, email: 'susana.costa@totalhiit.com', telefono_whatsapp: '+5491155550122' },
];

export const TASAS_INICIALES: TasaCambioHistoricaCRM[] = [
  { id: '1', fecha: '2026-06-01', moneda_origen: 'USD', moneda_destino: 'USD', tasa: 1.0, fuente: 'ExchangeRate-API' },
  { id: '2', fecha: '2026-06-01', moneda_origen: 'USD', moneda_destino: 'ARS', tasa: 1449.58, fuente: 'ExchangeRate-API' },
  { id: '3', fecha: '2026-06-01', moneda_origen: 'EUR', moneda_destino: 'USD', tasa: 1.14678899, fuente: 'ExchangeRate-API' },
  { id: '4', fecha: '2026-06-01', moneda_origen: 'EUR', moneda_destino: 'ARS', tasa: 1662.36238532, fuente: 'ExchangeRate-API' },
  { id: '5', fecha: '2026-06-01', moneda_origen: 'ARS', moneda_destino: 'USD', tasa: 0.00068985, fuente: 'ExchangeRate-API' },
  { id: '6', fecha: '2026-06-01', moneda_origen: 'ARS', moneda_destino: 'ARS', tasa: 1.0, fuente: 'ExchangeRate-API' },
];

export const INGRESOS_INICIALES: IngresoCRM[] = [
  { id: 'ing-0001', alumna_codigo: '0001', tipo_ingreso: 'CUOTA_ALUMNA', concepto: 'Cuota Junio 2026', fecha_pago: '2026-06-01', moneda_original: 'USD', monto_original: 40, tasa_a_usd: 1.0, tasa_a_ars: 1449.58, usd_equivalente: 40.00, ars_equivalente: 57983.20, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Transferencia', estado: 'APROBADO', cargado_por: 'ADMIN' },
  { id: 'ing-0004', alumna_codigo: '0004', tipo_ingreso: 'CUOTA_ALUMNA', concepto: 'Cuota Junio 2026', fecha_pago: '2026-06-01', moneda_original: 'USD', monto_original: 37, tasa_a_usd: 1.0, tasa_a_ars: 1449.58, usd_equivalente: 37.00, ars_equivalente: 53634.46, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Transferencia', estado: 'APROBADO', cargado_por: 'ADMIN' },
  { id: 'ing-0005', alumna_codigo: '0005', tipo_ingreso: 'CUOTA_ALUMNA', concepto: 'Cuota Junio 2026', fecha_pago: '2026-06-01', moneda_original: 'USD', monto_original: 37, tasa_a_usd: 1.0, tasa_a_ars: 1449.58, usd_equivalente: 37.00, ars_equivalente: 53634.46, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Transferencia', estado: 'APROBADO', cargado_por: 'ADMIN' },
  { id: 'ing-0008', alumna_codigo: '0008', tipo_ingreso: 'CUOTA_ALUMNA', concepto: 'Cuota Junio 2026', fecha_pago: '2026-06-01', moneda_original: 'USD', monto_original: 40, tasa_a_usd: 1.0, tasa_a_ars: 1449.58, usd_equivalente: 40.00, ars_equivalente: 57983.20, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Transferencia', estado: 'APROBADO', cargado_por: 'ADMIN' },
  { id: 'ing-0009', alumna_codigo: '0009', tipo_ingreso: 'CUOTA_ALUMNA', concepto: 'Cuota Junio 2026', fecha_pago: '2026-06-01', moneda_original: 'USD', monto_original: 37, tasa_a_usd: 1.0, tasa_a_ars: 1449.58, usd_equivalente: 37.00, ars_equivalente: 53634.46, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Transferencia', estado: 'APROBADO', cargado_por: 'ADMIN' },
  { id: 'ing-0010', alumna_codigo: '0010', tipo_ingreso: 'CUOTA_ALUMNA', concepto: 'Cuota Junio 2026', fecha_pago: '2026-06-01', moneda_original: 'USD', monto_original: 50, tasa_a_usd: 1.0, tasa_a_ars: 1449.58, usd_equivalente: 50.00, ars_equivalente: 72479.00, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Transferencia', estado: 'APROBADO', cargado_por: 'ADMIN' },
  { id: 'ing-0011', alumna_codigo: '0011', tipo_ingreso: 'CUOTA_ALUMNA', concepto: 'Cuota Junio 2026', fecha_pago: '2026-06-01', moneda_original: 'USD', monto_original: 37, tasa_a_usd: 1.0, tasa_a_ars: 1449.58, usd_equivalente: 37.00, ars_equivalente: 53634.46, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Transferencia', estado: 'APROBADO', cargado_por: 'ADMIN' },
  { id: 'ing-0012', alumna_codigo: '0012', tipo_ingreso: 'CUOTA_ALUMNA', concepto: 'Cuota Junio 2026', fecha_pago: '2026-06-01', moneda_original: 'USD', monto_original: 50, tasa_a_usd: 1.0, tasa_a_ars: 1449.58, usd_equivalente: 50.00, ars_equivalente: 72479.00, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Transferencia', estado: 'APROBADO', cargado_por: 'ADMIN' },
  { id: 'ing-0013', alumna_codigo: '0013', tipo_ingreso: 'CUOTA_ALUMNA', concepto: 'Cuota Junio 2026', fecha_pago: '2026-06-01', moneda_original: 'USD', monto_original: 40, tasa_a_usd: 1.0, tasa_a_ars: 1449.58, usd_equivalente: 40.00, ars_equivalente: 57983.20, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Transferencia', estado: 'APROBADO', cargado_por: 'ADMIN' },
  { id: 'ing-0017', alumna_codigo: '0017', tipo_ingreso: 'CUOTA_ALUMNA', concepto: 'Cuota Junio 2026', fecha_pago: '2026-06-01', moneda_original: 'USD', monto_original: 30, tasa_a_usd: 1.0, tasa_a_ars: 1449.58, usd_equivalente: 30.00, ars_equivalente: 43487.40, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Transferencia', estado: 'APROBADO', cargado_por: 'ADMIN' },
  { id: 'ing-0020', alumna_codigo: '0020', tipo_ingreso: 'CUOTA_ALUMNA', concepto: 'Cuota Junio 2026', fecha_pago: '2026-06-01', moneda_original: 'USD', monto_original: 40, tasa_a_usd: 1.0, tasa_a_ars: 1449.58, usd_equivalente: 40.00, ars_equivalente: 57983.20, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Transferencia', estado: 'APROBADO', cargado_por: 'ADMIN' },
  { id: 'ing-0003', alumna_codigo: '0003', tipo_ingreso: 'CUOTA_ALUMNA', concepto: 'Cuota Junio 2026', fecha_pago: '2026-06-01', moneda_original: 'EUR', monto_original: 40, tasa_a_usd: 1.14678899, tasa_a_ars: 1662.36238532, usd_equivalente: 45.87, ars_equivalente: 66494.50, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Transferencia', estado: 'APROBADO', cargado_por: 'ADMIN' },
  { id: 'ing-0006', alumna_codigo: '0006', tipo_ingreso: 'CUOTA_ALUMNA', concepto: 'Cuota Junio 2026', fecha_pago: '2026-06-01', moneda_original: 'EUR', monto_original: 40, tasa_a_usd: 1.14678899, tasa_a_ars: 1662.36238532, usd_equivalente: 45.87, ars_equivalente: 66494.50, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Transferencia', estado: 'APROBADO', cargado_por: 'ADMIN' },
  { id: 'ing-0016', alumna_codigo: '0016', tipo_ingreso: 'CUOTA_ALUMNA', concepto: 'Cuota Junio 2026', fecha_pago: '2026-06-01', moneda_original: 'EUR', monto_original: 34, tasa_a_usd: 1.14678899, tasa_a_ars: 1662.36238532, usd_equivalente: 38.99, ars_equivalente: 56520.32, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Transferencia', estado: 'APROBADO', cargado_por: 'ADMIN' },
  { id: 'ing-0018', alumna_codigo: '0018', tipo_ingreso: 'CUOTA_ALUMNA', concepto: 'Cuota Junio 2026', fecha_pago: '2026-06-01', moneda_original: 'EUR', monto_original: 36, tasa_a_usd: 1.14678899, tasa_a_ars: 1662.36238532, usd_equivalente: 41.28, ars_equivalente: 59845.05, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Transferencia', estado: 'APROBADO', cargado_por: 'ADMIN' },
  { id: 'ing-0002', alumna_codigo: '0002', tipo_ingreso: 'CUOTA_ALUMNA', concepto: 'Cuota Junio 2026', fecha_pago: '2026-06-01', moneda_original: 'ARS', monto_original: 37000, tasa_a_usd: 0.00068985, tasa_a_ars: 1.0, usd_equivalente: 25.52, ars_equivalente: 37000.00, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Transferencia', estado: 'APROBADO', cargado_por: 'ADMIN' },
  { id: 'ing-0007', alumna_codigo: '0007', tipo_ingreso: 'CUOTA_ALUMNA', concepto: 'Cuota Junio 2026', fecha_pago: '2026-06-01', moneda_original: 'ARS', monto_original: 40000, tasa_a_usd: 0.00068985, tasa_a_ars: 1.0, usd_equivalente: 27.59, ars_equivalente: 40000.00, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Transferencia', estado: 'APROBADO', cargado_por: 'ADMIN' },
  { id: 'ing-0014', alumna_codigo: '0014', tipo_ingreso: 'CUOTA_ALUMNA', concepto: 'Cuota Junio 2026', fecha_pago: '2026-06-01', moneda_original: 'ARS', monto_original: 40000, tasa_a_usd: 0.00068985, tasa_a_ars: 1.0, usd_equivalente: 27.59, ars_equivalente: 40000.00, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Transferencia', estado: 'APROBADO', cargado_por: 'ADMIN' },
  { id: 'ing-0015', alumna_codigo: '0015', tipo_ingreso: 'CUOTA_ALUMNA', concepto: 'Cuota Junio 2026', fecha_pago: '2026-06-01', moneda_original: 'ARS', monto_original: 42000, tasa_a_usd: 0.00068985, tasa_a_ars: 1.0, usd_equivalente: 28.97, ars_equivalente: 42000.00, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Transferencia', estado: 'APROBADO', cargado_por: 'ADMIN' },
  { id: 'ing-0021', alumna_codigo: '0021', tipo_ingreso: 'CUOTA_ALUMNA', concepto: 'Cuota Junio 2026', fecha_pago: '2026-06-01', moneda_original: 'ARS', monto_original: 37000, tasa_a_usd: 0.00068985, tasa_a_ars: 1.0, usd_equivalente: 25.52, ars_equivalente: 37000.00, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Transferencia', estado: 'APROBADO', cargado_por: 'ADMIN' },
  { id: 'ing-0022', alumna_codigo: '0022', tipo_ingreso: 'CUOTA_ALUMNA', concepto: 'Cuota Junio 2026', fecha_pago: '2026-06-01', moneda_original: 'ARS', monto_original: 42000, tasa_a_usd: 0.00068985, tasa_a_ars: 1.0, usd_equivalente: 28.97, ars_equivalente: 42000.00, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Transferencia', estado: 'APROBADO', cargado_por: 'ADMIN' },
];

export const EGRESOS_INICIALES: EgresoCRM[] = [
  { id: 'egr-0001', categoria: 'PUBLICIDAD', concepto: 'Campaña Meta Ads captación alumnas', fecha: '2026-06-05', proveedor: 'Meta Ads', moneda_original: 'USD', monto_original: 80, tasa_a_usd: 1.0, tasa_a_ars: 1449.58, usd_equivalente: 80, ars_equivalente: 115966.4, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Tarjeta' },
  { id: 'egr-0002', categoria: 'EQUIPOS', concepto: 'Micrófono corbatero inalámbrico para videos de entrenamiento', fecha: '2026-06-12', proveedor: 'Amazon', moneda_original: 'USD', monto_original: 65, tasa_a_usd: 1.0, tasa_a_ars: 1449.58, usd_equivalente: 65, ars_equivalente: 94222.7, mes_periodo: 6, anio_periodo: 2026, metodo_pago: 'Tarjeta' },
];

// ==============================================================================
// FUNCIONES DE GESTIÓN Y PERSISTENCIA (LOCAL-FIRST CON DEXIE)
// ==============================================================================

/**
 * Inicializa los datos en la base de datos local Dexie si están vacíos.
 */
export async function inicializarCrmSiVacio(): Promise<void> {
  try {
    const cantPaises = await db.paises_crm.count();
    if (cantPaises === 0) {
      await db.paises_crm.bulkAdd(PAISES_INICIALES);
    }

    const cantAlumnas = await db.alumnas_crm.count();
    if (cantAlumnas === 0) {
      await db.alumnas_crm.bulkAdd(ALUMNAS_INICIALES);
    }

    const cantTasas = await db.tasas_crm.count();
    if (cantTasas === 0) {
      await db.tasas_crm.bulkAdd(TASAS_INICIALES);
    }

    const cantIngresos = await db.ingresos_crm.count();
    if (cantIngresos === 0) {
      await db.ingresos_crm.bulkAdd(INGRESOS_INICIALES);
    }

    const cantEgresos = await db.egresos_crm.count();
    if (cantEgresos === 0) {
      await db.egresos_crm.bulkAdd(EGRESOS_INICIALES);
    }
  } catch (error) {
    console.warn('Error inicializando CRM en Dexie:', error);
  }
}

/**
 * Lista todas las alumnas registradas.
 */
export async function listarAlumnasCRM(): Promise<AlumnaCRM[]> {
  await inicializarCrmSiVacio();
  return db.alumnas_crm.toArray();
}

/**
 * Guarda o actualiza una alumna.
 */
export async function guardarAlumnaCRM(alumna: AlumnaCRM): Promise<AlumnaCRM> {
  await db.alumnas_crm.put(alumna);
  return alumna;
}

/**
 * Elimina una alumna por su código.
 */
export async function eliminarAlumnaCRM(codigo: string): Promise<void> {
  await db.alumnas_crm.delete(codigo);
}

/**
 * Lista todos los países disponibles.
 */
export async function listarPaisesCRM(): Promise<PaisCRM[]> {
  await inicializarCrmSiVacio();
  return db.paises_crm.toArray();
}

/**
 * Lista todos los ingresos registrados.
 */
export async function listarIngresosCRM(): Promise<IngresoCRM[]> {
  await inicializarCrmSiVacio();
  return db.ingresos_crm.toArray();
}

/**
 * Registra o actualiza un ingreso.
 */
export async function guardarIngresoCRM(ingreso: IngresoCRM): Promise<IngresoCRM> {
  await db.ingresos_crm.put(ingreso);
  return ingreso;
}

/**
 * Elimina un ingreso por su ID.
 */
export async function eliminarIngresoCRM(id: string): Promise<void> {
  await db.ingresos_crm.delete(id);
}

/**
 * Lista todos los egresos registrados.
 */
export async function listarEgresosCRM(): Promise<EgresoCRM[]> {
  await inicializarCrmSiVacio();
  return db.egresos_crm.toArray();
}

/**
 * Registra o actualiza un egreso.
 */
export async function guardarEgresoCRM(egreso: EgresoCRM): Promise<EgresoCRM> {
  await db.egresos_crm.put(egreso);
  return egreso;
}

/**
 * Elimina un egreso por su ID.
 */
export async function eliminarEgresoCRM(id: string): Promise<void> {
  await db.egresos_crm.delete(id);
}

// ==============================================================================
// MOTOR DE ALERTAS Y VENCIMIENTO DE CICLOS DE PAGO
// ==============================================================================

export interface AlertaVencimiento {
  alumna: AlumnaCRM;
  pais?: PaisCRM;
  diaDePago: number;
  diasParaVencer: number; // negativo si ya venció
  estado: 'VENCE_HOY' | 'PROXIMO' | 'VENCIDO' | 'AL_DIA';
  ultimoPagoMesActual?: IngresoCRM;
  montoEstimado: number;
  moneda: string;
}

/**
 * Calcula el estado de vencimiento para cada alumna activa.
 */
export async function calcularVencimientosAlumnas(
  fechaReferencia = new Date()
): Promise<AlertaVencimiento[]> {
  const alumnas = await listarAlumnasCRM();
  const paises = await listarPaisesCRM();
  const ingresos = await listarIngresosCRM();

  const diaActual = fechaReferencia.getDate();
  const mesActual = fechaReferencia.getMonth() + 1;
  const anioActual = fechaReferencia.getFullYear();

  const paisesMap = new Map(paises.map((p) => [p.id, p]));

  return alumnas
    .filter((a) => a.activa === 1)
    .map((alumna) => {
      const pais = paisesMap.get(alumna.pais_id);
      const diaPago = alumna.dia_de_pago || 1;
      const diasParaVencer = diaPago - diaActual;

      // Buscar si pagó en el mes contable actual
      const pagoMesActual = ingresos.find(
        (i) =>
          i.alumna_codigo === alumna.codigo &&
          i.mes_periodo === mesActual &&
          i.anio_periodo === anioActual &&
          i.estado === 'APROBADO'
      );

      // Buscar el último monto registrado para esta alumna o valor por defecto según moneda
      const ultimoPago = ingresos
        .filter((i) => i.alumna_codigo === alumna.codigo)
        .sort((a, b) => b.fecha_pago.localeCompare(a.fecha_pago))[0];

      const montoEstimado =
        ultimoPago?.monto_original ||
        (alumna.moneda_preferida === 'ARS' ? 40000 : alumna.moneda_preferida === 'EUR' ? 40 : 40);

      let estado: AlertaVencimiento['estado'] = 'AL_DIA';

      if (pagoMesActual) {
        estado = 'AL_DIA';
      } else if (diasParaVencer === 0) {
        estado = 'VENCE_HOY';
      } else if (diasParaVencer > 0 && diasParaVencer <= 7) {
        estado = 'PROXIMO';
      } else if (diasParaVencer < 0) {
        estado = 'VENCIDO';
      } else {
        estado = 'AL_DIA';
      }

      return {
        alumna,
        pais,
        diaDePago: diaPago,
        diasParaVencer,
        estado,
        ultimoPagoMesActual: pagoMesActual,
        montoEstimado,
        moneda: alumna.moneda_preferida,
      };
    })
    .sort((a, b) => {
      // Prioridad: VENCE_HOY -> VENCIDO -> PROXIMO -> AL_DIA
      const prioridad = { VENCE_HOY: 0, VENCIDO: 1, PROXIMO: 2, AL_DIA: 3 };
      if (prioridad[a.estado] !== prioridad[b.estado]) {
        return prioridad[a.estado] - prioridad[b.estado];
      }
      return a.diasParaVencer - b.diasParaVencer;
    });
}

// ==============================================================================
// GENERADOR DE MENSAJES MOTIVADORES DE COBRO (WHATSAPP & EMAIL)
// ==============================================================================

/**
 * Genera el texto del mensaje motivador para WhatsApp.
 * Enfocado en empoderamiento femenino +40, vitalidad, consistencia y salud integral.
 */
export function generarMensajeMotivadorWhatsApp({
  nombre,
  monto,
  moneda,
  diaPago,
}: {
  nombre: string;
  monto: number;
  moneda: string;
  diaPago: number;
}): string {
  const simbolo = moneda === 'EUR' ? '€' : '$';
  const primerNombre = nombre.split(' ')[0] || nombre;

  return `¡Hola ${primerNombre}! 🌟 Espero que estés teniendo una excelente semana y sintiendo en tu cuerpo toda la energía y fuerza que estás construyendo con cada entrenamiento TotalHIIT. 💪✨

Tu constancia y compromiso con tu salud y vitalidad después de los 40 son una verdadera inspiración. Cuidar de ti misma y regalarte este tiempo es la inversión más valiosa de tu vida.

Te escribo con mucho cariño para recordarte que el próximo día ${diaPago} corresponde la renovación de tu membresía activa de TotalHIIT:
📌 *Monto:* ${simbolo}${monto.toLocaleString('es-ES')} ${moneda}

Para mantener tu acompañamiento personalizado, acceso a clases y plan de nutrición sin interrupciones, por favor envíanos tu comprobante de transferencia por aquí al realizarlo.

¡Seguimos juntas avanzando con fuerza hacia tu mejor versión! 🔥 Un abrazo grande,
*Equipo TotalHIIT*`;
}

/**
 * Genera el enlace directo para enviar por WhatsApp Web o App.
 */
export function generarEnlaceWhatsApp(telefono?: string, mensaje?: string): string {
  const numeroLimpio = (telefono || '').replace(/[^\d+]/g, '');
  const urlBase = numeroLimpio
    ? `https://wa.me/${numeroLimpio.startsWith('+') ? numeroLimpio.slice(1) : numeroLimpio}`
    : 'https://wa.me/';
  return `${urlBase}?text=${encodeURIComponent(mensaje || '')}`;
}

/**
 * Genera el asunto y cuerpo para correo electrónico.
 */
export function generarMensajeMotivadorEmail({
  nombre,
  monto,
  moneda,
  diaPago,
}: {
  nombre: string;
  monto: number;
  moneda: string;
  diaPago: number;
}): { asunto: string; cuerpo: string } {
  const simbolo = moneda === 'EUR' ? '€' : '$';
  const primerNombre = nombre.split(' ')[0] || nombre;

  return {
    asunto: `✨ ${primerNombre}, tu energía no se detiene — Renovación Membresía TotalHIIT`,
    cuerpo: `¡Hola ${primerNombre}!

Espero que estés sintiendo los beneficios de cada sesión y la energía positiva que trae mantener el cuerpo activo y fuerte. Tu constancia es inspiradora y nos llena de orgullo acompañarte en tu transformación.

Te recordamos con cariño que el día ${diaPago} de este mes corresponde la renovación de tu ciclo en TotalHIIT:

• Monto a abonar: ${simbolo}${monto.toLocaleString('es-ES')} ${moneda}
• Concepto: Membresía TotalHIIT

Por favor, al realizar tu pago envíanos tu comprobante respondiendo a este correo para actualizar de inmediato tu ficha en nuestro sistema de administración.

¡Gracias por confiar en nosotras y ser parte activa de la comunidad TotalHIIT!

Con cariño y energía,
Equipo TotalHIIT
https://totalhiit.pages.dev/`,
  };
}
