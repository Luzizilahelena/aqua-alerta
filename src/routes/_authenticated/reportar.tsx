import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Droplets, Construction, Mountain, AlertCircle, MapPin, Camera, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/reportar")({
  head: () => ({ meta: [{ title: "Reportar · Maré" }] }),
  component: ReportarPage,
});

const types = [
  { id: "alagamento", label: "Alagamento", icon: Droplets },
  { id: "rua-bloqueada", label: "Rua bloqueada", icon: Construction },
  { id: "deslizamento", label: "Deslizamento", icon: Mountain },
  { id: "outros", label: "Outros", icon: AlertCircle },
];

const severities = [
  { id: "baixa", label: "Baixa", desc: "Pequeno acúmulo" },
  { id: "media", label: "Média", desc: "Atrapalha o trânsito" },
  { id: "alta", label: "Alta", desc: "Risco para pessoas" },
  { id: "critica", label: "Crítica", desc: "Evacuar agora" },
];

function ReportarPage() {
  const { user } = useAuth();
  const [type, setType] = useState("alagamento");
  const [severity, setSeverity] = useState("media");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("reports").insert({
      user_id: user.id,
      type,
      severity,
      location,
      description: description || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Não foi possível enviar o reporte");
      return;
    }
    setSent(true);
    setLocation("");
    setDescription("");
    toast.success("Reporte enviado! +20 pontos creditados.");
    setTimeout(() => setSent(false), 2500);
  };

  return (
      <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
        <header>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Em 30 segundos
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Novo reporte</h1>
          <p className="mt-1 text-muted-foreground">
            Quanto mais preciso, mais útil para sua vizinhança.
          </p>
        </header>

        <form
          onSubmit={submit}
          className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6"
        >
          <section className="space-y-3">
            <Label className="text-sm font-semibold">Tipo de ocorrência</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {types.map((t) => {
                const Icon = t.icon;
                const active = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-xs font-semibold transition ${
                      active
                        ? "border-primary bg-gradient-blood text-primary-foreground shadow-glow"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <Label className="text-sm font-semibold">Gravidade</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {severities.map((s) => {
                const active = severity === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSeverity(s.id)}
                    className={`rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <div className="text-sm font-bold">{s.label}</div>
                    <div className="text-[11px] text-muted-foreground">{s.desc}</div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-2">
            <Label htmlFor="loc" className="text-sm font-semibold">
              Endereço ou ponto de referência
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="loc"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Av. Brasil, 1240 — em frente à padaria"
                className="pl-9"
                required
              />
            </div>
          </section>

          <section className="space-y-2">
            <Label htmlFor="desc" className="text-sm font-semibold">
              Descrição (opcional)
            </Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Conte o que está acontecendo. Profundidade da água, há quanto tempo, etc."
              rows={3}
            />
          </section>

          <section>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background py-6 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <Camera className="h-5 w-5" />
              Adicionar foto (opcional)
            </button>
          </section>

          <div className="flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              Você ganhará <span className="font-semibold text-primary">+20 pontos</span> ao confirmar.
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="w-full gap-2 bg-gradient-blood text-primary-foreground shadow-glow hover:opacity-95 sm:w-auto"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : sent ? <Check className="h-4 w-4" /> : null}
              {submitting ? "Enviando..." : sent ? "Enviado!" : "Enviar reporte"}
            </Button>
          </div>
        </form>
      </div>
  );
}
