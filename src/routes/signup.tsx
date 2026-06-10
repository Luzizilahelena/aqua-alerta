import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Criar conta · Maré" }] }),
  component: SignupPage,
});

const schema = z.object({
  displayName: z.string().trim().min(2, "Nome muito curto").max(80),
  neighborhood: z.string().trim().min(2, "Informe seu bairro").max(80),
  phone: z.string().trim().min(6, "Telefone inválido").max(20),
  birthDate: z.string().min(1, "Informe sua data de nascimento"),
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(6, "Senha precisa de 6+ caracteres").max(72),
});

function SignupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: "", neighborhood: "", phone: "", birthDate: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/", replace: true }); }, [user, navigate]);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          display_name: parsed.data.displayName,
          neighborhood: parsed.data.neighborhood,
          phone: parsed.data.phone,
          birth_date: parsed.data.birthDate,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message.includes("registered") ? "Email já cadastrado" : "Erro ao criar conta");
      return;
    }
    toast.success("Conta criada! Verifique seu email para confirmar.");
    navigate({ to: "/login" });
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) { toast.error("Falha ao entrar com Google"); setLoading(false); }
  };

  return (
    <AuthShell title="Criar conta" subtitle="Junte-se à rede de sentinelas do seu bairro">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Nome</Label>
          <Input id="displayName" required value={form.displayName} onChange={update("displayName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input id="neighborhood" required placeholder="Ex.: Santa Tereza" value={form.neighborhood} onChange={update("neighborhood")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" type="tel" required placeholder="(00) 00000-0000" value={form.phone} onChange={update("phone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate">Nascimento</Label>
            <Input id="birthDate" type="date" required value={form.birthDate} onChange={update("birthDate")} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={form.email} onChange={update("email")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" autoComplete="new-password" required value={form.password} onChange={update("password")} />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-gradient-blood text-primary-foreground shadow-glow hover:opacity-95">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar conta"}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center"><span className="bg-card px-2 text-xs uppercase tracking-wider text-muted-foreground">ou</span></div>
      </div>

      <Button type="button" variant="outline" disabled={loading} onClick={handleGoogle} className="w-full">
        Continuar com Google
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">Entrar</Link>
      </p>
    </AuthShell>
  );
}
