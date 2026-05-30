import { reports, severityMeta } from "@/lib/mock-data";

// Posições mock no SVG (x%, y%)
const positions = [
  { id: "r1", x: 35, y: 45 },
  { id: "r2", x: 62, y: 30 },
  { id: "r3", x: 50, y: 60 },
  { id: "r4", x: 78, y: 55 },
  { id: "r5", x: 22, y: 70 },
];

export function RiskMap({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-ember ${className}`}>
      {/* grade */}
      <svg className="absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* "rios" estilizados */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d="M 0 55 Q 25 50 40 60 T 75 55 T 100 65"
          stroke="oklch(0.7 0.12 230 / 0.5)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 30 0 Q 35 30 50 45 T 65 100"
          stroke="oklch(0.7 0.12 230 / 0.35)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>

      {/* zonas de risco */}
      <div className="absolute left-[25%] top-[40%] h-40 w-40 rounded-full bg-[color:var(--danger)]/30 blur-2xl" />
      <div className="absolute left-[60%] top-[50%] h-32 w-32 rounded-full bg-[color:var(--warning)]/25 blur-2xl" />

      {/* pinos */}
      {positions.map((p) => {
        const r = reports.find((x) => x.id === p.id);
        if (!r) return null;
        const meta = severityMeta[r.severity];
        return (
          <div
            key={p.id}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <span className="relative flex h-3 w-3">
              <span className={`absolute inline-flex h-full w-full animate-pulse-ring rounded-full ${meta.bg}`} />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[color:var(--danger)] ring-2 ring-white/80" />
            </span>
            <div className="pointer-events-none absolute left-1/2 top-5 hidden w-44 -translate-x-1/2 rounded-lg bg-card p-2 text-xs shadow-soft group-hover:block">
              <div className="font-semibold text-foreground">{r.title}</div>
              <div className="text-muted-foreground">{r.location}</div>
            </div>
          </div>
        );
      })}

      {/* legenda */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider text-white/90">
        <span className="flex items-center gap-1.5 rounded-full bg-black/30 px-2 py-1 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-[color:var(--danger)]" /> Crítica
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-black/30 px-2 py-1 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-[color:var(--warning)]" /> Atenção
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-black/30 px-2 py-1 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-[color:var(--safe)]" /> Estável
        </span>
      </div>
    </div>
  );
}
