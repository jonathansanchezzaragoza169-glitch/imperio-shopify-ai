import { useState, useEffect, useCallback } from "react";
import { Loader2, Plug, Trash2, CheckCircle, XCircle, RefreshCw, Zap, Activity, Wifi } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ConnectorsPanel = () => {
  const [connectors, setConnectors] = useState([]);
  const [health, setHealth] = useState([]);
  const [busy, setBusy] = useState(false);
  const [activeConnector, setActiveConnector] = useState(null);
  const [form, setForm] = useState({});
  const [testResult, setTestResult] = useState(null);

  const load = useCallback(async () => {
    try {
      const [listRes, healthRes] = await Promise.all([
        fetch(`${API}/connectors/list`),
        fetch(`${API}/connectors/health`),
      ]);
      if (listRes.ok) setConnectors(await listRes.json());
      if (healthRes.ok) setHealth(await healthRes.json());
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const openConnector = (key, fields) => {
    setActiveConnector(key);
    const init = {};
    fields.forEach(f => { init[f] = ""; });
    setForm(init);
    setTestResult(null);
  };

  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${API}/connectors/save`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connector_key: activeConnector, fields: form }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult(data.test);
        if (data.test?.ok) {
          toast.success(`${data.connector} conectado automaticamente!`);
        } else {
          toast.error(`Conexion fallida: ${data.test?.error || data.test?.detail || "Error"}`);
        }
        load();
      } else {
        toast.error(data.detail || "Error");
      }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const remove = async (key) => {
    try {
      await fetch(`${API}/connectors/${key}`, { method: "DELETE" });
      toast.success("Conector eliminado");
      load();
    } catch { toast.error("Error"); }
  };

  const autoSync = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${API}/connectors/auto-sync`, { method: "POST" });
      if (res.ok) { const data = await res.json(); toast.success(`${data.active_connectors} conectores sincronizados con motor autonomo`); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const healthMap = {};
  health.forEach(h => { healthMap[h.key] = h; });

  return (
    <div data-testid="connectors-panel" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Plug size={20} className="text-primary" />
          <div>
            <h2 className="text-sm font-bold">Conectores</h2>
            <p className="font-mono text-[10px] text-muted-foreground">Conecta todo · Auto-test · Auto-sync</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={autoSync} disabled={busy} className="px-3 py-1.5 border border-primary/50 text-primary text-xs font-semibold hover:bg-primary/10 flex items-center gap-1.5 disabled:opacity-40">
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />} Auto-sync al motor
          </button>
          <button onClick={load} disabled={busy} className="p-1.5 text-muted-foreground hover:text-primary">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-px bg-border border border-border">
        <div className="bg-card px-3 py-2 text-center">
          <p className="font-mono text-[9px] text-muted-foreground uppercase">Conectados</p>
          <p className="font-mono text-lg text-emerald-400">{connectors.filter(c => c.configured).length}</p>
        </div>
        <div className="bg-card px-3 py-2 text-center">
          <p className="font-mono text-[9px] text-muted-foreground uppercase">Disponibles</p>
          <p className="font-mono text-lg text-foreground">{connectors.length}</p>
        </div>
        <div className="bg-card px-3 py-2 text-center">
          <p className="font-mono text-[9px] text-muted-foreground uppercase">Sanos</p>
          <p className="font-mono text-lg text-primary">{health.filter(h => h.healthy).length}</p>
        </div>
      </div>

      {/* Connector grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {connectors.map(c => {
          const h = healthMap[c.key] || {};
          return (
            <div key={c.key} data-testid={`connector-${c.key}`}
              className={`border p-3 transition-colors cursor-pointer ${activeConnector === c.key ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}
              onClick={() => openConnector(c.key, c.fields)}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">{c.name}</span>
                {c.configured ? (
                  <div className="flex items-center gap-1">
                    <CheckCircle size={13} className={h.healthy ? "text-emerald-400" : "text-amber-400"} />
                    {c.configured && !h.healthy && <span className="text-[9px] text-amber-400">fallo</span>}
                  </div>
                ) : (
                  <XCircle size={13} className="text-muted-foreground/50" />
                )}
              </div>
              <p className="font-mono text-[9px] text-muted-foreground">
                {c.configured ? (h.detail || "Configurado") : "No configurado"}
              </p>
              {c.configured && (
                <button onClick={(e) => { e.stopPropagation(); remove(c.key); }}
                  className="mt-1 text-[10px] text-destructive hover:underline flex items-center gap-1">
                  <Trash2 size={10} /> Eliminar
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Connector form */}
      {activeConnector && (
        <div data-testid="connector-form" className="border border-primary/40 bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">{connectors.find(c => c.key === activeConnector)?.name}</p>
            <button onClick={() => setActiveConnector(null)} className="text-muted-foreground hover:text-foreground text-xs">Cerrar</button>
          </div>
          {connectors.find(c => c.key === activeConnector)?.fields.map(f => (
            <div key={f}>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.replace(/_/g, " ")}</label>
              <input
                type={f.includes("secret") || f.includes("token") || f.includes("key") || f.includes("password") ? "password" : "text"}
                value={form[f] || ""}
                onChange={e => setForm({ ...form, [f]: e.target.value })}
                placeholder={f}
                className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          ))}
          <button data-testid="save-connector" onClick={save} disabled={busy || !Object.values(form).every(v => v)}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Plug size={14} />} Conectar y auto-probar
          </button>
          {testResult && (
            <div className={`border p-2 ${testResult.ok ? "border-emerald-500/40 bg-emerald-500/10" : "border-destructive/40 bg-destructive/10"}`}>
              <p className={`text-xs flex items-center gap-1.5 ${testResult.ok ? "text-emerald-400" : "text-destructive"}`}>
                {testResult.ok ? <CheckCircle size={12} /> : <XCircle size={12} />}
                {testResult.detail || testResult.error || (testResult.ok ? "Conectado!" : "Fallo")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Health status */}
      <div className="border border-border bg-card">
        <div className="px-3 py-2 border-b border-border flex items-center gap-2">
          <Activity size={12} className="text-primary" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Estado de conectores</span>
        </div>
        <div className="divide-y divide-border/40">
          {health.map((h, i) => (
            <div key={i} data-testid={`health-${h.key}`} className="px-3 py-2 flex items-center gap-2">
              <Wifi size={11} className={h.healthy ? "text-emerald-400" : "text-muted-foreground/40"} />
              <span className="text-xs flex-1">{h.name}</span>
              <span className={`text-[10px] font-mono ${h.healthy ? "text-emerald-400" : "text-muted-foreground"}`}>
                {h.detail || (h.healthy ? "OK" : "N/A")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
