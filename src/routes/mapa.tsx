import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { RiskMap } from "@/components/RiskMap";
import { reports, severityMeta } from "@/lib/mock-data";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa de risco · Maré" },
      { name: "description", content: "Visualize áreas de risco de enchente em tempo real." },
    ],
  }),
  component: MapaPage,
});

function MapaPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        <header>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Geografia</span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Mapa de risco</h1>
          <p className="mt-1 text-muted-foreground">
            Pinos vermelhos indicam alertas ativos confirmados pela comunidade.
          </p>
        </header>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-soft lg:col-span-8">
            <RiskMap className="h-[520px] w-full" />
          </div>

          <aside className="col-span-12 space-y-3 lg:col-span-4">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Pinos ativos
            </h2>
            {reports.map((r) => {
              const meta = severityMeta[r.severity];
              return (
                <div
                  key={r.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-soft transition hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold leading-tight">{r.title}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${meta.bg} ${meta.color}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {r.location}
                  </p>
                </div>
              );
            })}
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
