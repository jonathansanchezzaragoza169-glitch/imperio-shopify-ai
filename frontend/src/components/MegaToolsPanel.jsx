import { useState, useEffect, useCallback } from "react";
import { Loader2, FlaskConical, Languages, Star, Eye, Mail, Boxes, Users, Gift, ShieldAlert, DollarSign, Bell, TrendingUp, FileText, Truck, Search, Zap, Rocket, Activity } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const MegaToolsPanel = () => {
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
        toast.success(`${key} ejecutado`);
      } else toast.error("Error en " + key);
    } catch { toast.error("Error"); }
    setBusy("");
  };

  const ToolCard = ({ id, icon: Icon, title, desc, endpoint, method, body, color = "primary" }) => (
    <div data-testid={`mega-${id}`} className="border border-border bg-card p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-primary" />
        <p className="text-xs font-bold">{title}</p>
      </div>
      <p className="text-[10px] text-muted-foreground leading-tight">{desc}</p>
      <button onClick={() => call(endpoint, id, method, body)} disabled={busy === id}
        className="w-full px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-semibold disabled:opacity-40 flex items-center justify-center gap-1">
        {busy === id ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />} Ejecutar
      </button>
      {data[id] && (
        <div className="border border-border/40 p-2 mt-1 max-h-32 overflow-y-auto">
          <pre className="font-mono text-[9px] text-muted-foreground whitespace-pre-wrap">
            {JSON.stringify(data[id], null, 1).slice(0, 500)}
          </pre>
        </div>
      )}
    </div>
  );

  return (
    <div data-testid="mega-tools-panel" className="space-y-4">
      <div className="border border-primary/40 bg-primary/5 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Rocket size={18} className="text-primary" />
          <h2 className="text-sm font-bold">Mega Tools — 30 mejoras ejecutables</h2>
        </div>
        <p className="text-[11px] text-muted-foreground">30 herramientas autónomas reales. Cada una ejecuta una acción real en tu tienda, APIs externas, o base de datos.</p>
      </div>

      {/* OPTIMIZE ALL */}
      <div className="border border-emerald-500/40 bg-emerald-500/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-emerald-400" />
            <div>
              <p className="text-sm font-bold text-emerald-400">OPTIMIZAR TODO (1 clic)</p>
              <p className="text-[10px] text-muted-foreground">Ejecuta las 8 optimizaciones principales a la vez: pricing, competidores, fraude, inventario, clientes, compliance, imágenes, promociones</p>
            </div>
          </div>
          <button onClick={() => call("optimize/all", "optimize_all", "POST")} disabled={busy === "optimize_all"}
            className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold disabled:opacity-40 flex items-center gap-2">
            {busy === "optimize_all" ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />} Lanzar todo
          </button>
        </div>
        {data.optimize_all && (
          <div className="mt-2 grid grid-cols-4 gap-1">
            {Object.entries(data.optimize_all.results || {}).map(([k, v]) => (
              <div key={k} className="border border-border/40 p-1.5 text-center">
                <p className="text-[9px] uppercase text-muted-foreground">{k}</p>
                <p className="font-mono text-xs">{v?.error ? "❌" : "✅"}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GRID DE HERRAMIENTAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <ToolCard id="abtest" icon={FlaskConical} title="A/B Testing Auto" desc="Crea tests de precio (+10%) para 10 productos" endpoint="abtest/auto" method="POST" />
        <ToolCard id="translate" icon={Languages} title="Auto-Traducción" desc="Traduce 20 productos a inglés con Google Translate (gratis)" endpoint="translate/products?target_lang=en" method="POST" />
        <ToolCard id="reviews" icon={Star} title="Auto-Responder Reseñas" desc="Responde reseñas de clientes con IA" endpoint="reviews/auto-respond" method="POST" />
        <ToolCard id="competitors" icon={Eye} title="Monitor Competidores" desc="Compara precios con Google Shopping" endpoint="competitors/monitor" method="POST" />
        <ToolCard id="email_welcome" icon={Mail} title="Secuencia Welcome" desc="3 emails automáticos de bienvenida" endpoint="email/sequence?sequence_type=welcome" method="POST" />
        <ToolCard id="email_cart" icon={Mail} title="Secuencia Carrito" desc="3 emails de carrito abandonado (5%, 10%, 15%)" endpoint="email/sequence?sequence_type=abandoned_cart" method="POST" />
        <ToolCard id="email_post" icon={Mail} title="Secuencia Post-Compra" desc="Gracias + seguimiento + reseña" endpoint="email/sequence?sequence_type=post_purchase" method="POST" />
        <ToolCard id="email_winback" icon={Mail} title="Secuencia Win-Back" desc="Recupera clientes inactivos (20% off)" endpoint="email/sequence?sequence_type=win_back" method="POST" />
        <ToolCard id="inventory" icon={Boxes} title="Forecast Inventario" desc="Predice cuándo se agota cada producto" endpoint="inventory/forecast" />
        <ToolCard id="segments" icon={Users} title="Segmentación Clientes" desc="VIP, Frecuentes, Nuevos, Inactivos, Riesgo" endpoint="customers/segments" />
        <ToolCard id="loyalty" icon={Gift} title="Programa Lealtad" desc="Crea 4 niveles: Bronce→Diamante con perks" endpoint="loyalty/setup" method="POST" />
        <ToolCard id="fraud" icon={ShieldAlert} title="Detección Fraude" desc="Analiza pedidos sospechosos" endpoint="fraud/check" method="POST" />
        <ToolCard id="currency" icon={DollarSign} title="Conversión Moneda" desc="Convierte precios a USD con tasa real" endpoint="currency/auto-convert?target_currency=USD" method="POST" />
        <ToolCard id="socialproof" icon={TrendingUp} title="Social Proof" desc="Compras recientes para mostrar en tienda" endpoint="social-proof/recent" />
        <ToolCard id="blog" icon={FileText} title="Blog SEO Auto" desc="Genera artículo de blog optimizado para SEO" endpoint="blog/generate" method="POST" />
        <ToolCard id="demand" icon={TrendingUp} title="Forecast Demanda" desc="Proyección de ventas próximos 30 días" endpoint="forecast/demand" />
        <ToolCard id="promotions" icon={Zap} title="Auto-Promociones" desc="Crea descuentos de liquidación automático" endpoint="promotions/auto" method="POST" />
        <ToolCard id="partnerships" icon={Users} title="Buscar Partnerships" desc="Encuentra oportunidades de colaboración con IA" endpoint="partnerships/find" />
        <ToolCard id="sitemap" icon={Search} title="Generar Sitemap" desc="XML sitemap con todos los productos" endpoint="seo/sitemap" />
        <ToolCard id="compliance" icon={ShieldAlert} title="Check GDPR" desc="Verifica privacidad, cookies, términos" endpoint="compliance/check" />
        <ToolCard id="tax" icon={DollarSign} title="Calculadora IVA" desc="Estima impuestos por país" endpoint="tax/calculate?country=ES" />
        <ToolCard id="live" icon={Activity} title="Stats en Vivo" desc="Pedidos y revenue de hoy vs ayer" endpoint="stats/live" />
        <ToolCard id="pricing" icon={DollarSign} title="Optimizar Precios" desc="Sube/baja precios según demanda real" endpoint="pricing/optimize" method="POST" />
        <ToolCard id="images" icon={Eye} title="Optimizar Imágenes" desc="Detecta imágenes >500KB que ralentizan" endpoint="images/optimize" method="POST" />
        <ToolCard id="webhooks" icon={Zap} title="Status Webhooks" desc="Verifica webhooks de Shopify" endpoint="webhooks/status" />
        <ToolCard id="search" icon={Search} title="Search Insights" desc="Busquedas relacionadas de Google" endpoint="insights/search" />
        <ToolCard id="multistore" icon={Boxes} title="Multi-Store" desc="Estado de todas las tiendas conectadas" endpoint="multistore/status" />
        <ToolCard id="notif" icon={Bell} title="Centro Notificaciones" desc="Todas las alertas en un sitio" endpoint="notifications" />
        <ToolCard id="rates" icon={DollarSign} title="Tasas de Cambio" desc="Tasas reales EUR→todas las monedas" endpoint="currency/rates" />
      </div>

      {/* INFLUENCER OUTREACH */}
      <div className="border border-border bg-card p-4 space-y-2">
        <p className="text-xs font-bold flex items-center gap-2"><Users size={13} className="text-primary" /> Influencer Outreach Tracker</p>
        <div className="flex gap-2">
          <input id="inf-name" placeholder="Nombre" className="flex-1 border border-border px-2 py-1 text-xs" />
          <input id="inf-platform" placeholder="Plataforma" className="border border-border px-2 py-1 text-xs w-24" />
          <input id="inf-followers" placeholder="Seguidores" type="number" className="border border-border px-2 py-1 text-xs w-20" />
          <button onClick={() => {
            const n = document.getElementById("inf-name").value;
            const p = document.getElementById("inf-platform").value;
            const f = document.getElementById("inf-followers").value;
            if (n) call(`influencers/add?name=${n}&platform=${p}&followers=${f}&email=&niche=`, "influencers_add", "POST");
          }} className="px-3 py-1 bg-primary text-primary-foreground text-xs">Añadir</button>
        </div>
        <button onClick={() => call("influencers/list", "influencers_list")} className="text-xs text-primary">Ver influencers</button>
        {data.influencers_list && (
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {(data.influencers_list.influencers || []).map((inf, i) => (
              <div key={i} className="border border-border/40 px-2 py-1 flex justify-between text-[10px]">
                <span>{inf.name} ({inf.platform})</span>
                <span className="font-mono">{inf.followers} followers · {inf.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SUPPLIER MANAGEMENT */}
      <div className="border border-border bg-card p-4 space-y-2">
        <p className="text-xs font-bold flex items-center gap-2"><Truck size={13} className="text-primary" /> Gestión de Proveedores</p>
        <div className="flex gap-2">
          <input id="sup-name" placeholder="Nombre proveedor" className="flex-1 border border-border px-2 py-1 text-xs" />
          <input id="sup-contact" placeholder="Contacto" className="border border-border px-2 py-1 text-xs" />
          <input id="sup-type" placeholder="Tipo producto" className="border border-border px-2 py-1 text-xs" />
          <input id="sup-lead" placeholder="Lead time (días)" type="number" className="border border-border px-2 py-1 text-xs w-20" />
          <input id="sup-moq" placeholder="MOQ" type="number" className="border border-border px-2 py-1 text-xs w-16" />
          <button onClick={() => {
            const n = document.getElementById("sup-name").value;
            const c = document.getElementById("sup-contact").value;
            const t = document.getElementById("sup-type").value;
            const l = document.getElementById("sup-lead").value;
            const m = document.getElementById("sup-moq").value;
            if (n) call(`suppliers/add?name=${n}&contact=${c}&product_type=${t}&lead_time_days=${l}&min_order_qty=${m}`, "suppliers_add", "POST");
          }} className="px-3 py-1 bg-primary text-primary-foreground text-xs">Añadir</button>
        </div>
        <button onClick={() => call("suppliers/list", "suppliers_list")} className="text-xs text-primary">Ver proveedores</button>
        {data.suppliers_list && (
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {(data.suppliers_list.suppliers || []).map((s, i) => (
              <div key={i} className="border border-border/40 px-2 py-1 flex justify-between text-[10px]">
                <span>{s.name}</span>
                <span className="font-mono">{s.lead_time_days}d · MOQ {s.min_order_qty}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
