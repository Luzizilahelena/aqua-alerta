import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  User,
  MapPin,
  Trophy,
  FileText,
  AlertTriangle,
  Save,
  Loader2,
  Droplets,
  Construction,
  Mountain,
  AlertCircle,
  Phone,
  Cake,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({ meta: [{ title: "Perfil · Maré" }] }),
  component: PerfilPage,
});

type Profile = {
  display_name: string | null;
  neighborhood: string | null;
  phone: string | null;
  birth_date: string | null;
  bio: string | null;
  points: number;
  created_at: string;
};

type Report = {
  id: string;
  type: string;
  severity: string;
  location: string;
  status: string;
  created_at: string;
};

const typeMeta: Record<string, { label: string; icon: typeof Droplets }> = {
  alagamento: { label: "Alagamento", icon: Droplets },
  "rua-bloqueada": { label: "Rua bloqueada", icon: Construction },
  deslizamento: { label: "Deslizamento", icon: Mountain },
  outros: { label: "Outros", icon: AlertCircle },
};

const severityColor: Record<string, string> = {
  baixa: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  media: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  alta: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  critica: "bg-primary/20 text-primary border-primary/40",
};

function PerfilPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("reports")
          .select("id, type, severity, location, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      if (p) {
        setProfile(p as Profile);
        setDisplayName(p.display_name ?? "");
        setNeighborhood(p.neighborhood ?? "");
        setPhone((p as Profile).phone ?? "");
        setBirthDate((p as Profile).birth_date ?? "");
        setBio((p as Profile).bio ?? "");
      }
      setReports((r as Report[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const payload = {
      display_name: displayName,
      neighborhood,
      phone: phone || null,
      birth_date: birthDate || null,
      bio: bio || null,
    };
    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar: " + error.message);
      return;
    }
    toast.success("Perfil atualizado");
    setProfile((p) => (p ? { ...p, ...payload } : p));
  };

  const isDirty =
    !!profile &&
    ((displayName || "") !== (profile.display_name ?? "") ||
      (neighborhood || "") !== (profile.neighborhood ?? "") ||
      (phone || "") !== (profile.phone ?? "") ||
      (birthDate || "") !== (profile.birth_date ?? "") ||
      (bio || "") !== (profile.bio ?? ""));

  const initial = (displayName || user?.email || "S").charAt(0).toUpperCase();
  const totalReports = reports.length;
  const criticalReports = reports.filter((r) => r.severity === "critica" || r.severity === "alta").length;
  const points = profile?.points ?? 0;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <header>
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Sua sentinela
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Meu perfil</h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie suas informações e acompanhe seu impacto na comunidade.
        </p>
      </header>

      {/* Bento stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-gradient-blood p-5 text-primary-foreground shadow-glow">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-80">
            <Trophy className="h-4 w-4" /> Pontos
          </div>
          <div className="mt-3 text-4xl font-bold">{points}</div>
          <div className="mt-1 text-xs opacity-80">Cada reporte vale +20 pts</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <FileText className="h-4 w-4" /> Reportes
          </div>
          <div className="mt-3 text-4xl font-bold">{totalReports}</div>
          <div className="mt-1 text-xs text-muted-foreground">Total enviados</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-primary" /> Denúncias críticas
          </div>
          <div className="mt-3 text-4xl font-bold">{criticalReports}</div>
          <div className="mt-1 text-xs text-muted-foreground">Alta ou crítica</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Edit form */}
        <form
          onSubmit={save}
          className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-soft lg:col-span-2"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-blood text-xl font-bold text-primary-foreground shadow-glow">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold">{displayName || "Sem nome"}</div>
              <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              <User className="mr-1 inline h-3.5 w-3.5" /> Nome de exibição
            </Label>
            <Input
              id="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Como te chamamos?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hood" className="text-sm font-semibold">
              <MapPin className="mr-1 inline h-3.5 w-3.5" /> Bairro
            </Label>
            <Input
              id="hood"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Ex: Santa Tereza"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold">
                <Phone className="mr-1 inline h-3.5 w-3.5" /> Telefone
              </Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth" className="text-sm font-semibold">
                <Cake className="mr-1 inline h-3.5 w-3.5" /> Nascimento
              </Label>
              <Input id="birth" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-semibold">Bio</Label>
            <Textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Conte um pouco sobre você" />
          </div>

          <div className="text-xs text-muted-foreground">
            Membro desde{" "}
            <span className="font-medium text-foreground">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>

          {isDirty ? (
            <Button
              type="submit"
              disabled={saving}
              className="w-full gap-2 bg-gradient-blood text-primary-foreground shadow-glow hover:opacity-95"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar alterações
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400">
              <Save className="h-3.5 w-3.5" /> Tudo salvo
            </div>
          )}
        </form>

        {/* Reports history */}
        <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-soft lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Meus reportes</h2>
            <Badge variant="outline" className="text-xs">
              {totalReports} no total
            </Badge>
          </div>

          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
              <FileText className="h-8 w-8 opacity-50" />
              Você ainda não enviou nenhum reporte.
              <br />
              Quando enviar, eles aparecem aqui.
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {reports.map((r) => {
                const meta = typeMeta[r.type] ?? typeMeta.outros;
                const Icon = meta.icon;
                return (
                  <li key={r.id} className="flex items-start gap-3 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{meta.label}</span>
                        <span
                          className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            severityColor[r.severity] ?? severityColor.media
                          }`}
                        >
                          {r.severity}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate text-sm text-muted-foreground">
                        {r.location}
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {new Date(r.created_at).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · {r.status === "pending" ? "Em análise" : r.status}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
