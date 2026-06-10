import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  Droplets,
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Clock,
  Filter,
  MessageCircle,
  Send,
  Loader2,
  Construction,
  Mountain,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/alertas")({
  head: () => ({ meta: [{ title: "Alertas · Maré" }] }),
  component: AlertasPage,
});

type Severity = "baixa" | "media" | "alta" | "critica";

type Report = {
  id: string;
  type: string;
  severity: Severity;
  location: string;
  description: string | null;
  status: string;
  created_at: string;
  user_id: string;
};

type Reaction = { report_id: string; user_id: string; reaction: "like" | "dislike" };
type Comment = { id: string; report_id: string; user_id: string; content: string; created_at: string };

const severityMeta: Record<Severity, { label: string; color: string; bg: string }> = {
  baixa: { label: "Baixa", color: "text-emerald-400", bg: "bg-emerald-500/15" },
  media: { label: "Média", color: "text-amber-400", bg: "bg-amber-500/15" },
  alta: { label: "Alta", color: "text-orange-400", bg: "bg-orange-500/15" },
  critica: { label: "Crítica", color: "text-primary-foreground", bg: "bg-gradient-blood" },
};

const typeIcon: Record<string, typeof Droplets> = {
  alagamento: Droplets,
  "rua-bloqueada": Construction,
  deslizamento: Mountain,
  outros: AlertCircle,
};

const filters: { key: Severity | "todos"; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "critica", label: "Críticos" },
  { key: "alta", label: "Altos" },
  { key: "media", label: "Médios" },
  { key: "baixa", label: "Baixos" },
];

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
  return `há ${Math.floor(diff / 86400)}d`;
}

function AlertasPage() {
  const { user } = useAuth();
  const [active, setActive] = useState<Severity | "todos">("todos");
  const [reports, setReports] = useState<Report[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: rs }, { data: rx }, { data: cs }] = await Promise.all([
      supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("report_reactions").select("report_id, user_id, reaction"),
      supabase.from("report_comments").select("*").order("created_at", { ascending: true }),
    ]);
    setReports((rs as Report[]) ?? []);
    setReactions((rx as Reaction[]) ?? []);
    setComments((cs as Comment[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const list = useMemo(
    () => (active === "todos" ? reports : reports.filter((r) => r.severity === active)),
    [active, reports],
  );

  const countsFor = (reportId: string) => {
    const likes = reactions.filter((r) => r.report_id === reportId && r.reaction === "like").length;
    const dislikes = reactions.filter((r) => r.report_id === reportId && r.reaction === "dislike").length;
    const mine = reactions.find((r) => r.report_id === reportId && r.user_id === user?.id)?.reaction ?? null;
    return { likes, dislikes, mine };
  };

  const react = async (reportId: string, reaction: "like" | "dislike") => {
    if (!user) return;
    const existing = reactions.find((r) => r.report_id === reportId && r.user_id === user.id);
    if (existing?.reaction === reaction) {
      // toggle off
      const { error } = await supabase
        .from("report_reactions")
        .delete()
        .eq("report_id", reportId)
        .eq("user_id", user.id);
      if (error) return toast.error(error.message);
      setReactions((rs) => rs.filter((r) => !(r.report_id === reportId && r.user_id === user.id)));
      return;
    }
    const { error } = await supabase
      .from("report_reactions")
      .upsert(
        { report_id: reportId, user_id: user.id, reaction },
        { onConflict: "report_id,user_id" },
      );
    if (error) return toast.error(error.message);
    setReactions((rs) => {
      const others = rs.filter((r) => !(r.report_id === reportId && r.user_id === user.id));
      return [...others, { report_id: reportId, user_id: user.id, reaction }];
    });
  };

  const postComment = async (reportId: string) => {
    if (!user || !draft.trim()) return;
    setPosting(true);
    const { data, error } = await supabase
      .from("report_comments")
      .insert({ report_id: reportId, user_id: user.id, content: draft.trim() })
      .select()
      .single();
    setPosting(false);
    if (error || !data) return toast.error(error?.message ?? "Erro");
    setComments((cs) => [...cs, data as Comment]);
    setDraft("");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Feed</span>
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

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          Nenhum alerta nessa gravidade. Seja o primeiro a reportar.
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((r) => {
            const meta = severityMeta[r.severity] ?? severityMeta.media;
            const Icon = typeIcon[r.type] ?? AlertCircle;
            const { likes, dislikes, mine } = countsFor(r.id);
            const reportComments = comments.filter((c) => c.report_id === r.id);
            const isOpen = openComments === r.id;
            return (
              <li
                key={r.id}
                className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:border-primary/40"
              >
                <div className="flex items-start gap-4">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-semibold capitalize">{r.type.replace("-", " ")}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${meta.bg} ${meta.color}`}>
                        {meta.label}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {r.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {timeAgo(r.created_at)}
                      </span>
                    </div>
                    {r.description && (
                      <p className="mt-2 text-sm text-muted-foreground/90">{r.description}</p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => react(r.id, "like")}
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          mine === "like"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background hover:border-primary hover:text-primary"
                        }`}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" /> {likes}
                      </button>
                      <button
                        onClick={() => react(r.id, "dislike")}
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          mine === "dislike"
                            ? "border-destructive bg-destructive/10 text-destructive"
                            : "border-border bg-background hover:border-destructive hover:text-destructive"
                        }`}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" /> {dislikes}
                      </button>
                      <button
                        onClick={() => {
                          setOpenComments(isOpen ? null : r.id);
                          setDraft("");
                        }}
                        className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold transition hover:border-primary hover:text-primary"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> {reportComments.length}
                      </button>
                    </div>

                    {isOpen && (
                      <div className="mt-4 space-y-3 rounded-xl border border-border bg-background/40 p-3">
                        {reportComments.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Seja o primeiro a responder.</p>
                        ) : (
                          <ul className="space-y-2">
                            {reportComments.map((c) => (
                              <li key={c.id} className="rounded-lg bg-card p-2 text-sm">
                                <div className="text-xs text-muted-foreground">{timeAgo(c.created_at)}</div>
                                <div>{c.content}</div>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="flex gap-2">
                          <Textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            rows={2}
                            placeholder="Escrever resposta..."
                            className="text-sm"
                          />
                          <Button
                            type="button"
                            size="icon"
                            disabled={posting || !draft.trim()}
                            onClick={() => postComment(r.id)}
                            className="bg-gradient-blood text-primary-foreground"
                          >
                            {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
