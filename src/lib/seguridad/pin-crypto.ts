/**
 * FASE 10 — Criptografía Zero-Knowledge derivada de PIN (WebCrypto PBKDF2 + AES-GCM).
 * Permite cifrar datos íntimos (ciclo menstrual) antes de sincronizarlos al servidor,
 * garantizando que el servidor jamás posea la clave ni pueda descifrar el contenido.
 */

const ALGORITMO_CIFRADO = 'AES-GCM';
const ALGORITMO_DERIVACION = 'PBKDF2';
const BITS_CLAVE = 256;
const ITERACIONES_PBKDF2 = 100_000;
const LONGITUD_IV = 12;
const LONGITUD_SALT = 16;
const SENTINELA_VERIFICACION = 'TOTALHIIT_ZK_VALID';

export interface SobrePinCifrado {
  salt: string;       // Base64 (16 bytes)
  iv: string;         // Base64 (12 bytes)
  ciphertext: string; // Base64
}

export interface VerificadorPin {
  salt: string;       // Base64
  iv: string;         // Base64
  verificador: string;// Base64 con el sentinela cifrado
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

/** Genera una sal criptográfica de 16 bytes. */
export function generarSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(LONGITUD_SALT));
}

/** Valida que el PIN cumpla con el estándar mínimo (mínimo 6 caracteres). */
export function esPinValido(pin: string): boolean {
  return typeof pin === 'string' && pin.trim().length >= 6;
}

/**
 * Deriva una CryptoKey AES-GCM-256 a partir de un PIN y una sal usando PBKDF2 (SHA-256).
 */
export async function derivarClaveDesdePin(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  if (!esPinValido(pin)) {
    throw new Error('El PIN de seguridad debe tener al menos 6 caracteres.');
  }

  const encoder = new TextEncoder();
  const materialClave = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    ALGORITMO_DERIVACION,
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: ALGORITMO_DERIVACION,
      salt: salt as BufferSource,
      iterations: ITERACIONES_PBKDF2,
      hash: 'SHA-256',
    },
    materialClave,
    { name: ALGORITMO_CIFRADO, length: BITS_CLAVE },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Cifra un objeto o valor con una clave derivada del PIN.
 * Devuelve un SobrePinCifrado con { salt, iv, ciphertext } en Base64.
 */
export async function cifrarConPin(
  pin: string,
  valor: unknown,
  saltOpcional?: Uint8Array
): Promise<SobrePinCifrado> {
  const salt = saltOpcional ?? generarSalt();
  const clave = await derivarClaveDesdePin(pin, salt);
  const iv = crypto.getRandomValues(new Uint8Array(LONGITUD_IV));
  const datos = new TextEncoder().encode(JSON.stringify(valor));

  const bufferCifrado = await crypto.subtle.encrypt(
    { name: ALGORITMO_CIFRADO, iv: iv as BufferSource },
    clave,
    datos as BufferSource
  );

  return {
    salt: base64DeBytes(salt),
    iv: base64DeBytes(iv),
    ciphertext: base64DeBytes(new Uint8Array(bufferCifrado)),
  };
}

/**
 * Descifra un SobrePinCifrado usando el PIN de seguridad.
 * Lanza un error si el PIN es incorrecto o el contenido fue manipulado.
 */
export async function descifrarConPin<T>(pin: string, sobre: SobrePinCifrado): Promise<T> {
  const salt = bytesDeBase64(sobre.salt);
  const iv = bytesDeBase64(sobre.iv);
  const ciphertext = bytesDeBase64(sobre.ciphertext);

  const clave = await derivarClaveDesdePin(pin, salt);

  try {
    const bufferDescifrado = await crypto.subtle.decrypt(
      { name: ALGORITMO_CIFRADO, iv: iv as BufferSource },
      clave,
      ciphertext as BufferSource
    );
    const texto = new TextDecoder().decode(bufferDescifrado);
    return JSON.parse(texto) as T;
  } catch {
    throw new Error('No se pudo descifrar: PIN incorrecto o datos manipulados.');
  }
}

/**
 * Crea un verificador criptográfico para validar si el PIN ingresado por el usuario
 * es correcto en el dispositivo sin necesidad de almacenar el PIN ni la clave derivada.
 */
export async function crearVerificadorPin(pin: string): Promise<VerificadorPin> {
  const sobre = await cifrarConPin(pin, SENTINELA_VERIFICACION);
  return {
    salt: sobre.salt,
    iv: sobre.iv,
    verificador: sobre.ciphertext,
  };
}

/**
 * Verifica si un PIN corresponde al verificador almacenado.
 * Retorna true si es correcto, false si es incorrecto.
 */
export async function verificarPin(pin: string, verificador: VerificadorPin): Promise<boolean> {
  if (!esPinValido(pin)) return false;
  try {
    const descifrado = await descifrarConPin<string>(pin, {
      salt: verificador.salt,
      iv: verificador.iv,
      ciphertext: verificador.verificador,
    });
    return descifrado === SENTINELA_VERIFICACION;
  } catch {
    return false;
  }
}
