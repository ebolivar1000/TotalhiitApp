import { db } from './db';
import { nuevoId } from '../utilidades/ids';
import { fechaHoyIso } from '../utilidades/fechas';
import {
  VERSIONES_CONSENTIMIENTO,
  type CambiosPerfil,
  type ConsentRecord,
  type EntradaPerfil,
  type EntradaPreferencias,
  type Favorito,
  type ModuloConsentimiento,
  type NutritionPreferences,
  type TipoFavorito,
  type TipoObjetivo,
  type UserGoal,
  type UserProfile,
  type WorkoutSession,
} from './entidades';

/** Crea un perfil nuevo o actualiza el existente manteniendo createdAt. */
export async function guardarPerfil(entrada: EntradaPerfil, idExistente?: string): Promise<UserProfile> {
  const ahora = Date.now();
  const existente = idExistente ? await db.perfiles.get(idExistente) : undefined;
  const perfil: UserProfile = {
    ...entrada,
    id: existente?.id ?? nuevoId(),
    createdAt: existente?.createdAt ?? ahora,
    updatedAt: ahora,
  };
  await db.perfiles.put(perfil);
  return perfil;
}

export async function obtenerPerfil(id: string): Promise<UserProfile | undefined> {
  return db.perfiles.get(id);
}

/** En el MVP local hay un único usuario; devuelve el primero creado. */
export async function perfilPrincipal(): Promise<UserProfile | undefined> {
  const todos = await db.perfiles.orderBy('createdAt').toArray();
  return todos[0];
}

/** Registra un objetivo nuevo como activo y cierra el anterior con fecha de fin. */
export async function registrarObjetivo(userId: string, tipo: TipoObjetivo): Promise<UserGoal> {
  const hoy = fechaHoyIso();
  return db.transaction('rw', db.objetivos, async () => {
    const activos = await db.objetivos.where('[userId+activo]').equals([userId, 1]).toArray();
    for (const viejo of activos) {
      await db.objetivos.update(viejo.id, { activo: 0, hasta: hoy });
    }
    const nuevo: UserGoal = { id: nuevoId(), userId, tipo, desde: hoy, hasta: undefined, activo: 1 };
    await db.objetivos.put(nuevo);
    return nuevo;
  });
}

export async function objetivoActivo(userId: string): Promise<UserGoal | undefined> {
  const filas = await db.objetivos.where('[userId+activo]').equals([userId, 1]).toArray();
  return filas.sort((a, b) => b.desde.localeCompare(a.desde))[0];
}

export async function obtenerObjetivos(userId: string): Promise<UserGoal[]> {
  return db.objetivos.where('userId').equals(userId).toArray();
}

export async function guardarPreferencias(
  userId: string,
  entrada: EntradaPreferencias,
): Promise<NutritionPreferences> {
  const ahora = Date.now();
  const existente = (await db.preferencias.where('userId').equals(userId).first()) as NutritionPreferences | undefined;
  const preferencias: NutritionPreferences = {
    ...entrada,
    id: existente?.id ?? nuevoId(),
    userId,
    createdAt: existente?.createdAt ?? ahora,
    updatedAt: ahora,
  };
  await db.preferencias.put(preferencias);
  return preferencias;
}

export async function obtenerPreferencias(userId: string): Promise<NutritionPreferences | undefined> {
  return db.preferencias.where('userId').equals(userId).first();
}

export async function otorgarConsentimiento(userId: string, modulo: ModuloConsentimiento): Promise<ConsentRecord> {
  const registro: ConsentRecord = {
    id: nuevoId(),
    userId,
    modulo,
    version: VERSIONES_CONSENTIMIENTO[modulo],
    otorgado: Date.now(),
    revocado: undefined,
  };
  await db.consentimientos.put(registro);
  return registro;
}

export async function revocarConsentimiento(userId: string, modulo: ModuloConsentimiento): Promise<void> {
  const activos = (await db.consentimientos.where('[userId+modulo]').equals([userId, modulo]).toArray()).filter(
    (c) => !c.revocado,
  );
  for (const c of activos) {
    await db.consentimientos.update(c.id, { revocado: Date.now() });
  }
}

