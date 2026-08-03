import { useState, useEffect, useCallback } from "react";
import { Loader2, Play, Pause, Clock, CheckCircle, XCircle, AlertCircle, Zap, Activity, Power, Settings, Rocket } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AutoSystemPanel = () => {
  const [scheduler, setScheduler] = useState(null);
  const [health, setHealth] = useState(null);
  const [busy, setBusy] = useState(false);
  const [quickStart, setQuickStart] = useState({ shopify_domain: "", shopify_token: "", openai_key: "" });
  const [quickStartResult, setQuickStartResult] = useState(null);

  const load = useCallback(async () => {
    try {
      const [schedRes, healthRes] = await Promise.all([
        fetch(`${API}/scheduler/config`),
        fetch(`${API}/system/health`),
      ]);
      if (schedRes.ok) setScheduler(await schedRes.json());
      if (healthRes.ok) setHealth(await healthRes.json());
    } catch {}
  }, []);

  useEffect(() => { load(); const i = setInterval(load, 30000); return () => clearInterval(i); }, [load]);

  const toggleScheduler = async () => {
    setBusy(true);
    try {
      await fetch(`${API}/scheduler/toggle`, { method: "POST" });
      load();
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const toggleTask = async (index, enabled) => {
    if (!scheduler) return;
    const schedules = [...scheduler.schedules];
    schedules[index] = { ...schedules[index], enabled: !enabled };
    await fetch(`${API}/scheduler/config`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedules }),
    });
    load();
  };

  const doQuickStart = async () => {
    if (!quickStart.shopify_domain.trim() || !quickStart.shopify_token.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/quick-start`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quickStart),
      });
      if (res.ok) {
        const data = await res.json();
        setQuickStartResult(data);
        if (data.shopify_connected) {
          toast.success(`Sistema 24/7 activado! Tienda: ${data.shop_name}`);
        } else {
          toast.error("Shopify no conectado. Verifica tus credenciales.");
        }
        load();
      } else { toast.error("Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const statusColor = (status) => {
    if (status === "operational") return "text-emerald-400";
    if (status === "degraded") return "text-amber-400";
    return "text-destructive";
  };

  return (
    <div data-testid="auto-system-panel" className="space-y-4">
      {/* QUICK START - one click to configure everything */}
      {!health?.components?.shopify?.configured && (
        <div data-testid="quick-start" className="border border-primary/40 bg-primary/5 p-4 space-y-3">
          <p className="text-sm font-bold flex items-center gap-2"><Rocket size={16} className="text-primary" /> Quick Start - Activa todo en 1 clic</p>
          <p className="text-xs text-muted-foreground">Mete tus credenciales de Shopify y el sistema se pone a trabajar 24/7 solo.</p>
          <input value={quickStart.shopify_domain} onChange={e => setQuickStart({ ...quickStart, shopify_domain: e.target.value })}
            placeholder="tu-tienda.myshopify.com" className="w-full bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="password" value={quickStart.shopify_token} onChange={e => setQuickStart({ ...quickStart, shopify_token: e.target.value })}
            placeholder="shpat_xxxxx (Access Token Shopify)" className="w-full bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="password" value={quickStart.openai_key} onChange={e => setQuickStart({ ...quickStart, openai_key: e.target.value })}
            placeholder="sk-xxxxx (OpenAI API key - opcional)" className="w-full bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
          <button data-testid="quick-start-btn" onClick={doQuickStart} disabled={busy || !quickStart.shopify_domain.trim() || !quickStart.shopify_token.trim()}
            className="px-6 py-3 bg-primary text-primary-foreground text-sm font-bold disabled:opacity-40 flex items-center gap-2 glow-cyan">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />} ACTIVAR SISTEMA 24/7
          </button>
          {quickStartResult && (
            <div className={`border p-3 ${quickStartResult.shopify_connected ? "border-emerald-500/40 bg-emerald-500/10" : "border-destructive/40 bg-destructive/10"}`}>
              <p className={`text-xs ${quickStartResult.shopify_connected ? "text-emerald-400" : "text-destructive"}`}>
                {quickStartResult.shopify_connected ? `Tienda conectada: ${quickStartResult.shop_name}` : "No se pudo conectar Shopify"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{quickStartResult.message}</p>
              <p className="font-mono text-[10px] text-accent mt-1">{quickStartResult.scheduler_tasks} tareas 24/7 activadas</p>
            </div>
          )}
        </div>
      )}

      {/* SYSTEM STATUS */}
      {health && (
        <div className="border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Power size={16} className={health.status === "operational" ? "text-emerald-400" : "text-amber-400"} />
              <span className="text-sm font-bold">Estado del Sistema</span>
              <span className={`text-xs font-mono uppercase ${statusColor(health.status)}`}>{health.status}</span>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">uptime: {health.uptime}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
            <div className="bg-card px-3 py-2 text-center">
              <p className="font-mono text-[9px] text-muted-foreground uppercase">Shopify</p>
              <p className={`text-xs mt-0.5 ${health.components?.shopify?.configured ? "text-emerald-400" : "text-muted-foreground"}`}>
                {health.components?.shopify?.configured ? "CONECTADO" : "NO"}
              </p>
            </div>
            <div className="bg-card px-3 py-2 text-center">
              <p className="font-mono text-[9px] text-muted-foreground uppercase">Autonomia</p>
              <p className={`text-xs mt-0.5 ${health.components?.autonomy?.enabled ? "text-emerald-400" : "text-muted-foreground"}`}>
                {health.components?.autonomy?.running ? "ACTIVA 24/7" : health.components?.autonomy?.enabled ? "ENABLED" : "OFF"}
              </p>
            </div>
            <div className="bg-card px-3 py-2 text-center">
              <p className="font-mono text-[9px] text-muted-foreground uppercase">Scheduler</p>
              <p className={`text-xs mt-0.5 ${health.components?.scheduler?.running ? "text-emerald-400" : "text-muted-foreground"}`}>
                {health.components?.scheduler?.running ? `${health.components?.scheduler?.tasks || 0} tareas` : "PAUSADO"}
              </p>
            </div>
            <div className="bg-card px-3 py-2 text-center">
              <p className="font-mono text-[9px] text-muted-foreground uppercase">Conectores</p>
              <p className="text-xs mt-0.5 text-accent">{health.components?.connectors?.active || 0}/{health.components?.connectors?.total || 0}</p>
            </div>
          </div>
          {health.components?.activity?.events_today > 0 && (
            <p className="font-mono text-[10px] text-muted-foreground mt-2">{health.components.activity.events_today} eventos hoy</p>
          )}
        </div>
      )}

      {/* SCHEDULER CONTROL */}
      {scheduler && (
        <div className="border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <span className="text-sm font-bold">Scheduler 24/7</span>
            </div>
            <button data-testid="toggle-scheduler" onClick={toggleScheduler} disabled={busy}
              className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 ${scheduler.running ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-destructive/20 text-destructive border border-destructive/40"}`}>
              {busy ? <Loader2 size={12} className="animate-spin" /> : scheduler.running ? <Pause size={12} /> : <Play size={12} />}
              {scheduler.running ? "ACTIVO" : "PAUSADO"}
            </button>
          </div>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {scheduler.schedules?.map((s, i) => (
              <div key={i} data-testid={`task-${s.action}`} className="border border-border/40 px-3 py-2 flex items-center gap-2">
                <button onClick={() => toggleTask(i, s.enabled)} className="shrink-0">
                  {s.enabled ? <CheckCircle size={13} className="text-emerald-400" /> : <XCircle size={13} className="text-muted-foreground/40" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs ${s.enabled ? "text-foreground" : "text-muted-foreground"}`}>{s.name}</p>
                  <p className="font-mono text-[9px] text-muted-foreground">cada {s.interval_minutes} min · {s.action}</p>
                </div>
                <span className={`font-mono text-[9px] ${s.enabled ? "text-emerald-400" : "text-muted-foreground"}`}>
                  {s.enabled ? "ON" : "OFF"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPONENTS DETAIL */}
      {health && (
        <div className="border border-border bg-card">
          <div className="px-3 py-2 border-b border-border flex items-center gap-2">
            <Activity size={12} className="text-primary" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Componentes del sistema</span>
          </div>
          <div className="divide-y divide-border/40">
            {Object.entries(health.components || {}).map(([key, val]) => (
              <div key={key} data-testid={`component-${key}`} className="px-3 py-2 flex items-center justify-between">
                <span className="text-xs capitalize">{key}</span>
                <div className="flex items-center gap-2">
                  {val?.status === "connected" || val?.enabled || val?.running ? (
                    <CheckCircle size={11} className="text-emerald-400" />
                  ) : val?.status === "error" ? (
                    <AlertCircle size={11} className="text-destructive" />
                  ) : (
                    <XCircle size={11} className="text-muted-foreground/40" />
                  )}
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {val?.status || val?.provider || val?.active != null ? `${val.active}/${val.total}` : val?.enabled ? "on" : val?.running ? "on" : "off"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
