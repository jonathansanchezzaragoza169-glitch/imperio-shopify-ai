import { useState, useEffect, useCallback } from "react";
import { Loader2, Zap, Crown, TrendingUp, DollarSign, Brain, Package, CreditCard, Copy, Wallet, Radio, Video, Eye, ShoppingCart, Rocket, RefreshCw, Trophy, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AGENT_ICONS = {
  cerebro: Brain, productos: Package, automatizacion: Zap, capital: TrendingUp,
  clonacion: Copy, finanzas: DollarSign, rrss: Radio, edicion: Video, estetica: Eye, ventas: ShoppingCart,
};

export const IMASDPanel = () => {
  const [meeting, setMeeting] = useState(null);
  const [score, setScore] = useState(null);
  const [history, setHistory] = useState(null);
  const [busy, setBusy] = useState(false);
  const [executing, setExecuting] = useState(null);

  const load = useCallback(async () => {
    try {
      const scoreRes = await fetch(`${API}/imasd/profit-score`);
      if (scoreRes.ok) setScore(await scoreRes.json());
    } catch {}
  }, []);

  useEffect(() => { load(); const i = setInterval(load, 30000); return () => clearInterval(i); }, [load]);

  const runMeeting = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${API}/imasd/meeting`);
      if (res.ok) {
        const data = await res.json();
        setMeeting(data);
        toast.success(`IMASD: ${data.total_opportunities} oportunidades · Potencial ${data.total_potential_monthly_profit}€/mes`);
      } else { toast.error("Error en reunion IMASD"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API}/imasd/history`);
      if (res.ok) setHistory(await res.json());
    } catch {}
  };

  const executeOpp = async (opp) => {
    setExecuting(opp.title);
    try {
      const res = await fetch(`${API}/imasd/execute`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunity: opp }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.executed) toast.success(`Ejecutado: ${data.title}`);
        else toast.success(`Tarea creada para: ${data.title}`);
      }
    } catch { toast.error("Error"); }
    setExecuting(null);
  };

  const gradeColor = (g) => {
    if (g === "S") return "text-emerald-400";
    if (g === "A") return "text-emerald-400";
    if (g === "B") return "text-primary";
    if (g === "C") return "text-amber-400";
    if (g === "D") return "text-orange-400";
    return "text-destructive";
  };

  return (
    <div data-testid="imasd-panel" className="space-y-4">
      {/* HEADER */}
      <div className="border border-primary/40 bg-primary/5 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Crown size={18} className="text-primary" />
            <div>
              <h2 className="text-sm font-bold">IMASD</h2>
              <p className="font-mono text-[10px] text-muted-foreground">Ingresos Maximos Activos Sostenibles Diarios</p>
            </div>
          </div>
          <button onClick={runMeeting} disabled={busy}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold disabled:opacity-40 flex items-center gap-2 glow-cyan">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Reunion de agentes
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">Los 10 agentes se reúnen, escanean el negocio, detectan oportunidades de beneficio y ejecutan las mejores. Auto-ejecucion cada 4h.</p>
      </div>

      {/* PROFIT SCORE */}
      {score && !score.message && (
        <div className="border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Trophy size={13} /> Profit Score</p>
            <div className="flex items-baseline gap-2">
              <span className={`font-mono text-3xl font-bold ${gradeColor(score.grade)}`}>{score.grade}</span>
              <span className="font-mono text-sm text-muted-foreground">{score.value}/{score.max || 100}</span>
            </div>
          </div>
          <div className="space-y-2">
            {Object.entries(score.factors || {}).map(([key, f]) => (
              <div key={key}>
                <div className="flex justify-between text-[10px] mb-0.5">
                  <span className="text-muted-foreground capitalize">{key}: {f.detail}</span>
                  <span className="font-mono">{f.value}/{f.max}</span>
                </div>
                <div className="h-1 bg-border overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${(f.value / f.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          {score.recommendations?.length > 0 && (
            <div className="mt-3 border-t border-border pt-2">
              <p className="text-[10px] uppercase text-muted-foreground mb-1">Recomendaciones</p>
              {score.recommendations.map((r, i) => <p key={i} className="text-[11px] text-amber-400 flex items-center gap-1"><AlertCircle size={10} /> {r}</p>)}
            </div>
          )}
        </div>
      )}

      {/* AGENT STATUS GRID */}
      {meeting && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {Object.entries(meeting.agents || {}).map(([key, agent]) => {
            const Icon = AGENT_ICONS[key] || Brain;
            const agentDef = IMASD_AGENTS_BACKEND?.[key] || {};
            return (
              <div key={key} data-testid={`imasd-agent-${key}`}
                className={`border p-2 ${agent.status === "active" ? "border-emerald-500/40 bg-emerald-500/5" : agent.status === "error" ? "border-destructive/40" : "border-border"}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={12} className={agent.status === "active" ? "text-emerald-400" : "text-muted-foreground"} />
                  <span className="text-[10px] font-medium capitalize">{key}</span>
                </div>
                <p className="font-mono text-[9px] text-muted-foreground leading-tight">{agent.summary}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* STRATEGY */}
      {meeting?.strategy && (
        <div className="border border-primary/40 bg-card p-4 space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Brain size={13} className="text-primary" /> Estrategia de Cerebro</p>
          <p className="text-sm">{meeting.strategy.strategy}</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="border border-border/40 p-2"><p className="text-[10px] uppercase text-muted-foreground">Prioridad top</p><p className="text-xs font-medium">{meeting.strategy.top_priority}</p></div>
            <div className="border border-border/40 p-2"><p className="text-[10px] uppercase text-muted-foreground">Aumento estimado</p><p className="font-mono text-sm text-accent">+{meeting.strategy.expected_monthly_increase}€/mes</p></div>
          </div>
          {meeting.strategy.agent_directives?.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-[10px] uppercase text-muted-foreground">Directivas a agentes</p>
              {meeting.strategy.agent_directives.map((d, i) => (
                <p key={i} className="text-[11px]"><span className="text-primary font-medium">{d.agent}:</span> {d.directive}</p>
              ))}
            </div>
          )}
          <p className="font-mono text-[10px] text-muted-foreground mt-2">Riesgo: {meeting.strategy.risk_assessment}</p>
        </div>
      )}

      {/* TOTAL POTENTIAL */}
      {meeting && (
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-primary/40 bg-primary/5 p-3 text-center">
            <p className="font-mono text-[10px] text-muted-foreground uppercase">Oportunidades</p>
            <p className="font-mono text-2xl text-primary">{meeting.total_opportunities}</p>
          </div>
          <div className="border border-accent/40 bg-accent/5 p-3 text-center">
            <p className="font-mono text-[10px] text-muted-foreground uppercase">Potencial / mes</p>
            <p className="font-mono text-2xl text-accent">+{meeting.total_potential_monthly_profit}€</p>
          </div>
        </div>
      )}

      {/* OPPORTUNITIES LIST */}
      {meeting?.opportunities?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Rocket size={13} /> Oportunidades detectadas (ordenadas por beneficio)</p>
          {meeting.opportunities.map((opp, i) => {
            const Icon = AGENT_ICONS[opp.agent] || Brain;
            return (
              <div key={i} data-testid={`opp-${i}`}
                className="border border-border bg-card p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <Icon size={14} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{opp.title}</p>
                      <p className="text-[11px] text-muted-foreground">{opp.action}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-sm text-accent">+{opp.estimated_monthly_profit}€/mes</p>
                    <p className="font-mono text-[9px] text-muted-foreground">confianza: {opp.confidence}%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-muted-foreground uppercase">agente: {opp.agent} · tipo: {opp.type}</span>
                  <button onClick={() => executeOpp(opp)} disabled={executing === opp.title}
                    className="px-3 py-1 bg-primary text-primary-foreground text-[10px] font-semibold disabled:opacity-40 flex items-center gap-1">
                    {executing === opp.title ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />} Ejecutar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* HISTORY */}
      <div className="border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Historial IMASD</p>
          <button onClick={loadHistory} className="text-xs text-primary">Ver historial</button>
        </div>
        {history?.history?.length > 0 && (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {history.history.map((h, i) => (
              <div key={i} className="border border-border/40 px-2 py-1.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px]">{h.opportunity?.title}</p>
                  <p className="font-mono text-[9px] text-muted-foreground">{h.timestamp?.slice(0, 16)} · {h.agent}</p>
                </div>
                <span className={`font-mono text-[9px] ${h.executed ? "text-emerald-400" : "text-amber-400"}`}>
                  {h.executed ? "EJECUTADO" : "PENDIENTE"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HOW IT WORKS */}
      <div className="border border-border bg-card p-4 space-y-2">
        <p className="text-xs font-bold flex items-center gap-2"><Crown size={13} className="text-primary" /> Como funciona IMASD</p>
        <ol className="text-[11px] text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Click "Reunion de agentes" o espera al auto-run (cada 4h)</li>
          <li>Los 10 agentes escanean el negocio en paralelo</li>
          <li>Cada agente busca oportunidades en su especialidad</li>
          <li>Cerebro analiza todas las oportunidades y crea estrategia</li>
          <li>Las oportunidades con 80%+ confianza se auto-ejecutan</li>
          <li>Puedes ejecutar cualquier oportunidad manualmente</li>
          <li>Profit Score te dice como va el negocio (0-100, grade S-F)</li>
          <li>Todo 24/7 sin que tengas que hacer nada</li>
        </ol>
      </div>
    </div>
  );
};
