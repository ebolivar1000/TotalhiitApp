import { db } from './db';
import { nuevoId } from '../utilidades/ids';
import { fechaHoyIso } from '../utilidades/fechas';
import {
  VERSIONES_CONSENTIMIENTO,
  type CambiosPerfil,
  type ConsentRecord,
  type EntradaPerfil,
  type EntradaPreferencias,
  type ModuloConsentimiento,
  type NutritionPreferences,
  type TipoObjetivo,
  type UserGoal,
  type UserProfile,
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
  const [perfiles, objetivos, preferencias, consentimientos] = await Promise.all([
    db.perfiles.toArray(),
    db.objetivos.toArray(),
    db.preferencias.toArray(),
    db.consentimientos.toArray(),
  ]);
  return { app: 'totalhiit-app', version: 1, exportado: new Date().toISOString(), perfiles, objetivos, preferencias, consentimientos };
}

/** Borrado definitivo de todos los datos personales locales. */
export async function borrarDatosPersonales(): Promise<void> {
  await db.transaction('rw', db.perfiles, db.objetivos, db.preferencias, db.consentimientos, async () => {
    await Promise.all([
      db.perfiles.clear(),
      db.objetivos.clear(),
      db.preferencias.clear(),
      db.consentimientos.clear(),
    ]);
  });
}

export async function aplicarCambiosPerfil(id: string, cambios: CambiosPerfil): Promise<UserProfile> {
  const existente = await db.perfiles.get(id);
  if (!existente) throw new Error('Perfil no encontrado');
  const actualizado: UserProfile = { ...existente, ...cambios, id, updatedAt: Date.now() };
  await db.perfiles.put(actualizado);
  return actualizado;
}
