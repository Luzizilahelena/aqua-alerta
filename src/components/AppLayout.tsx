import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Map,
  Megaphone,
  Plus,
  Trophy,
  HelpCircle,
  Sparkles,
  Droplets,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useIsAdmin } from "@/hooks/use-admin";
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
import { Button } from "@/components/ui/button";

const mainNav = [
  { title: "Painel", url: "/", icon: LayoutDashboard },
  { title: "Mapa de risco", url: "/mapa", icon: Map },
  { title: "Alertas", url: "/alertas", icon: Megaphone },
  { title: "Reportar", url: "/reportar", icon: Plus },
];

const secondaryNav = [
  { title: "Meu perfil", url: "/perfil", icon: User },
  { title: "Recompensas", url: "/recompensas", icon: Trophy },
  { title: "Zona interativa", url: "/zona", icon: Sparkles },
  { title: "Perguntas frequentes", url: "/faq", icon: HelpCircle },
];

function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));
  const { isAdmin } = useIsAdmin();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/40">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-blood shadow-glow">
            <Droplets className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-bold tracking-tight text-sidebar-foreground">
                Maré
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">
                Alerta comunitário
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Comunidade</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin")}>
                    <Link to="/admin">
                      <Shield className="h-4 w-4" />
                      <span>Painel admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/40 p-3 space-y-2">
        {!collapsed && <UserCard />}
        <LogoutButton collapsed={collapsed} />
      </SidebarFooter>
    </Sidebar>
  );
}

function UserCard() {
  const { user } = useAuth();
  const name = (user?.user_metadata?.display_name as string) || user?.email?.split("@")[0] || "Sentinela";
  const initial = name.charAt(0).toUpperCase();
  return (
    <Link
      to="/perfil"
      className="flex items-center gap-2 rounded-lg bg-sidebar-accent/40 p-2 text-xs transition hover:bg-sidebar-accent"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-blood text-sm font-semibold text-primary-foreground">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold text-sidebar-foreground">{name}</div>
        <div className="truncate text-[10px] text-sidebar-foreground/60">{user?.email}</div>
      </div>
    </Link>
  );
}

function LogoutButton({ collapsed }: { collapsed: boolean }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
  };
  return (
    <Button
      variant="ghost"
      size={collapsed ? "icon" : "sm"}
      onClick={handleLogout}
      className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
    >
      <LogOut className="h-4 w-4" />
      {!collapsed && <span>Sair</span>}
    </Button>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="hidden items-center gap-2 sm:flex">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-[color:var(--danger)]" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[color:var(--danger)]" />
                </span>
                <span className="text-sm font-medium text-foreground">
                  3 alertas ativos · Bairro Santa Tereza
                </span>
              </div>
            </div>
            <Link to="/reportar">
              <Button size="sm" className="gap-1.5 bg-gradient-blood text-primary-foreground shadow-glow hover:opacity-95">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Novo reporte</span>
              </Button>
            </Link>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
