import { describe, it, expect } from 'vitest';
import {
  esPinValido,
  generarSalt,
  cifrarConPin,
  descifrarConPin,
  crearVerificadorPin,
  verificarPin,
  derivarClaveDesdePin,
} from './pin-crypto';

describe('FASE 10 — Criptografía Zero-Knowledge con PIN', () => {
  it('valida que el PIN tenga longitud mínima de 6 caracteres', () => {
    expect(esPinValido('')).toBe(false);
    expect(esPinValido('12345')).toBe(false);
    expect(esPinValido('123456')).toBe(true);
    expect(esPinValido('mi-frase-secreta')).toBe(true);
  });

  it('rechaza derivar clave si el PIN es inválido', async () => {
    const salt = generarSalt();
    await expect(derivarClaveDesdePin('123', salt)).rejects.toThrow(
      'El PIN de seguridad debe tener al menos 6 caracteres.'
    );
  });

  it('cifra y descifra correctamente un registro íntimo de ciclo con el PIN correcto', async () => {
    const pin = 'secreto789';
    const payloadIntimo = {
      fecha: '2026-10-28',
      flujo: 'moderado',
      sintomas: ['colicos', 'dolor_lumbar'],
      notas: 'Prueba confidencial de ciclo menstrual',
    };

    const sobre = await cifrarConPin(pin, payloadIntimo);

    expect(sobre.salt).toBeDefined();
    expect(sobre.iv).toBeDefined();
    expect(sobre.ciphertext).toBeDefined();
    // El ciphertext no debe contener texto en claro
    expect(sobre.ciphertext).not.toContain('colicos');
    expect(sobre.ciphertext).not.toContain('Prueba confidencial');

    const descifrado = await descifrarConPin<typeof payloadIntimo>(pin, sobre);
    expect(descifrado).toEqual(payloadIntimo);
  });

  it('falla al descifrar si el PIN es incorrecto', async () => {
    const pinCorrecto = 'pinCorrecto123';
    const pinIncorrecto = 'pinErroneo999';

    const sobre = await cifrarConPin(pinCorrecto, { secreto: 'muy_sensible' });

    await expect(descifrarConPin(pinIncorrecto, sobre)).rejects.toThrow(
      'No se pudo descifrar: PIN incorrecto o datos manipulados.'
    );
  });

  it('falla si el ciphertext es alterado (integridad AES-GCM)', async () => {
    const pin = 'pinValido1234';
    const sobre = await cifrarConPin(pin, { dato: 123 });

    // Modificamos el último caracter de base64
    const manipulado = {
      ...sobre,
      ciphertext: sobre.ciphertext.slice(0, -2) + 'AA',
    };

    await expect(descifrarConPin(pin, manipulado)).rejects.toThrow();
  });

  it('permite verificar la validez del PIN con un verificador criptográfico sin exponer el PIN', async () => {
    const pin = 'miClaveSegura2026';
    const verificador = await crearVerificadorPin(pin);

    // Debe verificar exitosamente con el PIN exacto
    const esValido = await verificarPin(pin, verificador);
    expect(esValido).toBe(true);

    // Debe rechazar un PIN erróneo
    const esInvalido = await verificarPin('otraClave999', verificador);
    expect(esInvalido).toBe(false);

    // Debe rechazar un PIN demasiado corto sin lanzar excepción
    const corto = await verificarPin('123', verificador);
    expect(corto).toBe(false);
  });
});
