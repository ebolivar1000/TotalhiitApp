import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BotonPrimario, Campo, EntradaTexto, Selector, Tarjeta } from '../componentes/ui';
import {
  agregarSuscriptor,
  alternarEstadoAnuncio,
  alternarEstadoSuscriptor,
  cambiarClaveAdmin,
  cerrarSesionAdmin,
  CLAVE_ADMIN_POR_DEFECTO,
  eliminarAnuncio,
  eliminarSuscriptor,
  EMAILS_ADMIN_POR_DEFECTO,
  estaAutenticadoAdmin,
  guardarAnuncio,
  iniciarSesionAdmin,
  listarAnuncios,
  listarSuscriptores,
  restablecerClaveAdminPorEmail,
  verificarClaveAdmin,
} from '../lib/admin/admin-servicio';
import type { AnuncioAdmin, Suscriptor } from '../lib/datos/db';

export default function Admin() {
  const [autenticado, setAutenticado] = useState(estaAutenticadoAdmin);
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [errorClave, setErrorClave] = useState('');

  // Recuperación de clave (Item 9)
  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [emailRecuperacion, setEmailRecuperacion] = useState('');
  const [mensajeRecuperacion, setMensajeRecuperacion] = useState('');
  const [errorRecuperacion, setErrorRecuperacion] = useState('');

  // Pestañas del panel
  const [tab, setTab] = useState<'suscriptores' | 'anuncios' | 'seguridad'>('suscriptores');

  // Cambiar clave dentro del panel (Item 9)
  const [nuevaClave, setNuevaClave] = useState('');
  const [confirmarClave, setConfirmarClave] = useState('');
  const [verNuevaClave, setVerNuevaClave] = useState(false);
  const [mensajeCambioClave, setMensajeCambioClave] = useState('');
  const [errorCambioClave, setErrorCambioClave] = useState('');

  // Datos de suscriptores
  const [suscriptores, setSuscriptores] = useState<Suscriptor[]>([]);
  const [filtro, setFiltro] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPlan, setNuevoPlan] = useState<Suscriptor['plan']>('total40');
  const [nuevasNotas, setNuevasNotas] = useState('');
  const [mensajeSub, setMensajeSub] = useState('');
  const [errorSub, setErrorSub] = useState('');

  // Datos de anuncios
  const [anuncios, setAnuncios] = useState<AnuncioAdmin[]>([]);
  const [anuncioTipo, setAnuncioTipo] = useState<AnuncioAdmin['tipo']>('promocion');
  const [anuncioTitulo, setAnuncioTitulo] = useState('');
  const [anuncioMensaje, setAnuncioMensaje] = useState('');
  const [anuncioEnlace, setAnuncioEnlace] = useState('');
  const [mensajeAnuncio, setMensajeAnuncio] = useState('');

  const cargarDatos = async () => {
    setSuscriptores(await listarSuscriptores());
    setAnuncios(await listarAnuncios());
  };

  useEffect(() => {
    if (autenticado) {
      void cargarDatos();
    }
  }, [autenticado]);

  const intentarAcceso = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificarClaveAdmin(clave)) {
      iniciarSesionAdmin();
      setAutenticado(true);
      setErrorClave('');
    } else {
      setErrorClave('Clave de administración incorrecta. Revisa o usa la opción de recuperar.');
    }
  };

  const handleRecuperarClave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorRecuperacion('');
    setMensajeRecuperacion('');
    const res = restablecerClaveAdminPorEmail(emailRecuperacion);
    if (res.exito) {
      setMensajeRecuperacion(res.mensaje);
      setClave(CLAVE_ADMIN_POR_DEFECTO);
    } else {
      setErrorRecuperacion(res.mensaje);
    }
  };

  const handleCambiarClave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCambioClave('');
    setMensajeCambioClave('');
    if (nuevaClave.trim() !== confirmarClave.trim()) {
      setErrorCambioClave('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }
    const res = cambiarClaveAdmin(nuevaClave);
    if (res.exito) {
      setMensajeCambioClave(res.mensaje);
      setNuevaClave('');
      setConfirmarClave('');
    } else {
      setErrorCambioClave(res.mensaje);
    }
  };

  const handleRestablecerClaveDefecto = () => {
    if (window.confirm(`¿Restablecer la clave de administración a la clave por defecto (${CLAVE_ADMIN_POR_DEFECTO})?`)) {
      cambiarClaveAdmin(CLAVE_ADMIN_POR_DEFECTO);
      setMensajeCambioClave(`Clave restablecida a "${CLAVE_ADMIN_POR_DEFECTO}".`);
    }
  };

  const salir = () => {
    cerrarSesionAdmin();
    setAutenticado(false);
  };

  const handleAgregarSuscriptor = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorSub('');
    setMensajeSub('');
    try {
      await agregarSuscriptor({
        email: nuevoEmail,
        nombre: nuevoNombre,
        plan: nuevoPlan,
        notas: nuevasNotas,
      });
      setNuevoEmail('');
      setNuevoNombre('');
      setNuevasNotas('');
      setMensajeSub('¡Suscriptor registrado exitosamente!');
      await cargarDatos();
    } catch (err) {
      setErrorSub((err as Error).message);
    }
  };

  const handleAlternarSub = async (id: string) => {
    await alternarEstadoSuscriptor(id);
    await cargarDatos();
  };

  const handleEliminarSub = async (id: string) => {
    if (window.confirm('¿Eliminar este suscriptor del registro?')) {
      await eliminarSuscriptor(id);
      await cargarDatos();
    }
  };

  const handleCrearAnuncio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anuncioTitulo.trim() || !anuncioMensaje.trim()) return;
    await guardarAnuncio({
      tipo: anuncioTipo,
      titulo: anuncioTitulo,
      mensaje: anuncioMensaje,
      enlace: anuncioEnlace,
      activo: true,
    });
    setAnuncioTitulo('');
    setAnuncioMensaje('');
    setAnuncioEnlace('');
    setMensajeAnuncio('¡Anuncio publicado correctamente!');
    await cargarDatos();
  };

  const handleAlternarAnuncio = async (id: string) => {
    await alternarEstadoAnuncio(id);
    await cargarDatos();
  };

  const handleEliminarAnuncio = async (id: string) => {
    await eliminarAnuncio(id);
    await cargarDatos();
  };

  // Pantalla de bloqueo con clave y opciones de visualización/recuperación
  if (!autenticado) {
    return (
      <main className="safe-area-superior mx-auto flex min-h-[85vh] max-w-sm flex-col justify-center px-4 py-8">
        <Tarjeta className="border-purple-200 shadow-md">
          <div className="text-center">
            <span className="text-4xl">👑</span>
            <h1 className="mt-2 text-xl font-bold text-zinc-900">Panel de Administración</h1>
            <p className="mt-1 text-xs text-zinc-500">
              Acceso restringido para gestión de suscriptoras de TOTALHIIT y anuncios.
            </p>
          </div>

          {!modoRecuperar ? (
            <form onSubmit={intentarAcceso} className="mt-5 space-y-3.5">
              <Campo etiqueta="Clave de Administrador" error={errorClave}>
                <div className="relative">
                  <EntradaTexto
                    type={verClave ? 'text' : 'password'}
                    placeholder="Ingresa la clave..."
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                    autoFocus
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setVerClave(!verClave)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition"
                    title={verClave ? 'Ocultar clave' : 'Ver clave que estás escribiendo'}
                  >
                    {verClave ? '🙈 Ocultar' : '👁️ Ver'}
                  </button>
                </div>
              </Campo>

              <BotonPrimario type="submit" className="min-h-[44px] w-full text-sm font-bold">
                Ingresar al Panel
              </BotonPrimario>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setModoRecuperar(true);
                    setErrorClave('');
                  }}
                  className="text-xs font-semibold text-zinc-500 hover:text-marca-magenta underline"
                >
                  ¿Olvidaste tu clave? Recuperar acceso
                </button>
              </div>
            </form>
          ) : (
            /* Panel de Recuperación de Clave (Item 9) */
            <form onSubmit={handleRecuperarClave} className="mt-5 space-y-3.5">
              <div className="rounded-xl bg-purple-50 p-3 text-xs text-purple-900">
                <p className="font-bold">🔐 Recuperación de Clave Maestra</p>
                <p className="mt-1 text-[11px] leading-relaxed text-purple-700">
                  Ingresa uno de los correos autorizados de administración para restablecer la contraseña a la clave inicial de fábrica ({CLAVE_ADMIN_POR_DEFECTO}).
                </p>
              </div>

              {mensajeRecuperacion && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-xs font-semibold text-green-800">
                  ✓ {mensajeRecuperacion}
                </div>
              )}

              {errorRecuperacion && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                  ⚠️ {errorRecuperacion}
                </div>
              )}

              <Campo etiqueta="Correo de Administración Autorizado">
                <EntradaTexto
                  type="email"
                  placeholder="ej. caribialabs@gmail.com"
                  value={emailRecuperacion}
                  onChange={(e) => setEmailRecuperacion(e.target.value)}
                  autoFocus
                />
              </Campo>

              <BotonPrimario type="submit" className="min-h-[44px] w-full text-xs font-bold">
                Restablecer Clave de Acceso
              </BotonPrimario>

              <button
                type="button"
                onClick={() => {
                  setModoRecuperar(false);
                  setErrorRecuperacion('');
                  setMensajeRecuperacion('');
                }}
                className="w-full text-center text-xs font-semibold text-zinc-500 hover:text-zinc-800"
              >
                ← Volver al inicio de sesión
              </button>
            </form>
          )}

          <div className="mt-5 border-t border-zinc-100 pt-4 text-center">
            <Link
              to="/"
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-100 active:scale-95"
            >
              ← Volver a la App
            </Link>
          </div>
        </Tarjeta>
      </main>
    );
  }

  const suscriptoresFiltrados = suscriptores.filter(
    (s) =>
      s.email.toLowerCase().includes(filtro.toLowerCase()) ||
      (s.nombre && s.nombre.toLowerCase().includes(filtro.toLowerCase())),
  );

  return (
    <main className="safe-area-superior mx-auto max-w-md space-y-4 px-4 pb-48 pt-6">
      {/* Barra superior del Admin con botones grandes y cómodos (Item 1) */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👑</span>
          <h1 className="text-lg font-bold text-zinc-900">Panel de Admin</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-marca-magenta shadow-sm transition hover:bg-zinc-50 active:scale-95"
          >
            Ir a la App →
          </Link>
          <button
            type="button"
            onClick={salir}
            className="inline-flex min-h-[44px] items-center rounded-xl bg-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-300 active:scale-95"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Pestañas del Panel */}
      <div className="flex rounded-xl bg-zinc-200/80 p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setTab('suscriptores')}
          className={`flex-1 rounded-lg py-2.5 transition ${
            tab === 'suscriptores' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          📧 Suscriptores ({suscriptores.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('anuncios')}
          className={`flex-1 rounded-lg py-2.5 transition ${
            tab === 'anuncios' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          📢 Avisos ({anuncios.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('seguridad')}
          className={`flex-1 rounded-lg py-2.5 transition ${
            tab === 'seguridad' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          🔐 Clave y Seguridad
        </button>
      </div>

      {/* TAB 1: SUSCRIPTORES */}
      {tab === 'suscriptores' && (
        <div className="space-y-4">
          <Tarjeta>
            <h2 className="text-sm font-bold uppercase tracking-wide text-marca-magenta">
              Dar de alta nuevo suscriptor
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Agrega los correos de Gmail que pagaron el plan para habilitar su acceso completo.
            </p>

            <form onSubmit={handleAgregarSuscriptor} className="mt-3 space-y-3">
              <Campo etiqueta="Correo de Google / Gmail">
                <EntradaTexto
                  type="email"
                  placeholder="alumna@gmail.com"
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  required
                />
              </Campo>

              <div className="grid grid-cols-2 gap-2">
                <Campo etiqueta="Nombre / Alias (opcional)">
                  <EntradaTexto
                    placeholder="Ej: Laura M."
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                  />
                </Campo>

                <Campo etiqueta="Plan">
                  <Selector
                    opciones={[
                      { valor: 'total40', etiqueta: 'Plan TOTAL+40' },
                      { valor: 'anual', etiqueta: 'Anual' },
                      { valor: 'mensual', etiqueta: 'Mensual' },
                      { valor: 'vitalicio', etiqueta: 'Vitalicio' },
                    ]}
                    value={nuevoPlan}
                    onChange={(e) => setNuevoPlan(e.target.value as Suscriptor['plan'])}
                  />
                </Campo>
              </div>

              <Campo etiqueta="Notas internas">
                <EntradaTexto
                  placeholder="Ej: Pago verificado por transferencia o web"
                  value={nuevasNotas}
                  onChange={(e) => setNuevasNotas(e.target.value)}
                />
              </Campo>

              {errorSub && <p className="text-xs font-semibold text-red-600">{errorSub}</p>}
              {mensajeSub && <p className="text-xs font-semibold text-green-700">{mensajeSub}</p>}

              <BotonPrimario type="submit" className="w-full">
                + Agregar Suscriptor Autorizado
              </BotonPrimario>
            </form>
          </Tarjeta>

          {/* Lista de suscriptores */}
          <Tarjeta>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wide text-marca-magenta">
                Suscriptores Autorizados
              </h2>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-800">
                {suscriptores.filter((s) => s.activo === 1).length} activos
              </span>
            </div>

            <div className="mt-2">
              <EntradaTexto
                placeholder="Buscar por correo o nombre..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>

            <div className="mt-3 divide-y divide-zinc-100">
              {suscriptoresFiltrados.length === 0 ? (
                <p className="py-4 text-center text-xs text-zinc-500">No se encontraron suscriptores.</p>
              ) : (
                suscriptoresFiltrados.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2.5">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="truncate text-xs font-bold text-zinc-900">{s.email}</p>
                      <p className="text-[11px] text-zinc-500">
                        {s.nombre ? `${s.nombre} · ` : ''}Plan: {s.plan.toUpperCase()} · Alta: {s.fechaAlta}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => void handleAlternarSub(s.id)}
                        className={`rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                          s.activo === 1
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                        }`}
                      >
                        {s.activo === 1 ? 'Activo' : 'Pausado'}
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleEliminarSub(s.id)}
                        className="rounded-lg p-1 text-zinc-400 hover:text-red-600"
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Tarjeta>
        </div>
      )}

      {/* TAB 2: ANUNCIOS Y PROMOS */}
      {tab === 'anuncios' && (
        <div className="space-y-4">
          <Tarjeta>
            <h2 className="text-sm font-bold uppercase tracking-wide text-marca-magenta">
              Crear Aviso de Promoción o Actualización
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              El anuncio activo se mostrará como un banner destacado en la pantalla principal de las usuarias.
            </p>

            <form onSubmit={handleCrearAnuncio} className="mt-3 space-y-3">
              <Campo etiqueta="Tipo de Aviso">
                <Selector
                  opciones={[
                    { valor: 'promocion', etiqueta: '🎉 Promoción Especial' },
                    { valor: 'update', etiqueta: '📲 Actualización de App' },
                    { valor: 'aviso', etiqueta: 'ℹ️ Aviso General' },
                  ]}
                  value={anuncioTipo}
                  onChange={(e) => setAnuncioTipo(e.target.value as AnuncioAdmin['tipo'])}
                />
              </Campo>

              <Campo etiqueta="Título">
                <EntradaTexto
                  placeholder="Ej: ¡Promo 2x1 en Plan Semanal!"
                  value={anuncioTitulo}
                  onChange={(e) => setAnuncioTitulo(e.target.value)}
                  required
                />
              </Campo>

              <Campo etiqueta="Mensaje">
                <EntradaTexto
                  placeholder="Ej: Inscríbete esta semana y recibe acceso al recetario exclusivo."
                  value={anuncioMensaje}
                  onChange={(e) => setAnuncioMensaje(e.target.value)}
                  required
                />
              </Campo>

              <Campo etiqueta="Enlace de Acción (opcional)">
                <EntradaTexto
                  placeholder="Ej: /totalhiit.apk o https://..."
                  value={anuncioEnlace}
                  onChange={(e) => setAnuncioEnlace(e.target.value)}
                />
              </Campo>

              {mensajeAnuncio && <p className="text-xs font-semibold text-green-700">{mensajeAnuncio}</p>}

              <BotonPrimario type="submit" className="w-full">
                Publicar Anuncio Activo
              </BotonPrimario>
            </form>
          </Tarjeta>

          {/* Historial de anuncios */}
          <Tarjeta>
            <h2 className="text-sm font-bold uppercase tracking-wide text-marca-magenta">
              Avisos Registrados
            </h2>

            <div className="mt-3 divide-y divide-zinc-100">
              {anuncios.length === 0 ? (
                <p className="py-4 text-center text-xs text-zinc-500">No hay anuncios configurados.</p>
              ) : (
                anuncios.map((a) => (
                  <div key={a.id} className="py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                            a.tipo === 'promocion'
                              ? 'bg-amber-100 text-amber-800'
                              : a.tipo === 'update'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {a.tipo}
                        </span>
                        <h3 className="mt-1 text-xs font-bold text-zinc-900">{a.titulo}</h3>
                        <p className="text-xs text-zinc-600">{a.mensaje}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => void handleAlternarAnuncio(a.id)}
                          className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                            a.activo === 1
                              ? 'bg-green-100 text-green-800'
                              : 'bg-zinc-200 text-zinc-600'
                          }`}
                        >
                          {a.activo === 1 ? 'Activo' : 'Inactivo'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleEliminarAnuncio(a.id)}
                          className="rounded-lg p-1 text-zinc-400 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Tarjeta>
        </div>
      )}

      {/* Pestaña: Seguridad y Clave (Item 9) */}
      {tab === 'seguridad' && (
        <div className="space-y-4">
          <Tarjeta>
            <h2 className="text-sm font-bold uppercase tracking-wide text-marca-magenta">
              Cambiar Clave de Administrador
            </h2>
            <p className="mt-1 text-xs text-zinc-600">
              Personaliza tu contraseña de acceso para administrar suscriptoras y anuncios con total seguridad.
            </p>

            <form onSubmit={handleCambiarClave} className="mt-4 space-y-3.5">
              <Campo etiqueta="Nueva Clave (mínimo 6 caracteres)">
                <div className="relative">
                  <EntradaTexto
                    type={verNuevaClave ? 'text' : 'password'}
                    placeholder="Escribe la nueva clave..."
                    value={nuevaClave}
                    onChange={(e) => setNuevaClave(e.target.value)}
                    required
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setVerNuevaClave(!verNuevaClave)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition"
                  >
                    {verNuevaClave ? '🙈 Ocultar' : '👁️ Ver'}
                  </button>
                </div>
              </Campo>

              <Campo etiqueta="Confirmar Nueva Clave">
                <EntradaTexto
                  type={verNuevaClave ? 'text' : 'password'}
                  placeholder="Repite la nueva clave..."
                  value={confirmarClave}
                  onChange={(e) => setConfirmarClave(e.target.value)}
                  required
                />
              </Campo>

              {mensajeCambioClave && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-2.5 text-xs font-semibold text-green-800">
                  ✓ {mensajeCambioClave}
                </div>
              )}

              {errorCambioClave && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-700">
                  ⚠️ {errorCambioClave}
                </div>
              )}

              <BotonPrimario type="submit" className="min-h-[44px] w-full text-xs font-bold">
                💾 Guardar Nueva Clave
              </BotonPrimario>
            </form>
          </Tarjeta>

          <Tarjeta>
            <h2 className="text-sm font-bold uppercase tracking-wide text-marca-magenta">
              Correos Autorizados para Recuperación
            </h2>
            <p className="mt-1 text-xs text-zinc-600">
              Si olvidas tu clave, puedes restablecerla desde la pantalla de inicio ingresando cualquiera de estos correos:
            </p>

            <ul className="mt-3 space-y-1.5 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs font-mono text-zinc-800">
              {EMAILS_ADMIN_POR_DEFECTO.map((m) => (
                <li key={m} className="flex items-center gap-2">
                  <span>🛡️</span>
                  <strong>{m}</strong>
                </li>
              ))}
            </ul>

            <div className="mt-4 border-t border-zinc-100 pt-3">
              <button
                type="button"
                onClick={handleRestablecerClaveDefecto}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-50 active:scale-95 transition"
              >
                🔄 Restablecer a clave por defecto ({CLAVE_ADMIN_POR_DEFECTO})
              </button>
            </div>
          </Tarjeta>
        </div>
      )}
    </main>
  );
}
