-- ==============================================================================
-- TOTALHIIT CRM: ESQUEMA DE BASE DE DATOS PARA CLOUDFLARE D1 (SQLITE)
-- Incluye: Directorio de Alumnas, Ingresos (Cuotas, App, Marcas), Egresos
-- (Publicidad, Impuestos, Equipos) y Tasas Históricas Multi-divisa.
-- ==============================================================================

-- 1. Tabla de Países
CREATE TABLE IF NOT EXISTS paises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL,
    codigo_iso TEXT NOT NULL,
    bandera_emoji TEXT NOT NULL
);

-- 2. Tabla de Monedas
CREATE TABLE IF NOT EXISTS monedas (
    codigo TEXT PRIMARY KEY, -- 'USD', 'EUR', 'ARS'
    nombre TEXT NOT NULL,
    simbolo TEXT NOT NULL
);

-- 3. Tabla de Tasas de Cambio Históricas
CREATE TABLE IF NOT EXISTS tasas_cambio_historicas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL, -- 'YYYY-MM-DD'
    moneda_origen TEXT NOT NULL REFERENCES monedas(codigo),
    moneda_destino TEXT NOT NULL REFERENCES monedas(codigo),
    tasa REAL NOT NULL,
    fuente TEXT DEFAULT 'ExchangeRate-API',
    creado_en TEXT DEFAULT (datetime('now')),
    UNIQUE(fecha, moneda_origen, moneda_destino)
);

-- 4. Tabla de Alumnas (Directorio Maestro)
CREATE TABLE IF NOT EXISTS alumnas (
    codigo TEXT PRIMARY KEY, -- '0001', '0002', etc.
    nombre_completo TEXT NOT NULL,
    email TEXT,
    telefono_whatsapp TEXT,
    pais_id INTEGER REFERENCES paises(id),
    moneda_preferida TEXT DEFAULT 'USD' REFERENCES monedas(codigo),
    fecha_inicio TEXT NOT NULL, -- 'YYYY-MM-DD'
    dia_de_pago INTEGER DEFAULT 1, -- 1 al 31 (para alertas de vencimiento)
    activa INTEGER DEFAULT 1, -- 1 = Activa, 0 = Inactiva
    notas TEXT,
    creado_en TEXT DEFAULT (datetime('now'))
);

-- 5. Tabla de Ingresos (Cuotas Alumnas, Contrataciones App, Colaboraciones con Marcas y Otros)
CREATE TABLE IF NOT EXISTS ingresos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_ingreso TEXT NOT NULL DEFAULT 'CUOTA_ALUMNA', -- 'CUOTA_ALUMNA', 'CONTRATACION_APP', 'COLABORACION_MARCA', 'OTRO_INGRESO'
    alumna_codigo TEXT REFERENCES alumnas(codigo) ON DELETE RESTRICT, -- NULL si es marca o contratación de app
    cliente_o_marca TEXT, -- Nombre de la marca o empresa contratante si no es alumna
    concepto TEXT, -- Detalle (ej. "Cuota Mensual Junio", "Sponsor Indumentaria", "Licencia PWA")
    fecha_pago TEXT NOT NULL, -- 'YYYY-MM-DD'
    moneda_original TEXT NOT NULL REFERENCES monedas(codigo),
    monto_original REAL NOT NULL,
    tasa_a_usd REAL NOT NULL,
    tasa_a_ars REAL NOT NULL,
    usd_equivalente REAL GENERATED ALWAYS AS (ROUND(monto_original * tasa_a_usd, 2)) STORED,
    ars_equivalente REAL GENERATED ALWAYS AS (ROUND(monto_original * tasa_a_ars, 2)) STORED,
    mes_periodo INTEGER NOT NULL,
    anio_periodo INTEGER NOT NULL,
    metodo_pago TEXT DEFAULT 'Transferencia', -- 'Transferencia', 'PayPal', 'Stripe', 'Efectivo', 'MercadoPago'
    comprobante_url TEXT,
    estado TEXT DEFAULT 'APROBADO', -- 'PENDIENTE', 'APROBADO', 'RECHAZADO'
    cargado_por TEXT DEFAULT 'ADMIN', -- 'ADMIN', 'ALUMNA_FORM'
    notas TEXT,
    creado_en TEXT DEFAULT (datetime('now'))
);

