import { useState } from "react";
import { Loader2, Zap, Crown, TrendingUp, DollarSign, Package, Globe, Users, Brain, Rocket, Search, ShoppingCart, Gift, Star, Target } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const MasterPanel = () => {
  const [busy, setBusy] = useState("");
  const [data, setData] = useState({});

  const call = async (endpoint, key, method = "GET") => {
    setBusy(key);
    try {
      const res = await fetch(`${API}/${endpoint}`, { method });
      if (res.ok) {
        const result = await res.json();
        setData(prev => ({ ...prev, [key]: result }));
        if (result.voice_message) {
          const u = new SpeechSynthesisUtterance(result.voice_message);
          u.lang = "es-ES"; u.rate = 1.0;
          window.speechSynthesis?.speak(u);
        }
        toast.success(`${key} OK`);
      } else toast.error("Error");
    } catch { toast.error("Error"); }
    setBusy("");
  };

  const masterExecute = async () => {
    setBusy("master_all");
    try {
      const res = await fetch(`${API}/master/execute-all`, { method: "POST" });
      const result = await res.json();
      setData(prev => ({ ...prev, master_all: result }));
      if (result.voice_message) {
        const u = new SpeechSynthesisUtterance(result.voice_message);
        u.lang = "es-ES"; u.rate = 1.0;
        window.speechSynthesis?.speak(u);
      }
      toast.success("MASTER PUSH COMPLETADO");
    } catch { toast.error("Error"); }
    setBusy("");
  };

  const groups = [
    {
      title: "💰 Profit & Revenue", icon: DollarSign, color: "text-emerald-400",
      tasks: [
        { id: "profit_v3", label: "Profit Maximizer v3", desc: "10 optimizaciones de profit de golpe", endpoint: "master/profit-max-v3", method: "POST" },
        { id: "rev_opt", label: "Revenue Optimization", desc: "Detectar y arreglar fugas de revenue", endpoint: "master/revenue-optimize", method: "POST" },
        { id: "cost_red", label: "Cost Reduction Engine", desc: "Encontrar ahorros automaticos", endpoint: "master/cost-reduce", method: "POST" },
        { id: "bi_dash", label: "BI Dashboard", desc: "Business Intelligence en vivo", endpoint: "master/bi-dashboard" },
      ]
    },
    {
      title: "📊 Analytics & Intelligence", icon: Brain, color: "text-blue-400",
      tasks: [
        { id: "seo_audit", label: "SEO Audit completo", desc: "Score 0-100 con issues detallados", endpoint: "master/seo-audit", method: "POST" },
        { id: "prod_score", label: "Product Score AI", desc: "Scorear producto 0-100 (vender/evitar)", endpoint: "master/product-score?product_title=test&price=30&category=moda", method: "POST" },
        { id: "journey", label: "Customer Journey", desc: "Mapear: first→repeat→frequent→VIP", endpoint: "master/customer-journey" },
        { id: "recos", label: "Recommendations ML", desc: "Productos recomendados con confianza", endpoint: "master/recommendations" },
        { id: "trend_jump", label: "Trend Jump", desc: "Saltar sobre tendencias virales HOY", endpoint: "master/trend-jump", method: "POST" },
      ]
    },
    {
      title: "📦 Operations & Inventory", icon: Package, color: "text-orange-400",
      tasks: [
        { id: "inv_opt", label: "Inventory Optimization", desc: "Reducir overstock + reordenar", endpoint: "master/inventory-optimize", method: "POST" },
        { id: "pricing_exp", label: "Pricing Experiments A/B", desc: "Testear precios +5% vs control", endpoint: "master/pricing-experiment", method: "POST" },
        { id: "comp_scrape", label: "Competitor Scraping", desc: "Scrapear precios de competencia", endpoint: "master/competitor-scrape?url=https://example.com", method: "POST" },
      ]
    },
    {
      title: "🚀 Growth & Expansion", icon: Rocket, color: "text-purple-400",
      tasks: [
        { id: "growth_hack", label: "Growth Hacking", desc: "8 experimentos growth gratis", endpoint: "master/growth-hack", method: "POST" },
        { id: "market_exp", label: "Market Expansion", desc: "8 paises para expandir", endpoint: "master/market-expand" },
        { id: "cart_opt", label: "Cart Optimization", desc: "Codigo para subir AOV", endpoint: "master/cart-optimize", method: "POST" },
        { id: "checkout_opt", label: "Checkout Optimization", desc: "7 fixes para -35% abandono", endpoint: "master/checkout-optimize", method: "POST" },
        { id: "referral", label: "Referral Program", desc: "Widget completo dar+recibir", endpoint: "master/referral-program?reward=10%25", method: "POST" },
        { id: "loyalty_v2", label: "Loyalty v2 (5 tiers)", desc: "Bronce→Plata→Oro→Diamante→Leyenda", endpoint: "master/loyalty-v2", method: "POST" },
      ]
    },
  ];

  return (
    <div data-testid="master-panel" className="space-y-4">
      {/* HEADER */}
      <div className="border border-purple-500/40 bg-purple-500/5 p-4">
        <h2 className="text-base font-bold flex items-center gap-2"><Crown size={18} className="text-purple-400" /> v13 MASTER PUSH — Máxima Autonomía + Profit</h2>
        <p className="text-xs text-muted-foreground">20 nuevas mejoras ejecutables. Profit maximizer v3, revenue optimization, cost reduction, growth hacking, BI dashboard, trend jumping, market expansion. Todo automático, real, lucrativo.</p>
      </div>

      {/* MASTER EXECUTE */}
      <div className="border border-purple-500/40 bg-purple-500/10 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold flex items-center gap-1.5"><Crown size={14} className="text-purple-400" /> MASTER EXECUTE ALL</p>
            <p className="text-[10px] text-muted-foreground">Ejecuta 13 sistemas de golpe: Profit v3 + SEO audit + Revenue + Cost + Inventory + BI + Journey + Loyalty + Recos + Trends + Growth + Markets + Ultimate v12</p>
          </div>
          <button onClick={masterExecute} disabled={busy === "master_all"}
            className="px-4 py-3 bg-purple-500 text-white text-xs font-bold disabled:opacity-40 flex items-center gap-2">
            {busy === "master_all" ? <Loader2 size={16} className="animate-spin" /> : <Crown size={16} />}
            MASTER
          </button>
        </div>
        {data.master_all && (
          <div className="mt-2 space-y-1">
            <p className="text-[10px] text-emerald-400 font-medium">{data.master_all.voice_message}</p>
            <div className="grid grid-cols-4 gap-1">
              {(data.master_all.results || []).map((r, i) => (
                <div key={i} className="flex justify-between text-[9px] border border-border/40 px-2 py-1">
                  <span className="truncate">{r.group}</span>
                  <span className={r.error ? "text-destructive" : "text-emerald-400"}>
                    {r.error ? "✗" : `✓ ${r.ok || r.score || r.leaks || r.savings || r.recommendations || r.kpis || r.total || r.found || r.experiments || r.markets || ""}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RESULTS DISPLAY */}
      {data.profit_v3 && (
        <div className="border border-emerald-500/20 bg-emerald-500/5 p-2">
          <p className="text-[10px] text-emerald-400">{data.profit_v3.voice_message}</p>
          <p className="text-lg font-mono text-emerald-400">+${data.profit_v3.estimated_extra_monthly}/mes</p>
        </div>
      )}
      {data.seo_audit && (
        <div className="border border-border bg-card p-2">
          <p className="text-xs font-bold">SEO Score: <span className={data.seo_audit.score > 70 ? "text-emerald-400" : "text-amber-400"}>{data.seo_audit.score}/100 (Grade {data.seo_audit.grade})</span></p>
          <p className="text-[10px] text-muted-foreground">{data.seo_audit.critical} criticos · {data.seo_audit.warnings} warnings · {data.seo_audit.info} info</p>
        </div>
      )}
      {data.cost_red && (
        <div className="border border-border bg-card p-2">
          <p className="text-xs font-bold">Ahorro mensual: <span className="text-emerald-400">${data.cost_red.total_monthly_savings}/mes</span></p>
          <p className="text-[10px] text-muted-foreground">Anual: ${data.cost_red.yearly_savings}</p>
          {(data.cost_red.savings || []).map((s, i) => (
            <p key={i} className="text-[10px] border border-border/40 px-2 py-0.5 mt-1">{s.area}: ${s.current} → ahorrar ${s.save}</p>
          ))}
        </div>
      )}
      {data.rev_opt && (
        <div className="border border-border bg-card p-2">
          <p className="text-[10px] text-emerald-400">{data.rev_opt.message}</p>
          {(data.rev_opt.leaks || []).map((l, i) => (
            <p key={i} className="text-[10px] border border-border/40 px-2 py-0.5 mt-1">{l.type}: ${l.value} ({l.fix})</p>
          ))}
        </div>
      )}
      {data.growth_hack && (
        <div className="border border-border bg-card p-2 space-y-1">
          <p className="text-xs font-bold text-purple-400">{data.growth_hack.experiments} experimentos · {data.growth_hack.total_expected_lift}</p>
          {(data.growth_hack.list || []).map((e, i) => (
            <div key={i} className="text-[10px] border border-border/40 px-2 py-1">
              <p className="font-medium">{e.name} → {e.expected_lift}</p>
              <p className="text-muted-foreground">{e.hypothesis}</p>
            </div>
          ))}
        </div>
      )}
      {data.market_exp && (
        <div className="border border-border bg-card p-2">
          <p className="text-xs font-bold">{data.market_exp.total_markets} mercados · {data.market_exp.action_now}</p>
          {(data.market_exp.markets || []).slice(0, 5).map((m, i) => (
            <p key={i} className="text-[10px] border border-border/40 px-2 py-0.5 mt-1">
              <span className="font-medium">{m.country}</span> ({m.potential}) - {m.reason} → {m.action}
            </p>
          ))}
        </div>
      )}
      {data.trend_jump && (
        <div className="border border-border bg-card p-2">
          <p className="text-xs font-bold text-amber-400">{data.trend_jump.trends_found} tendencias detectadas · {data.trend_jump.speed}</p>
          {(data.trend_jump.trends || []).slice(0, 5).map((t, i) => (
            <p key={i} className="text-[10px] border border-border/40 px-2 py-0.5 mt-1">{t.source}: {t.title || "OK"} (score: {t.score || t.reactions || "N/A"})</p>
          ))}
        </div>
      )}
      {data.loyalty_v2 && (
        <div className="border border-border bg-card p-2">
          <p className="text-xs font-bold">Loyalty: {data.loyalty_v2.total_customers} clientes</p>
          {Object.entries(data.loyalty_v2.tier_distribution || {}).map(([tier, count]) => (
            <p key={tier} className="text-[10px] inline-block px-2 py-0.5 m-1 border border-border/40">
              {tier}: {count}
            </p>
          ))}
        </div>
      )}
      {data.recos && (
        <div className="border border-border bg-card p-2 space-y-1">
          <p className="text-xs font-bold">{data.recos.total} recomendaciones ML</p>
          {(data.recos.recommendations || []).slice(0, 5).map((r, i) => (
            <p key={i} className="text-[10px] border border-border/40 px-2 py-0.5">
              Si compra <b>{r.if_buys}</b> → recomendar <b>{r.recommend}</b> ({r.confidence}% confianza)
            </p>
          ))}
        </div>
      )}
      {data.journey && (
        <div className="border border-border bg-card p-2">
          <p className="text-xs font-bold">{data.journey.total_customers} clientes mapeados</p>
          {Object.entries(data.journey.funnel_pct || {}).map(([stage, pct]) => (
            <p key={stage} className="text-[10px] border border-border/40 px-2 py-0.5 mt-1">
              {stage}: {pct}% ({data.journey.stages[stage]})
            </p>
          ))}
          <p className="text-[10px] text-muted-foreground mt-1">{data.journey.recommendation}</p>
        </div>
      )}

      {/* GROUPS */}
      {groups.map((group, gi) => {
        const GIcon = group.icon;
        return (
          <div key={gi} className="border border-border bg-card p-3">
            <p className="text-xs font-bold mb-2 flex items-center gap-1.5"><GIcon size={12} className={group.color} /> {group.title}</p>
            <div className="space-y-1">
              {group.tasks.map((task, ti) => (
                <div key={ti} className="flex items-center gap-3 border border-border/40 p-2">
                  <div className="flex-1">
                    <p className="text-xs font-medium">{task.label}</p>
                    <p className="text-[10px] text-muted-foreground">{task.desc}</p>
                  </div>
                  <button onClick={() => call(task.endpoint, task.id, task.method)} disabled={busy === task.id}
                    className="px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-semibold disabled:opacity-40 flex items-center gap-1">
                    {busy === task.id ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />} Ejecutar
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* SCHEDULER v4 */}
      <button onClick={() => call("scheduler/v4-config", "sched_v4")}
        className="w-full py-2 border border-border bg-card text-xs font-semibold flex items-center justify-center gap-2">
        <Zap size={12} /> Ver Scheduler v4 (60 tareas 24/7)
      </button>
      {data.sched_v4 && (
        <div className="border border-border bg-card p-2">
          <p className="text-xs font-bold mb-1">Scheduler v4: {data.sched_v4.total} tareas · {data.sched_v4.version}</p>
          <div className="grid grid-cols-3 gap-1 text-[8px] max-h-32 overflow-y-auto">
            {(data.sched_v4.tasks || []).map((t, i) => (
              <div key={i} className="border border-border/40 px-1 py-0.5 flex items-center gap-1">
                <span className="text-emerald-400">●</span> {t.name} ({t.interval})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MASTER STATS */}
      <button onClick={() => call("stats/master", "master_stats")}
        className="w-full py-3 bg-purple-500 text-white text-sm font-bold flex items-center justify-center gap-2">
        <Crown size={14} /> VER STATS MASTER
      </button>
      {data.master_stats && (
        <div className="border border-purple-500/40 bg-purple-500/5 p-3">
          <p className="text-xs font-bold text-purple-400">{data.master_stats.version}</p>
          <div className="grid grid-cols-7 gap-2 text-center mt-2">
            <div><p className="font-mono text-sm text-purple-400">{data.master_stats.endpoints}</p><p className="text-[7px] uppercase text-muted-foreground">Endpoints</p></div>
            <div><p className="font-mono text-sm text-emerald-400">{data.master_stats.backend_lines}</p><p className="text-[7px] uppercase text-muted-foreground">Lineas</p></div>
            <div><p className="font-mono text-sm text-primary">{data.master_stats.components}</p><p className="text-[7px] uppercase text-muted-foreground">Componentes</p></div>
            <div><p className="font-mono text-sm text-amber-400">{data.master_stats.tabs}</p><p className="text-[7px] uppercase text-muted-foreground">Tabs</p></div>
            <div><p className="font-mono text-sm text-cyan-400">{data.master_stats.tasks_24_7}</p><p className="text-[7px] uppercase text-muted-foreground">Tareas</p></div>
            <div><p className="font-mono text-sm text-pink-400">{data.master_stats.connectors}</p><p className="text-[7px] uppercase text-muted-foreground">Conectores</p></div>
            <div><p className="font-mono text-sm text-orange-400">{data.master_stats.files}</p><p className="text-[7px] uppercase text-muted-foreground">Archivos</p></div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {(data.master_stats.new_v13_features || []).map((f, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded text-[8px]">{f}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
