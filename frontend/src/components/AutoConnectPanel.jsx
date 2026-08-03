import { useState, useEffect, useCallback } from "react";
import { Loader2, CheckCircle, AlertCircle, Zap, Power, RefreshCw, Rocket } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AutoConnectPanel = () => {
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [autoConnecting, setAutoConnecting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/auto-connect/status`);
      if (res.ok) setStatus(await res.json());
    } catch {}
  }, []);

  useEffect(() => { load(); const i = setInterval(load, 15000); return () => clearInterval(i); }, [load]);

  const runAutoConnect = async () => {
    setAutoConnecting(true);
    try {
      const res = await fetch(`${API}/auto-connect/run`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Auto-connect: ${data.total_connected} conectados, ${data.total_failed} pendientes`);
        load();
      }
    } catch { toast.error("Error"); }
    setAutoConnecting(false);
  };

  const connectedCount = status?.connected?.length || 0;
  const needsCount = status?.needs_attention?.length || 0;
  const total = connectedCount + needsCount;

  return (
    <div data-testid="autoconnect-panel" className="space-y-3">
      {/* HEADER */}
      <div className={`border p-4 ${status?.system_active ? "border-emerald-500/40 bg-emerald-500/5" : "border-primary/40 bg-primary/5"}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Power size={18} className={status?.system_active ? "text-emerald-400" : "text-primary"} />
            <div>
              <h2 className="text-sm font-bold">Auto-Connect</h2>
              <p className="font-mono text-[10px] text-muted-foreground">El sistema se conecta solo al arrancar</p>
            </div>
          </div>
          <button onClick={runAutoConnect} disabled={autoConnecting}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold disabled:opacity-40 flex items-center gap-2">
            {autoConnecting ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />} Reconectar
          </button>
        </div>
        {status && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="border border-emerald-500/40 bg-emerald-500/10 p-2 text-center">
              <p className="font-mono text-2xl text-emerald-400">{connectedCount}</p>
              <p className="text-[10px] uppercase text-muted-foreground">Conectados</p>
            </div>
            <div className="border border-amber-500/40 bg-amber-500/10 p-2 text-center">
              <p className="font-mono text-2xl text-amber-400">{needsCount}</p>
              <p className="text-[10px] uppercase text-muted-foreground">Pendientes</p>
            </div>
            <div className={`border p-2 text-center ${status.system_active ? "border-emerald-500/40 bg-emerald-500/10" : "border-border"}`}>
              <p className={`font-mono text-2xl ${status.system_active ? "text-emerald-400" : "text-muted-foreground"}`}>{status.system_active ? "ON" : "OFF"}</p>
              <p className="text-[10px] uppercase text-muted-foreground">24/7</p>
            </div>
          </div>
        )}
        {!status && <p className="text-xs text-muted-foreground mt-2">Conectando al backend...</p>}
      </div>

      {/* SYSTEM STATUS */}
      {status?.system_active && (
        <div className="border border-emerald-500/40 bg-emerald-500/5 p-3 flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <div>
            <p className="text-xs font-medium text-emerald-400">Sistema 24/7 activo</p>
            <p className="font-mono text-[10px] text-muted-foreground">Shopify conectado → motor autonomo arrancado → 23 tareas en background</p>
          </div>
        </div>
      )}

      {/* CONNECTED SERVICES */}
      {status?.connected?.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1"><CheckCircle size={12} /> Conectados automaticamente</p>
          {status.connected.map((c, i) => (
            <div key={i} className="border border-emerald-500/20 px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={12} className="text-emerald-400" />
                <span className="text-xs font-medium">{c.service}</span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">{c.detail}</span>
            </div>
          ))}
        </div>
      )}

      {/* NEEDS ATTENTION */}
      {status?.needs_attention?.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1"><AlertCircle size={12} /> Pendientes (opcional)</p>
          {status.needs_attention.map((n, i) => (
            <div key={i} className="border border-amber-500/20 px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={12} className="text-amber-400" />
                <span className="text-xs">{n.service}</span>
              </div>
              <span className="font-mono text-[9px] text-muted-foreground text-right max-w-[60%]">{n.detail}</span>
            </div>
          ))}
        </div>
      )}

      {/* HOW IT WORKS */}
      <div className="border border-border bg-card p-4 space-y-2">
        <p className="text-xs font-bold flex items-center gap-2"><Rocket size={13} className="text-primary" /> Como funciona el auto-connect</p>
        <ol className="text-[11px] text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Pones tus keys en backend/.env</li>
          <li>Arrancas con `python3 start.py`</li>
          <li>El sistema lee .env automaticamente</li>
          <li>Conecta Shopify, PayPal, Stripe, Telegram... lo que encuentre</li>
          <li>Si Shopify esta → activa motor 24/7 solo</li>
          <li>Las que falten las puedes anadir despues</li>
          <li>No necesitas configurar nada manualmente</li>
        </ol>
      </div>
    </div>
  );
};