-- 6. Tabla de Egresos (Gastos Operativos de la Marca TotalHIIT)
CREATE TABLE IF NOT EXISTS egresos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria TEXT NOT NULL, -- 'PUBLICIDAD', 'IMPUESTOS', 'EQUIPOS', 'SOFTWARE_HOSTING', 'OTRO_EGRESO'
    concepto TEXT NOT NULL, -- Ej: "Campaña Meta Ads Junio", "Micrófono inalámbrico", "Impuesto a las ganancias"
    fecha TEXT NOT NULL, -- 'YYYY-MM-DD'
    proveedor TEXT, -- Ej: 'Meta Ads', 'Apple Store', 'Mercado Libre', 'AFIP'
    moneda_original TEXT NOT NULL REFERENCES monedas(codigo),
    monto_original REAL NOT NULL,
    tasa_a_usd REAL NOT NULL,
    tasa_a_ars REAL NOT NULL,
    usd_equivalente REAL GENERATED ALWAYS AS (ROUND(monto_original * tasa_a_usd, 2)) STORED,
    ars_equivalente REAL GENERATED ALWAYS AS (ROUND(monto_original * tasa_a_ars, 2)) STORED,
    mes_periodo INTEGER NOT NULL,
    anio_periodo INTEGER NOT NULL,
    metodo_pago TEXT DEFAULT 'Tarjeta', -- 'Tarjeta', 'Transferencia', 'Efectivo'
    comprobante_url TEXT,
    notas TEXT,
    creado_en TEXT DEFAULT (datetime('now'))
);

-- ==============================================================================
-- SEMILLADO DE DATOS MAESTROS
-- ==============================================================================

-- Países
INSERT OR IGNORE INTO paises (id, nombre, codigo_iso, bandera_emoji) VALUES
(1, 'Estados Unidos', 'US', '🇺🇸'),
(2, 'Argentina', 'AR', '🇦🇷'),
(3, 'Alemania', 'DE', '🇩🇪'),
(4, 'Finlandia', 'FI', '🇫🇮'),
(5, 'Brasil', 'BR', '🇧🇷'),
(6, 'Chile', 'CL', '🇨🇱'),
(7, 'España', 'ES', '🇪🇸'),
(8, 'Mexico', 'MX', '🇲🇽');

-- Monedas
INSERT OR IGNORE INTO monedas (codigo, nombre, simbolo) VALUES
('USD', 'Dólar Estadounidense', '$'),
('EUR', 'Euro', '€'),
('ARS', 'Peso Argentino', '$');

-- Tasas Históricas registradas para el corte Junio 2026
INSERT OR IGNORE INTO tasas_cambio_historicas (fecha, moneda_origen, moneda_destino, tasa, fuente) VALUES
('2026-06-01', 'USD', 'USD', 1.0, 'ExchangeRate-API'),
('2026-06-01', 'USD', 'ARS', 1449.58, 'ExchangeRate-API'),
('2026-06-01', 'EUR', 'USD', 1.14678899, 'ExchangeRate-API'),
('2026-06-01', 'EUR', 'ARS', 1662.36238532, 'ExchangeRate-API'),
('2026-06-01', 'ARS', 'USD', 0.00068985, 'ExchangeRate-API'),
('2026-06-01', 'ARS', 'ARS', 1.0, 'ExchangeRate-API');

-- 22 Alumnas del Directorio Inicial
INSERT OR IGNORE INTO alumnas (codigo, nombre_completo, pais_id, moneda_preferida, fecha_inicio, dia_de_pago, activa) VALUES
('0001', 'Raquel Hernandez', 1, 'USD', '2026-06-01', 1, 1),
('0002', 'Jackie Boriziuk', 2, 'ARS', '2026-06-01', 1, 1),
('0003', 'Esther Guisado', 3, 'EUR', '2026-06-01', 1, 1),
('0004', 'Magaly Jarquin', 1, 'USD', '2026-06-01', 1, 1),
('0005', 'Argelia belen Jarquin', 1, 'USD', '2026-06-01', 1, 1),
('0006', 'Paula Hoor', 3, 'EUR', '2026-06-17', 17, 1),
('0007', 'Nataly Benitez', 2, 'ARS', '2026-06-01', 1, 1),
('0008', 'Marlin Lopez', 1, 'USD', '2026-06-01', 1, 1),
('0009', 'Margareth Banegas', 1, 'USD', '2026-06-01', 1, 1),
('0010', 'Adilia Rodriguez', 1, 'USD', '2026-06-01', 1, 1),
('0011', 'Eileen Garcia', 1, 'USD', '2026-06-01', 1, 1),
('0012', 'Sonia Valeriano', 1, 'USD', '2026-06-01', 1, 1),
('0013', 'Yolanda Montijo', 1, 'USD', '2026-06-01', 1, 1),
('0014', 'Abygail Garcia', 2, 'ARS', '2026-06-01', 1, 1),
('0015', 'Manuela Sarome', 2, 'ARS', '2026-06-01', 1, 1),
('0016', 'Lousa Basili', 3, 'EUR', '2026-06-01', 1, 1),
('0017', 'Monica Barber', 1, 'USD', '2026-06-01', 1, 1),
('0018', 'Karla Kuusella', 4, 'EUR', '2026-06-01', 1, 1),
('0019', 'Frania Lähdemäki', 4, 'EUR', '2026-06-01', 1, 1),
('0020', 'Jessica Ledesma', 1, 'USD', '2026-06-01', 1, 1),
('0021', 'Mariela Decuzzi', 2, 'ARS', '2026-06-01', 1, 1),
('0022', 'Susana Costa', 2, 'ARS', '2026-06-01', 1, 1);

