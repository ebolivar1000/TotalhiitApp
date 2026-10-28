import { useSyncExternalStore } from 'react';
import { monitorConexion } from '../lib/red/conexion';

/**
 * FASE 11 — Hook de estado de conexión a la red.
 * Suscripción óptima mediante useSyncExternalStore.
 */
export function useConexion(): { online: boolean } {
  const online = useSyncExternalStore(
    (onStoreChange) => monitorConexion.suscribir(onStoreChange),
    () => monitorConexion.estaOnline(),
    () => true
  );

  return { online };
}
