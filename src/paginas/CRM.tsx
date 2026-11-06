import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import BannerSeccion from '../componentes/BannerSeccion';
import {
  BotonPrimario,
  BotonSecundario,
  Campo,
  EntradaTexto,
  Tarjeta,
} from '../componentes/ui';
import {
  cambiarClaveAdmin,
  cerrarSesionAdmin,
  CLAVE_ADMIN_POR_DEFECTO,
  EMAILS_ADMIN_POR_DEFECTO,
  estaAutenticadoAdmin,
  obtenerEmailAdminAutenticado,
  restablecerClaveAdminPorEmail,
  validarLoginAdmin,
} from '../lib/admin/admin-servicio';
import type { AlumnaCRM, EgresoCRM, IngresoCRM, PaisCRM } from '../lib/datos/db';
import {
  calcularVencimientosAlumnas,
  eliminarAlumnaCRM,
  eliminarEgresoCRM,
  eliminarIngresoCRM,
  generarEnlaceWhatsApp,
  generarMensajeMotivadorEmail,
  generarMensajeMotivadorWhatsApp,
  guardarAlumnaCRM,
  guardarEgresoCRM,
  guardarIngresoCRM,
  listarAlumnasCRM,
  listarEgresosCRM,
  listarIngresosCRM,
  listarPaisesCRM,
  type AlertaVencimiento,
} from '../lib/crm/crm-servicio';

