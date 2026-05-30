import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { faqItems } from "@/lib/mock-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "Perguntas frequentes · Maré" }] }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <AppLayout>
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
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-display text-base font-semibold hover:text-primary">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
    </AppLayout>
  );
}
