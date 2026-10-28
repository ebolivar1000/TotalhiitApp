/**
 * FASE 8 — Cifrado local de los registros de ciclo (WebCrypto AES-GCM-256).
 * La clave se genera aleatoriamente en el dispositivo y se guarda SOLO en
 * localStorage; nunca viaja ni se exporta (D19). Limitación honesta: quien
 * tenga acceso COMPLETO al dispositivo (IndexedDB + localStorage) podría
 * recuperar la clave; el cifrado protege la base de datos sola (respaldos,
 * copias del archivo, lecturas directas de IndexedDB). En FASE 10 se evaluará
 * derivación con PIN para elevar el nivel.
 */

const ALGORITMO = 'AES-GCM';
const BITS = 256;
const LONGITUD_IV = 12;
export const LLAVE_CLAVE_CICLO = 'totalhiit.ciclo.clave';

export interface AlmacenClave {
  getItem(clave: string): string | null;
  setItem(clave: string, valor: string): void;
  removeItem(clave: string): void;
}

export function base64DeBytes(bytes: Uint8Array): string {
  let binario = '';
  for (const byte of bytes) binario += String.fromCharCode(byte);
  return btoa(binario);
}

export function bytesDeBase64(base64: string): Uint8Array<ArrayBuffer> {
  const binario = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(binario.length));
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

/** Clave aleatoria de 256 bits, codificada en base64 (para guardarla una sola vez). */
export function crearClaveBase64(): string {
  return base64DeBytes(crypto.getRandomValues(new Uint8Array(BITS / 8)));
}

export async function importarClave(base64: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', bytesDeBase64(base64), ALGORITMO, false, ['encrypt', 'decrypt']);
}

/** Cifra JSON con AES-GCM: devuelve "iv.codificado" en base64 (IV nuevo por llamada). */
export async function cifrarConClave(clave: CryptoKey, valor: unknown): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(LONGITUD_IV));
  const datos = new Uint8Array(new TextEncoder().encode(JSON.stringify(valor)));
  const cifrado = new Uint8Array(await crypto.subtle.encrypt({ name: ALGORITMO, iv }, clave, datos));
  return `${base64DeBytes(iv)}.${base64DeBytes(cifrado)}`;
}

/** Descifra el blob producido por cifrarConClave. Falla si el dato o la clave no corresponden. */
export async function descifrarConClave<T>(clave: CryptoKey, blob: string): Promise<T> {
  const partes = blob.split('.');
  const iv = partes[0];
  const texto = partes[1];
  if (!iv || !texto) throw new Error('Registro de ciclo corrupto');
  const descifrado = await crypto.subtle.decrypt({ name: ALGORITMO, iv: bytesDeBase64(iv) }, clave, bytesDeBase64(texto));
  return JSON.parse(new TextDecoder().decode(descifrado)) as T;
}

/** Resuelve localStorage de forma segura (en Node no existe si no se lo provee). */
function resolverAlmacen(): AlmacenClave | undefined {
  try {
    if (typeof localStorage !== 'undefined' && localStorage) return localStorage;
  } catch {
    return undefined;
  }
  return undefined;
}

/** Obtiene (o crea la primera vez) la clave local del dispositivo. */
export async function obtenerOCrearClaveCiclo(almacen?: AlmacenClave): Promise<CryptoKey> {
  const destino = almacen ?? resolverAlmacen();
  if (!destino) throw new Error('No hay almacenamiento local disponible para la clave del ciclo');
  let base64 = destino.getItem(LLAVE_CLAVE_CICLO);
  if (!base64) {
    base64 = crearClaveBase64();
    destino.setItem(LLAVE_CLAVE_CICLO, base64);
  }
  return importarClave(base64);
}

/** Elimina la clave local (borrado total de datos). */
export function borrarClaveCiclo(almacen?: AlmacenClave): void {
  const destino = almacen ?? resolverAlmacen();
  destino?.removeItem(LLAVE_CLAVE_CICLO);
}
