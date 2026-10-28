import { describe, expect, it } from 'vitest';
import type { EntradaDiario } from '../datos/entidades';
import {
  diasEntre,
  lunesDeSemana,
  promedioUltimosDias,
  rachaDiasActivos,
  resumenesSemanales,
  sumarDias,
  tendenciaPeso,
} from './metricas';

const H = '2026-10-28'; // miércoles

let contador = 0;
function entrada(parcial: Partial<EntradaDiario> & { fecha: string }): EntradaDiario {
  contador++;
  return {
    id: `e${contador}`,
    userId: 'u1',
    energiaNivel: undefined,
    animoNivel: undefined,
    horasSueno: undefined,
    calidadSueno: undefined,
    vasosAgua: undefined,
    pesoKg: undefined,
    notas: undefined,
    createdAt: contador,
    updatedAt: contador,
    ...parcial,
  };
}

describe('utilidades de calendario', () => {
  it('sumarDias cruza límites de mes', () => {
    expect(sumarDias('2026-10-31', 1)).toBe('2026-11-01');
    expect(sumarDias('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('diasEntre calcula la diferencia en días', () => {
    expect(diasEntre('2026-10-01', '2026-10-28')).toBe(27);
    expect(diasEntre('2026-10-28', '2026-10-01')).toBe(-27);
  });

  it('lunesDeSemana devuelve el lunes de la semana', () => {
    expect(lunesDeSemana('2026-10-28')).toBe('2026-10-26'); // miércoles
    expect(lunesDeSemana('2026-10-26')).toBe('2026-10-26'); // lunes
    expect(lunesDeSemana('2026-10-25')).toBe('2026-10-19'); // domingo
  });
});

describe('rachaDiasActivos', () => {
  it('cuenta días consecutivos terminando hoy', () => {
    expect(rachaDiasActivos([`${H}`, '2026-10-27', '2026-10-26'], H)).toBe(3);
  });

  it('se mantiene si el último día activo fue ayer', () => {
    expect(rachaDiasActivos(['2026-10-27', '2026-10-26'], H)).toBe(2);
  });

  it('vuelve a cero si el último día activo es anterior a ayer', () => {
    expect(rachaDiasActivos(['2026-10-26'], H)).toBe(0);
    expect(rachaDiasActivos([], H)).toBe(0);
  });

  it('corta en el primer hueco e ignora duplicados', () => {
    expect(rachaDiasActivos([`${H}`, '2026-10-26'], H)).toBe(1);
    expect(rachaDiasActivos([`${H}`, `${H}`, '2026-10-27'], H)).toBe(2);
  });
});

describe('promedioUltimosDias', () => {
  const entradas = [
    entrada({ fecha: '2026-10-22', energiaNivel: 5 }),
    entrada({ fecha: '2026-10-26', energiaNivel: 3 }),
    entrada({ fecha: '2026-10-27', horasSueno: 6 }),
    entrada({ fecha: '2026-10-28', energiaNivel: 4, horasSueno: 8 }),
  ];

  it('promedia solo la ventana de días con datos', () => {
    // Ventana de 7 días: 10-22..10-28 → (5+3+4)/3
    expect(promedioUltimosDias(entradas, 'energiaNivel', 7, H)).toBe(4);
    // Ventana de 5 días: 10-24..10-28 → excluye el registro del 22 → (3+4)/2
    expect(promedioUltimosDias(entradas, 'energiaNivel', 5, H)).toBe(3.5);
    expect(promedioUltimosDias(entradas, 'horasSueno', 7, H)).toBe(7);
  });

  it('devuelve null si no hay datos en la ventana', () => {
    expect(promedioUltimosDias(entradas, 'vasosAgua', 7, H)).toBeNull();
    expect(promedioUltimosDias([], 'energiaNivel', 7, H)).toBeNull();
  });
});

describe('tendenciaPeso', () => {
  it('compara el registro más reciente contra el más antiguo de la ventana', () => {
    const entradas = [
      entrada({ fecha: '2026-10-01', pesoKg: 70 }),
      entrada({ fecha: '2026-10-15', pesoKg: 68.8 }),
      entrada({ fecha: '2026-10-27', pesoKg: 68.2 }),
    ];
    const t = tendenciaPeso(entradas, H, 30);
    expect(t).not.toBeNull();
    expect(t?.pesoAnterior).toBe(70);
    expect(t?.pesoActual).toBe(68.2);
    expect(t?.deltaKg).toBe(-1.8);
  });

  it('respeta la ventana (30 días por defecto)', () => {
    const entradas = [
      entrada({ fecha: '2026-09-01', pesoKg: 70 }),
      entrada({ fecha: '2026-10-20', pesoKg: 68 }),
    ];
    expect(tendenciaPeso(entradas, H)).toBeNull(); // el registro viejo queda fuera
    expect(tendenciaPeso(entradas, H, 60)?.deltaKg).toBe(-2);
  });

  it('necesita al menos dos registros con peso', () => {
    expect(tendenciaPeso([entrada({ fecha: H, pesoKg: 70 })], H)).toBeNull();
    expect(tendenciaPeso([], H)).toBeNull();
  });
});

describe('resumenesSemanales', () => {
  it('arma semanas de lunes a domingo con la semana en curso primero', () => {
    const entradas = [
      entrada({ fecha: '2026-10-26', horasSueno: 7, energiaNivel: 4, vasosAgua: 6 }),
      entrada({ fecha: '2026-10-28', horasSueno: 8 }),
      entrada({ fecha: '2026-10-15', energiaNivel: 2 }),
      entrada({ fecha: '2026-10-08', horasSueno: 9 }),
    ];
    const sesiones = ['2026-10-26', '2026-10-28', '2026-10-10'];
    const semanas = resumenesSemanales(entradas, sesiones, H, 4);
    expect(semanas).toHaveLength(4);
    expect(semanas[0]?.inicio).toBe('2026-10-26');
    expect(semanas[0]?.diasActivos).toBe(2);
    expect(semanas[0]?.promedioSueno).toBe(7.5);
    expect(semanas[0]?.promedioEnergia).toBe(4);
    expect(semanas[0]?.registros).toBe(2);

    expect(semanas[1]?.inicio).toBe('2026-10-19');
    expect(semanas[1]?.diasActivos).toBe(0);
    expect(semanas[1]?.promedioEnergia).toBeNull();

    expect(semanas[2]?.inicio).toBe('2026-10-12');
    expect(semanas[2]?.promedioEnergia).toBe(2); // entrada del 10-15
    expect(semanas[2]?.diasActivos).toBe(0);

    expect(semanas[3]?.inicio).toBe('2026-10-05');
    expect(semanas[3]?.diasActivos).toBe(1); // sesión del 10-10
    expect(semanas[3]?.promedioSueno).toBe(9); // entrada del 10-08
  });

  it('devuelve null en promedios sin datos', () => {
    const semanas = resumenesSemanales([], [], H, 1);
    expect(semanas[0]?.promedioSueno).toBeNull();
    expect(semanas[0]?.promedioVasos).toBeNull();
  });
});
