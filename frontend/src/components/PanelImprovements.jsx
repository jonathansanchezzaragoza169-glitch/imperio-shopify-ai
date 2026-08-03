import { useState, useCallback } from "react";
import { Loader2, Zap, TrendingUp, Search, Eye, Mail, Boxes, Users, DollarSign, Activity, Brain, Calendar, Send, Shield, Download, RefreshCw, AlertTriangle, CheckCircle, FileText } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const PanelImprovements = () => {
  const [busy, setBusy] = useState("");
  const [data, setData] = useState({});

  const call = async (endpoint, key, method = "GET", body = null) => {
    setBusy(key);
    try {
      const opts = { method };
      if (body) { opts.headers = { "Content-Type": "application/json" }; opts.body = JSON.stringify(body); }
      const res = await fetch(`${API}/${endpoint}`, opts);
      if (res.ok) {
        const result = await res.json();
        setData(prev => ({ ...prev, [key]: result }));
        toast.success(`${key} OK`);
      } else toast.error("Error");
    } catch { toast.error("Error de conexion"); }
    setBusy("");
  };

  const Section = ({ title, icon: Icon, children }) => (
    <div className="border border-border bg-card p-3 space-y-2">
      <p className="text-xs font-bold flex items-center gap-1.5"><Icon size={13} className="text-primary" /> {title}</p>
      {children}
    </div>
  );

  const Btn = ({ id, label, endpoint, method, body }) => (
    <button onClick={() => call(endpoint, id, method, body)} disabled={busy === id}
      className="w-full px-2 py-1.5 bg-primary text-primary-foreground text-[10px] font-semibold disabled:opacity-40 flex items-center justify-center gap-1">
      {busy === id ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />} {label}
    </button>
  );

  const Out = ({ id }) => data[id] ? (
    <pre className="font-mono text-[9px] text-muted-foreground max-h-28 overflow-y-auto border border-border/40 p-1.5">
      {JSON.stringify(data[id], null, 0).slice(0, 400)}
    </pre>
  ) : null;

  return (
    <div data-testid="panel-improvements" className="space-y-3">
      <div className="border border-primary/40 bg-primary/5 p-3">
        <h2 className="text-sm font-bold">Mejoras por Panel — Ejecutables, Reales, Legales</h2>
        <p className="text-[10px] text-muted-foreground">Cada panel del sistema tiene nuevas herramientas ejecutables. Todo real, sin datos sinteticos.</p>
      </div>

      {/* PANEL SUMMARY */}
      <Section title="Resumen de todos los paneles" icon={Activity}>
        <Btn id="summary" label="Ver estado de todos los paneles" endpoint="panels/summary" />
        <Out id="summary" />
      </Section>

      {/* AUTONOMO */}
      <Section title="Panel Autónomo — Historial + Auto-ajuste" icon={Brain}>
        <div className="grid grid-cols-2 gap-2">
          <Btn id="auto_hist" label="Historial de decisiones" endpoint="autonomous/history" />
          <Btn id="auto_adj" label="Auto-ajustar threshold" endpoint="autonomous/auto-adjust-threshold" method="POST" />
        </div>
        <Out id="auto_hist" />
        <Out id="auto_adj" />
      </Section>

      {/* 24/7 */}
      <Section title="Panel 24/7 — Historial + Auto-retry" icon={RefreshCw}>
        <div className="grid grid-cols-2 gap-2">
          <Btn id="sched_hist" label="Historial de ejecuciones" endpoint="scheduler/history" />
          <Btn id="sched_retry" label="Reintentar fallidas" endpoint="scheduler/retry-failed" method="POST" />
        </div>
        <Out id="sched_hist" />
      </Section>

      {/* CEO */}
      <Section title="Panel CEO — Proyecciones + Historial retiros" icon={DollarSign}>
        <div className="grid grid-cols-2 gap-2">
          <Btn id="proj" label="Proyecciones 7/30/90 dias" endpoint="ceo/projections" />
          <Btn id="withdraw_hist" label="Historial de retiros" endpoint="ceo/withdrawal-history" />
        </div>
        {data.proj && (
          <div className="grid grid-cols-3 gap-1 text-center">
            <div className="border border-border/40 p-1.5"><p className="font-mono text-sm text-primary">{data.proj.projection_7d || 0}</p><p className="text-[8px] uppercase text-muted-foreground">7 dias</p></div>
            <div className="border border-border/40 p-1.5"><p className="font-mono text-sm text-emerald-400">{data.proj.projection_30d || 0}</p><p className="text-[8px] uppercase text-muted-foreground">30 dias</p></div>
            <div className="border border-border/40 p-1.5"><p className="font-mono text-sm text-amber-400">{data.proj.projection_90d || 0}</p><p className="text-[8px] uppercase text-muted-foreground">90 dias</p></div>
          </div>
        )}
        {data.proj && data.proj.growth_rate !== undefined && (
          <p className="text-[10px] text-muted-foreground">Crecimiento: <span className={data.proj.growth_rate > 0 ? "text-emerald-400" : "text-destructive"}>{data.proj.growth_rate}%</span> · AOV: ${data.proj.avg_order_value || 0}</p>
        )}
      </Section>

      {/* IMASD */}
      <Section title="Panel IMASD — ROI por decision" icon={TrendingUp}>
        <Btn id="imasd_roi" label="ROI por tipo de decision" endpoint="imasd/roi" />
        <Out id="imasd_roi" />
      </Section>

      {/* PRODUCTOS */}
      <Section title="Panel Productos — Auto-tag + Performance" icon={Boxes}>
        <div className="grid grid-cols-2 gap-2">
          <Btn id="auto_tag" label="Auto-etiquetar productos" endpoint="products/auto-tag" method="POST" />
          <Btn id="prod_perf" label="Score de performance" endpoint="products/performance" />
        </div>
        {data.prod_perf && (data.prod_perf.products || []).slice(0, 5).map((p, i) => (
          <div key={i} className="border border-border/40 px-2 py-1 flex justify-between text-[10px]">
            <span>{p.title}</span>
            <span className="font-mono">{p.score}/100 ({p.grade}) → {p.action}</span>
          </div>
        ))}
      </Section>

      {/* DESCUBRIR */}
      <Section title="Panel Descubrir — Guardar ganadores" icon={Search}>
        <Btn id="winners" label="Productos ganadores guardados" endpoint="discover/winners" />
        <Out id="winners" />
      </Section>

      {/* REDES */}
      <Section title="Panel Redes — Cola + Auto-programar" icon={Send}>
        <div className="grid grid-cols-2 gap-2">
          <Btn id="queue" label="Cola de publicacion" endpoint="social/queue" />
          <Btn id="auto_sched" label="Auto-programar posts" endpoint="social/auto-schedule" method="POST" />
        </div>
        <Out id="auto_sched" />
      </Section>

      {/* FINANZAS */}
      <Section title="Panel Finanzas — Cash flow real" icon={DollarSign}>
        <Btn id="cashflow" label="Analisis de cash flow" endpoint="finanzas/cashflow" />
        {data.cashflow && data.cashflow.net_profit !== undefined && (
          <div className="grid grid-cols-3 gap-1 text-center">
            <div className="border border-border/40 p-1.5"><p className="font-mono text-xs text-emerald-400">{data.cashflow.total_income}</p><p className="text-[8px] uppercase text-muted-foreground">Ingresos</p></div>
            <div className="border border-border/40 p-1.5"><p className="font-mono text-xs text-destructive">{data.cashflow.total_expenses}</p><p className="text-[8px] uppercase text-muted-foreground">Gastos</p></div>
            <div className="border border-border/40 p-1.5"><p className="font-mono text-xs text-primary">{data.cashflow.net_profit}</p><p className="text-[8px] uppercase text-muted-foreground">Beneficio</p></div>
          </div>
        )}
        {data.cashflow && data.cashflow.profit_margin !== undefined && (
          <p className="text-[10px] text-muted-foreground">Margen: {data.cashflow.profit_margin}% · Diario: ${data.cashflow.daily_profit}</p>
        )}
      </Section>

      {/* CLONACION */}
      <Section title="Panel Clonacion — Diff con competidor" icon={Eye}>
        <div className="flex gap-2">
          <input id="diff-url" placeholder="URL competidor" className="flex-1 border border-border px-2 py-1 text-xs" />
          <button onClick={() => {
            const url = document.getElementById("diff-url").value;
            if (url) call(`clone/diff?store_url=${encodeURIComponent(url)}`, "clone_diff");
          }} disabled={busy === "clone_diff"}
            className="px-3 py-1 bg-primary text-primary-foreground text-xs disabled:opacity-40">
            {busy === "clone_diff" ? <Loader2 size={12} className="animate-spin" /> : "Comparar"}
          </button>
        </div>
        {data.clone_diff && (data.clone_diff.recommendations || []).map((r, i) => (
          <div key={i} className="border border-amber-500/20 bg-amber-500/5 px-2 py-1 text-[10px]">
            <AlertTriangle size={9} className="inline mr-1 text-amber-400" /> {r}
          </div>
        ))}
      </Section>

      {/* ESTETICA */}
      <Section title="Panel Estetica — SEO score + Auto-fix" icon={Search}>
        <div className="grid grid-cols-2 gap-2">
          <Btn id="seo_scores" label="SEO score por producto" endpoint="seo/scores" />
          <Btn id="seo_fix" label="Auto-arreglar SEO" endpoint="seo/auto-fix" method="POST" />
        </div>
        {data.seo_scores && (
          <p className="text-[10px] text-muted-foreground">Promedio SEO: <span className={data.seo_scores.average_score >= 60 ? "text-emerald-400" : "text-amber-400"}>{data.seo_scores.average_score}/100</span> · {data.seo_scores.total} productos</p>
        )}
      </Section>

      {/* VENTAS */}
      <Section title="Panel Ventas — CLV + Metricas" icon={Users}>
        <Btn id="ventas_met" label="Metricas de ventas (CLV, AOV, repetición)" endpoint="ventas/metrics" />
        {data.ventas_met && (
          <div className="grid grid-cols-3 gap-1 text-center">
            <div className="border border-border/40 p-1.5"><p className="font-mono text-xs text-primary">{data.ventas_met.avg_clv}</p><p className="text-[8px] uppercase text-muted-foreground">CLV medio</p></div>
            <div className="border border-border/40 p-1.5"><p className="font-mono text-xs text-emerald-400">{data.ventas_met.repeat_rate}%</p><p className="text-[8px] uppercase text-muted-foreground">Repeticion</p></div>
            <div className="border border-border/40 p-1.5"><p className="font-mono text-xs text-amber-400">{data.ventas_met.recent_aov}</p><p className="text-[8px] uppercase text-muted-foreground">AOV reciente</p></div>
          </div>
        )}
      </Section>

      {/* EDITOR */}
      <Section title="Panel Editor — Generar descripcion con IA" icon={FileText}>
        <div className="flex gap-2">
          <input id="gen-title" placeholder="Titulo del producto" className="flex-1 border border-border px-2 py-1 text-xs" />
          <input id="gen-type" placeholder="Tipo" className="w-24 border border-border px-2 py-1 text-xs" />
          <button onClick={() => {
            const t = document.getElementById("gen-title").value;
            const ty = document.getElementById("gen-type").value;
            if (t) call(`editor/generate-description?product_title=${t}&product_type=${ty}&tone=profesional`, "gen_desc", "POST");
          }} disabled={busy === "gen_desc"}
            className="px-3 py-1 bg-primary text-primary-foreground text-xs disabled:opacity-40">
            {busy === "gen_desc" ? <Loader2 size={12} className="animate-spin" /> : "Generar"}
          </button>
        </div>
        {data.gen_desc && <p className="text-[10px] border border-border/40 p-2 max-h-32 overflow-y-auto">{data.gen_desc.description || data.gen_desc.error}</p>}
      </Section>

      {/* AUTOMATIZACION */}
      <Section title="Panel Automatizacion — Health check" icon={Shield}>
        <Btn id="auto_health" label="Health check del sistema" endpoint="automation/health" />
        {data.auto_health && (
          <div className="space-y-1">
            {Object.entries(data.auto_health.systems || {}).map(([k, v]) => (
              <div key={k} className="flex justify-between text-[10px]">
                <span>{k}</span>
                <span className={v.status === "ok" ? "text-emerald-400" : v.status === "warning" ? "text-amber-400" : "text-destructive"}>
                  {v.status === "ok" ? "✓" : v.status === "warning" ? "⚠" : "✗"} {v.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* WALLET */}
      <Section title="Panel Wallet — Alertas de saldo" icon={DollarSign}>
        <Btn id="wallet_alerts" label="Alertas de wallet" endpoint="wallet/alerts" />
        <Out id="wallet_alerts" />
      </Section>

      {/* CONECTORES */}
      <Section title="Panel Conectores — Auto-reconnect" icon={RefreshCw}>
        <Btn id="auto_reconnect" label="Auto-reconectar desde .env" endpoint="connectors/auto-reconnect" method="POST" />
        {data.auto_reconnect && (
          <div className="space-y-0.5 max-h-28 overflow-y-auto">
            {(data.auto_reconnect.results || []).map((c, i) => (
              <div key={i} className="flex justify-between text-[10px]">
                <span>{c.connector}</span>
                <span className={c.status === "connected" ? "text-emerald-400" : "text-muted-foreground"}>
                  {c.status === "connected" ? "✓" : "✗"} {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* CONFIGURAR */}
      <Section title="Panel Configurar — Backup/Export" icon={Download}>
        <Btn id="export" label="Exportar configuracion" endpoint="config/export" />
        <Out id="export" />
      </Section>
    </div>
  );
};
