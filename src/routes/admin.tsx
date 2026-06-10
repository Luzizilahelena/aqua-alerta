import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useIsAdmin } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Shield,
  Users,
  FileText,
  HelpCircle,
  Trophy,
  Loader2,
  Trash2,
  Plus,
  ShieldCheck,
  ShieldOff,
  LayoutDashboard,
  ArrowLeft,
  LogOut,
  Droplets,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel administrativo · Maré" }] }),
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: AdminShell,
});

type Section = "dashboard" | "reports" | "users" | "faq" | "rewards";

const adminNav: { id: Section; title: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", title: "Visão geral", icon: LayoutDashboard },
  { id: "reports", title: "Reportes", icon: FileText },
  { id: "users", title: "Usuários", icon: Users },
  { id: "faq", title: "FAQ", icon: HelpCircle },
  { id: "rewards", title: "Recompensas", icon: Trophy },
];

function AdminShell() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [section, setSection] = useState<Section>("dashboard");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login", search: { redirect: "/admin" } });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    (async () => {
      const { count } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");
      setAdminExists((count ?? 0) > 0);
    })();
  }, [isAdmin]);

  if (authLoading || roleLoading || adminExists === null || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin && !adminExists) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl items-center p-6">
        <div className="w-full rounded-2xl border border-primary/30 bg-gradient-blood p-8 text-primary-foreground shadow-glow">
          <Shield className="h-10 w-10" />
          <h1 className="mt-4 text-3xl font-bold">Configurar primeiro admin</h1>
          <p className="mt-2 opacity-90">
            Ainda não existe nenhum administrador. Torne-se o admin inicial.
          </p>
          <Button
            disabled={bootstrapping}
            onClick={async () => {
              setBootstrapping(true);
              const { error } = await supabase
                .from("user_roles")
                .insert({ user_id: user.id, role: "admin" });
              setBootstrapping(false);
              if (error) return toast.error("Não foi possível: " + error.message);
              toast.success("Você agora é admin");
              window.location.reload();
            }}
            className="mt-5 gap-2 bg-white text-primary hover:bg-white/90"
          >
            {bootstrapping ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Tornar-me administrador
          </Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl items-center p-6">
        <div className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <ShieldOff className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Acesso restrito</h1>
          <p className="mt-2 text-muted-foreground">
            Esta área é apenas para administradores.
          </p>
          <Link to="/">
            <Button variant="outline" className="mt-5 gap-2">
              <ArrowLeft className="h-4 w-4" /> Voltar ao app
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const current = adminNav.find((n) => n.id === section)!;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar section={section} onSelect={setSection} />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">Administração ·</span>
                {current.title}
              </span>
            </div>
            <Link to="/">
              <Button size="sm" variant="outline" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Voltar ao app</span>
              </Button>
            </Link>
          </header>
          <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 sm:p-6">
            <SectionView section={section} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AdminSidebar({
  section,
  onSelect,
}: {
  section: Section;
  onSelect: (s: Section) => void;
}) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
  };

  const name = (user?.user_metadata?.display_name as string) || user?.email?.split("@")[0] || "Admin";
  const initial = name.charAt(0).toUpperCase();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/40">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-blood shadow-glow">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-bold tracking-tight text-sidebar-foreground">
                Admin Maré
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">
                Painel de controle
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gerenciar</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNav.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={section === item.id}
                    onClick={() => onSelect(item.id)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Aplicativo</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/">
                    <Droplets className="h-4 w-4" />
                    <span>Voltar ao app</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/40 p-3 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent/40 p-2 text-xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-blood text-sm font-semibold text-primary-foreground">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold text-sidebar-foreground">{name}</div>
              <div className="truncate text-[10px] text-sidebar-foreground/60">{user?.email}</div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

function SectionView({ section }: { section: Section }) {
  const titles: Record<Section, { title: string; sub: string }> = {
    dashboard: { title: "Visão geral", sub: "Métricas em tempo real da plataforma." },
    reports: { title: "Reportes", sub: "Aprovar, resolver ou excluir reportes da comunidade." },
    users: { title: "Usuários", sub: "Gerencie membros, pontos e permissões." },
    faq: { title: "FAQ", sub: "Edite as perguntas frequentes do app." },
    rewards: { title: "Recompensas", sub: "Catálogo de recompensas e custos." },
  };
  const t = titles[section];
  let content: ReactNode = null;
  if (section === "dashboard") content = <DashboardTab />;
  if (section === "reports") content = <ReportsTab />;
  if (section === "users") content = <UsersTab />;
  if (section === "faq") content = <FaqTab />;
  if (section === "rewards") content = <RewardsTab />;

  return (
    <>
      <header>
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Administração
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.title}</h1>
        <p className="mt-1 text-muted-foreground">{t.sub}</p>
      </header>
      {content}
    </>
  );
}