export async function tieneConsentimiento(userId: string, modulo: ModuloConsentimiento): Promise<boolean> {
  const filas = await db.consentimientos.where('[userId+modulo]').equals([userId, modulo]).toArray();
  return filas.some((c) => !c.revocado);
}

/** Exportación en JSON plano de todos los datos del usuario (módulo J). */
export async function exportarDatos(): Promise<Record<string, unknown>> {
  const [perfiles, objetivos, preferencias, consentimientos, sesiones, favoritos] = await Promise.all([
    db.perfiles.toArray(),
    db.objetivos.toArray(),
    db.preferencias.toArray(),
    db.consentimientos.toArray(),
    db.sesiones.toArray(),
    db.favoritos.toArray(),
  ]);
  return {
    app: 'totalhiit-app',
    version: 2,
    exportado: new Date().toISOString(),
    perfiles,
    objetivos,
    preferencias,
    consentimientos,
    sesiones,
    favoritos,
  };
}

/** Borrado definitivo de todos los datos personales locales. */
export async function borrarDatosPersonales(): Promise<void> {
  await db.transaction(
    'rw',
    [db.perfiles, db.objetivos, db.preferencias, db.consentimientos, db.sesiones, db.favoritos],
    async () => {
      await Promise.all([
        db.perfiles.clear(),
        db.objetivos.clear(),
        db.preferencias.clear(),
        db.consentimientos.clear(),
        db.sesiones.clear(),
        db.favoritos.clear(),
      ]);
    },
  );
}

export async function aplicarCambiosPerfil(id: string, cambios: CambiosPerfil): Promise<UserProfile> {
  const existente = await db.perfiles.get(id);
  if (!existente) throw new Error('Perfil no encontrado');
  const actualizado: UserProfile = { ...existente, ...cambios, id, updatedAt: Date.now() };
  await db.perfiles.put(actualizado);
  return actualizado;
}

/** Registra una sesión de entrenamiento realizada (FASE 4). */
export async function registrarSesion(
  entrada: Omit<WorkoutSession, 'id' | 'completado'> & { completado?: boolean; id?: string },
): Promise<WorkoutSession> {
  const { id, ...resto } = entrada;
  const sesion: WorkoutSession = { ...resto, completado: resto.completado ?? true, id: id ?? nuevoId() };
  await db.sesiones.put(sesion);
  return sesion;
}

export async function sesionesDeUsuario(userId: string): Promise<WorkoutSession[]> {
  const filas = await db.sesiones.where('userId').equals(userId).toArray();
  return filas.sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export async function sesionesDeWorkout(userId: string, workoutId: string): Promise<WorkoutSession[]> {
  const filas = await db.sesiones.where('workoutId').equals(workoutId).toArray();
  return filas.filter((s) => s.userId === userId).sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/** Alterna un favorito; devuelve true si quedó como favorito. */
export async function alternarFavorito(
  userId: string,
  tipo: TipoFavorito,
  refId: string,
): Promise<boolean> {
  const clave = (f: Favorito) => f.userId === userId && f.tipo === tipo && f.refId === refId;
  const existentes = (await db.favoritos.toArray()).filter(clave);
  if (existentes.length > 0) {
    await db.favoritos.bulkDelete(existentes.map((f) => f.id));
    return false;
  }
  const favorito: Favorito = { id: nuevoId(), userId, tipo, refId, createdAt: Date.now() };
  await db.favoritos.put(favorito);
  return true;
}

export async function esFavorito(userId: string, tipo: TipoFavorito, refId: string): Promise<boolean> {
  const filas = await db.favoritos.where('[userId+tipo]').equals([userId, tipo]).toArray();
  return filas.some((f) => f.refId === refId);
}

export async function favoritosDe(userId: string, tipo: TipoFavorito): Promise<Favorito[]> {
  const filas = await db.favoritos.where('[userId+tipo]').equals([userId, tipo]).toArray();
  return filas.sort((a, b) => b.createdAt - a.createdAt);
}
