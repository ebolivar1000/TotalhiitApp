export const VERSION_ACTUAL = '1.0.5';
export const BUILD_ACTUAL = 6;

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
 * Compatible tanto con Capacitor (Android nativo usando CapacitorHttp para saltar CORS) como con la Web.
 */
export async function consultarActualizacion(urlCustom?: string): Promise<ResultadoActualizacion> {
  const url = urlCustom || URL_REMOTA_VERSION;
  try {
    let datos: InfoVersion | null = null;

    // 1. Si estamos en Capacitor nativo (Android), usamos CapacitorHttp nativo para evitar bloqueos CORS
    if (
      typeof window !== 'undefined' &&
      Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.())
    ) {
      try {
        const { CapacitorHttp } = await import('@capacitor/core');
        const respuestaNativa = await CapacitorHttp.get({
          url: `${url}?_t=${Date.now()}`,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
        });
        if (respuestaNativa.status >= 200 && respuestaNativa.status < 300 && respuestaNativa.data) {
          datos = typeof respuestaNativa.data === 'string'
            ? (JSON.parse(respuestaNativa.data) as InfoVersion)
            : (respuestaNativa.data as InfoVersion);
        }
      } catch (errCap) {
        console.warn('CapacitorHttp no disponible o falló, recurriendo a fetch estándar:', errCap);
      }
    }

    // 2. Fallback estándar con fetch del navegador
    if (!datos) {
      const respuesta = await fetch(`${url}?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
      if (!respuesta.ok) {
        return {
          disponible: false,
          mensaje: 'No se pudo verificar la versión en el servidor.',
        };
      }
      datos = (await respuesta.json()) as InfoVersion;
    }

    if (!datos || typeof datos.buildNumber !== 'number') {
      return {
        disponible: false,
        mensaje: 'La respuesta del servidor no tiene un formato de versión válido.',
      };
    }

    const esMasNueva = datos.buildNumber > BUILD_ACTUAL || datos.version !== VERSION_ACTUAL;

    if (esMasNueva) {
      return {
        disponible: true,
        versionRemota: datos,
        mensaje: `¡Nueva versión v${datos.version} disponible!`,
      };
    }

    return {
      disponible: false,
      versionRemota: datos,
      mensaje: `Ya tienes instalada la versión más reciente (v${VERSION_ACTUAL} · Build ${BUILD_ACTUAL}).`,
    };
  } catch (error) {
    return {
      disponible: false,
      mensaje: 'Error de conexión al buscar actualizaciones.',
    };
  }
}
