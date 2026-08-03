import { useState, useEffect, useCallback } from "react";
import { DollarSign, TrendingUp, Wallet, ArrowDownToLine, Loader2, Bot, CheckCircle, Activity, PiggyBank, Crown, RefreshCw, Power } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const fmt = (n) => new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

export const CEODashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoConfig, setAutoConfig] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [withdrawDest, setWithdrawDest] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("paypal");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, autoRes] = await Promise.all([
        fetch(`${API}/ceo/dashboard`),
        fetch(`${API}/autonomy/config`),
      ]);
      if (dashRes.ok) setData(await dashRes.json());
      if (autoRes.ok) setAutoConfig(await autoRes.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const quickWithdraw = async () => {
    if (withdrawAmount <= 0) { toast.error("Pon un importe mayor que 0"); return; }
    setBusy(true);
    try {
      const res = await fetch(`${API}/ceo/quick-withdraw`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: withdrawAmount, method: withdrawMethod, destination: withdrawDest }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(`Retiro REAL enviado: ${result.status}`);
        setWithdrawAmount(0);
        setWithdrawDest("");
        load();
      } else {
        toast.error(result.detail || "Error en el retiro");
      }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const toggleAutonomy = async () => {
    const newEnabled = !autoConfig?.enabled;
    try {
      await fetch(`${API}/autonomy/config`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: newEnabled,
          interval_seconds: autoConfig?.interval_seconds || 120,
          auto_post_social: true, auto_recover_carts: true, auto_discover_products: true,
          auto_check_inventory: true, auto_generate_strategy: true, auto_execute_tasks: true,
        }),
      });
      toast.success(newEnabled ? "Autonomia ACTIVADA - los agentes trabajan solos" : "Autonomia pausada");
      load();
    } catch { toast.error("Error"); }
  };

  if (!data) {
    return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-primary" /></div>;
  }

  return (
    <div data-testid="ceo-dashboard" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown size={24} className="text-accent" />
          <div>
            <h2 className="text-lg font-bold">Panel del CEO</h2>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Tu supervisas el dinero · Ellos trabajan</p>
          </div>
        </div>
        <button onClick={load} disabled={loading} className="p-2 text-muted-foreground hover:text-primary">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
        </button>
      </div>

      {/* Autonomy status */}
      <div className={`border p-4 flex items-center justify-between ${data.autonomia_activa ? "border-emerald-500/40 bg-emerald-500/10" : "border-border bg-card"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 flex items-center justify-center ${data.autonomia_activa ? "bg-emerald-500/20" : "bg-secondary"}`}>
            <Bot size={20} className={data.autonomia_activa ? "text-emerald-400" : "text-muted-foreground"} />
          </div>
          <div>
            <p className="text-sm font-semibold">
              {data.autonomia_activa ? "Agentes trabajando en autonomo" : "Autonomia pausada"}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              {data.tareas_automaticas} tareas auto · {data.tareas_activas} activas · {data.tareas_completadas} completadas
            </p>
          </div>
        </div>
        <button data-testid="toggle-autonomy" onClick={toggleAutonomy}
          className={`px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-colors ${data.autonomia_activa ? "border border-destructive/50 text-destructive hover:bg-destructive/10" : "bg-primary text-primary-foreground glow-cyan"}`}>
          <Power size={15} />
          {data.autonomia_activa ? "Pausar agentes" : "Activar autonomia"}
        </button>
      </div>

      {/* Money overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
        <div data-testid="ceo-revenue" className="bg-card px-4 py-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign size={13} className="text-accent" />
            <span className="text-[10px] uppercase tracking-[0.15em]">Ingresos totales</span>
          </div>
          <p className="mt-1 font-mono text-2xl text-accent">${fmt(data.ingresos)}</p>
        </div>
        <div data-testid="ceo-profit" className="bg-card px-4 py-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <PiggyBank size={13} className="text-accent" />
            <span className="text-[10px] uppercase tracking-[0.15em]">Beneficio</span>
          </div>
          <p className="mt-1 font-mono text-2xl text-accent">${fmt(data.beneficio)}</p>
          <p className="font-mono text-[10px] text-muted-foreground mt-0.5">Margen: {data.margen_porcentaje}%</p>
        </div>
        <div data-testid="ceo-available" className="bg-card px-4 py-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wallet size={13} className="text-primary" />
            <span className="text-[10px] uppercase tracking-[0.15em]">Disponible</span>
          </div>
          <p className="mt-1 font-mono text-2xl text-primary">${fmt(data.disponible_para_retirar)}</p>
        </div>
        <div data-testid="ceo-withdrawn" className="bg-card px-4 py-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowDownToLine size={13} className="text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-[0.15em]">Ya retirado</span>
          </div>
          <p className="mt-1 font-mono text-2xl text-foreground">${fmt(data.ya_retirado)}</p>
          <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{data.total_retiros} retiros</p>
        </div>
      </div>

      {/* Quick withdrawal */}
      <div data-testid="quick-withdraw" className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2">
          <ArrowDownToLine size={13} /> Retiro rapido
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Importe</label>
            <input type="number" value={withdrawAmount || ""} onChange={e => setWithdrawAmount(parseFloat(e.target.value) || 0)}
              placeholder={data.disponible_para_retirar.toFixed(2)} step="0.01" min="0"
              className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Metodo</label>
            <select value={withdrawMethod} onChange={e => setWithdrawMethod(e.target.value)}
              className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="paypal">PayPal</option>
              <option value="stripe">Stripe</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Destino</label>
            <input value={withdrawDest} onChange={e => setWithdrawDest(e.target.value)}
              placeholder={withdrawMethod === "paypal" ? "email@paypal.com" : "ba_xxx"}
              className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>
        <button data-testid="ceo-withdraw-btn" onClick={quickWithdraw} disabled={busy || withdrawAmount <= 0}
          className="w-full py-2.5 bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40">
          {busy ? <Loader2 size={15} className="animate-spin" /> : <ArrowDownToLine size={15} />}
          {busy ? "Procesando..." : `Retirar $${fmt(withdrawAmount)}`}
        </button>
        <p className="font-mono text-[10px] text-muted-foreground">// Disponible: ${fmt(data.disponible_para_retirar)} · Pendiente: ${fmt(data.retiros_pendientes)}</p>
      </div>

      {/* Projections */}
      <div className="border border-border bg-card p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
          <TrendingUp size={13} className="text-primary" /> Proyecciones reales (basadas en datos actuales)
        </p>
        <div className="grid grid-cols-3 gap-px bg-border border border-border">
          <div className="bg-secondary px-3 py-3 text-center">
            <p className="font-mono text-[9px] text-muted-foreground uppercase">Diario</p>
            <p className="font-mono text-lg text-primary mt-1">${fmt(data.proyeccion_diaria)}</p>
          </div>
          <div className="bg-secondary px-3 py-3 text-center">
            <p className="font-mono text-[9px] text-muted-foreground uppercase">Mensual</p>
            <p className="font-mono text-lg text-accent mt-1">${fmt(data.proyeccion_mensual)}</p>
          </div>
          <div className="bg-secondary px-3 py-3 text-center">
            <p className="font-mono text-[9px] text-muted-foreground uppercase">Anual</p>
            <p className="font-mono text-lg text-accent mt-1">${fmt(data.proyeccion_anual)}</p>
          </div>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground mt-2">// Calculado desde ingresos reales de Shopify / 30 dias. Sin alucinaciones.</p>
      </div>

      {/* What agents are doing */}
      <div className="border border-border bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Activity size={13} className="text-primary" />
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Que estan haciendo los agentes ahora</span>
        </div>
        <div className="divide-y divide-border/60 max-h-64 overflow-y-auto">
          {data.actividad_reciente?.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground font-mono">// Sin actividad. Activa la autonomia para que los agentes empiecen a trabajar.</p>
          ) : (
            data.actividad_reciente?.map((a, i) => (
              <div key={i} data-testid={`activity-${i}`} className="px-4 py-2.5 flex items-start gap-2">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${a.text?.includes('[AUTO]') ? "bg-emerald-400" : "bg-primary"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs">
                    {a.agent_name && <span className="text-primary font-medium">{a.agent_name}: </span>}
                    <span className="text-foreground">{a.text}</span>
                  </p>
                  <p className="font-mono text-[9px] text-muted-foreground">{a.timestamp ? new Date(a.timestamp).toLocaleString("es-ES") : ""}</p>
                </div>
                {a.text?.includes("[AUTO]") && <CheckCircle size={12} className="text-emerald-400 shrink-0 mt-1" />}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
        <div className="bg-card px-3 py-3 text-center">
          <p className="font-mono text-[9px] text-muted-foreground uppercase">Productos</p>
          <p className="font-mono text-lg text-foreground mt-1">{data.productos}</p>
        </div>
        <div className="bg-card px-3 py-3 text-center">
          <p className="font-mono text-[9px] text-muted-foreground uppercase">Tiendas</p>
          <p className="font-mono text-lg text-foreground mt-1">{data.tiendas}</p>
        </div>
        <div className="bg-card px-3 py-3 text-center">
          <p className="font-mono text-[9px] text-muted-foreground uppercase">Tareas auto</p>
          <p className="font-mono text-lg text-emerald-400 mt-1">{data.tareas_automaticas}</p>
        </div>
        <div className="bg-card px-3 py-3 text-center">
          <p className="font-mono text-[9px] text-muted-foreground uppercase">Completadas</p>
          <p className="font-mono text-lg text-primary mt-1">{data.tareas_completadas}</p>
        </div>
      </div>
    </div>
  );
};
