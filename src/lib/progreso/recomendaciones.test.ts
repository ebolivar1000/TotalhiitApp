import { describe, expect, it } from 'vitest';
import type { EntradaDiario } from '../datos/entidades';
import { sugerenciasDashboard, type ContextoSugerencias } from './recomendaciones';

const H = '2026-10-28';

let contador = 0;
function entrada(parcial: Partial<EntradaDiario> & { fecha: string }): EntradaDiario {
  contador++;
  return {
    id: `e${contador}`,
    userId: 'u1',
    createdAt: contador,
    updatedAt: contador,
    ...parcial,
  };
}

function contexto(parcial: Partial<ContextoSugerencias>): ContextoSugerencias {
  return {
    hoy: H,
    entradas: [],
    sesionesUltimos7Dias: 3,
    sesionesSemanaPasada: 3,
    vasosHoy: undefined,
    metaVasos: 9,
    ultimaFechaPeso: H,
    sugerenciaEntrenamiento: 'Full body con mancuernas',
    sugerenciaReceta: 'Bowl de pollo y quinoa',
    ...parcial,
  };
}

describe('sugerenciasDashboard', () => {
  it('sin sesiones en 7 días sugiere retomar con tono positivo', () => {
    const s = sugerenciasDashboard(contexto({ sesionesUltimos7Dias: 0, sesionesSemanaPasada: 2 }));
    expect(s[0]?.id).toBe('entrenamiento');
    expect(s[0]?.titulo).toContain('Full body con mancuernas');
    expect(s[0]?.detalle).not.toMatch(/culpa|fallaste/i);
  });

  it('compara contra la semana pasada cuando hubo menos sesiones', () => {
    const s = sugerenciasDashboard(contexto({ sesionesUltimos7Dias: 1, sesionesSemanaPasada: 3 }));
    const entrenamiento = s.find((x) => x.id === 'entrenamiento');
    expect(entrenamiento?.titulo).toBe('Sumá una sesión más esta semana');
    expect(entrenamiento?.detalle).toContain('1 en los últimos 7 días vs 3');
  });

  it('no sugiere entrenar si la semana va igual o mejor que la pasada', () => {
    const s = sugerenciasDashboard(contexto({ sesionesUltimos7Dias: 3, sesionesSemanaPasada: 3 }));
    expect(s.find((x) => x.id === 'entrenamiento')).toBeUndefined();
  });

  it('sugiere hidratación solo si registró vasos y quedó debajo de la meta', () => {
    const conFalta = sugerenciasDashboard(contexto({ vasosHoy: 4, metaVasos: 9 }));
    expect(conFalta.find((x) => x.id === 'hidratacion')?.titulo).toContain('4 de ~9');
    expect(sugerenciasDashboard(contexto({ vasosHoy: 9, metaVasos: 9 })).find((x) => x.id === 'hidratacion')).toBeUndefined();
    expect(sugerenciasDashboard(contexto({ vasosHoy: undefined, metaVasos: 9 })).find((x) => x.id === 'hidratacion')).toBeUndefined();
  });

  it('sugiere dormir más si el promedio de 7 días baja de 7 h', () => {
    const entradas = [
      entrada({ fecha: '2026-10-26', horasSueno: 6 }),
      entrada({ fecha: '2026-10-27', horasSueno: 6.5 }),
    ];
    const s = sugerenciasDashboard(contexto({ entradas }));
    const sueno = s.find((x) => x.id === 'sueno');
    expect(sueno?.titulo).toContain('~6.3 h');
  });

  it('sugiere registrarse si nunca hubo peso o pasaron más de 14 días', () => {
    expect(sugerenciasDashboard(contexto({ ultimaFechaPeso: undefined })).find((x) => x.id === 'peso')).toBeDefined();
    expect(sugerenciasDashboard(contexto({ ultimaFechaPeso: '2026-10-01' })).find((x) => x.id === 'peso')).toBeDefined();
    expect(sugerenciasDashboard(contexto({ ultimaFechaPeso: '2026-10-20' })).find((x) => x.id === 'peso')).toBeUndefined();
  });

  it('siempre cierra con la receta sugerida y devuelve máximo 3', () => {
    const s = sugerenciasDashboard(
      contexto({
        sesionesUltimos7Dias: 0,
        sesionesSemanaPasada: 3,
        vasosHoy: 1,
        metaVasos: 9,
        ultimaFechaPeso: undefined,
        entradas: [entrada({ fecha: '2026-10-27', horasSueno: 5 })],
      }),
    );
    expect(s).toHaveLength(3);
    expect(s.map((x) => x.id)).toEqual(['entrenamiento', 'hidratacion', 'sueno']);
    expect(sugerenciasDashboard(contexto({})).at(-1)?.id).toBe('receta');
  });
});
