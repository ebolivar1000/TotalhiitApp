import { Link } from 'react-router';
import { Tarjeta } from '../componentes/ui';

export default function Privacidad() {
  return (
    <main className="safe-area-superior mx-auto max-w-xl space-y-4 px-4 pb-48 pt-6">
      <div className="flex items-center justify-between pb-1">
        <Link
          to="/"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:scale-95"
        >
          ← Volver a la App
        </Link>
      </div>

      <div className="text-center sm:text-left">
        <span className="inline-block rounded-full bg-marca-magenta/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-marca-magenta">
          Seguridad y Transparencia
        </span>
        <h1 className="mt-2 text-2xl font-black text-zinc-900 sm:text-3xl">Política de Privacidad</h1>
        <p className="mt-1 text-xs text-zinc-500">Última actualización: 29 de octubre de 2026</p>
      </div>

      <Tarjeta>
        <h2 className="text-sm font-bold uppercase tracking-wide text-marca-magenta">1. Compromiso Local-First</h2>
        <p className="mt-2 text-xs leading-relaxed text-zinc-600">
          <strong>TOTALHIIT</strong> ha sido diseñada bajo una arquitectura <em>Local-First</em>. Esto significa que
          tus datos personales (peso, estatura, nivel de actividad física, preferencias alimentarias, registros de
          progreso y horas de sueño) se almacenan de manera predeterminada y primordial <strong>en la memoria local de tu dispositivo</strong>.
        </p>
      </Tarjeta>

      <Tarjeta>
        <h2 className="text-sm font-bold uppercase tracking-wide text-marca-magenta">2. Privacidad Estricta del Ciclo Menstrual</h2>
        <p className="mt-2 text-xs leading-relaxed text-zinc-600">
          Tus registros de ciclo menstrual y bienestar hormonal gozan del más alto estándar de protección:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-zinc-600">
          <li>Cifrado militar en el dispositivo mediante <strong>AES-GCM-256</strong> con derivación PBKDF2 (100.000 iteraciones).</li>
          <li>Nadie (incluyendo los desarrolladores y servidores) puede leer tus notas o síntomas íntimos.</li>
          <li>Tienes la opción de mantener el módulo menstrual 100% aislado en tu teléfono.</li>
        </ul>
      </Tarjeta>

      <Tarjeta>
        <h2 className="text-sm font-bold uppercase tracking-wide text-marca-magenta">3. No Venta de Datos ni Rastreadores Invasivos</h2>
        <p className="mt-2 text-xs leading-relaxed text-zinc-600">
          No comercializamos, no alquilamos ni vendemos tu información personal a terceros bajo ninguna circunstancia. La
          aplicación <strong>no incluye anuncios publicitarios de terceros</strong> que recopilen tu comportamiento para perfiles de marketing.
        </p>
      </Tarjeta>

      <Tarjeta>
        <h2 className="text-sm font-bold uppercase tracking-wide text-marca-magenta">4. Derecho de Eliminación y Portabilidad de Datos</h2>
        <p className="mt-2 text-xs leading-relaxed text-zinc-600">
          En cumplimiento con las directivas internacionales de protección de datos (incluyendo normativas de Amazon Appstore y Google Play):
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-zinc-600">
          <li><strong>Eliminación completa:</strong> Puedes borrar en cualquier momento y con un solo clic todos tus datos, perfiles y registros desde el menú <em>Ajustes → Borrar mis datos</em>.</li>
          <li><strong>Exportación:</strong> Puedes descargar una copia completa de tus registros en formato JSON estándar desde <em>Ajustes → Exportar mis datos</em>.</li>
        </ul>
      </Tarjeta>

      <Tarjeta>
        <h2 className="text-sm font-bold uppercase tracking-wide text-marca-magenta">5. Exención de Responsabilidad Médica</h2>
        <p className="mt-2 text-xs leading-relaxed text-zinc-600">
          TOTALHIIT proporciona sugerencias de entrenamiento físico y educación nutricional orientadas al bienestar de mujeres de más de 40 años. <strong>No constituye un dispositivo médico ni reemplaza la consulta, diagnóstico o prescripción de profesionales facultativos de la salud.</strong>
        </p>
      </Tarjeta>

      <Tarjeta>
        <h2 className="text-sm font-bold uppercase tracking-wide text-marca-magenta">6. Contacto y Soporte</h2>
        <p className="mt-2 text-xs leading-relaxed text-zinc-600">
          Para cualquier duda, solicitud de soporte o aclaración sobre la gestión de tus datos, puedes contactarnos directamente a través de:
        </p>
        <div className="mt-2 rounded-xl bg-zinc-50 p-2.5 font-mono text-xs text-zinc-700">
          <p>📧 caribialabs@gmail.com</p>
          <p>📧 ebolivar1000@gmail.com</p>
        </div>
      </Tarjeta>
    </main>
  );
}
