export const VERSION_ACTUAL = '1.0.1';
export const BUILD_ACTUAL = 2;

export interface InfoVersion {
  version: string;
  buildNumber: number;
  releaseDate: string;
  apkUrl: string;
  novedades: string[];
}

export interface ResultadoActualizacion {
  disponible: boolean;
  versionRemota?: InfoVersion;
  mensaje: string;
}

/**
 * Consulta la última versión disponible en el servidor.
 * No requiere store ni servicios externos, solo el manifest estático /version.json.
 */
export async function consultarActualizacion(): Promise<ResultadoActualizacion> {
  try {
    const respuesta = await fetch(`/version.json?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { Pragma: 'no-cache' },
    });
    if (!respuesta.ok) {
      return {
        disponible: false,
        mensaje: 'No se pudo verificar la versión en el servidor.',
      };
    }
    const datos = (await respuesta.json()) as InfoVersion;
    const esMasNueva = datos.buildNumber > BUILD_ACTUAL || datos.version !== VERSION_ACTUAL;

    if (esMasNueva) {
      return {
        disponible: true,
        versionRemota: datos,
        mensaje: `¡Nueva versión ${datos.version} disponible!`,
      };
    }

    return {
      disponible: false,
      versionRemota: datos,
      mensaje: `Ya tienes instalada la versión más reciente (v${VERSION_ACTUAL}).`,
    };
  } catch (error) {
    return {
      disponible: false,
      mensaje: 'Error de conexión al buscar actualizaciones.',
    };
  }
}
