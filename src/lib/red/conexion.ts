/**
 * FASE 11 — Monitor de Conectividad y Resiliencia Offline.
 *
 * Administra el estado de conexión a la red de forma desacoplada de React
 * para permitir pruebas unitarias limpias y suscripción de alto rendimiento
 * mediante useSyncExternalStore.
 */

export type EscuchaConexion = (online: boolean) => void;

export class MonitorConexion {
  private online: boolean;
  private escuchas = new Set<EscuchaConexion>();
  private limpiadorWindow?: () => void;

  constructor(inicial?: boolean) {
    if (typeof inicial === 'boolean') {
      this.online = inicial;
    } else if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      this.online = navigator.onLine;
    } else {
      this.online = true;
    }

    this.iniciarEscuchasWindow();
  }

  private iniciarEscuchasWindow(): void {
    if (typeof window === 'undefined') return;

    const onOnline = () => this.setEstado(true);
    const onOffline = () => this.setEstado(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    this.limpiadorWindow = () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }

  public estaOnline(): boolean {
    return this.online;
  }

  public setEstado(nuevoEstado: boolean): void {
    if (this.online !== nuevoEstado) {
      this.online = nuevoEstado;
      this.escuchas.forEach((fn) => fn(this.online));
    }
  }

  public suscribir(callback: EscuchaConexion): () => void {
    this.escuchas.add(callback);
    return () => {
      this.escuchas.delete(callback);
    };
  }

  public destruir(): void {
    this.limpiadorWindow?.();
    this.escuchas.clear();
  }
}

/** Instancia singleton compartida por la aplicación */
export const monitorConexion = new MonitorConexion();
