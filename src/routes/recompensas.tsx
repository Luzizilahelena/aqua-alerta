import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { rewards } from "@/lib/mock-data";
import { Trophy, Flame, Star, Award } from "lucide-react";

export const Route = createFileRoute("/recompensas")({
  head: () => ({ meta: [{ title: "Recompensas · Maré" }] }),
  component: RecompensasPage,
});

const achievements = [
  { icon: Flame, label: "Sentinela ativo", desc: "7 dias seguidos reportando", got: true },
  { icon: Star, label: "Primeira ajuda", desc: "Primeiro reporte confirmado", got: true },
  { icon: Award, label: "Voz da rua", desc: "10 reportes confirmados", got: false },
];

function RecompensasPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        <header>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Sua contribuição
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Recompensas</h1>
        </header>

        {/* Hero pontos */}
        <div className="overflow-hidden rounded-2xl bg-gradient-blood p-6 text-primary-foreground shadow-glow sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-80">
                <Trophy className="h-4 w-4" /> Saldo
              </div>
              <div className="mt-2 text-6xl font-bold tracking-tight">230</div>
              <div className="opacity-85">pontos disponíveis</div>
            </div>
            <div className="w-full sm:w-64">
              <div className="mb-2 flex items-center justify-between text-xs opacity-85">
                <span>Próximo nível: Guardião</span>
                <span>230/300</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-[77%] rounded-full bg-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Conquistas */}
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">Conquistas</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {achievements.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.label}
                  className={`rounded-2xl border p-4 ${
                    a.got ? "border-primary/30 bg-card shadow-soft" : "border-dashed border-border bg-card/40"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      a.got ? "bg-gradient-blood text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-3 font-semibold">{a.label}</div>
                  <div className="text-xs text-muted-foreground">{a.desc}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Loja */}
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">Troque seus pontos</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {rewards.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:border-primary/40"
              >
                <div>
                  <div className="font-semibold">{r.title}</div>
                  <div className="text-xs text-muted-foreground">{r.partner}</div>
                </div>
                <button className="rounded-full bg-gradient-blood px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow transition hover:opacity-95">
                  {r.points} pts
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