// =================== DASHBOARD ===================
function DashboardTab() {
  const [stats, setStats] = useState({ users: 0, reports: 0, pending: 0, critical: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [u, r, p, c] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("reports").select("*", { count: "exact", head: true }),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("reports").select("*", { count: "exact", head: true }).in("severity", ["alta", "critica"]),
      ]);
      setStats({
        users: u.count ?? 0,
        reports: r.count ?? 0,
        pending: p.count ?? 0,
        critical: c.count ?? 0,
      });
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: "Usuários", value: stats.users, icon: Users, accent: false },
    { label: "Reportes", value: stats.reports, icon: FileText, accent: false },
    { label: "Em análise", value: stats.pending, icon: Loader2, accent: false },
    { label: "Críticos / Altos", value: stats.critical, icon: Shield, accent: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className={`rounded-2xl border p-5 shadow-soft ${
              c.accent
                ? "border-primary/30 bg-gradient-blood text-primary-foreground shadow-glow"
                : "border-border bg-card"
            }`}
          >
            <div
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${
                c.accent ? "opacity-80" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" /> {c.label}
            </div>
            <div className="mt-3 text-4xl font-bold">{loading ? "—" : c.value}</div>
          </div>
        );
      })}
    </div>
  );
}

// =================== REPORTS ===================
type AdminReport = {
  id: string;
  type: string;
  severity: string;
  location: string;
  description: string | null;
  status: string;
  created_at: string;
  user_id: string;
};

