/**
 * Utilidades para detección de entorno iOS, Safari, PWA Standalone y navegadores in-app.
 */

export interface EstadoDispositivoIos {
  esIos: boolean;
  esIphone: boolean;
  esIpad: boolean;
  esSafari: boolean;
  esStandalone: boolean;
  esNavegadorInApp: boolean;
}

const LLAVE_BANNER_IOS_DESCARTADO = 'totalhiit_pwa_ios_descartado';

/**
 * Detecta si el dispositivo actual es iOS (iPhone, iPad o iPod).
 */
export function detectarDispositivoIos(): EstadoDispositivoIos {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      esIos: false,
      esIphone: false,
      esIpad: false,
      esSafari: false,
      esStandalone: false,
      esNavegadorInApp: false,
    };
  }

  const ua = (navigator.userAgent || '').toLowerCase();
  const platform = (navigator.platform || '').toLowerCase();

  // Detección de iPhone, iPod
  const esIphone = /iphone|ipod/.test(ua);

  // iPad moderno reporta Macintosh en userAgent pero tiene maxTouchPoints > 1
  const esIpad =
    /ipad/.test(ua) || (platform.includes('mac') && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1);

  const esIos = esIphone || esIpad;

  // Detección de navegador in-app (WhatsApp, Instagram, Facebook, Messenger, Telegram)
  const esNavegadorInApp =
    ua.includes('whatsapp') ||
    ua.includes('fban') ||
    ua.includes('fbav') ||
    ua.includes('instagram') ||
    ua.includes('telegram') ||
    ua.includes('line') ||
    ua.includes('crios') || // Chrome en iOS
    ua.includes('fxios'); // Firefox en iOS

  // Safari nativo en iOS (tiene 'safari', 'mobile' o 'version' y NO es Chrome/Firefox/In-app)
  const esSafari =
    esIos &&
    /safari/.test(ua) &&
    !esNavegadorInApp &&
    !ua.includes('crios') &&
    !ua.includes('fxios') &&
    !ua.includes('edgios');

  // Detectar si ya está corriendo como PWA en pantalla de inicio (Standalone)
  const navigatorConStandalone = navigator as unknown as { standalone?: boolean };
  const esStandalone =
    Boolean(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    Boolean(navigatorConStandalone.standalone === true);

  return {
    esIos,
    esIphone,
    esIpad,
    esSafari,
    esStandalone,
    esNavegadorInApp,
  };
}

/**
 * Verifica si se debe mostrar el banner de instalación para iOS.
 * Condición: Dispositivo iOS, no instalado en standalone, y no descartado recientemente.
 */
export function debeMostrarBannerIos(): boolean {
  if (typeof window === 'undefined') return false;

  const estado = detectarDispositivoIos();
  if (!estado.esIos || estado.esStandalone) {
    return false;
  }

  try {
    const descarte = localStorage.getItem(LLAVE_BANNER_IOS_DESCARTADO);
    if (!descarte) return true;

    const fechaDescarte = Number(descarte);
    if (isNaN(fechaDescarte)) return true;

    // Si pasaron más de 3 días desde que lo descartó, volver a recordar sutilmente
    const TRES_DIAS_MS = 3 * 24 * 60 * 60 * 1000;
    return Date.now() - fechaDescarte > TRES_DIAS_MS;
  } catch {
    return true;
  }
}

/**
 * Guarda en localStorage que el usuario descartó el banner para no molestarlo.
 */
export function marcarBannerIosDescartado(): void {
  try {
    localStorage.setItem(LLAVE_BANNER_IOS_DESCARTADO, String(Date.now()));
  } catch {
    // Modo privado o storage no disponible
  }
}

/**
 * Restablece el descarte (útil para pruebas o cuando el usuario hace clic en "Ver guía").
 */
export function restablecerBannerIos(): void {
  try {
    localStorage.removeItem(LLAVE_BANNER_IOS_DESCARTADO);
  } catch {
    // Silencioso
  }
}