export default function CRM() {
  const [autenticado, setAutenticado] = useState(estaAutenticadoAdmin);
  const [adminEmail, setAdminEmail] = useState(obtenerEmailAdminAutenticado);

  // Credenciales login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginClave, setLoginClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');

  // Recuperación clave
  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState('');
  const [msgRecuperar, setMsgRecuperar] = useState('');
  const [errorRecuperar, setErrorRecuperar] = useState('');

  // Pestañas
  const [tab, setTab] = useState<
    'alumnas' | 'vencimientos' | 'ingresos' | 'egresos' | 'dashboard' | 'seguridad'
  >('alumnas');

  // Datos
  const [alumnas, setAlumnas] = useState<AlumnaCRM[]>([]);
  const [paises, setPaises] = useState<PaisCRM[]>([]);
  const [ingresos, setIngresos] = useState<IngresoCRM[]>([]);
  const [egresos, setEgresos] = useState<EgresoCRM[]>([]);
  const [alertas, setAlertas] = useState<AlertaVencimiento[]>([]);
  const [cargando, setCargando] = useState(false);

  // Filtros Alumnas
  const [busquedaAlumna, setBusquedaAlumna] = useState('');
  const [filtroPais, setFiltroPais] = useState<string>('todos');
  const [filtroMoneda, setFiltroMoneda] = useState<string>('todas');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activas' | 'inactivas'>('todos');

  // Modal Alta / Edición Alumna
  const [modalAlumnaAbierto, setModalAlumnaAbierto] = useState(false);
  const [alumnaEditando, setAlumnaEditando] = useState<AlumnaCRM | null>(null);
  const [formCodigo, setFormCodigo] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formPaisId, setFormPaisId] = useState(1);
  const [formMoneda, setFormMoneda] = useState<'USD' | 'EUR' | 'ARS'>('USD');
  const [formFechaInicio, setFormFechaInicio] = useState('2026-06-01');
  const [formDiaPago, setFormDiaPago] = useState(1);
  const [formActiva, setFormActiva] = useState(1);
  const [formNotas, setFormNotas] = useState('');

  // Modal Mensaje WhatsApp / Email Motivador
  const [modalMsgAbierto, setModalMsgAbierto] = useState(false);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<AlertaVencimiento | null>(null);
  const [textoMsgPersonalizado, setTextoMsgPersonalizado] = useState('');
  const [copiadoExito, setCopiadoExito] = useState(false);

  // Modal Registrar Ingreso
  const [modalIngresoAbierto, setModalIngresoAbierto] = useState(false);
  const [ingTipo, setIngTipo] = useState<IngresoCRM['tipo_ingreso']>('CUOTA_ALUMNA');
  const [ingAlumnaCod, setIngAlumnaCod] = useState('');
  const [ingClienteMarca, setIngClienteMarca] = useState('');
  const [ingConcepto, setIngConcepto] = useState('Cuota Mensual TotalHIIT');
  const [ingFecha, setIngFecha] = useState('2026-06-01');
  const [ingMoneda, setIngMoneda] = useState('USD');
  const [ingMonto, setIngMonto] = useState<number>(40);
  const [ingTasaUsd, setIngTasaUsd] = useState<number>(1.0);
  const [ingTasaArs, setIngTasaArs] = useState<number>(1449.58);
  const [ingMetodo, setIngMetodo] = useState('Transferencia');
  const [ingNotas, setIngNotas] = useState('');

  // Modal Registrar Egreso
  const [modalEgresoAbierto, setModalEgresoAbierto] = useState(false);
  const [egrCategoria, setEgrCategoria] = useState<EgresoCRM['categoria']>('PUBLICIDAD');
  const [egrConcepto, setEgrConcepto] = useState('');
  const [egrFecha, setEgrFecha] = useState('2026-06-01');
  const [egrProveedor, setEgrProveedor] = useState('');
  const [egrMoneda, setEgrMoneda] = useState('USD');
  const [egrMonto, setEgrMonto] = useState<number>(50);
  const [egrTasaUsd, setEgrTasaUsd] = useState<number>(1.0);
  const [egrTasaArs, setEgrTasaArs] = useState<number>(1449.58);
  const [egrMetodo, setEgrMetodo] = useState('Tarjeta');
  const [egrNotas, setEgrNotas] = useState('');

  // Seguridad
  const [nuevaClave, setNuevaClave] = useState('');
  const [confirmarClave, setConfirmarClave] = useState('');
  const [msgSeguridad, setMsgSeguridad] = useState('');
  const [errorSeguridad, setErrorSeguridad] = useState('');

  // Carga de datos
  const recargarDatos = async () => {
    setCargando(true);
    try {
      const [listaAlumnas, listaPaises, listaIngresos, listaEgresos, listaAlertas] =
        await Promise.all([
          listarAlumnasCRM(),
          listarPaisesCRM(),
          listarIngresosCRM(),
          listarEgresosCRM(),
          calcularVencimientosAlumnas(),
        ]);
      setAlumnas(listaAlumnas);
      setPaises(listaPaises);
      setIngresos(listaIngresos);
      setEgresos(listaEgresos);
      setAlertas(listaAlertas);
    } catch (err) {
      console.error('Error cargando CRM:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (autenticado) {
      void recargarDatos();
    }
  }, [autenticado]);

  // Manejador login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin('');
    const res = validarLoginAdmin(loginEmail, loginClave);
    if (res.exito) {
      setAutenticado(true);
      setAdminEmail(obtenerEmailAdminAutenticado());
    } else {
      setErrorLogin(res.mensaje);
    }
  };

  // Manejador salir
  const handleLogout = () => {
    cerrarSesionAdmin();
    setAutenticado(false);
  };

  // Manejador recuperación clave
  const handleRecuperar = (e: React.FormEvent) => {
    e.preventDefault();
    setMsgRecuperar('');
    setErrorRecuperar('');
    const res = restablecerClaveAdminPorEmail(emailRecuperar);
    if (res.exito) {
      setMsgRecuperar(res.mensaje);
      setLoginClave(CLAVE_ADMIN_POR_DEFECTO);
    } else {
      setErrorRecuperar(res.mensaje);
    }
  };

  // Mapa de países por ID
  const mapaPaises = useMemo(() => {
    const map = new Map<number, PaisCRM>();
    paises.forEach((p) => map.set(p.id, p));
    return map;
  }, [paises]);

  // Alumnas filtradas
  const alumnasFiltradas = useMemo(() => {
    return alumnas.filter((a) => {
      const q = busquedaAlumna.toLowerCase();
      const coincideTexto =
        a.nombre_completo.toLowerCase().includes(q) ||
        a.codigo.toLowerCase().includes(q) ||
        (a.email || '').toLowerCase().includes(q) ||
        (a.telefono_whatsapp || '').includes(q);

      const coincidePais = filtroPais === 'todos' || a.pais_id === Number(filtroPais);
      const coincideMoneda = filtroMoneda === 'todas' || a.moneda_preferida === filtroMoneda;
      const coincideEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'activas' && a.activa === 1) ||
        (filtroEstado === 'inactivas' && a.activa === 0);

      return coincideTexto && coincidePais && coincideMoneda && coincideEstado;
    });
  }, [alumnas, busquedaAlumna, filtroPais, filtroMoneda, filtroEstado]);

  // Abrir modal nueva alumna
  const handleAbrirNuevaAlumna = () => {
    setAlumnaEditando(null);
    const sigNum = (alumnas.length + 1).toString().padStart(4, '0');
    setFormCodigo(sigNum);
    setFormNombre('');
    setFormEmail('');
    setFormTelefono('');
    setFormPaisId(1);
    setFormMoneda('USD');
    setFormFechaInicio('2026-06-01');
    setFormDiaPago(1);
    setFormActiva(1);
    setFormNotas('');
    setModalAlumnaAbierto(true);
  };

  // Abrir modal editar alumna
  const handleAbrirEditarAlumna = (a: AlumnaCRM) => {
    setAlumnaEditando(a);
    setFormCodigo(a.codigo);
    setFormNombre(a.nombre_completo);
    setFormEmail(a.email || '');
    setFormTelefono(a.telefono_whatsapp || '');
    setFormPaisId(a.pais_id);
    setFormMoneda(a.moneda_preferida);
    setFormFechaInicio(a.fecha_inicio);
    setFormDiaPago(a.dia_de_pago);
    setFormActiva(a.activa);
    setFormNotas(a.notas || '');
    setModalAlumnaAbierto(true);
  };

  // Guardar alumna
  const handleGuardarAlumna = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim()) return;

    const payload: AlumnaCRM = {
      codigo: formCodigo.trim(),
      nombre_completo: formNombre.trim(),
      email: formEmail.trim() || undefined,
      telefono_whatsapp: formTelefono.trim() || undefined,
      pais_id: Number(formPaisId),
      moneda_preferida: formMoneda,
      fecha_inicio: formFechaInicio,
      dia_de_pago: Number(formDiaPago) || 1,
      activa: formActiva,
      notas: formNotas.trim() || undefined,
    };

    await guardarAlumnaCRM(payload);
    setModalAlumnaAbierto(false);
    await recargarDatos();
  };

  // Eliminar alumna
  const handleEliminarAlumna = async (codigo: string, nombre: string) => {
    if (window.confirm(`¿Confirmas eliminar a la alumna ${nombre} (${codigo})?`)) {
      await eliminarAlumnaCRM(codigo);
      await recargarDatos();
    }
  };

  // Abrir modal de mensaje de cobro
  const handleAbrirMensajeCobro = (alerta: AlertaVencimiento) => {
    setAlertaSeleccionada(alerta);
    const msg = generarMensajeMotivadorWhatsApp({
      nombre: alerta.alumna.nombre_completo,
      monto: alerta.montoEstimado,
      moneda: alerta.moneda,
      diaPago: alerta.diaDePago,
    });
    setTextoMsgPersonalizado(msg);
    setCopiadoExito(false);
    setModalMsgAbierto(true);
  };

  // Copiar al portapapeles
  const handleCopiarMensaje = async () => {
    try {
      await navigator.clipboard.writeText(textoMsgPersonalizado);
      setCopiadoExito(true);
      setTimeout(() => setCopiadoExito(false), 2500);
    } catch {
      alert('Copia el texto manualmente.');
    }
  };

  // Ajustar tasas según moneda seleccionada en ingreso
  const handleCambioMonedaIngreso = (mon: string) => {
    setIngMoneda(mon);
    if (mon === 'USD') {
      setIngTasaUsd(1.0);
      setIngTasaArs(1449.58);
      setIngMonto(40);
    } else if (mon === 'EUR') {
      setIngTasaUsd(1.14678899);
      setIngTasaArs(1662.36238532);
      setIngMonto(40);
    } else if (mon === 'ARS') {
      setIngTasaUsd(0.00068985);
      setIngTasaArs(1.0);
      setIngMonto(40000);
    }
  };

  // Guardar nuevo ingreso
  const handleGuardarIngreso = async (e: React.FormEvent) => {
    e.preventDefault();
    const monto = Number(ingMonto) || 0;
    const tasaUsd = Number(ingTasaUsd) || 1.0;
    const tasaArs = Number(ingTasaArs) || 1.0;

    const fechaObj = new Date(ingFecha);
    const mesPeriodo = isNaN(fechaObj.getMonth()) ? 6 : fechaObj.getMonth() + 1;
    const anioPeriodo = isNaN(fechaObj.getFullYear()) ? 2026 : fechaObj.getFullYear();

    const nuevo: IngresoCRM = {
      id: `ing-${Date.now()}`,
      tipo_ingreso: ingTipo,
      alumna_codigo: ingTipo === 'CUOTA_ALUMNA' ? ingAlumnaCod : undefined,
      cliente_o_marca: ingTipo !== 'CUOTA_ALUMNA' ? ingClienteMarca : undefined,
      concepto: ingConcepto.trim() || 'Ingreso TotalHIIT',
      fecha_pago: ingFecha,
      moneda_original: ingMoneda,
      monto_original: monto,
      tasa_a_usd: tasaUsd,
      tasa_a_ars: tasaArs,
      usd_equivalente: Math.round(monto * tasaUsd * 100) / 100,
      ars_equivalente: Math.round(monto * tasaArs * 100) / 100,
      mes_periodo: mesPeriodo,
      anio_periodo: anioPeriodo,
      metodo_pago: ingMetodo,
      estado: 'APROBADO',
      cargado_por: 'ADMIN',
      notas: ingNotas.trim() || undefined,
    };

    await guardarIngresoCRM(nuevo);
    setModalIngresoAbierto(false);
    await recargarDatos();
  };

  // Guardar nuevo egreso
  const handleGuardarEgreso = async (e: React.FormEvent) => {
    e.preventDefault();
    const monto = Number(egrMonto) || 0;
    const tasaUsd = Number(egrTasaUsd) || 1.0;
    const tasaArs = Number(egrTasaArs) || 1.0;

    const fechaObj = new Date(egrFecha);
    const mesPeriodo = isNaN(fechaObj.getMonth()) ? 6 : fechaObj.getMonth() + 1;
    const anioPeriodo = isNaN(fechaObj.getFullYear()) ? 2026 : fechaObj.getFullYear();

    const nuevo: EgresoCRM = {
      id: `egr-${Date.now()}`,
      categoria: egrCategoria,
      concepto: egrConcepto.trim(),
      fecha: egrFecha,
      proveedor: egrProveedor.trim() || undefined,
      moneda_original: egrMoneda,
      monto_original: monto,
      tasa_a_usd: tasaUsd,
      tasa_a_ars: tasaArs,
      usd_equivalente: Math.round(monto * tasaUsd * 100) / 100,
      ars_equivalente: Math.round(monto * tasaArs * 100) / 100,
      mes_periodo: mesPeriodo,
      anio_periodo: anioPeriodo,
      metodo_pago: egrMetodo,
      notas: egrNotas.trim() || undefined,
    };

    await guardarEgresoCRM(nuevo);
    setModalEgresoAbierto(false);
    await recargarDatos();
  };

  // Cambiar clave admin
  const handleCambiarClave = (e: React.FormEvent) => {
    e.preventDefault();
    setMsgSeguridad('');
    setErrorSeguridad('');
    if (nuevaClave.trim() !== confirmarClave.trim()) {
      setErrorSeguridad('Las contraseñas no coinciden.');
      return;
    }
    const res = cambiarClaveAdmin(nuevaClave);
    if (res.exito) {
      setMsgSeguridad(res.mensaje);
      setNuevaClave('');
      setConfirmarClave('');
    } else {
      setErrorSeguridad(res.mensaje);
    }
  };

  // Métricas financieras consolidadas
  const metricas = useMemo(() => {
    const totalIngresosUSD = ingresos.reduce((acc, i) => acc + (i.usd_equivalente || 0), 0);
    const totalIngresosARS = ingresos.reduce((acc, i) => acc + (i.ars_equivalente || 0), 0);
    const totalEgresosUSD = egresos.reduce((acc, e) => acc + (e.usd_equivalente || 0), 0);
    const totalEgresosARS = egresos.reduce((acc, e) => acc + (e.ars_equivalente || 0), 0);

    const gananciaNetaUSD = totalIngresosUSD - totalEgresosUSD;
    const gananciaNetaARS = totalIngresosARS - totalEgresosARS;

    const ingresosCuotas = ingresos
      .filter((i) => i.tipo_ingreso === 'CUOTA_ALUMNA')
      .reduce((acc, i) => acc + (i.usd_equivalente || 0), 0);
    const ingresosApp = ingresos
      .filter((i) => i.tipo_ingreso === 'CONTRATACION_APP')
      .reduce((acc, i) => acc + (i.usd_equivalente || 0), 0);
    const ingresosMarcas = ingresos
      .filter((i) => i.tipo_ingreso === 'COLABORACION_MARCA')
      .reduce((acc, i) => acc + (i.usd_equivalente || 0), 0);

    const egresosPublicidad = egresos
      .filter((e) => e.categoria === 'PUBLICIDAD')
      .reduce((acc, e) => acc + (e.usd_equivalente || 0), 0);
    const egresosEquipos = egresos
      .filter((e) => e.categoria === 'EQUIPOS')
      .reduce((acc, e) => acc + (e.usd_equivalente || 0), 0);
    const egresosImpuestos = egresos
      .filter((e) => e.categoria === 'IMPUESTOS')
      .reduce((acc, e) => acc + (e.usd_equivalente || 0), 0);

    // Conteo por países
    const porPaisUSD = new Map<string, number>();
    ingresos
      .filter((i) => i.alumna_codigo)
      .forEach((i) => {
        const al = alumnas.find((a) => a.codigo === i.alumna_codigo);
        const paisNom = al ? mapaPaises.get(al.pais_id)?.nombre || 'Otro' : 'Otro';
        porPaisUSD.set(paisNom, (porPaisUSD.get(paisNom) || 0) + (i.usd_equivalente || 0));
      });

    return {
      totalIngresosUSD,
      totalIngresosARS,
      totalEgresosUSD,
      totalEgresosARS,
      gananciaNetaUSD,
      gananciaNetaARS,
      ingresosCuotas,
      ingresosApp,
      ingresosMarcas,
      egresosPublicidad,
      egresosEquipos,
      egresosImpuestos,
      porPaisUSD: Array.from(porPaisUSD.entries()),
      ticketPromedioUSD: ingresos.length > 0 ? totalIngresosUSD / ingresos.length : 0,
      cantAlumnasActivas: alumnas.filter((a) => a.activa === 1).length,
    };
  }, [ingresos, egresos, alumnas, mapaPaises]);

  // Si no está autenticado, mostramos login unificado
  if (!autenticado) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-950 p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <img
              src="/images/logo_valen.jpeg"
              alt="TotalHIIT"
              className="mx-auto h-20 w-20 rounded-2xl border-2 border-marca-magenta object-cover shadow-lg"
            />
            <h1 className="mt-3 font-marca text-2xl tracking-wider text-white">
              TOTAL<span className="text-marca-magenta">HIIT</span> CRM
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Sistema de Gestión de Alumnas, Finanzas & Cobros Multi-divisa
            </p>
          </div>

          <Tarjeta className="border-zinc-800 bg-zinc-900 text-zinc-100 shadow-2xl">
            {!modoRecuperar ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <Campo etiqueta="Correo de Administrador">
                  <EntradaTexto
                    type="email"
                    placeholder="ej: ebolivar1000@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="border-zinc-700 bg-zinc-800 text-white placeholder-zinc-500"
                  />
                </Campo>

                <Campo etiqueta="Contraseña de Administrador">
                  <div className="relative">
                    <EntradaTexto
                      type={verClave ? 'text' : 'password'}
                      placeholder="admin2026"
                      value={loginClave}
                      onChange={(e) => setLoginClave(e.target.value)}
                      required
                      className="border-zinc-700 bg-zinc-800 pr-12 text-white placeholder-zinc-500"
                    />
                    <button
                      type="button"
                      onClick={() => setVerClave(!verClave)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-xs text-zinc-400 hover:text-white"
                    >
                      {verClave ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>
                </Campo>

                {errorLogin && (
                  <div className="rounded-xl border border-red-500/30 bg-red-950/50 p-3 text-xs font-semibold text-red-300">
                    ⚠️ {errorLogin}
                  </div>
                )}

                <BotonPrimario type="submit" className="w-full font-bold shadow-lg shadow-marca-magenta/30">
                  Iniciar Sesión en el CRM
                </BotonPrimario>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setModoRecuperar(true);
                      setErrorLogin('');
                    }}
                    className="text-pink-400 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                  <Link to="/" className="text-zinc-400 hover:text-zinc-200">
                    ← Volver a la App
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRecuperar} className="space-y-4">
                <h3 className="text-sm font-bold text-white">Recuperar Acceso Administrativo</h3>
                <p className="text-xs text-zinc-400">
                  Ingresa tu correo autorizado para restablecer la contraseña a la clave inicial (
                  <code className="text-pink-400">{CLAVE_ADMIN_POR_DEFECTO}</code>).
                </p>

                <Campo etiqueta="Correo Autorizado">
                  <EntradaTexto
                    type="email"
                    placeholder="ej: caribialabs@gmail.com"
                    value={emailRecuperar}
                    onChange={(e) => setEmailRecuperar(e.target.value)}
                    required
                    className="border-zinc-700 bg-zinc-800 text-white placeholder-zinc-500"
                  />
                </Campo>

                {msgRecuperar && (
                  <div className="rounded-xl border border-green-500/30 bg-green-950/50 p-3 text-xs font-semibold text-green-300">
                    ✅ {msgRecuperar}
                  </div>
                )}

                {errorRecuperar && (
                  <div className="rounded-xl border border-red-500/30 bg-red-950/50 p-3 text-xs font-semibold text-red-300">
                    ⚠️ {errorRecuperar}
                  </div>
                )}

                <BotonPrimario type="submit" className="w-full font-bold">
                  Restablecer Contraseña
                </BotonPrimario>

                <button
                  type="button"
                  onClick={() => {
                    setModoRecuperar(false);
                    setMsgRecuperar('');
                    setErrorRecuperar('');
                  }}
                  className="w-full text-center text-xs text-zinc-400 hover:underline"
                >
                  Volver al formulario de acceso
                </button>
              </form>
            )}
          </Tarjeta>
        </div>
      </div>
    );
  }

  // Vista Principal del CRM
  return (
    <div className="min-h-dvh bg-zinc-100 text-zinc-900 pb-16">
      {/* Barra superior de Administrador */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 px-4 py-2.5 backdrop-blur shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo_valen.jpeg"
              alt="TotalHIIT"
              className="h-9 w-9 rounded-xl border border-marca-magenta object-cover"
            />
            <div>
              <span className="font-marca text-base tracking-wider text-zinc-900">
                TOTAL<span className="text-marca-magenta">HIIT</span>
              </span>
              <span className="ml-2 rounded-md bg-marca-magenta/10 px-2 py-0.5 text-[10px] font-bold text-marca-magenta">
                CRM v2.0
              </span>
              {cargando && (
                <span className="ml-2 text-[10px] text-zinc-400 font-semibold animate-pulse">
                  Actualizando...
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {adminEmail}
            </span>
            <Link
              to="/admin"
              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
            >
              Panel Anuncios
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700 hover:bg-zinc-200"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Contenedor central */}
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Banner de Cabecera TotalHIIT */}
        <BannerSeccion
          titulo="Portal de Gestión Contable & Alumnas"
          subtitulo="Control multidivisa unificado (USD, EUR, ARS), ciclo de cobros y rentabilidad operativa."
          etiqueta="TotalHIIT CRM"
          insignia={`${metricas.cantAlumnasActivas} Alumnas Activas`}
          imagenSrc="/images/banner-progreso.jpg"
          altura="h-44 sm:h-48"
        />

        {/* Barra de pestañas */}
        <div className="flex overflow-x-auto border-b border-zinc-200 bg-white rounded-2xl p-1.5 shadow-xs">
          {[
            { id: 'alumnas', etiqueta: '👥 Directorio Alumnas', count: alumnas.length },
            {
              id: 'vencimientos',
              etiqueta: '⏰ Vencimientos & Cobros',
              badge: alertas.filter((a) => a.estado === 'VENCE_HOY' || a.estado === 'VENCIDO').length,
            },
            { id: 'ingresos', etiqueta: '💵 Ingresos', count: ingresos.length },
            { id: 'egresos', etiqueta: '📉 Egresos de Marca', count: egresos.length },
            { id: 'dashboard', etiqueta: '📊 Métricas & P&L' },
            { id: 'seguridad', etiqueta: '🔐 Seguridad' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as typeof tab)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                tab === item.id
                  ? 'bg-marca-magenta text-white shadow-sm'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              <span>{item.etiqueta}</span>
              {item.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    tab === item.id ? 'bg-white/30 text-white' : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {item.count}
                </span>
              )}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.2 text-[10px] font-bold text-white animate-bounce">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ============================================================== */}
        {/* PESTAÑA 1: DIRECTORIO DE ALUMNAS                                */}
        {/* ============================================================== */}
        {tab === 'alumnas' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="flex-1 flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="🔍 Buscar por nombre, código, email o teléfono..."
                  value={busquedaAlumna}
                  onChange={(e) => setBusquedaAlumna(e.target.value)}
                  className="w-full sm:w-80 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs outline-none focus:border-marca-magenta"
                />

                <select
                  value={filtroPais}
                  onChange={(e) => setFiltroPais(e.target.value)}
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs outline-none"
                >
                  <option value="todos">🌍 Todos los países</option>
                  {paises.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.bandera_emoji} {p.nombre}
                    </option>
                  ))}
                </select>

                <select
                  value={filtroMoneda}
                  onChange={(e) => setFiltroMoneda(e.target.value)}
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs outline-none"
                >
                  <option value="todas">🪙 Todas las monedas</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="ARS">ARS ($)</option>
                </select>

                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value as typeof filtroEstado)}
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs outline-none"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activas">✅ Solo Activas</option>
                  <option value="inactivas">⏸️ Solo Inactivas</option>
                </select>
              </div>

              <BotonPrimario
                onClick={handleAbrirNuevaAlumna}
                className="whitespace-nowrap py-2 text-xs font-bold"
              >
                + Nueva Alumna
              </BotonPrimario>
            </div>

            {/* Tabla / Tarjetas de Alumnas */}
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-200 bg-zinc-50 font-bold text-zinc-600">
                    <tr>
                      <th className="py-3 px-4">Código</th>
                      <th className="py-3 px-4">Alumna</th>
                      <th className="py-3 px-4">País</th>
                      <th className="py-3 px-4">Moneda</th>
                      <th className="py-3 px-4">Día de Cobro</th>
                      <th className="py-3 px-4">Contacto</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {alumnasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-zinc-400">
                          No se encontraron alumnas con los filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      alumnasFiltradas.map((a) => {
                        const pais = mapaPaises.get(a.pais_id);
                        return (
                          <tr key={a.codigo} className="hover:bg-zinc-50/80 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-marca-magenta">
                              {a.codigo}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-zinc-900 block">
                                {a.nombre_completo}
                              </span>
                              <span className="text-[11px] text-zinc-400">
                                Inicio: {a.fecha_inicio}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="mr-1.5">{pais?.bandera_emoji || '🌍'}</span>
                              <span className="text-zinc-700">{pais?.nombre || 'Desconocido'}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-bold text-zinc-700">
                                {a.moneda_preferida}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-semibold text-zinc-800">
                              Día {a.dia_de_pago} de c/ mes
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap space-y-0.5">
                              {a.telefono_whatsapp && (
                                <a
                                  href={generarEnlaceWhatsApp(
                                    a.telefono_whatsapp,
                                    `¡Hola ${a.nombre_completo}! ¿Cómo estás?`
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:underline"
                                >
                                  💬 {a.telefono_whatsapp}
                                </a>
                              )}
                              {a.email && (
                                <span className="block text-[11px] text-zinc-500">{a.email}</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  a.activa === 1
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-zinc-200 text-zinc-600'
                                }`}
                              >
                                {a.activa === 1 ? 'Activa' : 'Inactiva'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleAbrirEditarAlumna(a)}
                                className="rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-bold text-zinc-700 hover:bg-zinc-200"
                              >
                                ✏️ Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEliminarAlumna(a.codigo, a.nombre_completo)}
                                className="rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 2: VENCIMIENTOS & COBROS AUTOMÁTICOS                    */}
        {/* ============================================================== */}
        {tab === 'vencimientos' && (
          <div className="space-y-4">
            <Tarjeta className="border-amber-200 bg-amber-50/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-amber-900">
                    ⏰ Alertas Inteligentes de Ciclo de Cobro
                  </h3>
                  <p className="mt-0.5 text-xs text-amber-800">
                    Visualiza quién debe renovar membresía en los próximos 7 días o ya tiene cuota
                    pendiente. Envía recordatorios motivadores con 1 clic por WhatsApp o correo.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-red-800">
                    🔴 Vence Hoy / Vencido
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">
                    🟡 En 7 Días
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-800">
                    🟢 Al Día
                  </span>
                </div>
              </div>
            </Tarjeta>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alertas.map((alerta) => {
                const al = alerta.alumna;
                const pais = alerta.pais;
                const esUrgente = alerta.estado === 'VENCE_HOY' || alerta.estado === 'VENCIDO';
                const esProximo = alerta.estado === 'PROXIMO';

                const claseBorde = esUrgente
                  ? 'border-red-300 bg-red-50/30'
                  : esProximo
                  ? 'border-amber-300 bg-amber-50/30'
                  : 'border-zinc-200 bg-white';

                return (
                  <Tarjeta key={al.codigo} className={`${claseBorde} flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-marca-magenta">
                            {al.codigo}
                          </span>
                          <h4 className="font-bold text-zinc-900 text-sm">
                            {al.nombre_completo}
                          </h4>
                          <span className="text-xs text-zinc-500">
                            {pais?.bandera_emoji} {pais?.nombre}
                          </span>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            alerta.estado === 'VENCE_HOY'
                              ? 'bg-red-500 text-white animate-pulse'
                              : alerta.estado === 'VENCIDO'
                              ? 'bg-red-100 text-red-800'
                              : alerta.estado === 'PROXIMO'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {alerta.estado === 'VENCE_HOY'
                            ? '🚨 Vence Hoy'
                            : alerta.estado === 'VENCIDO'
                            ? `⚠️ Venció hace ${Math.abs(alerta.diasParaVencer)}d`
                            : alerta.estado === 'PROXIMO'
                            ? `⏳ Vence en ${alerta.diasParaVencer}d`
                            : '✅ Al Día'}
                        </span>
                      </div>

                      <div className="mt-3.5 space-y-1.5 text-xs text-zinc-600 border-t border-zinc-100 pt-2.5">
                        <div className="flex justify-between">
                          <span>Día de cobro habitual:</span>
                          <strong className="text-zinc-800">Día {alerta.diaDePago}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Cuota sugerida:</span>
                          <strong className="text-marca-magenta">
                            {alerta.moneda === 'EUR' ? '€' : '$'}
                            {alerta.montoEstimado.toLocaleString('es-ES')} {alerta.moneda}
                          </strong>
                        </div>
                        {al.telefono_whatsapp && (
                          <div className="flex justify-between text-[11px]">
                            <span>WhatsApp:</span>
                            <span className="font-mono text-zinc-700">{al.telefono_whatsapp}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 flex gap-2">
                      <BotonPrimario
                        onClick={() => handleAbrirMensajeCobro(alerta)}
                        className="flex-1 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        💬 Recordatorio
                      </BotonPrimario>
                    </div>
                  </Tarjeta>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 3: INGRESOS DIVERSIFICADOS                              */}
        {/* ============================================================== */}
        {tab === 'ingresos' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Registro de Ingresos (Cuotas, App, Marcas y Otros)
                </h3>
                <p className="text-xs text-zinc-500">
                  Histórico de cobros con tasas de cambio congeladas y equivalentes calculados.
                </p>
              </div>

              <BotonPrimario
                onClick={() => setModalIngresoAbierto(true)}
                className="py-2 text-xs font-bold"
              >
                + Registrar Ingreso
              </BotonPrimario>
            </div>

            {/* KPIs Rápidos de Ingresos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Tarjeta className="p-3.5 bg-white">
                <span className="text-[11px] font-bold text-zinc-500 block">Total en USD</span>
                <span className="text-lg font-black text-emerald-600">
                  ${metricas.totalIngresosUSD.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </span>
              </Tarjeta>
              <Tarjeta className="p-3.5 bg-white">
                <span className="text-[11px] font-bold text-zinc-500 block">Total en ARS</span>
                <span className="text-lg font-black text-zinc-800">
                  ${metricas.totalIngresosARS.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </span>
              </Tarjeta>
              <Tarjeta className="p-3.5 bg-white">
                <span className="text-[11px] font-bold text-zinc-500 block">Cuotas Alumnas</span>
                <span className="text-lg font-black text-marca-magenta">
                  ${metricas.ingresosCuotas.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </span>
              </Tarjeta>
              <Tarjeta className="p-3.5 bg-white">
                <span className="text-[11px] font-bold text-zinc-500 block">App & Marcas</span>
                <span className="text-lg font-black text-purple-600">
                  ${(metricas.ingresosApp + metricas.ingresosMarcas).toLocaleString('es-ES', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </Tarjeta>
            </div>

            {/* Tabla de Ingresos */}
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-200 bg-zinc-50 font-bold text-zinc-600">
                    <tr>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Cliente / Alumna</th>
                      <th className="py-3 px-4">Concepto</th>
                      <th className="py-3 px-4">Monto Original</th>
                      <th className="py-3 px-4">USD Equiv.</th>
                      <th className="py-3 px-4">ARS Equiv.</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {ingresos.map((ing) => {
                      const al = ing.alumna_codigo
                        ? alumnas.find((a) => a.codigo === ing.alumna_codigo)
                        : null;
                      return (
                        <tr key={ing.id} className="hover:bg-zinc-50/80">
                          <td className="py-3 px-4 whitespace-nowrap text-zinc-600">
                            {ing.fecha_pago}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                ing.tipo_ingreso === 'CUOTA_ALUMNA'
                                  ? 'bg-blue-100 text-blue-800'
                                  : ing.tipo_ingreso === 'CONTRATACION_APP'
                                  ? 'bg-purple-100 text-purple-800'
                                  : ing.tipo_ingreso === 'COLABORACION_MARCA'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-zinc-100 text-zinc-700'
                              }`}
                            >
                              {ing.tipo_ingreso === 'CUOTA_ALUMNA'
                                ? 'Alumna'
                                : ing.tipo_ingreso === 'CONTRATACION_APP'
                                ? 'App'
                                : ing.tipo_ingreso === 'COLABORACION_MARCA'
                                ? 'Marca'
                                : 'Otro'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-zinc-800">
                            {al ? `${al.nombre_completo} (${al.codigo})` : ing.cliente_o_marca || '—'}
                          </td>
                          <td className="py-3 px-4 text-zinc-600 max-w-xs truncate">
                            {ing.concepto}
                          </td>
                          <td className="py-3 px-4 font-bold text-zinc-900 whitespace-nowrap">
                            {ing.moneda_original === 'EUR' ? '€' : '$'}
                            {ing.monto_original.toLocaleString('es-ES')}{' '}
                            <span className="text-[10px] font-normal text-zinc-500">
                              {ing.moneda_original}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-600 whitespace-nowrap">
                            ${ing.usd_equivalente.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 font-medium text-zinc-700 whitespace-nowrap">
                            ${ing.ars_equivalente.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4">
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              {ing.estado}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={async () => {
                                if (window.confirm('¿Eliminar este registro de ingreso?')) {
                                  await eliminarIngresoCRM(ing.id);
                                  await recargarDatos();
                                }
                              }}
                              className="text-zinc-400 hover:text-red-600 text-xs font-bold"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 4: EGRESOS OPERATIVOS DE LA MARCA                       */}
        {/* ============================================================== */}
        {tab === 'egresos' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Control de Egresos & Costos de la Marca TotalHIIT
                </h3>
                <p className="text-xs text-zinc-500">
                  Publicidad (Meta/Google), Impuestos, Reposición de Equipos de video o entrenamiento.
                </p>
              </div>

              <BotonPrimario
                onClick={() => setModalEgresoAbierto(true)}
                className="py-2 text-xs font-bold bg-zinc-800 hover:bg-zinc-900"
              >
                + Declarar Egreso
              </BotonPrimario>
            </div>

            {/* KPIs de Gastos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Tarjeta className="p-3.5 bg-white">
                <span className="text-[11px] font-bold text-zinc-500 block">Total Egresos (USD)</span>
                <span className="text-lg font-black text-red-600">
                  ${metricas.totalEgresosUSD.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </span>
              </Tarjeta>
              <Tarjeta className="p-3.5 bg-white">
                <span className="text-[11px] font-bold text-zinc-500 block">Total Egresos (ARS)</span>
                <span className="text-lg font-black text-zinc-800">
                  ${metricas.totalEgresosARS.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </span>
              </Tarjeta>
              <Tarjeta className="p-3.5 bg-white">
                <span className="text-[11px] font-bold text-zinc-500 block">Publicidad Meta/Ads</span>
                <span className="text-lg font-black text-amber-600">
                  ${metricas.egresosPublicidad.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </span>
              </Tarjeta>
              <Tarjeta className="p-3.5 bg-white">
                <span className="text-[11px] font-bold text-zinc-500 block">Equipos & Otros</span>
                <span className="text-lg font-black text-zinc-700">
                  ${metricas.egresosEquipos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </span>
              </Tarjeta>
            </div>

            {/* Tabla de Egresos */}
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-200 bg-zinc-50 font-bold text-zinc-600">
                    <tr>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4">Concepto</th>
                      <th className="py-3 px-4">Proveedor</th>
                      <th className="py-3 px-4">Monto Original</th>
                      <th className="py-3 px-4">USD Equiv.</th>
                      <th className="py-3 px-4">ARS Equiv.</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {egresos.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-zinc-400">
                          Aún no hay egresos declarados este mes.
                        </td>
                      </tr>
                    ) : (
                      egresos.map((egr) => (
                        <tr key={egr.id} className="hover:bg-zinc-50/80">
                          <td className="py-3 px-4 whitespace-nowrap text-zinc-600">
                            {egr.fecha}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-700">
                              {egr.categoria}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-zinc-800">
                            {egr.concepto}
                          </td>
                          <td className="py-3 px-4 text-zinc-500">{egr.proveedor || '—'}</td>
                          <td className="py-3 px-4 font-bold text-zinc-900 whitespace-nowrap">
                            ${egr.monto_original.toLocaleString('es-ES')} {egr.moneda_original}
                          </td>
                          <td className="py-3 px-4 font-bold text-red-600 whitespace-nowrap">
                            ${egr.usd_equivalente.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 font-medium text-zinc-700 whitespace-nowrap">
                            ${egr.ars_equivalente.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={async () => {
                                if (window.confirm('¿Eliminar este registro de gasto?')) {
                                  await eliminarEgresoCRM(egr.id);
                                  await recargarDatos();
                                }
                              }}
                              className="text-zinc-400 hover:text-red-600 text-xs font-bold"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 5: DASHBOARD FINANCIERO & P&L                           */}
        {/* ============================================================== */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            {/* Tarjeta de Ganancia Real / P&L */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Tarjeta className="border-emerald-300 bg-gradient-to-br from-emerald-50 to-white">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  Ingresos Totales (Consolidados)
                </span>
                <div className="mt-2 text-2xl font-black text-emerald-700">
                  ${metricas.totalIngresosUSD.toLocaleString('es-ES', { minimumFractionDigits: 2 })}{' '}
                  <span className="text-xs font-normal text-zinc-500">USD</span>
                </div>
                <div className="mt-1 text-xs text-zinc-500 font-mono">
                  ARS: ${metricas.totalIngresosARS.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </div>
              </Tarjeta>

              <Tarjeta className="border-red-300 bg-gradient-to-br from-red-50 to-white">
                <span className="text-xs font-bold text-red-800 uppercase tracking-wide">
                  Egresos Operativos (Gastos)
                </span>
                <div className="mt-2 text-2xl font-black text-red-700">
                  ${metricas.totalEgresosUSD.toLocaleString('es-ES', { minimumFractionDigits: 2 })}{' '}
                  <span className="text-xs font-normal text-zinc-500">USD</span>
                </div>
                <div className="mt-1 text-xs text-zinc-500 font-mono">
                  ARS: ${metricas.totalEgresosARS.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </div>
              </Tarjeta>

              <Tarjeta className="border-marca-magenta bg-gradient-to-br from-pink-50 to-white shadow-md">
                <span className="text-xs font-bold text-marca-magenta uppercase tracking-wide">
                  Beneficio Neto Real (EBITDA)
                </span>
                <div className="mt-2 text-2xl font-black text-marca-magenta">
                  ${metricas.gananciaNetaUSD.toLocaleString('es-ES', { minimumFractionDigits: 2 })}{' '}
                  <span className="text-xs font-normal text-zinc-500">USD</span>
                </div>
                <div className="mt-1 text-xs text-zinc-500 font-mono">
                  ARS: ${metricas.gananciaNetaARS.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </div>
              </Tarjeta>
            </div>

            {/* Comparativa por País y Fuentes de Ingreso */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Tarjeta>
                <h3 className="text-sm font-bold text-zinc-900 mb-3 flex items-center justify-between">
                  <span>🌍 Distribución por País de Origen</span>
                  <span className="text-xs text-zinc-400 font-normal">Equiv. USD</span>
                </h3>

                <div className="space-y-3">
                  {metricas.porPaisUSD.map(([paisNom, totalUsd]) => {
                    const pct =
                      metricas.totalIngresosUSD > 0
                        ? Math.round((totalUsd / metricas.totalIngresosUSD) * 100)
                        : 0;
                    return (
                      <div key={paisNom} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-zinc-800">{paisNom}</span>
                          <span className="font-bold text-zinc-900">
                            ${totalUsd.toLocaleString('es-ES', { minimumFractionDigits: 2 })} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                          <div
                            className="h-full bg-marca-magenta rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Tarjeta>

              <Tarjeta>
                <h3 className="text-sm font-bold text-zinc-900 mb-3">
                  📈 Proyección de Escalabilidad a Futuro
                </h3>
                <p className="text-xs text-zinc-600 mb-4">
                  Simulación de ingresos proyectados manteniendo el ticket promedio actual de{' '}
                  <strong className="text-zinc-900">
                    ${metricas.ticketPromedioUSD.toFixed(1)} USD / alumna
                  </strong>
                  :
                </p>

                <div className="space-y-3 text-xs">
                  {[
                    { alumnas: 50, factor: 50 },
                    { alumnas: 100, factor: 100 },
                    { alumnas: 250, factor: 250 },
                  ].map((escenario) => {
                    const proyectadoUSD = escenario.factor * metricas.ticketPromedioUSD;
                    return (
                      <div
                        key={escenario.alumnas}
                        className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-3"
                      >
                        <div>
                          <span className="font-bold text-zinc-800">
                            Meta {escenario.alumnas} Alumnas Activas
                          </span>
                          <span className="block text-[11px] text-zinc-500">
                            + Suscripciones App y Sponsors
                          </span>
                        </div>
                        <span className="text-base font-black text-marca-magenta">
                          ~${Math.round(proyectadoUSD).toLocaleString('es-ES')} USD/mes
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Tarjeta>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 6: SEGURIDAD & CLAVE ADMIN                             */}
        {/* ============================================================== */}
        {tab === 'seguridad' && (
          <div className="max-w-xl mx-auto space-y-4">
            <Tarjeta>
              <h3 className="text-sm font-bold text-marca-magenta uppercase tracking-wide">
                Cambiar Contraseña de Administrador
              </h3>
              <p className="mt-1 text-xs text-zinc-600">
                Esta contraseña protege tanto la ruta <code className="text-pink-600 font-bold">/admin</code> como <code className="text-pink-600 font-bold">/crm</code>.
              </p>

              <form onSubmit={handleCambiarClave} className="mt-4 space-y-3.5">
                <Campo etiqueta="Nueva Contraseña (mínimo 6 caracteres)">
                  <EntradaTexto
                    type="password"
                    placeholder="Escribe la nueva contraseña..."
                    value={nuevaClave}
                    onChange={(e) => setNuevaClave(e.target.value)}
                    required
                  />
                </Campo>

                <Campo etiqueta="Confirmar Contraseña">
                  <EntradaTexto
                    type="password"
                    placeholder="Repite la nueva contraseña..."
                    value={confirmarClave}
                    onChange={(e) => setConfirmarClave(e.target.value)}
                    required
                  />
                </Campo>

                {msgSeguridad && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-2.5 text-xs font-semibold text-green-800">
                    ✅ {msgSeguridad}
                  </div>
                )}

                {errorSeguridad && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-700">
                    ⚠️ {errorSeguridad}
                  </div>
                )}

                <BotonPrimario type="submit" className="w-full text-xs font-bold">
                  💾 Guardar Nueva Contraseña
                </BotonPrimario>
              </form>
            </Tarjeta>

            <Tarjeta>
              <h4 className="text-xs font-bold text-zinc-700 uppercase">
                Correos de Administradores Autorizados
              </h4>
              <ul className="mt-2 space-y-1 text-xs font-mono text-zinc-600">
                {EMAILS_ADMIN_POR_DEFECTO.map((email) => (
                  <li key={email} className="flex items-center gap-2">
                    <span>🛡️</span>
                    <span>{email}</span>
                  </li>
                ))}
              </ul>
            </Tarjeta>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL: ALTA / EDICIÓN DE ALUMNA                                */}
      {/* ============================================================== */}
      {modalAlumnaAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900">
                {alumnaEditando ? '✏️ Editar Alumna' : '➕ Registrar Nueva Alumna'}
              </h3>
              <button
                type="button"
                onClick={() => setModalAlumnaAbierto(false)}
                className="text-zinc-400 hover:text-zinc-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarAlumna} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <Campo etiqueta="Código Único">
                  <EntradaTexto
                    value={formCodigo}
                    onChange={(e) => setFormCodigo(e.target.value)}
                    required
                    placeholder="0023"
                  />
                </Campo>

                <Campo etiqueta="Día de Cobro (1-31)">
                  <EntradaTexto
                    type="number"
                    min="1"
                    max="31"
                    value={formDiaPago}
                    onChange={(e) => setFormDiaPago(Number(e.target.value))}
                    required
                  />
                </Campo>
              </div>

              <Campo etiqueta="Nombre Completo">
                <EntradaTexto
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  required
                  placeholder="ej: Carolina Mendez"
                />
              </Campo>

              <div className="grid grid-cols-2 gap-3">
                <Campo etiqueta="País de Origen">
                  <select
                    value={formPaisId}
                    onChange={(e) => setFormPaisId(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-xs outline-none"
                  >
                    {paises.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.bandera_emoji} {p.nombre}
                      </option>
                    ))}
                  </select>
                </Campo>

                <Campo etiqueta="Moneda Habitual">
                  <select
                    value={formMoneda}
                    onChange={(e) => setFormMoneda(e.target.value as typeof formMoneda)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-xs outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="ARS">ARS ($)</option>
                  </select>
                </Campo>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Campo etiqueta="Teléfono / WhatsApp (con prefijo)">
                  <EntradaTexto
                    type="tel"
                    placeholder="+1 305..."
                    value={formTelefono}
                    onChange={(e) => setFormTelefono(e.target.value)}
                  />
                </Campo>

                <Campo etiqueta="Email">
                  <EntradaTexto
                    type="email"
                    placeholder="alumna@email.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </Campo>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Campo etiqueta="Fecha de Inicio">
                  <EntradaTexto
                    type="date"
                    value={formFechaInicio}
                    onChange={(e) => setFormFechaInicio(e.target.value)}
                    required
                  />
                </Campo>

                <Campo etiqueta="Estado">
                  <select
                    value={formActiva}
                    onChange={(e) => setFormActiva(Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-xs outline-none"
                  >
                    <option value={1}>✅ Activa</option>
                    <option value={0}>⏸️ Inactiva</option>
                  </select>
                </Campo>
              </div>

              <Campo etiqueta="Notas internas">
                <EntradaTexto
                  placeholder="Detalles de lesiones, horario de clases..."
                  value={formNotas}
                  onChange={(e) => setFormNotas(e.target.value)}
                />
              </Campo>

              <div className="flex gap-2 pt-2">
                <BotonSecundario
                  onClick={() => setModalAlumnaAbierto(false)}
                  className="flex-1 py-2 text-xs"
                >
                  Cancelar
                </BotonSecundario>
                <BotonPrimario type="submit" className="flex-1 py-2 text-xs font-bold">
                  Guardar Alumna
                </BotonPrimario>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: VISTA PREVIA MENSAJE MOTIVADOR COBRO                    */}
      {/* ============================================================== */}
      {modalMsgAbierto && alertaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  💬 Recordatorio Motivador de Cobro
                </h3>
                <p className="text-xs text-zinc-500">
                  Para: <strong className="text-zinc-800">{alertaSeleccionada.alumna.nombre_completo}</strong>{' '}
                  ({alertaSeleccionada.alumna.telefono_whatsapp || 'Sin WhatsApp'})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalMsgAbierto(false)}
                className="text-zinc-400 hover:text-zinc-600 font-bold"
              >
                ✕
              </button>
            </div>

            <textarea
              rows={11}
              value={textoMsgPersonalizado}
              onChange={(e) => setTextoMsgPersonalizado(e.target.value)}
              className="w-full rounded-2xl border border-zinc-300 p-3 text-xs leading-relaxed outline-none focus:border-marca-magenta font-sans"
            />

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopiarMensaje}
                className="flex-1 rounded-xl border border-zinc-300 bg-white py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
              >
                {copiadoExito ? '✅ ¡Copiado al Portapapeles!' : '📋 Copiar Mensaje'}
              </button>

              {alertaSeleccionada.alumna.email && (
                <a
                  href={`mailto:${alertaSeleccionada.alumna.email}?subject=${encodeURIComponent(
                    generarMensajeMotivadorEmail({
                      nombre: alertaSeleccionada.alumna.nombre_completo,
                      monto: alertaSeleccionada.montoEstimado,
                      moneda: alertaSeleccionada.moneda,
                      diaPago: alertaSeleccionada.diaDePago,
                    }).asunto
                  )}&body=${encodeURIComponent(
                    generarMensajeMotivadorEmail({
                      nombre: alertaSeleccionada.alumna.nombre_completo,
                      monto: alertaSeleccionada.montoEstimado,
                      moneda: alertaSeleccionada.moneda,
                      diaPago: alertaSeleccionada.diaDePago,
                    }).cuerpo
                  )}`}
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-center text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                >
                  ✉️ Email
                </a>
              )}

              <a
                href={generarEnlaceWhatsApp(
                  alertaSeleccionada.alumna.telefono_whatsapp,
                  textoMsgPersonalizado
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-center text-xs font-bold text-white hover:bg-emerald-700 shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>🚀 Abrir en WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: REGISTRAR INGRESO                                       */}
      {/* ============================================================== */}
      {modalIngresoAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900">💵 Registrar Nuevo Ingreso</h3>
              <button
                type="button"
                onClick={() => setModalIngresoAbierto(false)}
                className="text-zinc-400 hover:text-zinc-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarIngreso} className="space-y-3.5">
              <Campo etiqueta="Tipo de Ingreso">
                <select
                  value={ingTipo}
                  onChange={(e) => setIngTipo(e.target.value as typeof ingTipo)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-xs outline-none"
                >
                  <option value="CUOTA_ALUMNA">👥 Cuota de Alumna (Membresía)</option>
                  <option value="CONTRATACION_APP">📱 Contratación de la App (Licencia/PWA)</option>
                  <option value="COLABORACION_MARCA">🤝 Colaboración / Sponsor con Marca</option>
                  <option value="OTRO_INGRESO">✨ Otro Ingreso Extraordinario</option>
                </select>
              </Campo>

              {ingTipo === 'CUOTA_ALUMNA' ? (
                <Campo etiqueta="Alumna">
                  <select
                    value={ingAlumnaCod}
                    onChange={(e) => setIngAlumnaCod(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-xs outline-none"
                  >
                    <option value="">Selecciona una alumna...</option>
                    {alumnas.map((a) => (
                      <option key={a.codigo} value={a.codigo}>
                        {a.codigo} — {a.nombre_completo} ({a.moneda_preferida})
                      </option>
                    ))}
                  </select>
                </Campo>
              ) : (
                <Campo etiqueta="Nombre de Empresa / Marca o Cliente">
                  <EntradaTexto
                    placeholder="ej: Marca Ropa Deportiva, Empresa X..."
                    value={ingClienteMarca}
                    onChange={(e) => setIngClienteMarca(e.target.value)}
                    required
                  />
                </Campo>
              )}

              <Campo etiqueta="Concepto del Ingreso">
                <EntradaTexto
                  value={ingConcepto}
                  onChange={(e) => setIngConcepto(e.target.value)}
                  required
                />
              </Campo>

              <div className="grid grid-cols-2 gap-3">
                <Campo etiqueta="Fecha de Pago">
                  <EntradaTexto
                    type="date"
                    value={ingFecha}
                    onChange={(e) => setIngFecha(e.target.value)}
                    required
                  />
                </Campo>

                <Campo etiqueta="Moneda Original">
                  <select
                    value={ingMoneda}
                    onChange={(e) => handleCambioMonedaIngreso(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-xs outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="ARS">ARS ($)</option>
                  </select>
                </Campo>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Campo etiqueta="Monto Original">
                  <EntradaTexto
                    type="number"
                    step="any"
                    value={ingMonto}
                    onChange={(e) => setIngMonto(Number(e.target.value))}
                    required
                  />
                </Campo>
                <Campo etiqueta="Tasa a USD">
                  <EntradaTexto
                    type="number"
                    step="any"
                    value={ingTasaUsd}
                    onChange={(e) => setIngTasaUsd(Number(e.target.value))}
                    required
                  />
                </Campo>
                <Campo etiqueta="Tasa a ARS">
                  <EntradaTexto
                    type="number"
                    step="any"
                    value={ingTasaArs}
                    onChange={(e) => setIngTasaArs(Number(e.target.value))}
                    required
                  />
                </Campo>
              </div>

              <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3 text-xs flex justify-between font-mono">
                <span>
                  USD Equiv: <strong>${(ingMonto * ingTasaUsd).toFixed(2)}</strong>
                </span>
                <span>
                  ARS Equiv: <strong>${(ingMonto * ingTasaArs).toFixed(2)}</strong>
                </span>
              </div>

              <Campo etiqueta="Método de Pago">
                <select
                  value={ingMetodo}
                  onChange={(e) => setIngMetodo(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-xs outline-none"
                >
                  <option value="Transferencia">Transferencia Bancaria</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Stripe">Stripe</option>
                  <option value="MercadoPago">Mercado Pago</option>
                  <option value="Efectivo">Efectivo</option>
                </select>
              </Campo>

              <Campo etiqueta="Notas / Referencia">
                <EntradaTexto
                  placeholder="Número de comprobante, banco emisor..."
                  value={ingNotas}
                  onChange={(e) => setIngNotas(e.target.value)}
                />
              </Campo>

              <div className="flex gap-2 pt-2">
                <BotonSecundario
                  onClick={() => setModalIngresoAbierto(false)}
                  className="flex-1 py-2 text-xs"
                >
                  Cancelar
                </BotonSecundario>
                <BotonPrimario type="submit" className="flex-1 py-2 text-xs font-bold">
                  Guardar Ingreso
                </BotonPrimario>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: REGISTRAR EGRESO                                        */}
      {/* ============================================================== */}
      {modalEgresoAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900">📉 Declarar Egreso de Marca</h3>
              <button
                type="button"
                onClick={() => setModalEgresoAbierto(false)}
                className="text-zinc-400 hover:text-zinc-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarEgreso} className="space-y-3.5">
              <Campo etiqueta="Categoría de Gasto">
                <select
                  value={egrCategoria}
                  onChange={(e) => setEgrCategoria(e.target.value as typeof egrCategoria)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-xs outline-none"
                >
                  <option value="PUBLICIDAD">📢 Publicidad (Meta Ads, Google, Redes)</option>
                  <option value="IMPUESTOS">🏛️ Impuestos / Tasas Fiscales</option>
                  <option value="EQUIPOS">🎥 Reposición de Equipos (Video, Audio, Fitness)</option>
                  <option value="SOFTWARE_HOSTING">💻 Software, Hosting, Dominios</option>
                  <option value="OTRO_EGRESO">📦 Otros Egresos Operativos</option>
                </select>
              </Campo>

              <Campo etiqueta="Concepto / Detalle del Gasto">
                <EntradaTexto
                  placeholder="ej: Micrófono inalámbrico, Pauta Meta Junio..."
                  value={egrConcepto}
                  onChange={(e) => setEgrConcepto(e.target.value)}
                  required
                />
              </Campo>

              <div className="grid grid-cols-2 gap-3">
                <Campo etiqueta="Proveedor o Entidad">
                  <EntradaTexto
                    placeholder="Meta Ads, Amazon, AFIP..."
                    value={egrProveedor}
                    onChange={(e) => setEgrProveedor(e.target.value)}
                  />
                </Campo>

                <Campo etiqueta="Fecha">
                  <EntradaTexto
                    type="date"
                    value={egrFecha}
                    onChange={(e) => setEgrFecha(e.target.value)}
                    required
                  />
                </Campo>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Campo etiqueta="Monto">
                  <EntradaTexto
                    type="number"
                    step="any"
                    value={egrMonto}
                    onChange={(e) => setEgrMonto(Number(e.target.value))}
                    required
                  />
                </Campo>

                <Campo etiqueta="Moneda">
                  <select
                    value={egrMoneda}
                    onChange={(e) => {
                      const mon = e.target.value;
                      setEgrMoneda(mon);
                      if (mon === 'USD') {
                        setEgrTasaUsd(1.0);
                        setEgrTasaArs(1449.58);
                      } else if (mon === 'ARS') {
                        setEgrTasaUsd(0.00068985);
                        setEgrTasaArs(1.0);
                      }
                    }}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-xs outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="ARS">ARS ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </Campo>

                <Campo etiqueta="Método">
                  <select
                    value={egrMetodo}
                    onChange={(e) => setEgrMetodo(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-xs outline-none"
                  >
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Efectivo">Efectivo</option>
                  </select>
                </Campo>
              </div>

              <Campo etiqueta="Notas / Factura">
                <EntradaTexto
                  placeholder="Número de factura o comprobante..."
                  value={egrNotas}
                  onChange={(e) => setEgrNotas(e.target.value)}
                />
              </Campo>

              <div className="flex gap-2 pt-2">
                <BotonSecundario
                  onClick={() => setModalEgresoAbierto(false)}
                  className="flex-1 py-2 text-xs"
                >
                  Cancelar
                </BotonSecundario>
                <BotonPrimario type="submit" className="flex-1 py-2 text-xs font-bold">
                  Guardar Egreso
                </BotonPrimario>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