function ReportsTab() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    let q = supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(200);
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setReports((data as AdminReport[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("reports").update({ status }).eq("id", id);
    if (error) return toast.error("Erro: " + error.message);
    toast.success("Status atualizado");
    setReports((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este reporte?")) return;
    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (error) return toast.error("Erro: " + error.message);
    toast.success("Reporte removido");
    setReports((rs) => rs.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Label className="text-sm">Filtrar:</Label>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="approved">Aprovados</SelectItem>
            <SelectItem value="resolved">Resolvidos</SelectItem>
            <SelectItem value="rejected">Rejeitados</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline">{reports.length} resultado(s)</Badge>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
          Nenhum reporte encontrado.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="divide-y divide-border">
            {reports.map((r) => (
              <div key={r.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold capitalize">{r.type.replace("-", " ")}</span>
                    <Badge variant="outline" className="uppercase text-[10px]">{r.severity}</Badge>
                    <Badge
                      className={
                        r.status === "resolved"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : r.status === "rejected"
                          ? "bg-muted text-muted-foreground"
                          : r.status === "approved"
                          ? "bg-sky-500/15 text-sky-400"
                          : "bg-amber-500/15 text-amber-400"
                      }
                    >
                      {r.status}
                    </Badge>
                  </div>
                  <div className="truncate text-sm text-muted-foreground">{r.location}</div>
                  {r.description && (
                    <div className="line-clamp-2 text-xs text-muted-foreground/80">{r.description}</div>
                  )}
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(r.created_at).toLocaleString("pt-BR")}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                    <SelectTrigger className="h-8 w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="resolved">Resolvido</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(r.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =================== USERS ===================
type AdminUser = {
  id: string;
  display_name: string | null;
  neighborhood: string | null;
  points: number;
  created_at: string;
  is_admin: boolean;
};

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("user_roles").select("user_id, role").eq("role", "admin"),
    ]);
    const adminSet = new Set((roles ?? []).map((r) => r.user_id));
    setUsers(
      (profiles ?? []).map((p) => ({
        id: p.id,
        display_name: p.display_name,
        neighborhood: p.neighborhood,
        points: p.points,
        created_at: p.created_at,
        is_admin: adminSet.has(p.id),
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleAdmin = async (u: AdminUser) => {
    if (u.is_admin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", u.id).eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("Admin removido");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: u.id, role: "admin" });
      if (error) return toast.error(error.message);
      toast.success("Usuário promovido a admin");
    }
    setUsers((us) => us.map((x) => (x.id === u.id ? { ...x, is_admin: !u.is_admin } : x)));
  };

  const adjustPoints = async (u: AdminUser, delta: number) => {
    const next = Math.max(0, u.points + delta);
    const { error } = await supabase.from("profiles").update({ points: next }).eq("id", u.id);
    if (error) return toast.error(error.message);
    setUsers((us) => us.map((x) => (x.id === u.id ? { ...x, points: next } : x)));
  };

  const filtered = users.filter(
    (u) =>
      !query ||
      (u.display_name ?? "").toLowerCase().includes(query.toLowerCase()) ||
      (u.neighborhood ?? "").toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar por nome ou bairro..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md"
      />
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="divide-y divide-border">
            {filtered.map((u) => (
              <div key={u.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{u.display_name || "(sem nome)"}</span>
                    {u.is_admin && <Badge className="bg-primary/20 text-primary">admin</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {u.neighborhood || "—"} · {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => adjustPoints(u, -10)}>−10</Button>
                  <span className="min-w-[3rem] text-center font-bold">{u.points}</span>
                  <Button size="sm" variant="outline" onClick={() => adjustPoints(u, 10)}>+10</Button>
                  <Button
                    size="sm"
                    variant={u.is_admin ? "destructive" : "default"}
                    onClick={() => toggleAdmin(u)}
                    className="gap-1"
                  >
                    {u.is_admin ? (
                      <><ShieldOff className="h-3.5 w-3.5" /> Remover</>
                    ) : (
                      <><ShieldCheck className="h-3.5 w-3.5" /> Promover</>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =================== FAQ ===================
type FaqItem = { id: string; question: string; answer: string; sort_order: number };

function FaqTab() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [a, setA] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("faq_items").select("*").order("sort_order");
    setItems((data as FaqItem[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!q.trim() || !a.trim()) return toast.error("Preencha pergunta e resposta");
    const { error } = await supabase.from("faq_items").insert({ question: q, answer: a, sort_order: items.length });
    if (error) return toast.error(error.message);
    setQ(""); setA("");
    toast.success("Pergunta adicionada");
    load();
  };

  const update = async (item: FaqItem) => {
    const { error } = await supabase.from("faq_items").update({ question: item.question, answer: item.answer }).eq("id", item.id);
    if (error) return toast.error(error.message);
    toast.success("Atualizado");
  };

  const remove = async (id: string) => {
    if (!confirm("Remover esta pergunta?")) return;
    const { error } = await supabase.from("faq_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((is) => is.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="mb-3 font-semibold">Nova pergunta</h3>
        <div className="space-y-3">
          <Input placeholder="Pergunta" value={q} onChange={(e) => setQ(e.target.value)} />
          <Textarea placeholder="Resposta" value={a} onChange={(e) => setA(e.target.value)} rows={3} />
          <Button onClick={create} className="gap-1.5"><Plus className="h-4 w-4" /> Adicionar</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.id} className="space-y-2 rounded-2xl border border-border bg-card p-4 shadow-soft">
              <Input
                value={item.question}
                onChange={(e) => {
                  const v = e.target.value;
                  setItems((is) => is.map((x, i) => (i === idx ? { ...x, question: v } : x)));
                }}
                className="font-semibold"
              />
              <Textarea
                value={item.answer}
                rows={2}
                onChange={(e) => {
                  const v = e.target.value;
                  setItems((is) => is.map((x, i) => (i === idx ? { ...x, answer: v } : x)));
                }}
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => update(item)}>Salvar</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(item.id)} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =================== REWARDS ===================
type Reward = { id: string; title: string; description: string | null; cost: number; active: boolean };

function RewardsTab() {
  const [items, setItems] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cost, setCost] = useState(100);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("rewards").select("*").order("cost");
    setItems((data as Reward[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title.trim()) return toast.error("Informe um título");
    const { error } = await supabase.from("rewards").insert({ title, description: desc || null, cost, active: true });
    if (error) return toast.error(error.message);
    setTitle(""); setDesc(""); setCost(100);
    toast.success("Recompensa criada");
    load();
  };

  const update = async (r: Reward) => {
    const { error } = await supabase.from("rewards").update({
      title: r.title, description: r.description, cost: r.cost, active: r.active,
    }).eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Atualizado");
  };

  const remove = async (id: string) => {
    if (!confirm("Remover esta recompensa?")) return;
    const { error } = await supabase.from("rewards").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((is) => is.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="mb-3 font-semibold">Nova recompensa</h3>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_120px]">
          <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Descrição" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <Input type="number" min={0} placeholder="Custo" value={cost} onChange={(e) => setCost(Number(e.target.value))} />
        </div>
        <Button onClick={create} className="mt-3 gap-1.5"><Plus className="h-4 w-4" /> Adicionar</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          {items.map((r, idx) => (
            <div key={r.id} className="space-y-2 rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_120px]">
                <Input value={r.title} onChange={(e) => {
                  const v = e.target.value;
                  setItems((is) => is.map((x, i) => (i === idx ? { ...x, title: v } : x)));
                }} />
                <Input value={r.description ?? ""} onChange={(e) => {
                  const v = e.target.value;
                  setItems((is) => is.map((x, i) => (i === idx ? { ...x, description: v } : x)));
                }} />
                <Input type="number" value={r.cost} onChange={(e) => {
                  const v = Number(e.target.value);
                  setItems((is) => is.map((x, i) => (i === idx ? { ...x, cost: v } : x)));
                }} />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={r.active} onCheckedChange={(v) => {
                    setItems((is) => is.map((x, i) => (i === idx ? { ...x, active: v } : x)));
                  }} />
                  Ativa
                </label>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => update(r)}>Salvar</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(r.id)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
