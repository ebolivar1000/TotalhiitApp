/** Utilidades de fechas locales (sin timezone) en formato YYYY-MM-DD. */

export function fechaHoyIso(hoy: Date = new Date()): string {
  return fechaAiso(hoy);
}

export function fechaAiso(fecha: Date): string {
  const y = String(fecha.getFullYear()).padStart(4, '0');
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isoAFecha(iso: string): Date {
  const [y = 0, m = 1, d = 1] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Edad cumplida a partir de una fecha de nacimiento YYYY-MM-DD.
 * Referencia inyectable para pruebas.
 */
export function edadCumplida(fechaNacimientoIso: string, hoy: Date = new Date()): number {
  const nacimiento = isoAFecha(fechaNacimientoIso);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const aunNoCumplio =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (aunNoCumplio) edad--;
  return edad;
}
