import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import Navegacion from './componentes/Navegacion';
import AvisoConexion from './componentes/AvisoConexion';
import PortadaTransicion from './componentes/PortadaTransicion';
import Admin from './paginas/Admin';
import CRM from './paginas/CRM';
import { LLAVE_ONBOARDING_COMPLETADO, LLAVE_ONBOARDING_SALTADO, usePerfil } from './hooks/usePerfil';
import Ajustes from './paginas/Ajustes';
import Ciclo from './paginas/Ciclo';
import DetalleEntrenamiento from './paginas/DetalleEntrenamiento';
import DetalleReceta from './paginas/DetalleReceta';
import EditarPerfil from './paginas/EditarPerfil';
import Entrenamientos from './paginas/Entrenamientos';
import Inicio from './paginas/Inicio';
import Nutricion from './paginas/Nutricion';
import Onboarding from './paginas/Onboarding';
import Perfil from './paginas/Perfil';
import Plan from './paginas/Plan';
import Privacidad from './paginas/Privacidad';
import Progreso from './paginas/Progreso';
import Salud from './paginas/Salud';
import DescargarApp from './paginas/DescargarApp';

export default function App() {
  const { cargando, perfil } = usePerfil();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (cargando) return;
    const saltado = localStorage.getItem(LLAVE_ONBOARDING_SALTADO) === '1';
    const completado = localStorage.getItem(LLAVE_ONBOARDING_COMPLETADO) === '1';
    const ruta = location.pathname;
    const esRutaExenta =
      ruta.startsWith('/onboarding') ||
      ruta.startsWith('/descargar') ||
      ruta.startsWith('/instalar') ||
      ruta.startsWith('/apk') ||
      ruta.startsWith('/download') ||
      ruta.startsWith('/crm');

    if (!perfil && !esRutaExenta && !saltado && !completado) {
      navigate('/onboarding', { replace: true });
    }
    if (perfil && ruta.startsWith('/onboarding')) {
      navigate('/', { replace: true });
    }
  }, [cargando, perfil, location.pathname, navigate]);

  if (cargando) {
    return <div className="p-10 text-center text-sm text-zinc-500">Cargando…</div>;
  }

  const ocultarNavegacion =
    location.pathname.startsWith('/onboarding') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/crm') ||
    location.pathname.startsWith('/descargar') ||
    location.pathname.startsWith('/instalar') ||
    location.pathname.startsWith('/apk') ||
    location.pathname.startsWith('/download');

  return (
    <div className="min-h-dvh bg-neutro-100">
      <PortadaTransicion />
      <AvisoConexion />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/descargar" element={<DescargarApp />} />
        <Route path="/instalar" element={<DescargarApp />} />
        <Route path="/apk" element={<DescargarApp />} />
        <Route path="/download" element={<DescargarApp />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/perfil/editar" element={<EditarPerfil />} />
        <Route path="/salud" element={<Salud />} />
        <Route path="/nutricion" element={<Nutricion />} />
        <Route path="/nutricion/:id" element={<DetalleReceta />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/entrenamientos" element={<Entrenamientos />} />
        <Route path="/entrenamientos/:id" element={<DetalleEntrenamiento />} />
        <Route path="/progreso" element={<Progreso />} />
        <Route path="/ciclo" element={<Ciclo />} />
        <Route path="/ajustes" element={<Ajustes />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/crm" element={<CRM />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!ocultarNavegacion && <Navegacion />}
    </div>
  );
}
