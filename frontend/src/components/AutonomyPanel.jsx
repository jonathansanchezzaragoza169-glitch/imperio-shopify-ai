import { useState, useEffect, useCallback } from "react";
import { Bot, Play, Pause, Loader2, Clock, Zap, RefreshCw, Activity } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AutonomyPanel = () => {
  const [config, setConfig] = useState({ enabled: false, interval_seconds: 120 });
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);

  const loadStatus = useCallback(() => {
    fetch(`${API}/autonomy/status`)
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  const loadConfig = useCallback(() => {
    fetch(`${API}/autonomy/config`)
      .then((r) => r.json())
      .then((d) => { if (d) setConfig(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadConfig();
    loadStatus();
    const t = setInterval(loadStatus, 10000);
    return () => clearInterval(t);
  }, [loadConfig, loadStatus]);

  const saveConfig = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/autonomy/config`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      toast.success(config.enabled ? "Modo autonomo activado" : "Modo autonomo desactivado");
    } catch {
      toast.error("Error guardando configuracion");
    }
    setSaving(false);
  };

  const runNow = async () => {
    setRunning(true);
    try {
      const res = await fetch(`${API}/autonomy/run`, { method: "POST" });
      if (!res.ok) throw new Error();
      const tasks = await res.json();
      toast.success(`Cerebro genero ${tasks.length} tareas automaticas`);
      loadStatus();
    } catch {
      toast.error("Error ejecutando ciclo autonomo");
    }
    setRunning(false);
  };

  const toggle = () => {
    const newConfig = { ...config, enabled: !config.enabled };
    setConfig(newConfig);
    saveConfig();
  };

  return (
    <div data-testid="autonomy-panel" className="space-y-4">
      {/* Estado autonomo */}
      <div className="border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 flex items-center justify-center border ${config.enabled ? "border-accent/50 text-accent glow-gold" : "border-border text-muted-foreground"}`}>
              <Bot size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold">Modo Autonomo</h3>
              <p className="font-mono text-[10px] text-muted-foreground">
                {config.enabled ? "ACTIVO · Cerebro trabaja solo" : "INACTIVO · Tu diriges todo"}
              </p>
            </div>
          </div>
          <button
            data-testid="autonomy-toggle"
            onClick={toggle}
            disabled={saving}
            className={`px-5 py-2.5 text-sm font-semibold flex items-center gap-2 transition-colors duration-200 ${
              config.enabled
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground glow-cyan"
            }`}
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : config.enabled ? <Pause size={15} /> : <Play size={15} />}
            {config.enabled ? "Detener" : "Activar"}
          </button>
        </div>

        {/* Stats de autonomia */}
        {status && (
          <div className="grid grid-cols-3 gap-px bg-border border border-border">
            <div className="bg-secondary px-3 py-2.5 text-center">
              <Clock size={13} className="text-muted-foreground mx-auto mb-1" />
              <p className="font-mono text-[9px] text-muted-foreground uppercase">Ultima ejec.</p>
              <p className="font-mono text-xs text-foreground mt-0.5">
                {status.last_run ? new Date(status.last_run).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "—"}
              </p>
            </div>
            <div className="bg-secondary px-3 py-2.5 text-center">
              <Zap size={13} className="text-accent mx-auto mb-1" />
              <p className="font-mono text-[9px] text-muted-foreground uppercase">Tareas gen.</p>
              <p className="font-mono text-xs text-accent mt-0.5">{status.tasks_generated || 0}</p>
            </div>
            <div className="bg-secondary px-3 py-2.5 text-center">
              <Activity size={13} className="text-primary mx-auto mb-1" />
              <p className="font-mono text-[9px] text-muted-foreground uppercase">Proxima</p>
              <p className="font-mono text-xs text-primary mt-0.5">
                {status.next_run_eta ? new Date(status.next_run_eta).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "—"}
              </p>
            </div>
          </div>
        )}

        {/* Intervalo configurable */}
        <div className="mt-3 flex items-center gap-3">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">Intervalo (seg):</label>
          <input
            type="number"
            value={config.interval_seconds}
            onChange={(e) => setConfig({ ...config, interval_seconds: parseInt(e.target.value) || 120 })}
            min="30"
            className="w-24 bg-secondary border border-border px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            data-testid="save-interval-btn"
            onClick={saveConfig}
            disabled={saving}
            className="px-3 py-1.5 border border-border text-xs hover:border-primary/50 hover:text-primary transition-colors duration-200"
          >
            Guardar
          </button>
          <button
            data-testid="run-now-btn"
            onClick={runNow}
            disabled={running}
            className="ml-auto px-3 py-1.5 bg-accent/10 border border-accent/50 text-accent text-xs font-semibold flex items-center gap-1.5 hover:bg-accent/20 transition-colors duration-200 disabled:opacity-40"
          >
            {running ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Ejecutar ahora
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="border border-border bg-card p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Como funciona el modo autonomo</p>
        <div className="space-y-2 text-[11px] text-muted-foreground">
          <p>1. Cerebro analiza las metricas actuales y la actividad de los 9 agentes</p>
          <p>2. Genera tareas automaticas y las asigna al agente mas adecuado</p>
          <p>3. Cada {config.interval_seconds}s se repite el ciclo sin tu intervencion</p>
          <p>4. Las tareas aparecen en la pestana Tareas para que veas el progreso</p>
        </div>
      </div>
    </div>
  );
};
