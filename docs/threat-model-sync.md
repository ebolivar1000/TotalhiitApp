# Evaluación de Amenazas: Sincronización y Datos Íntimos

> **FASE 10 — Seguridad, Privacidad y Datos Sensibles**  
> Fecha: 2026-10-28  
> Documento de análisis de riesgos según principios OWASP / STRIDE antes de habilitar sync.

---

## 1. Definición y Sensibilidad de los Datos

En TOTALHIIT App, los datos se clasifican en tres niveles de sensibilidad:

1. **Datos Operativos / Catálogos (Públicos):**
   - Catálogo de entrenamientos, catálogo de recetas, fuentes USDA.
2. **Datos Personales y de Progreso (Sensibilidad Media):**
   - Perfil (alias, peso, estatura, edad, objetivos, preferencias alimentarias).
   - Registros diarios (peso, horas de sueño, energía, vasos de agua, notas generales).
   - Sesiones completadas, planes semanales, recetas favoritas.
3. **Datos Íntimos y de Salud Fisiológica (Sensibilidad Máxima / Categoría Especial):**
   - Registros de ciclo menstrual: flujo (sangrado/manchado), síntomas físicos/emocionales, notas íntimas, fechas de inicio y estimaciones de fertilidad/ciclo.

---

## 2. Matriz de Amenazas (Modelo STRIDE)

| Amenaza | Vector de Ataque | Impacto sin mitigación | Mitigación Arquitectónica en TOTALHIIT |
|---|---|---|---|
| **Spoofing (Suplantación)** | Robo de credenciales o sesión de un usuario para leer sus datos en la nube. | Alto: acceso a historial de salud y ciclo de la usuaria. | Tokens de sesión con caducidad corta, firma HMAC-SHA256, sin almacenamiento de contraseñas en claro (PBKDF2/Argon2 en servidor). |
| **Tampering (Manipulación)** | Alteración de los datos en tránsito o en la base de datos central. | Medio: alteración de métricas de peso o planes de nutrición. | HTTPS estricto + firmas de integridad (AES-GCM con tag de autenticación de 128 bits). Cualquier alteración en tránsito o en reposo genera error criptográfico y se descarta. |
| **Repudiation (Repudio)** | Negar acciones en el sistema. | Bajo en app personal. | Trazabilidad local con timestamps inmutables (`createdAt`, `updatedAt`). |
| **Information Disclosure (Filtración de Datos)** | 1. Filtración de la base de datos del servidor (D1 o backup).<br>2. Empleado o admin deshonesto inspeccionando la base de datos.<br>3. Órdenes judiciales o brechas de terceros. | **Crítico / Inaceptable** si el ciclo menstrual está en claro en el servidor. | **Zero-Knowledge Client-Side Encryption**: El servidor NUNCA recibe los datos del ciclo en claro. Solo almacena blobs cifrados con una clave derivada del PIN de la usuaria que jamás viaja al servidor. |
| **Denial of Service (Denegación de servicio)** | Saturación de la API de sincronización. | Medio: la usuaria no puede sincronizar entre dispositivos. | Arquitectura **local-first**: la app funciona 100% offline. Si el servidor no responde, los datos continúan guardándose en IndexedDB sin pérdida. |
| **Elevation of Privilege (Elevación de privilegios)** | Una usuaria normal intenta acceder a funciones o entrenamientos premium alterando el cliente. | Medio: acceso no autorizado a contenido de pago. | **Validación de permisos SIEMPRE en el servidor**: la API rechaza descargas de contenido premium si el token no contiene el entitlement verificado. La UI solo refleja el estado. |

---

## 3. Decisión Criptográfica para Datos Íntimos (Ciclo Menstrual)

### ¿El ciclo menstrual debe subirse al servidor?
Se define una política en dos capas:

1. **Opción Predeterminada (Local Exclusivo):**
   - Por defecto, el módulo de ciclo menstrual permanece **estrictamente en el dispositivo local** (IndexedDB con clave aleatoria AES-GCM local generada en la FASE 8).
   - El motor de sincronización saltea la tabla `ciclo` a menos que la usuaria active explícitamente el "Respaldo y sincronización en la nube".

2. **Opción con Respaldo en la Nube (Zero-Knowledge con PIN):**
   - Si la usuaria desea sincronizar su ciclo entre su teléfono y tablet, se exige la creación de un **PIN de Seguridad (mínimo 6 dígitos o frase de paso)**.
   - **Derivación de clave:** Se utiliza **PBKDF2 con SHA-256**, 100.000 iteraciones y una sal criptográfica aleatoria de 16 bytes generada en el cliente con WebCrypto.
   - **Cifrado del payload:** Los registros de ciclo se cifran con **AES-GCM-256** utilizando la clave derivada del PIN.
   - **Envelope:** El blob que viaja y se persiste en el servidor tiene el formato:
     `{ id, userId, fecha, salt, iv, ciphertext, updatedAt }`
   - **Propiedad de Conocimiento Cero (Zero-Knowledge):**
     - El PIN **NUNCA** se envía al servidor.
     - La clave derivada **NUNCA** sale del navegador o dispositivo.
     - Ni los administradores de TOTALHIIT, ni Cloudflare, ni un atacante que vulnere la base de datos pueden leer o deducir los registros íntimos de la usuaria.

---

## 4. Gestión de Claves y Recuperación

- **Pérdida de PIN:**  
  Debido a las garantías criptográficas de conocimiento cero, si la usuaria olvida su PIN, el servidor **no puede** recuperar los datos íntimos respaldados en la nube.
- **Protección contra pérdida:**
  - Los datos locales en el dispositivo siguen accesibles mientras la sesión local esté abierta.
  - La función de **Exportación de Datos (JSON)** en Ajustes permite a la usuaria descargar un respaldo completo sin intermediación de servidores.

---

## 5. Garantías de Privacidad en Entitlements y Funciones Gratuitas

1. **Módulo menstrual básico SIEMPRE GRATIS:**  
   Bajo ninguna circunstancia el registro de ciclo, calendario, síntomas o estimaciones básicas requerirán pago o suscripción premium.
2. **Exportación y Borrado SIEMPRE GRATIS:**  
   El derecho a exportar todos los datos en formato estándar y a eliminarlos completamente (cumplimiento GDPR / derecho al olvido) no tiene barreras de pago ni límites de uso.
3. **Telemetría Cero:**  
   Ningún evento relacionado con la salud, nutrición o ciclo genera llamadas a servicios de analítica de terceros.
