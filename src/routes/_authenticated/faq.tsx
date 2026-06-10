import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, MessageCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/faq")({
  head: () => ({ meta: [{ title: "Perguntas frequentes · Maré" }] }),
  component: FaqPage,
});

type FaqItem = { id: string; question: string; answer: string };

function FaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("faq_items")
        .select("id, question, answer")
        .order("sort_order");
      setItems((data as FaqItem[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <header>
        <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
          <HelpCircle className="h-3.5 w-3.5" /> Comunidade
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Perguntas frequentes
        </h1>
        <p className="mt-1 text-muted-foreground">
          Tudo que você precisa saber para usar o Maré e proteger a vizinhança.
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-2 shadow-soft sm:p-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Nenhuma pergunta cadastrada ainda.
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {items.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left font-display text-base font-semibold hover:text-primary">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-gradient-ember p-5 text-primary-foreground">
        <MessageCircle className="h-8 w-8 shrink-0 opacity-90" />
        <div>
          <div className="font-display font-semibold">Não achou sua dúvida?</div>
          <div className="text-sm opacity-85">
            Mande sua pergunta na zona interativa — a comunidade responde rapidinho.
          </div>
        </div>
      </div>
    </div>
  );
}
