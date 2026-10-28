interface Props {
  titulo: string;
  fase: string;
  descripcion: string;
}

export default function PaginaPlaceholder({ titulo, fase, descripcion }: Props) {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
      <p className="text-zinc-600">{descripcion}</p>
      <p className="inline-block rounded-full bg-marca-crema px-3 py-1 text-xs font-semibold text-marca-magenta-oscuro">
        Módulo planificado — {fase}
      </p>
    </section>
  );
}
