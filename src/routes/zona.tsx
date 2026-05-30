import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MessageCircle, ThumbsUp, Send, Sparkles } from "lucide-react";

export const Route = createFileRoute("/zona")({
  head: () => ({ meta: [{ title: "Zona interativa · Maré" }] }),
  component: ZonaPage,
});

type Q = { id: number; author: string; question: string; answers: number; likes: number; ago: string };

const initial: Q[] = [
  {
    id: 1,
    author: "Lúcia R.",
    question: "Alguém sabe se a rua Tiradentes ainda está bloqueada?",
    answers: 4,
    likes: 12,
    ago: "há 10 min",
  },
  {
    id: 2,
    author: "Ricardo M.",
    question: "Qual número da Defesa Civil aqui da região?",
    answers: 7,
    likes: 22,
    ago: "há 1h",
  },
  {
    id: 3,
    author: "Bia F.",
    question: "Tem ponto de doação aberto hoje no bairro?",
    answers: 2,
    likes: 8,
    ago: "há 2h",
  },
];

function ZonaPage() {
  const [questions, setQuestions] = useState(initial);
  const [text, setText] = useState("");

  const post = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setQuestions([
      { id: Date.now(), author: "Você", question: text, answers: 0, likes: 0, ago: "agora" },
      ...questions,
    ]);
    setText("");
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
        <header>
          <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Conversa em tempo real
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Zona interativa</h1>
          <p className="mt-1 text-muted-foreground">
            Pergunte, responda, ajude alguém da sua rua.
          </p>
        </header>

        <form
          onSubmit={post}
          className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-soft sm:flex-row sm:items-center"
        >
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Faça uma pergunta para a comunidade..."
            className="flex-1"
          />
          <Button type="submit" className="gap-1.5 bg-gradient-blood text-primary-foreground shadow-glow">
            <Send className="h-4 w-4" /> Publicar
          </Button>
        </form>

        <ul className="space-y-3">
          {questions.map((q) => (
            <li
              key={q.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:border-primary/40"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-blood text-sm font-bold text-primary-foreground">
                  {q.author[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{q.author}</span>
                    <span>·</span>
                    <span>{q.ago}</span>
                  </div>
                  <p className="mt-1 font-display text-base font-medium leading-snug">
                    {q.question}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-xs">
                    <button className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-semibold transition hover:border-primary hover:text-primary">
                      <ThumbsUp className="h-3 w-3" /> {q.likes}
                    </button>
                    <button className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-semibold transition hover:border-primary hover:text-primary">
                      <MessageCircle className="h-3 w-3" /> {q.answers} respostas
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AppLayout>
  );
}
