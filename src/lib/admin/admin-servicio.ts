import { db, type AnuncioAdmin, type Suscriptor } from '../datos/db';
import { fechaHoyIso } from '../utilidades/fechas';

export const EMAILS_ADMIN_POR_DEFECTO = [
  'caribialabs@gmail.com',
  'ebolivar1000@gmail.com',
  'totalhiit1@gmail.com',
];
export const CLAVE_ADMIN_POR_DEFECTO = 'admin2026';
export const LLAVE_SESION_ADMIN = 'totalhiit_admin_autenticado';
export const LLAVE_ADMIN_EMAIL = 'totalhiit_admin_email';
export const LLAVE_CLAVE_ADMIN = 'totalhiit_admin_clave';

let claveEnMemoria: string | null = null;

function resolverAlmacenClave(): {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
} {
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      return localStorage;
    }
  } catch {}
  return {
    getItem: () => claveEnMemoria,
    setItem: (_k: string, v: string) => {
      claveEnMemoria = v;
    },
    removeItem: () => {
      claveEnMemoria = null;
    },
  };
}

/**
 * Obtiene la clave actual de administración (almacenada o la clave por defecto).
 */
export function obtenerClaveAdminActual(): string {
  try {
    const almacen = resolverAlmacenClave();
    return almacen.getItem(LLAVE_CLAVE_ADMIN) || CLAVE_ADMIN_POR_DEFECTO;
  } catch {
    return CLAVE_ADMIN_POR_DEFECTO;
  }
}

/**
 * Valida la clave de acceso al panel de administración.
 */
export function verificarClaveAdmin(clave: string): boolean {
  return clave.trim() === obtenerClaveAdminActual();
}

/**
 * Permite al administrador cambiar su contraseña de acceso.
 */
export function cambiarClaveAdmin(nuevaClave: string): { exito: boolean; mensaje: string } {
  const claveLimpia = nuevaClave.trim();
  if (claveLimpia.length < 6) {
    return { exito: false, mensaje: 'La nueva clave debe tener al menos 6 caracteres.' };
  }
  try {
    const almacen = resolverAlmacenClave();
    almacen.setItem(LLAVE_CLAVE_ADMIN, claveLimpia);
    return { exito: true, mensaje: '¡Contraseña de administración actualizada correctamente!' };
  } catch {
    return { exito: false, mensaje: 'Error al guardar la nueva contraseña en este dispositivo.' };
  }
}

/**
 * Restablece la clave de administración mediante correo maestro autorizado.
 */
export function restablecerClaveAdminPorEmail(email: string): { exito: boolean; mensaje: string } {
  const norm = normalizarEmail(email);
  if (!norm) {
    return { exito: false, mensaje: 'Por favor ingresa un correo electrónico de administrador.' };
  }
  if (!EMAILS_ADMIN_POR_DEFECTO.includes(norm)) {
    return {
      exito: false,
      mensaje: 'El correo no corresponde a una cuenta autorizada de administración para recuperación.',
    };
  }

  try {
    const almacen = resolverAlmacenClave();
    almacen.setItem(LLAVE_CLAVE_ADMIN, CLAVE_ADMIN_POR_DEFECTO);
    return {
      exito: true,
      mensaje: `Clave restablecida con éxito a la clave por defecto: "${CLAVE_ADMIN_POR_DEFECTO}". Ya puedes ingresar y cambiarla.`,
    };
  } catch {
    return { exito: false, mensaje: 'Error al restablecer la clave en el dispositivo.' };
  }
}

export function estaAutenticadoAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(LLAVE_SESION_ADMIN) === '1';
}

export function obtenerEmailAdminAutenticado(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(LLAVE_ADMIN_EMAIL) || 'admin@totalhiit.com';
}

export function iniciarSesionAdmin(email?: string): void {
  sessionStorage.setItem(LLAVE_SESION_ADMIN, '1');
  if (email) {
    sessionStorage.setItem(LLAVE_ADMIN_EMAIL, normalizarEmail(email));
  }
}

export function cerrarSesionAdmin(): void {
  sessionStorage.removeItem(LLAVE_SESION_ADMIN);
  sessionStorage.removeItem(LLAVE_ADMIN_EMAIL);
}

/**
 * Valida las credenciales de administración requeridas:
 * Email autorizado (caribialabs@gmail.com, ebolivar1000@gmail.com, totalhiit1@gmail.com)
 * y clave de acceso (por defecto 'admin2026' o la configurada).
 */
export function validarLoginAdmin(email: string, clave: string): { exito: boolean; mensaje: string } {
  const emailNorm = normalizarEmail(email);
  if (!emailNorm) {
    return { exito: false, mensaje: 'Por favor ingresa tu correo de administrador.' };
  }
  if (!EMAILS_ADMIN_POR_DEFECTO.includes(emailNorm)) {
    return {
      exito: false,
      mensaje: 'Acceso denegado: El correo no está autorizado como administrador de TotalHIIT.',
    };
  }
  if (!verificarClaveAdmin(clave)) {
    return {
      exito: false,
      mensaje: 'Contraseña de administrador incorrecta. Verifica o usa la recuperación.',
    };
  }

  iniciarSesionAdmin(emailNorm);
  return { exito: true, mensaje: 'Inicio de sesión exitoso.' };
}

/**
 * Normaliza una dirección de correo para búsqueda consistente.
 */
export function normalizarEmail(email?: string | null): string {
  return (email ?? '').trim().toLowerCase();
}

