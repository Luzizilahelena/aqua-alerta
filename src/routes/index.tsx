import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { RiskMap } from "@/components/RiskMap";
import { reports, severityMeta, rewards, faqItems } from "@/lib/mock-data";
import {
  ArrowRight,
  Droplets,
  Megaphone,
  Trophy,
  TrendingUp,
  Users,
  MapPin,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maré · Alerta comunitário para enchentes" },
      {
        name: "description",
        content:
          "Reporte alagamentos, marque ruas bloqueadas e acompanhe áreas de risco em tempo real com a sua comunidade.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Painel da comunidade
          </span>
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Olá, vizinhança.
            <span className="block text-muted-foreground">
              Hoje há <span className="text-primary">3 zonas em alerta</span> perto de você.
            </span>
          </h1>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Mapa — grande */}
          <Link
            to="/mapa"
            className="group col-span-12 row-span-2 overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-soft transition hover:shadow-glow lg:col-span-8"
          >
            <div className="relative">
              <RiskMap className="h-[340px] w-full sm:h-[420px]" />
              <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                <MapPin className="mr-1 inline h-3 w-3" /> Mapa de risco em tempo real
              </div>
              <div className="pointer-events-none absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-primary opacity-0 transition group-hover:opacity-100">
                Abrir mapa <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </Link>

          {/* Stats stack */}
          <div className="col-span-6 rounded-2xl border border-border bg-gradient-blood p-5 text-primary-foreground shadow-glow lg:col-span-4">
            <div className="flex items-center justify-between">
              <Droplets className="h-5 w-5 opacity-80" />
              <span className="text-[10px] uppercase tracking-wider opacity-75">últimas 24h</span>
            </div>
            <div className="mt-6 text-4xl font-bold tracking-tight">47</div>
            <div className="text-sm opacity-90">reportes confirmados</div>
            <div className="mt-4 flex items-center gap-1 text-xs opacity-80">
              <TrendingUp className="h-3 w-3" /> +18% vs ontem
            </div>
          </div>

          <div className="col-span-6 rounded-2xl border border-border bg-card p-5 shadow-soft lg:col-span-4">
            <div className="flex items-center justify-between">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                ativa agora
              </span>
            </div>
            <div className="mt-6 text-4xl font-bold tracking-tight">1.284</div>
            <div className="text-sm text-muted-foreground">vizinhos conectados</div>
            <div className="mt-4 flex -space-x-1.5">
              {["M", "J", "C", "P", "+"].map((l, i) => (
                <span
                  key={i}
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-secondary text-[10px] font-semibold"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Alertas recentes */}
          <div className="col-span-12 rounded-2xl border border-border bg-card p-5 shadow-soft lg:col-span-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" />
                <h2 className="font-display text-lg font-semibold">Alertas recentes</h2>
              </div>
              <Link
                to="/alertas"
                className="text-xs font-medium text-primary hover:underline"
              >
                Ver todos →
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {reports.slice(0, 4).map((r) => {
                const meta = severityMeta[r.severity];
                return (
                  <li key={r.id} className="flex items-center gap-3 py-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}
                    >
                      <Droplets className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {r.title}
                        </p>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${meta.bg} ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.location} · {r.neighborhood} · {r.timeAgo}
                      </p>
                    </div>
                    <div className="hidden text-right text-xs text-muted-foreground sm:block">
                      {r.confirmations} confirmações
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Recompensas */}
          <Link
            to="/recompensas"
            className="col-span-12 rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:shadow-glow sm:col-span-6 lg:col-span-4"
          >
            <div className="flex items-center justify-between">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                suas recompensas
              </span>
            </div>
            <div className="mt-6">
              <div className="text-4xl font-bold tracking-tight text-primary">230</div>
              <div className="text-sm text-muted-foreground">pontos disponíveis</div>
            </div>
            <div className="mt-4 space-y-2">
              {rewards.slice(0, 2).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-xs"
                >
                  <span className="truncate font-medium">{r.title}</span>
                  <span className="shrink-0 font-bold text-primary">{r.points}p</span>
                </div>
              ))}
            </div>
          </Link>

          {/* FAQ preview */}
          <div className="col-span-12 rounded-2xl border border-border bg-ink-950 p-5 text-primary-foreground sm:col-span-6 lg:col-span-4 lg:col-start-1"
            style={{ background: "var(--gradient-ember)" }}>
            <span className="text-[10px] uppercase tracking-wider opacity-70">
              Comunidade pergunta
            </span>
            <h3 className="mt-2 font-display text-lg font-semibold">
              {faqItems[0].q}
            </h3>
            <p className="mt-2 text-sm leading-relaxed opacity-85">
              {faqItems[0].a}
            </p>
            <Link
              to="/faq"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-white hover:underline"
            >
              Ver perguntas frequentes <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Call reportar */}
          <Link
            to="/reportar"
            className="col-span-12 flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:shadow-glow lg:col-span-8"
          >
            <div>
              <span className="text-[10px] uppercase tracking-wider text-primary">
                Aja agora
              </span>
              <h3 className="mt-1 font-display text-xl font-semibold">
                Viu algo? Reporte em 30 segundos.
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Sua contribuição protege quem mora ao seu redor — e te rende pontos.
              </p>
            </div>
            <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-blood text-primary-foreground shadow-glow sm:flex">
              <ArrowRight className="h-6 w-6" />
            </div>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
