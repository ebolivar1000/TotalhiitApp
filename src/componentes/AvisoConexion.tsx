import { useConexion } from '../hooks/useConexion';

/**
 * FASE 11 — Aviso discreto de estado de conexión.
 * Ofrece retroalimentación transparente y tranquilizadora para la usuaria
 * recordando que TOTALHIIT es local-first y opera plenamente sin internet.
 */
export default function AvisoConexion() {
  const { online } = useConexion();

  if (online) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-zinc-900 px-4 py-2 text-center text-xs font-medium text-pink-200 shadow-md transition-all"
    >
      <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
      <span>Modo sin conexión activo · Tus entrenamientos, recetas y registros locales funcionan con normalidad.</span>
    </aside>
  );
}