/**
 * Verifica si un correo electrónico cuenta con suscripción activa a TOTALHIIT.
 * Los administradores siempre tienen acceso completo.
 */
export async function esSuscriptorActivo(email?: string | null): Promise<boolean> {
  const norm = normalizarEmail(email);
  if (!norm) return false;

  // Administradores autorizados por defecto
  if (EMAILS_ADMIN_POR_DEFECTO.includes(norm)) {
    return true;
  }

  try {
    const suscriptor = await db.suscriptores.where('email').equals(norm).first();
    return Boolean(suscriptor && suscriptor.activo === 1);
  } catch (error) {
    console.error('Error al verificar suscriptor en base de datos:', error);
    return false;
  }
}

/**
 * Lista todos los suscriptores registrados en el sistema.
 */
export async function listarSuscriptores(): Promise<Suscriptor[]> {
  await inicializarAdminSiVacio();
  return db.suscriptores.toArray();
}

/**
 * Agrega un nuevo correo a la lista de suscriptores activos.
 */
export async function agregarSuscriptor(entrada: {
  email: string;
  nombre?: string;
  plan?: Suscriptor['plan'];
  notas?: string;
}): Promise<Suscriptor> {
  const emailNorm = normalizarEmail(entrada.email);
  if (!emailNorm || !emailNorm.includes('@')) {
    throw new Error('Ingresa un correo electrónico válido');
  }

  const existente = await db.suscriptores.where('email').equals(emailNorm).first();
  if (existente) {
    // Si ya existe, lo reactivamos con el nuevo plan
    const actualizado: Suscriptor = {
      ...existente,
      nombre: entrada.nombre?.trim() || existente.nombre,
      plan: entrada.plan ?? existente.plan,
      activo: 1,
      notas: entrada.notas?.trim() ?? existente.notas,
    };
    await db.suscriptores.put(actualizado);
    return actualizado;
  }

  const nuevo: Suscriptor = {
    id: crypto.randomUUID(),
    email: emailNorm,
    nombre: entrada.nombre?.trim() || undefined,
    plan: entrada.plan ?? 'total40',
    activo: 1,
    fechaAlta: fechaHoyIso(),
    notas: entrada.notas?.trim() || undefined,
  };

  await db.suscriptores.add(nuevo);
  return nuevo;
}

/**
 * Cambia el estado de un suscriptor entre activo e inactivo.
 */
export async function alternarEstadoSuscriptor(id: string): Promise<Suscriptor | undefined> {
  const s = await db.suscriptores.get(id);
  if (!s) return undefined;

  const actualizado: Suscriptor = {
    ...s,
    activo: s.activo === 1 ? 0 : 1,
  };
  await db.suscriptores.put(actualizado);
  return actualizado;
}

/**
 * Elimina a un suscriptor del registro.
 */
export async function eliminarSuscriptor(id: string): Promise<void> {
  await db.suscriptores.delete(id);
}

/**
 * Lista todos los anuncios configurados en el panel de administración.
 */
export async function listarAnuncios(): Promise<AnuncioAdmin[]> {
  return db.anuncios.toArray();
}

/**
 * Obtiene el anuncio activo más reciente para mostrar en la cabecera de la app.
 */
export async function obtenerAnuncioActivo(): Promise<AnuncioAdmin | null> {
  try {
    const todos = await db.anuncios.toArray();
    const activos = todos.filter((a) => a.activo === 1);
    if (activos.length === 0) return null;
    return activos[activos.length - 1] ?? null;
  } catch {
    return null;
  }
}

/**
 * Guarda o actualiza un anuncio promocional o de actualización.
 */
export async function guardarAnuncio(anuncio: {
  tipo: AnuncioAdmin['tipo'];
  titulo: string;
  mensaje: string;
  enlace?: string;
  activo?: boolean;
}): Promise<AnuncioAdmin> {
  const nuevo: AnuncioAdmin = {
    id: crypto.randomUUID(),
    tipo: anuncio.tipo,
    titulo: anuncio.titulo.trim(),
    mensaje: anuncio.mensaje.trim(),
    enlace: anuncio.enlace?.trim() || undefined,
    activo: anuncio.activo === false ? 0 : 1,
    fecha: fechaHoyIso(),
  };

  await db.anuncios.add(nuevo);
  return nuevo;
}

/**
 * Cambia el estado de un anuncio (activo/inactivo).
 */
export async function alternarEstadoAnuncio(id: string): Promise<void> {
  const a = await db.anuncios.get(id);
  if (!a) return;
  await db.anuncios.put({
    ...a,
    activo: a.activo === 1 ? 0 : 1,
  });
}

/**
 * Elimina un anuncio.
 */
export async function eliminarAnuncio(id: string): Promise<void> {
  await db.anuncios.delete(id);
}

/**
 * Si no hay suscriptores cargados, inicializa los correos de administración.
 */
export async function inicializarAdminSiVacio(): Promise<void> {
  try {
    const cant = await db.suscriptores.count();
    if (cant === 0) {
      for (const email of EMAILS_ADMIN_POR_DEFECTO) {
        await db.suscriptores.add({
          id: crypto.randomUUID(),
          email,
          nombre: email.includes('caribia') ? 'Caribia Labs Admin' : 'Everth Admin',
          plan: 'vitalicio',
          activo: 1,
          fechaAlta: fechaHoyIso(),
          notas: 'Administrador del sistema',
        });
      }
    }
  } catch (error) {
    console.warn('Error inicializando suscriptores por defecto:', error);
  }
}
