# Comparativa de Backend: Cloudflare Workers + D1 (+R2) vs Supabase

> **FASE 10 — Identidad, Sync y Premium**  
> Fecha de auditoría: 2026-10-28  
> Documento técnico para decisión con el propietario.

---

## 1. Resumen ejecutivo y recomendación

| Criterio | Cloudflare (Workers + D1 + R2 + Pages) | Supabase (PostgreSQL + Auth + Storage) |
|---|---|---|
| **Ecosistema existente** | **Ya existe cuenta** (`caribialabs@gmail.com`); el sitio web usa Cloudflare | Cuenta nueva requerida |
| **Pausado por inactividad** | **NUNCA se pausa** (alta disponibilidad continua) | **Se pausa tras 7 días de inactividad** (Riesgo alto en plan gratis) |
| **Almacenamiento BD gratis** | **5 GB** (SQLite / D1) | 500 MB (PostgreSQL) |
| **Lecturas / Escrituras BD** | 5M lecturas/día · 100k escrituras/día | Ilimitadas dentro de los 500 MB de cómputo |
| **Almacenamiento archivos** | R2: **10 GB gratis / mes · $0 egress (sin cobro por transferencia)** | 1 GB gratis / mes · 2 GB egress máx. |
| **Auth** | JWT ligero con WebCrypto / KV / Turnstile o Cloudflare Zero Trust | GoTrue integrado (Email, OAuth, Magic Links) listo para usar |
| **Protección de videos** | Signed URLs en R2 / Cloudflare Stream (add-on) / YouTube nocookie | Storage firmado / YouTube nocookie |
| **Latencia / Edge** | < 20 ms en 300+ ciudades (red anycast global de Cloudflare) | Centralizado en 1 región AWS (ej. us-east-1 o sa-east-1) |
| **Riesgo de costo sorpresa** | **Nulo** (R2 no cobra ancho de banda saliente) | Medio (exceso de egress o reactivación de proyectos) |

### Recomendación técnica
**Cloudflare Workers + D1 + R2** es la opción recomendada:
1. **Sin riesgo de "sitio dormido":** Supabase suspende proyectos gratuitos inactivos tras 7 días. Si las usuarias reducen su actividad durante vacaciones, la app se rompería. Cloudflare permanece 100% activo sin importar los días de inactividad.
2. **5 GB de base de datos** (10 veces más que los 500 MB de Supabase) y **10 GB en R2 sin costo de transferencia** ($0 egress bandwidth).
3. **Unificación operativa:** Toda la infraestructura (dominio, PWA en Pages, backend en Workers, base en D1) se gestiona bajo la misma cuenta ya existente de Cloudflare.
4. **Arquitectura local-first:** La app ya almacena en SQLite/IndexedDB vía Dexie; el dialecto SQL de Cloudflare D1 es SQLite nativo, permitiendo sincronización casi idéntica entre cliente y servidor.

---

## 2. Límites oficiales verificados (Planes Gratuitos)

### Cloudflare
*Verificado en cloudflare.com/plans/developer-platform/ (2026)*
- **Workers (Edge Compute):**
  - 100.000 solicitudes / día.
  - 10 ms de tiempo de CPU por solicitud (más que suficiente para CRUD, verificación de tokens y sync).
  - Despliegue global en 330+ ciudades.
- **D1 (Base de datos relacional serverless):**
  - 5.000.000 de filas leídas / día.
  - 100.000 de filas escritas / día.
  - 5 GB de almacenamiento total.
  - Motor: SQLite (compatible con transacciones y tipos relacionales).
- **R2 (Almacenamiento de objetos S3 compatible):**
  - 10 GB de almacenamiento / mes.
  - 1.000.000 de operaciones Clase A (escrituras/listas) / mes.
  - 10.000.000 de operaciones Clase B (lecturas) / mes.
  - **$0 por ancho de banda saliente (egress)**: permite servir PDFs de recetas, planes y assets sin sorpresas.
