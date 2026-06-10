import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Trophy, Flame, Star, Award, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/recompensas")({
  head: () => ({ meta: [{ title: "Recompensas · Maré" }] }),
  component: RecompensasPage,
});

const achievements = [
  { icon: Flame, label: "Sentinela ativo", desc: "7 dias seguidos reportando", got: true },
  { icon: Star, label: "Primeira ajuda", desc: "Primeiro reporte confirmado", got: true },
  { icon: Award, label: "Voz da rua", desc: "10 reportes confirmados", got: false },
];

type Reward = {
  id: string;
  title: string;
  description: string | null;
  cost: number;
};

function RecompensasPage() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: rws }, { data: profile }] = await Promise.all([
        supabase
          .from("rewards")
          .select("id, title, description, cost")
          .eq("active", true)
          .order("cost"),
        user
          ? supabase.from("profiles").select("points").eq("id", user.id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      setRewards((rws as Reward[]) ?? []);
      setPoints(profile?.points ?? 0);
      setLoading(false);
    })();
  }, [user]);

  const nextLevel = 300;
  const progress = Math.min(100, Math.round((points / nextLevel) * 100));

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <header>
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Sua contribuição
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Recompensas</h1>
      </header>

      <div className="overflow-hidden rounded-2xl bg-gradient-blood p-6 text-primary-foreground shadow-glow sm:p-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-80">
              <Trophy className="h-4 w-4" /> Saldo
            </div>
            <div className="mt-2 text-6xl font-bold tracking-tight">{points}</div>
            <div className="opacity-85">pontos disponíveis</div>
          </div>
          <div className="w-full sm:w-64">
            <div className="mb-2 flex items-center justify-between text-xs opacity-85">
              <span>Próximo nível: Guardião</span>
              <span>{points}/{nextLevel}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

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

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Troque seus pontos</h2>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : rewards.length === 0 ? (
          <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
            Nenhuma recompensa disponível.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {rewards.map((r) => {
              const canRedeem = points >= r.cost;
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:border-primary/40"
                >
                  <div>
                    <div className="font-semibold">{r.title}</div>
                    {r.description && (
                      <div className="text-xs text-muted-foreground">{r.description}</div>
                    )}
                  </div>
                  <button
                    disabled={!canRedeem}
                    className="rounded-full bg-gradient-blood px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow transition hover:opacity-95 disabled:opacity-40"
                  >
                    {r.cost} pts
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
