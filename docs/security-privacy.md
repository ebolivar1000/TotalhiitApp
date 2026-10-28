# Seguridad y privacidad — App TOTALHIIT

> Master prompt §8. Revisión viva; se actualiza por fase.

## 1. Base de seguridad (OWASP aplicable)

| Control | Estado en esta app |
|---|---|
| Validación de entradas | zod en formularios y límites plausibles en fórmulas |
| XSS | React escapa por defecto; sin `dangerouslySetInnerHTML`; sin HTML externo |
| Inyección | IndexedDB parametrizado por Dexie; sin SQL en cliente; luego, consultas preparadas en backend |
| Secretos | Ningún secreto en el cliente. Si hay backend (FASE 10), secretos solo del lado servidor |
| Autorización | En el MVP no hay cuentas: todo es local. Con cuentas (FASE 10), autorización SIEMPRE del lado servidor |
| Transporte | HTTPS obligatorio (PWA); Capacitor usa `https://localhost` interno |
| Datos sensibles | Menstrual/íntimo: cifrado adicional + consentimiento (§3) |
| Dependencias | Versiones fijadas + `npm audit` por fase (4 LOW de build documentadas en `ai/decisions.md` D9) |
| Logs | Nunca registrar datos íntimos (síntomas, ciclo) ni datos de salud en consola/telemetría |
| Trackers | **Sin** analíticas ni publicidad por defecto (master prompt §8) |

## 2. Datos íntimos (módulo menstrual, FASE 8) — reglas obligatorias

1. Activación solo por **consentimiento explícito** (pantalla dedicada + `ConsentRecord`).
2. Datos **locales por defecto**; sin sincronización en el MVP.
3. Nunca enviar estos datos a: analíticas, logs, IA externa, ni ningún tercero.
4. Cifrado del store menstrual con WebCrypto (AES-GCM) sobre los campos sensibles;
   documentar honestamente qué protege (contra lectura casual del dispositivo,
   no contra otro código mismo-origen) y qué NO (ver §3).
5. Exportación (JSON) y **borrado definitivo** accesibles desde Ajustes.
6. Notificaciones discretas y opcionales; sin contenido explícito en la notificación.
7. Desactivar el módulo borra los datos o los mantiene cifrados localmente (elección del usuario).
8. Si se implementan cuentas/sincronización (FASE 10): **evaluación de amenazas
   previa** (doc aparte) antes del lanzamiento: cifrado del lado cliente con clave
   no exportable, recuperación de cuenta sin exponer datos, borrado en servidor, etc.

## 3. Límites honestos del almacenamiento local

- IndexedDB **no es cifrado automático** (master prompt §6): protegeremos los
  stores íntimos con cifrado aplicado por la app; el nivel real depende del
  sistema operativo y de si el dispositivo está desbloqueado/rooteado.
- **Safari/iOS puede desalojar** almacenamiento de PWAs poco usadas (eviction/ITP):
  mitigación = exportación manual fácil + aviso al usuario + (futuro) backup opcional.
- La app informará al usuario en lenguaje claro qué datos hay, dónde viven y
  cómo borrarlos (sin jerga legal).

## 4. Salud y nutrición (riesgo de contenido)

- Las fórmulas (IMC/TMB/TDEE) muestran SIEMPRE su limitación y el aviso de que
  no reemplazan a un profesional (master prompt §5.C).
- Prohibido: déficits energéticos automáticos extremos, dietas terapéuticas,
  afirmaciones de tratamiento/curación (insomnio, hormonas, ciclos).
- El módulo menstrual NO es anticonceptivo ni diagnostica nada (§5.H).
- Separación clara en la UI entre *fórmulas comprobables* y cualquier texto
  informativo (y en el futuro, contenido generado por IA marcado como tal).

## 5. Distribución

- APK: firma con keystore propiedad del propietario; **keystore NUNCA en el repo**
  (documentar rutas y respaldo en `deployment.md` cuando se cree).
- Instalación fuera de Google Play: instrucciones claras; advertir los avisos de
  "origen desconocido" de Android como comportamiento normal esperado.
- PWA: servida bajo HTTPS desde hosting gratuito verificado (FASE 11).
- No prometer que la marca de agua impide la copia (es disuasiva, no criptográfica).

## 6. Accesos y secretos del proyecto
- Sin claves de API en el cliente, jamás (master prompt §7).
- Si algún día se usa IA: backend propio como proxy; el cliente nunca ve la clave.
