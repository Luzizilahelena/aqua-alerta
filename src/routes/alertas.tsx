import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { reports, severityMeta, Severity } from "@/lib/mock-data";
import { Droplets, ThumbsUp, MapPin, Clock, Filter } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/alertas")({
  head: () => ({ meta: [{ title: "Alertas · Maré" }] }),
  component: AlertasPage,
});

const filters: { key: Severity | "todos"; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "critica", label: "Críticos" },
  { key: "alta", label: "Altos" },
  { key: "media", label: "Médios" },
  { key: "baixa", label: "Baixos" },
];

function AlertasPage() {
  const [active, setActive] = useState<Severity | "todos">("todos");
  const list = active === "todos" ? reports : reports.filter((r) => r.severity === active);

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Feed
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Alertas ativos</h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Filtrar por gravidade
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActive(f.key)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                active === f.key
                  ? "border-transparent bg-gradient-blood text-primary-foreground shadow-glow"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <ul className="space-y-3">
          {list.map((r) => {
            const meta = severityMeta[r.severity];
            return (
              <li
                key={r.id}
                className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:border-primary/40 hover:shadow-glow"
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}
                  >
                    <Droplets className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-semibold">{r.title}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${meta.bg} ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {r.location} · {r.neighborhood}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {r.timeAgo}
                      </span>
                      <span>por {r.author}</span>
                    </div>
                  </div>
                  <button className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold transition hover:border-primary hover:text-primary">
                    <ThumbsUp className="h-3.5 w-3.5" /> {r.confirmations}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </AppLayout>
  );
}
