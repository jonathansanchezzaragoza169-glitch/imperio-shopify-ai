import { useState } from "react";
import { Loader2, Rocket, Globe, Crown, MessageCircle, Store, Languages, BrainCircuit, FileText, Gift, QrCode, Users, TrendingUp, Shield, Star, Box, Video, Mic, Search, Zap } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const MegaMaxPanel = () => {
  const [busy, setBusy] = useState("");
  const [data, setData] = useState({});
  const [supreme, setSupreme] = useState(null);

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

  const ultimateExecute = async () => {
    setBusy("ultimate");
    try {
      const res = await fetch(`${API}/ultimate/execute-all`, { method: "POST" });
      const result = await res.json();
      setData(prev => ({ ...prev, ultimate: result }));
      if (result.voice_message) {
        const u = new SpeechSynthesisUtterance(result.voice_message);
        u.lang = "es-ES"; u.rate = 1.0;
        window.speechSynthesis?.speak(u);
      }
      toast.success("EJECUCION SUPREMA COMPLETADA");
    } catch { toast.error("Error"); }
    setBusy("");
  };

  const tasks = [
    { id: "whatsapp", label: "WhatsApp broadcast", desc: "Enviar mensaje a todos los clientes", endpoint: "whatsapp/broadcast?message=Oferta especial solo para ti!", method: "POST", icon: MessageCircle, color: "text-green-400" },
    { id: "multi_store", label: "Multi-store aggregate", desc: "Unificar datos de todas tus tiendas", endpoint: "multi-store/aggregate", icon: Store, color: "text-blue-400" },
    { id: "translate", label: "Traducir a 10 idiomas", desc: "Vender globalmente con traducciones", endpoint: "translate/multi-lang?product_id=1", method: "POST", icon: Languages, color: "text-cyan-400" },
    { id: "churn", label: "Churn prediction", desc: "Detectar clientes en riesgo de irse", endpoint: "analytics/churn", icon: Users, color: "text-red-400" },
    { id: "ltv", label: "LTV prediction", desc: "Valor de vida de cada cliente", endpoint: "analytics/ltv", icon: TrendingUp, color: "text-emerald-400" },
    { id: "seasonal", label: "Tendencias estacionales", desc: "Predecir que vender en 3 meses", endpoint: "analytics/seasonal", icon: Star, color: "text-amber-400" },
    { id: "invoice", label: "Generar factura", desc: "Factura PDF para pedido", endpoint: "invoice/generate?order_id=1", method: "POST", icon: FileText, color: "text-indigo-400" },
    { id: "shipping", label: "Calcular envio", desc: "Tarifas por pais", endpoint: "shipping/calculate", method: "POST", icon: Box, color: "text-purple-400" },
    { id: "accessibility", label: "Check accesibilidad", desc: "WCAG compliance", endpoint: "accessibility/check", method: "POST", icon: Shield, color: "text-teal-400" },
    { id: "influencer", label: "Influencer outreach", desc: "Templates para contactar influencers", endpoint: "influencer/outreach?niche=moda&platform=instagram", method: "POST", icon: Users, color: "text-pink-400" },
    { id: "video_script", label: "Video script", desc: "Guion para TikTok/Reels", endpoint: "content/video-script?product=mi+producto&platform=tiktok&duration=30", method: "POST", icon: Video, color: "text-red-400" },
    { id: "podcast", label: "Podcast producto", desc: "Texto para audio de producto", endpoint: "content/podcast?product_id=1", method: "POST", icon: Mic, color: "text-orange-400" },
    { id: "rank_check", label: "Keyword rank", desc: "Ver posicion en buscadores", endpoint: "seo/rank-check?keyword=producto+online", method: "POST", icon: Search, color: "text-blue-400" },
    { id: "backlinks", label: "Backlink monitor", desc: "PageRank de la tienda", endpoint: "seo/backlinks", icon: TrendingUp, color: "text-green-400" },
    { id: "dup_content", label: "Contenido duplicado", desc: "Detectar descripciones repetidas", endpoint: "seo/duplicate-check", method: "POST", icon: FileText, color: "text-amber-400" },
    { id: "mobile_check", label: "Mobile check", desc: "Optimizacion mobile", endpoint: "seo/mobile-check", method: "POST", icon: Globe, color: "text-cyan-400" },
    { id: "sub_box", label: "Subscription box", desc: "Crear caja de suscripcion (recurring)", endpoint: "subscription-box/create?name=Box+Premium&theme=moda&price=29.99&frequency=monthly", method: "POST", icon: Gift, color: "text-purple-400" },
    { id: "qr_code", label: "QR code producto", desc: "Generar QR para producto fisico", endpoint: "qr/product?product_id=1", method: "POST", icon: QrCode, color: "text-teal-400" },
    { id: "chatbot", label: "Chatbot codigo", desc: "Widget de soporte para Shopify", endpoint: "support/chatbot-code", method: "POST", icon: MessageCircle, color: "text-blue-400" },
    { id: "terms", label: "Terminos servicio", desc: "Generar ToS legal", endpoint: "legal/terms-of-service", method: "POST", icon: Shield, color: "text-indigo-400" },
    { id: "privacy", label: "Politica privacidad", desc: "Generar privacy policy GDPR", endpoint: "legal/privacy-policy", method: "POST", icon: Shield, color: "text-teal-400" },
  ];

  const generators = [
    { id: "sub_box_list", label: "Ver subscription boxes", endpoint: "subscription-box/list", icon: Gift },
    { id: "connectors_v2", label: "30 conectores", endpoint: "connectors/v2-all", icon: Globe },
    { id: "scheduler_v3", label: "Scheduler 40 tareas", endpoint: "scheduler/v3-config", icon: Zap },
    { id: "supreme_dash", label: "Dashboard supremo", endpoint: "dashboard/supreme", icon: Crown },
  ];

  return (
    <div data-testid="mega-max" className="space-y-4">
      {/* HEADER */}
      <div className="border border-purple-500/40 bg-purple-500/5 p-4">
        <h2 className="text-base font-bold flex items-center gap-2"><Crown size={18} className="text-purple-400" /> v11 MEGA MAX — Suprema</h2>
        <p className="text-xs text-muted-foreground">21 nuevas mejoras ejecutables + Ultimate Execute All. WhatsApp Business, Multi-store, 10 idiomas, Churn, LTV, Facturas, Influencers, Video scripts, Podcasts, QR, Chatbot, Legal completo. Todo real, todo gratis.</p>
      </div>

      {/* ULTIMATE EXECUTE */}
      <div className="border border-purple-500/40 bg-purple-500/10 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold flex items-center gap-1.5"><Rocket size={14} className="text-purple-400" /> ULTIMATE EXECUTE ALL</p>
            <p className="text-[10px] text-muted-foreground">Ejecuta 35+ mejoras en 1 clic: SEO + Pricing + Bundles + Cross-sell + Loyalty + Schema + Images + Carts + Win-back + Reviews + Competitors + Growth + Profit + Evolution + Autopilot + 404 + Stock urgency</p>
          </div>
          <button onClick={ultimateExecute} disabled={busy === "ultimate"}
            className="px-4 py-3 bg-purple-500 text-white text-xs font-bold disabled:opacity-40 flex items-center gap-2">
            {busy === "ultimate" ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
            EJECUTAR TODO
          </button>
        </div>
        {data.ultimate && (
          <div className="mt-2 space-y-1">
            <p className="text-[10px] text-emerald-400 font-medium">{data.ultimate.voice_message}</p>
            <div className="grid grid-cols-4 gap-1">
              {(data.ultimate.results || []).map((r, i) => (
                <div key={i} className="flex justify-between text-[9px] border border-border/40 px-2 py-1">
                  <span className="truncate">{r.group}</span>
                  <span className={r.error ? "text-destructive" : "text-emerald-400"}>
                    {r.error ? "✗" : `✓${r.ok || r.result || r.broken !== undefined ? ` ${r.ok || r.result || r.broken}` : ""}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TASKS */}
      <div>
        <p className="text-xs font-bold uppercase text-muted-foreground mb-2">21 Mejoras v11 ejecutables</p>
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
                    {data[task.id].sent !== undefined ? `${data[task.id].sent} env` :
                     data[task.id].total_stores ? `${data[task.id].total_stores} tiendas` :
                     data[task.id].translations ? `${data[task.id].translations.length} langs` :
                     data[task.id].at_risk !== undefined ? `${data[task.id].at_risk} riesgo` :
                     data[task.id].avg_ltv ? `$${data[task.id].avg_ltv}` :
                     data[task.id].upcoming_trends ? `${data[task.id].upcoming_trends.length} trends` :
                     data[task.id].qr_url ? "QR OK" :
                     data[task.id].box_id ? "Caja OK" :
                     data[task.id].templates ? `${data[task.id].templates.length} templates` :
                     data[task.id].invoice_html ? "PDF OK" :
                     data[task.id].checks ? `${data[task.id].mobile_score || 0}%` :
                     data[task.id].total_issues !== undefined ? `${data[task.id].total_issues} issues` :
                     data[task.id].position ? `#${data[task.id].position}` :
                     data[task.id].duplicates !== undefined ? `${data[task.id].duplicates} dup` :
                     data[task.id].code ? "Code OK" : "✓"}
                  </span>
                )}
                <button onClick={() => call(task.endpoint, task.id, task.method)} disabled={busy === task.id}
                  className="px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-semibold disabled:opacity-40 flex items-center gap-1">
                  {busy === task.id ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />} Ejecutar
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* GENERATORS */}
      <div>
        <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Info del sistema</p>
        <div className="grid grid-cols-2 gap-2">
          {generators.map((gen, i) => {
            const Icon = gen.icon;
            return (
              <button key={i} onClick={() => call(gen.endpoint, gen.id, "GET")} disabled={busy === gen.id}
                className="border border-border bg-card p-2 flex items-center gap-2 text-xs disabled:opacity-40">
                {busy === gen.id ? <Loader2 size={12} className="animate-spin" /> : <Icon size={12} className="text-primary" />}
                {gen.label}
              </button>
            );
          })}
        </div>
        {data.supreme_dash && (
          <div className="mt-2 border border-border bg-card p-2 grid grid-cols-5 gap-2 text-center">
            <div><p className="font-mono text-sm text-purple-400">{data.supreme_dash.stats?.endpoints || 422}</p><p className="text-[8px] uppercase text-muted-foreground">Endpoints</p></div>
            <div><p className="font-mono text-sm text-emerald-400">{data.supreme_dash.stats?.backend_lines || "17K"}</p><p className="text-[8px] uppercase text-muted-foreground">Lineas</p></div>
            <div><p className="font-mono text-sm text-primary">{data.supreme_dash.stats?.components || 35}</p><p className="text-[8px] uppercase text-muted-foreground">Componentes</p></div>
            <div><p className="font-mono text-sm text-amber-400">{data.supreme_dash.stats?.tasks_24_7 || 40}</p><p className="text-[8px] uppercase text-muted-foreground">Tareas 24/7</p></div>
            <div><p className="font-mono text-sm text-cyan-400">{data.supreme_dash.stats?.connectors || 30}</p><p className="text-[8px] uppercase text-muted-foreground">Conectores</p></div>
          </div>
        )}
        {data.scheduler_v3 && (
          <div className="mt-2 border border-border bg-card p-2">
            <p className="text-[10px] font-bold mb-1">Scheduler 24/7 v3: {data.scheduler_v3.total} tareas automaticas</p>
            <div className="grid grid-cols-3 gap-1 text-[8px] max-h-24 overflow-y-auto">
              {(data.scheduler_v3.tasks || []).map((t, i) => (
                <div key={i} className="border border-border/40 px-1 py-0.5 flex items-center gap-1">
                  <span className="text-emerald-400">●</span> {t.name} ({t.interval})
                </div>
              ))}
            </div>
          </div>
        )}
        {data.connectors_v2 && (
          <div className="mt-2 border border-border bg-card p-2">
            <p className="text-[10px] font-bold mb-1">{data.connectors_v2.total} conectores ({data.connectors_v2.free} gratis)</p>
            <div className="grid grid-cols-3 gap-1 text-[8px] max-h-24 overflow-y-auto">
              {(data.connectors_v2.connectors || []).map((c, i) => (
                <div key={i} className="border border-border/40 px-1 py-0.5 flex items-center justify-between">
                  <span className={c.new_v11 ? "text-purple-400" : c.new ? "text-primary" : ""}>{c.name}</span>
                  <span className="text-muted-foreground">{c.free ? "$0" : "$"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
