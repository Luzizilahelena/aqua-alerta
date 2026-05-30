export type Severity = "baixa" | "media" | "alta" | "critica";

export type Report = {
  id: string;
  type: "alagamento" | "rua-bloqueada" | "deslizamento" | "outros";
  title: string;
  location: string;
  neighborhood: string;
  severity: Severity;
  timeAgo: string;
  confirmations: number;
  author: string;
};

export const severityMeta: Record<Severity, { label: string; color: string; bg: string }> = {
  baixa: { label: "Baixa", color: "text-[color:var(--safe)]", bg: "bg-[color:var(--safe)]/15" },
  media: { label: "Média", color: "text-[color:var(--warning)]", bg: "bg-[color:var(--warning)]/15" },
  alta: { label: "Alta", color: "text-[color:var(--danger)]", bg: "bg-[color:var(--danger)]/15" },
  critica: { label: "Crítica", color: "text-primary-foreground", bg: "bg-gradient-blood" },
};

export const reports: Report[] = [
  {
    id: "r1",
    type: "alagamento",
    title: "Av. Brasil totalmente alagada",
    location: "Av. Brasil, 1240",
    neighborhood: "Santa Tereza",
    severity: "critica",
    timeAgo: "há 8 min",
    confirmations: 24,
    author: "Maria S.",
  },
  {
    id: "r2",
    type: "rua-bloqueada",
    title: "Árvore caída bloqueando via",
    location: "R. das Acácias, 88",
    neighborhood: "Jardim Botânico",
    severity: "alta",
    timeAgo: "há 22 min",
    confirmations: 11,
    author: "João P.",
  },
  {
    id: "r3",
    type: "alagamento",
    title: "Bueiro entupido, água subindo",
    location: "R. Bento Gonçalves, 500",
    neighborhood: "Centro",
    severity: "media",
    timeAgo: "há 45 min",
    confirmations: 6,
    author: "Carla M.",
  },
  {
    id: "r4",
    type: "deslizamento",
    title: "Encosta com risco de deslizamento",
    location: "Morro do Cruzeiro",
    neighborhood: "Petrópolis",
    severity: "alta",
    timeAgo: "há 1h",
    confirmations: 18,
    author: "Defesa Civil",
  },
  {
    id: "r5",
    type: "alagamento",
    title: "Ponte com nível elevado",
    location: "Ponte do Arroio",
    neighborhood: "Menino Deus",
    severity: "baixa",
    timeAgo: "há 2h",
    confirmations: 3,
    author: "Pedro L.",
  },
];

export const faqItems = [
  {
    q: "Como reporto um alagamento?",
    a: "Toque em 'Novo reporte' no topo, selecione o tipo, adicione localização e uma foto se possível. Quanto mais detalhes, melhor o alerta para a vizinhança.",
  },
  {
    q: "Como ganho recompensas?",
    a: "Cada reporte confirmado pela comunidade vale pontos. Você troca os pontos por descontos em parceiros locais e selos de reconhecimento.",
  },
  {
    q: "Os alertas são oficiais?",
    a: "Os alertas vêm da comunidade e são validados por moradores próximos. Reportes da Defesa Civil aparecem com selo oficial.",
  },
  {
    q: "Posso usar sem internet?",
    a: "Os últimos alertas baixados ficam disponíveis offline. Para enviar reportes você precisa de conexão, mesmo que instável.",
  },
  {
    q: "Como protejo minha privacidade?",
    a: "Mostramos apenas seu primeiro nome. A localização exata só é usada para georreferenciar o reporte, nunca exposta publicamente.",
  },
];

export const rewards = [
  { id: 1, title: "10% off em farmácia Vida", points: 150, partner: "Farmácia Vida" },
  { id: 2, title: "Café grátis", points: 80, partner: "Padaria Central" },
  { id: 3, title: "Selo Sentinela", points: 300, partner: "Comunidade Maré" },
  { id: 4, title: "R$ 15 em transporte", points: 220, partner: "MobiCard" },
];
