import { NavLink, useLocation } from 'react-router';

const items = [
  { to: '/', etiqueta: 'Inicio', icono: '🏠' },
  { to: '/entrenamientos', etiqueta: 'Entrenar', icono: '💪' },
  { to: '/nutricion', etiqueta: 'Nutrición', icono: '🥗' },
  { to: '/salud', etiqueta: 'Salud', icono: '❤️' },
  { to: '/progreso', etiqueta: 'Progreso', icono: '📈' },
];

export default function Navegacion() {
  const location = useLocation();

  // En la pantalla de onboarding la navegación inferior NUNCA se muestra
  if (location.pathname.startsWith('/onboarding')) {
    return null;
  }

  return (
    <nav className="safe-area-inferior fixed inset-x-0 bottom-0 z-10 border-t border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-stretch justify-around">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors ${
                isActive ? 'text-marca-magenta font-semibold' : 'text-zinc-500 hover:text-zinc-700'
              }`
            }
          >
            <span aria-hidden="true" className="text-lg">
              {item.icono}
            </span>
            <span>{item.etiqueta}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
