export const VERSION_ACTUAL = '1.0.3';
export const BUILD_ACTUAL = 4;

export const URL_REMOTA_VERSION = 'https://totalhiit-app.caribialabs.workers.dev/version.json';

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
 * Consulta la última versión disponible en el servidor remoto.
 * Compatible tanto con Capacitor (Android nativo) como con la Web.
 */
export async function consultarActualizacion(urlCustom?: string): Promise<ResultadoActualizacion> {
  const url = urlCustom || URL_REMOTA_VERSION;
  try {
    const respuesta = await fetch(`${url}?_t=${Date.now()}`, {
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