- **KV (Almacenamiento clave-valor de ultra baja latencia):**
  - 100.000 lecturas / día.
  - 1.000 escrituras / día.
  - Ideal para lista negra de tokens revocados o caché de catálogo.

### Supabase
*Verificado en supabase.com/pricing (2026)*
- **Base de datos PostgreSQL:** 500 MB compartidos. Límite de cómputo: microinstancia compartida.
- **Pausa por inactividad:** Las bases de datos se pausan tras 7 días sin tráfico HTTP. La reactivación demora entre 20 y 45 segundos y suele dar error en el primer intento del cliente móvil.
- **Autenticación:** 50.000 usuarios activos mensuales (MAU).
- **Storage:** 1 GB de almacenamiento total; límite estricto de 2 GB de ancho de banda saliente al mes.
- **Edge Functions:** 500.000 invocaciones / mes.
- **Límite de proyectos:** Máximo 2 proyectos gratuitos activos por cuenta.

---

## 3. Autenticación y Control de Roles

### En Cloudflare Workers
- Implementación de **tokens JWT autofirmados** usando la API nativa `WebCrypto` (HMAC SHA-256 / RS256).
- Cero dependencias pesadas: la firma y verificación de JWT corre en < 1 ms en el runtime de Workers.
- Roles: `usuario`, `admin`, `premium`.
- Las contraseñas se hashean en el worker con **PBKDF2 / Argon2** (o Scrypt) antes de guardarse en D1.
- Opcional: Integración con **Cloudflare Turnstile** (gratuito) para prevenir registros de bots sin captchas invasivos.

### En Supabase
- Incluye el servicio GoTrue con endpoints `/auth/v1/signup`, `/auth/v1/token`.
- Cómodo pero agrega un SDK cliente de ~100 kB y acopla la app a la infraestructura propietaria de Supabase.

---

## 4. Protección de Contenido y Videos

- **Videos públicos y bootcamp:** Se mantienen en YouTube en modo nocookie (`youtube-nocookie.com`), tal como se implementó en la FASE 4.
- **Videos exclusivos / premium:**
  - *Opción Cloudflare R2:* Videos MP4/WebM alojados en R2 con URLs prefirmadas (`signed URLs`) con expiración corta (ej. 15 minutos). Al no tener costos de egress, el streaming directo no genera gastos de ancho de banda.
  - *Opción Cloudflare Stream:* Servicio dedicado de video adaptativo (HLS/DASH). Nota: Stream es un servicio pago por minuto de video ($5/1.000 min almacenados), por lo que para el MVP gratuito se descarta y se usa R2 con URLs prefirmadas o YouTube privado.

---

## 5. Estrategia de Sincronización Local-First

La app TOTALHIIT es **local-first** (prioridad local con IndexedDB/Dexie).
1. El usuario puede utilizar el 100% de la app sin conexión y sin registrarse (Modo Invitado).
2. Si el usuario inicia sesión:
   - Los datos locales se asocian a su ID de usuario.
   - Sincronización bidireccional incremental basada en `updatedAt` y `deletedAt` (soft deletes).
   - Resolución de conflictos: **Last-Write-Wins (LWW)** con reconciliación a nivel de campo.
3. **Resguardo de datos íntimos:** Los datos del ciclo menstrual se mantienen en el dispositivo O se suben bajo un contenedor cifrado de conocimiento cero (**Zero-Knowledge Client-Side Encryption**), donde el servidor solo almacena texto cifrado ininteligible.
4. Red de seguridad: El botón **"Exportar datos (JSON)"** en Ajustes funciona offline en todo momento.

---

## 6. Dictamen y Siguientes Pasos

Se propone al propietario avanzar con la arquitectura basada en **Cloudflare Workers + D1**:
1. Desarrollar el contrato cliente del servicio de Auth, Entitlements y Sync.
2. Implementar la validación rigurosa de permisos en el lado servidor (mock/contrato TypeScript testeado con Vitest).
3. Aplicar el modelo de amenazas de datos íntimos y derivación de clave con PIN (Zero-Knowledge).
