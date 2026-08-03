import { useState } from "react";
import { Loader2, Zap, Rocket, Clock, Tag, Users, Image, Search, FileText, Gift, Star, TrendingUp, AlertTriangle, Settings } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AutoMejorasPanel = () => {
  const [busy, setBusy] = useState("");
  const [data, setData] = useState({});
  const [runningAll, setRunningAll] = useState(false);

  const call = async (endpoint, key, method = "POST") => {
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

  const executeAll = async () => {
    setRunningAll(true);
    await call("auto/execute-all", "execute_all", "POST");
    setRunningAll(false);
  };

  const tasks = [
    { id: "seo_desc", label: "Generar descripciones SEO", desc: "IA escribe descripciones optimizadas para productos sin texto", endpoint: "auto/seo-descriptions", icon: FileText, color: "text-blue-400" },
    { id: "dyn_price", label: "Pricing dinamico AI", desc: "Sube/baja precios segun stock y ventas reales", endpoint: "pricing/dynamic", icon: TrendingUp, color: "text-emerald-400" },
    { id: "stock_urg", label: "Badge stock urgente", desc: "Anade 'solo X restantes' a productos con poco stock", endpoint: "auto/stock-urgency", icon: AlertTriangle, color: "text-red-400" },
    { id: "bundles", label: "Bundles AI", desc: "Crea packs con 10% descuento de productos comprados juntos", endpoint: "bundles/auto-create", icon: Gift, color: "text-purple-400" },
    { id: "cross_sell", label: "Cross-sell auto", desc: "Recomienda productos complementarios", endpoint: "auto/cross-sell", icon: Tag, color: "text-amber-400" },
    { id: "loyalty", label: "Puntos lealtad", desc: "Asigna puntos por compras: bronce/plata/oro/diamante", endpoint: "auto/loyalty", icon: Star, color: "text-yellow-400" },
    { id: "schema", label: "Schema markup SEO", desc: "Genera JSON-LD para rich snippets en Google", endpoint: "auto/schema-markup", icon: Search, color: "text-cyan-400" },
    { id: "img_opt", label: "Optimizar imagenes", desc: "Convierte imagenes a WebP (mas rapido, gratis)", endpoint: "auto/optimize-images", icon: Image, color: "text-pink-400" },
    { id: "sitemap", label: "Generar sitemap XML", desc: "Crea sitemap para Google Search Console", endpoint: "auto/sitemap", icon: FileText, color: "text-indigo-400" },
    { id: "cart_recov", label: "Recuperar carritos", desc: "Emails automaticos a carritos abandonados", endpoint: "email/auto-recover-all", icon: Clock, color: "text-orange-400" },
    { id: "winback", label: "Win-back clientes", desc: "Email +20% descuento a clientes inactivos 30+ dias", endpoint: "auto/winback", icon: Users, color: "text-teal-400" },
    { id: "reviews", label: "Solicitar resenas", desc: "Email a clientes 10 dias post-compra pidiendo review", endpoint: "auto/review-requests", icon: Star, color: "text-yellow-400" },
    { id: "comp_match", label: "Match precios competencia", desc: "Iguala precios 2% por debajo de competidores", endpoint: "auto/competitor-price-match", icon: TrendingUp, color: "text-green-400" },
    { id: "social_proof", label: "Social proof live", desc: "Notificaciones reales de compras recientes", endpoint: "auto/social-proof", icon: Users, color: "text-blue-400" },
    { id: "check_404", label: "Check 404 errors", desc: "Detecta URLs rotas de productos", endpoint: "auto/check-404", icon: AlertTriangle, color: "text-red-400" },
  ];

  const generators = [
    { id: "faq", label: "FAQ automatico", endpoint: "auto/faq", icon: FileText, color: "text-blue-400" },
    { id: "gift_card", label: "Gift cards ($25)", endpoint: "auto/gift-cards", icon: Gift, color: "text-purple-400" },
    { id: "countdown", label: "Countdown timer", endpoint: "auto/countdown", icon: Clock, color: "text-red-400" },
    { id: "exit_popup", label: "Exit intent popup", endpoint: "auto/exit-popup", icon: AlertTriangle, color: "text-orange-400" },
    { id: "return_pol", label: "Politica devoluciones", endpoint: "auto/return-policy", icon: FileText, color: "text-teal-400" },
    { id: "cookie", label: "Banner cookies GDPR", endpoint: "auto/cookie-banner", icon: Settings, color: "text-indigo-400" },
    { id: "currency", label: "Multi-moneda", endpoint: "auto/currency-display", icon: TrendingUp, color: "text-emerald-400" },
  ];

  return (
    <div data-testid="auto-mejoras" className="space-y-4">
      {/* HEADER */}
      <div className="border border-primary/40 bg-primary/5 p-4">
        <h2 className="text-base font-bold flex items-center gap-2"><Rocket size={18} className="text-primary" /> Auto-Mejoras Ejecutables</h2>
        <p className="text-xs text-muted-foreground">15 mejoras + 7 generadores. Todas ejecutables con 1 clic o automaticas 24/7. Todo real, todo gratis.</p>
      </div>

      {/* EXECUTE ALL */}
      <div className="border border-purple-500/40 bg-purple-500/5 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold flex items-center gap-1.5"><Zap size={14} className="text-purple-400" /> Ejecutar TODAS las mejoras</p>
            <p className="text-[10px] text-muted-foreground">SEO + Pricing + Bundles + Cross-sell + Loyalty + Schema + Images + Sitemap + Carts + Win-back + Reviews + Profit + Evolution + Autopilot</p>
          </div>
          <button onClick={executeAll} disabled={runningAll || busy === "execute_all"}
            className="px-4 py-3 bg-purple-500 text-white text-xs font-bold disabled:opacity-40 flex items-center gap-2">
            {busy === "execute_all" ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
            EJECUTAR TODO
          </button>
        </div>
        {data.execute_all && (
          <div className="mt-2 space-y-1">
            <p className="text-[10px] text-emerald-400 font-medium">{data.execute_all.voice_message}</p>
            <div className="grid grid-cols-3 gap-1">
              {(data.execute_all.results || []).map((r, i) => (
                <div key={i} className="flex justify-between text-[9px] border border-border/40 px-2 py-1">
                  <span className="truncate">{r.task}</span>
                  <span className={r.status === "ok" ? "text-emerald-400" : "text-destructive"}>
                    {r.status === "ok" ? `✓${r.result !== undefined ? ` ${r.result}` : ""}` : "✗"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MEJORAS EJECUTABLES */}
      <div>
        <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Mejoras ejecutables (1 clic)</p>
        <div className="grid grid-cols-1 gap-2">
          {tasks.map((task, i) => {
            const Icon = task.icon;
            return (
              <div key={i} className="border border-border bg-card p-2 flex items-center gap-3">
                <Icon size={16} className={task.color} />
                <div className="flex-1">
                  <p className="text-xs font-medium">{task.label}</p>
                  <p className="text-[10px] text-muted-foreground">{task.desc}</p>
                </div>
                {data[task.id] && (
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {data[task.id].generated || data[task.id].updated || data[task.id].badged || data[task.id].total || data[task.id].matched || data[task.id].optimized || data[task.id].schemas || data[task.id].sent || data[task.id].pairs || data[task.id].assigned || data[task.id].checked || data[task.id].broken_count !== undefined ? `${data[task.id].broken_count} rotas` : ""}
                  </span>
                )}
                <button onClick={() => call(task.endpoint, task.id, "POST")} disabled={busy === task.id}
                  className="px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-semibold disabled:opacity-40 flex items-center gap-1">
                  {busy === task.id ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />} Ejecutar
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* GENERADORES */}
      <div>
        <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Generadores de codigo</p>
        <div className="grid grid-cols-2 gap-2">
          {generators.map((gen, i) => {
            const Icon = gen.icon;
            return (
              <div key={i} className="border border-border bg-card p-2 flex items-center gap-2">
                <Icon size={14} className={gen.color} />
                <p className="text-xs flex-1">{gen.label}</p>
                <button onClick={() => call(gen.endpoint, gen.id, "POST")} disabled={busy === gen.id}
                  className="px-2 py-1 bg-primary text-primary-foreground text-[9px] font-semibold disabled:opacity-40">
                  {busy === gen.id ? <Loader2 size={8} className="animate-spin" /> : "Gen"}
                </button>
              </div>
            );
          })}
        </div>
        {data.faq && (data.faq.faqs || []).length > 0 && (
          <div className="mt-2 border border-border/40 p-2 space-y-1">
            <p className="text-[10px] font-bold">FAQ generado para: {data.faq.product}</p>
            {(data.faq.faqs || []).map((f, i) => (
              <div key={i} className="text-[10px]">
                <p className="font-medium">Q: {f.q}</p>
                <p className="text-muted-foreground">A: {f.a}</p>
              </div>
            ))}
          </div>
        )}
        {data.gift_card && (data.gift_card.cards || []).length > 0 && (
          <div className="mt-2 border border-border/40 p-2">
            <p className="text-[10px] font-bold">Gift cards creadas: {data.gift_card.created}</p>
            {(data.gift_card.cards || []).map((c, i) => (
              <p key={i} className="text-[10px] font-mono text-primary">{c.code} - ${c.value}</p>
            ))}
          </div>
        )}
        {data.social_proof && (data.social_proof.notifications || []).length > 0 && (
          <div className="mt-2 border border-border/40 p-2 space-y-1">
            <p className="text-[10px] font-bold">Social proof en vivo:</p>
            {(data.social_proof.notifications || []).map((n, i) => (
              <p key={i} className="text-[10px] text-emerald-400">✓ {n.text} ({n.time})</p>
            ))}
          </div>
        )}
      </div>

      {/* SCHEDULER V2 */}
      <div className="border border-border bg-card p-3">
        <p className="text-xs font-bold mb-2 flex items-center gap-1.5"><Clock size={12} className="text-primary" /> Scheduler 24/7 v2 (31 tareas automaticas)</p>
        <div className="grid grid-cols-2 gap-1 text-[9px] max-h-32 overflow-y-auto">
          {["Descubrir productos 6h", "Publicar redes 4h", "Recuperar carritos 1h", "Check inventario 2h", "Analizar competidores 12h", "Generar estrategia 6h", "Ejecutar tareas 30min", "Informe diario 24h", "Atencion cliente 15min", "Procesar pedidos 10min", "Auto-restock 3h", "Auto-pricing 6h", "Follow-up compra 2h", "Solicitar resenas 8h", "Auto-mantenimiento 1h", "Monitor tendencias 6h", "Informe semanal 7d", "SEO descriptions 12h", "Pricing dinamico 6h", "Stock urgency 2h", "Auto bundles 12h", "Cross-sell 12h", "Loyalty points 24h", "Image optimize 12h", "Win-back emails 24h", "Review requests 8h", "Schema markup 12h", "Sitemap gen 12h", "Auto execute ALL 6h", "Competitor match 12h"].map((s, i) => (
            <div key={i} className="border border-border/40 px-2 py-1 flex items-center gap-1">
              <span className="text-emerald-400">●</span> {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
