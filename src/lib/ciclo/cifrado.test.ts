import { describe, expect, it } from 'vitest';
import {
  borrarClaveCiclo,
  cifrarConClave,
  crearClaveBase64,
  descifrarConClave,
  importarClave,
  obtenerOCrearClaveCiclo,
  type AlmacenClave,
} from './cifrado';

describe('cifrado del ciclo (FASE 8)', () => {
  it('cifra y descifra un objeto con acentos y ñ', async () => {
    const clave = await importarClave(crearClaveBase64());
    const valor = { flujo: 'abundante', sintomas: ['cólicos', 'dolor de cabeza'], notas: '¡Ñoño año!' };
    const blob = await cifrarConClave(clave, valor);
    const recuperado = await descifrarConClave<typeof valor>(clave, blob);
    expect(recuperado).toEqual(valor);
  });

  it('el blob nunca contiene el texto plano', async () => {
    const clave = await importarClave(crearClaveBase64());
    const blob = await cifrarConClave(clave, { flujo: 'abundante', sintomas: [], notas: 'secreto' });
    expect(blob).not.toContain('abundante');
    expect(blob).not.toContain('secreto');
  });

  it('usa un IV nuevo por llamada (dos cifrados difieren)', async () => {
    const clave = await importarClave(crearClaveBase64());
    const a = await cifrarConClave(clave, { flujo: 'medio', sintomas: [] });
    const b = await cifrarConClave(clave, { flujo: 'medio', sintomas: [] });
    expect(a).not.toBe(b);
  });

  it('falla con una clave distinta o datos alterados', async () => {
    const claveA = await importarClave(crearClaveBase64());
    const claveB = await importarClave(crearClaveBase64());
    const blob = await cifrarConClave(claveA, { flujo: 'ligero', sintomas: [] });
    await expect(descifrarConClave(claveB, blob)).rejects.toThrow();
    await expect(descifrarConClave(claveA, `${blob}x`)).rejects.toThrow();
  });

  it('obtenerOCrearClaveCiclo crea una vez y reutiliza', async () => {
    const memoria = new Map<string, string>();
    const almacen: AlmacenClave = {
      getItem: (k) => memoria.get(k) ?? null,
      setItem: (k, v) => void memoria.set(k, v),
      removeItem: (k) => void memoria.delete(k),
    };
    const clave1 = await obtenerOCrearClaveCiclo(almacen);
    const guardada = memoria.get('totalhiit.ciclo.clave');
    expect(guardada).toBeTruthy();
    const clave2 = await obtenerOCrearClaveCiclo(almacen);
    expect(memoria.get('totalhiit.ciclo.clave')).toBe(guardada);
    const blob = await cifrarConClave(clave1, { flujo: 'ligero', sintomas: [] });
    expect(await descifrarConClave(clave2, blob)).toEqual({ flujo: 'ligero', sintomas: [] });
    borrarClaveCiclo(almacen);
    expect(memoria.get('totalhiit.ciclo.clave')).toBeUndefined();
  });
});
