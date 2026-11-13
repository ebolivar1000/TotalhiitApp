/**
 * Utilidad Screen Wake Lock API.
 * Mantiene la pantalla encendida en iOS y Android durante los entrenamientos HIIT.
 */

export interface WakeLockControl {
  activo: boolean;
  liberar: () => Promise<void>;
}

interface WakeLockSentinelLike {
  release: () => Promise<void>;
  released: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
}

interface NavigatorWithWakeLock {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinelLike>;
  };
}

let wakeLockSentinel: WakeLockSentinelLike | null = null;

/**
 * Solicita que la pantalla no se apague.
 * Retorna true si se activó con éxito, false si el navegador no lo soporta.
 */
export async function activarWakeLock(): Promise<boolean> {
  if (typeof navigator === 'undefined') return false;

  const nav = navigator as unknown as NavigatorWithWakeLock;
  if (!nav.wakeLock || typeof nav.wakeLock.request !== 'function') {
    return false;
  }

  try {
    // Si ya hay uno activo, no duplicar
    if (wakeLockSentinel && !wakeLockSentinel.released) {
      return true;
    }

    wakeLockSentinel = await nav.wakeLock.request('screen');
    wakeLockSentinel.addEventListener?.('release', () => {
      wakeLockSentinel = null;
    });
    return true;
  } catch {
    // Puede fallar si la batería está muy baja o la pestaña no está visible
    wakeLockSentinel = null;
    return false;
  }
}

/**
 * Libera el bloqueo de pantalla para volver al comportamiento normal del sistema.
 */
export async function desactivarWakeLock(): Promise<void> {
  if (wakeLockSentinel && !wakeLockSentinel.released) {
    try {
      await wakeLockSentinel.release();
    } catch {
      // Ignorar errores al liberar
    } finally {
      wakeLockSentinel = null;
    }
  }
}

/**
 * Consulta si el dispositivo soporta Wake Lock API.
 */
export function soportaWakeLock(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as unknown as NavigatorWithWakeLock;
  return Boolean(nav.wakeLock && typeof nav.wakeLock.request === 'function');
}
