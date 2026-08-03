import { useState, useEffect, useCallback } from "react";
import { Users, Loader2, Send, RefreshCw, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CollaborationPanel = () => {
  const [messages, setMessages] = useState([]);
  const [objective, setObjective] = useState("");
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState(null);

  const load = useCallback(() => {
    fetch(`${API}/agents/collaboration`)
      .then((r) => r.json())
      .then(setMessages)
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const orchestrate = async () => {
    if (!objective.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/agents/collaboration/orchestrate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objective }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPlan(data);
      toast.success("Plan de colaboracion generado");
      load();
    } catch {
      toast.error("Error generando plan de colaboracion");
    }
    setBusy(false);
  };

  return (
    <div data-testid="collaboration-panel" className="space-y-4">
      {/* Orquestador */}
      <div className="border border-border bg-card p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
          <Users size={13} className="text-accent" /> Orquestador de colaboracion entre agentes
        </p>
        <div className="flex gap-2">
          <input
            data-testid="orchestrate-input"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && orchestrate()}
            placeholder="Ej: Lanzar 3 tiendas nuevas este mes y alcanzar $50K en ventas"
            className="flex-1 bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            data-testid="orchestrate-btn"
            onClick={orchestrate}
            disabled={busy || !objective.trim()}
            className="px-4 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2 glow-cyan"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {busy ? "Orquestando..." : "Coordinar"}
          </button>
        </div>
      </div>

      {/* Plan generado */}
      {plan && (
        <div data-testid="collaboration-plan" className="border border-border bg-card p-4 fade-up">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Plan de colaboracion</p>
          {plan.summary && (
            <p className="text-sm text-foreground mb-3 p-2 bg-secondary border border-border">{plan.summary}</p>
          )}
          <div className="space-y-2">
            {plan.collaboration_steps?.map((step, i) => (
              <div key={i} data-testid={`collab-step-${i}`} className="border border-border bg-secondary p-3 fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-[10px] text-primary bg-primary/10 px-1.5 py-0.5">Paso {step.step || i + 1}</span>
                  <span className="font-medium text-foreground">{step.from_agent}</span>
                  <ArrowRight size={12} className="text-muted-foreground" />
                  <span className="font-medium text-foreground">{step.to_agent}</span>
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">{step.message}</p>
                {step.task && <p className="mt-1 text-[11px] text-accent font-mono">Tarea: {step.task}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial de colaboracion */}
      <div className="border border-border bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Mensajes entre agentes</span>
          <button onClick={load} className="p-1 text-muted-foreground hover:text-primary transition-colors duration-200">
            <RefreshCw size={12} />
          </button>
        </div>
        {messages.length === 0 ? (
          <p className="p-4 text-xs text-muted-foreground font-mono">// Sin mensajes. Coordinar agentes para empezar.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto divide-y divide-border/60">
            {messages.map((m, i) => (
              <div key={m.id || i} data-testid={`collab-message-${i}`} className="px-4 py-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-primary">{m.from_agent}</span>
                  <ArrowRight size={11} className="text-muted-foreground" />
                  <span className="font-medium text-accent">{m.to_agent}</span>
                  <span className="font-mono text-[10px] text-muted-foreground ml-auto">
                    {m.created_at ? new Date(m.created_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : ""}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{m.message}</p>
                {m.response && (
                  <p className="mt-1 text-[11px] text-foreground pl-3 border-l border-border">{m.response}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
