import { describe, it, expect, vi } from 'vitest';
import { MonitorConexion } from './conexion';

describe('FASE 11 — Monitor de Conectividad y Resiliencia Offline', () => {
  it('inicializa con el estado online provisto o por defecto true', () => {
    const monitorTrue = new MonitorConexion(true);
    expect(monitorTrue.estaOnline()).toBe(true);

    const monitorFalse = new MonitorConexion(false);
    expect(monitorFalse.estaOnline()).toBe(false);
  });

  it('notifica a los suscriptores cuando cambia el estado de conexión', () => {
    const monitor = new MonitorConexion(true);
    const listener = vi.fn();

    const desuscribir = monitor.suscribir(listener);

    monitor.setEstado(false);
    expect(monitor.estaOnline()).toBe(false);
    expect(listener).toHaveBeenCalledWith(false);

    monitor.setEstado(true);
    expect(monitor.estaOnline()).toBe(true);
    expect(listener).toHaveBeenCalledWith(true);

    desuscribir();

    monitor.setEstado(false);
    // No debe llamarse tras desuscribir
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('no notifica si se asigna el mismo estado que ya tenía', () => {
    const monitor = new MonitorConexion(true);
    const listener = vi.fn();
    monitor.suscribir(listener);

    monitor.setEstado(true);
    expect(listener).not.toHaveBeenCalled();
  });
});