-- 21 Pagos de Alumnas de Junio 2026 (Monto Original, Tasas Congeladas y Equivalentes)
INSERT OR IGNORE INTO ingresos (alumna_codigo, tipo_ingreso, concepto, fecha_pago, moneda_original, monto_original, tasa_a_usd, tasa_a_ars, mes_periodo, anio_periodo, estado) VALUES
('0001', 'CUOTA_ALUMNA', 'Cuota Junio 2026', '2026-06-01', 'USD', 40.00, 1.0, 1449.58, 6, 2026, 'APROBADO'),
('0004', 'CUOTA_ALUMNA', 'Cuota Junio 2026', '2026-06-01', 'USD', 37.00, 1.0, 1449.58, 6, 2026, 'APROBADO'),
('0005', 'CUOTA_ALUMNA', 'Cuota Junio 2026', '2026-06-01', 'USD', 37.00, 1.0, 1449.58, 6, 2026, 'APROBADO'),
('0008', 'CUOTA_ALUMNA', 'Cuota Junio 2026', '2026-06-01', 'USD', 40.00, 1.0, 1449.58, 6, 2026, 'APROBADO'),
('0009', 'CUOTA_ALUMNA', 'Cuota Junio 2026', '2026-06-01', 'USD', 37.00, 1.0, 1449.58, 6, 2026, 'APROBADO'),
('0010', 'CUOTA_ALUMNA', 'Cuota Junio 2026', '2026-06-01', 'USD', 50.00, 1.0, 1449.58, 6, 2026, 'APROBADO'),
('0011', 'CUOTA_ALUMNA', 'Cuota Junio 2026', '2026-06-01', 'USD', 37.00, 1.0, 1449.58, 6, 2026, 'APROBADO'),
('0012', 'CUOTA_ALUMNA', 'Cuota Junio 2026', '2026-06-01', 'USD', 50.00, 1.0, 1449.58, 6, 2026, 'APROBADO'),
('0013', 'CUOTA_ALUMNA', 'Cuota Junio 2026', '2026-06-01', 'USD', 40.00, 1.0, 1449.58, 6, 2026, 'APROBADO'),
('0017', 'CUOTA_ALUMNA', 'Cuota Junio 2026', '2026-06-01', 'USD', 30.00, 1.0, 1449.58, 6, 2026, 'APROBADO'),
('0020', 'CUOTA_ALUMNA', 'Cuota Junio 2026', '2026-06-01', 'USD', 40.00, 1.0, 1449.58, 6, 2026, 'APROBADO'),
('0003', 'CUOTA_ALUMNA', 'Cuota Junio 2026', '2026-06-01', 'EUR', 40.00, 1.14678899, 1662.36238532, 6, 2026, 'APROBADO'),
('0006', 'CUOTA_ALUMNA', 'Cuota Junio 2026', '2026-06-01', 'EUR', 40.00, 1.14678899, 1662.36238532, 6, 2026, 'APROBADO'),
('0016', 'CUOTA_ALUMNA', 'Cuota Junio 2026', '2026-06-01', 'EUR', 34.00, 1.14678899, 1662.36238532, 6, 2026, 'APROBADO'),
('0018', 'CUOTA_ALUMNA', 'Cuota Junio 2026', '2026-06-01', 'EUR', 36.00, 1.14678899, 1662.36238532, 6, 2026, 'APROBADO'),
('0002', 'CUOTA_ALUMNA', 'Cuota Junio 2026', '2026-06-01', 'ARS', 37000.00, 0.00068985, 1.0, 6, 2026, 'APROBADO'),
('0007', 'CUOTA_ALUMNA', 'Cuota Junio 2026', '2026-06-01', 'ARS', 40000.00, 0.00068985, 1.0, 6, 2026, 'APROBADO'),
('0014', 'CUOTA_ALUMNA', 'Cuota Junio 2026', '2026-06-01', 'ARS', 40000.00, 0.00068985, 1.0, 6, 2026, 'APROBADO'),
('0015', 'CUOTA_ALUMNA', 'Cuota Junio 2026', '2026-06-01', 'ARS', 42000.00, 0.00068985, 1.0, 6, 2026, 'APROBADO'),
('0021', 'CUOTA_ALUMNA', 'Cuota Junio 2026', '2026-06-01', 'ARS', 37000.00, 0.00068985, 1.0, 6, 2026, 'APROBADO'),
('0022', 'CUOTA_ALUMNA', 'Cuota Junio 2026', '2026-06-01', 'ARS', 42000.00, 0.00068985, 1.0, 6, 2026, 'APROBADO');
