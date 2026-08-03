import { useState } from "react";
import { Wrench, Loader2, Search, Shield, Globe, QrCode, Link2, FileText, Calculator, FileCode, Lock, Rss, FileSpreadsheet, Send, Receipt, ShoppingCart, Users, TrendingUp, Bot, DollarSign, Mail, Layers, Zap } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ToolsPanel = () => {
  const [tab, setTab] = useState("cart");
  const [busy, setBusy] = useState(false);

  const tabs = [
    { id: "cart", label: "Carritos", icon: ShoppingCart },
    { id: "customers", label: "Clientes", icon: Users },
    { id: "prices", label: "Precios comp.", icon: TrendingUp },
    { id: "pagespeed", label: "PageSpeed", icon: Globe },
    { id: "seo", label: "SEO", icon: Search },
    { id: "ssl", label: "SSL/Security", icon: Lock },
    { id: "qr", label: "QR", icon: QrCode },
    { id: "utm", label: "UTM", icon: Link2 },
    { id: "tax", label: "Impuestos", icon: Calculator },
    { id: "legal", label: "Legal", icon: FileText },
    { id: "feeds", label: "Feeds/XML", icon: FileCode },
    { id: "rss", label: "RSS Monitor", icon: Rss },
    { id: "whatsapp", label: "WhatsApp", icon: Send },
    { id: "autopilot", label: "AutoPilot", icon: Bot },
    { id: "blog", label: "Blog SEO", icon: FileText },
    { id: "profit", label: "Beneficio", icon: DollarSign },
    { id: "email-seq", label: "Email Seq", icon: Mail },
    { id: "landing", label: "Landing", icon: Globe },
    { id: "stores", label: "Multi-store", icon: Layers },
    { id: "adspy", label: "Ad Spy", icon: Eye },
    { id: "ltv", label: "LTV", icon: DollarSign },
    { id: "bundles", label: "Bundles", icon: Package },
    { id: "ad-creative", label: "Ad Creative", icon: Zap },
    { id: "forecast", label: "Forecast", icon: BarChart3 },
    { id: "winback", label: "Win-Back", icon: Target },
    { id: "competitor-full", label: "Anal. Comp.", icon: Eye },
    { id: "funnel", label: "Embudo", icon: TrendingUp },
    { id: "conversion", label: "Conversion", icon: Percent },
    { id: "video-script", label: "Video", icon: Video },
    { id: "daily-profit", label: "Profit/day", icon: DollarSign },
  ];

  return (
    <div data-testid="tools-panel" className="space-y-4">
      <div className="flex gap-1 border border-border bg-card p-1 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} data-testid={`tools-tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "cart" && <CartRecovery />}
      {tab === "customers" && <CustomerManager />}
      {tab === "prices" && <CompetitorTracker />}
      {tab === "pagespeed" && <PageSpeedTool />}
      {tab === "seo" && <SEOTool />}
      {tab === "ssl" && <SSLTool />}
      {tab === "qr" && <QRTool />}
      {tab === "utm" && <UTMTool />}
      {tab === "tax" && <TaxTool />}
      {tab === "legal" && <LegalTool />}
      {tab === "feeds" && <FeedsTool />}
      {tab === "rss" && <RSSTool />}
      {tab === "whatsapp" && <WhatsAppTool />}
      {tab === "autopilot" && <AutoPilotTool />}
      {tab === "blog" && <BlogTool />}
      {tab === "profit" && <ProfitTool />}
      {tab === "email-seq" && <EmailSequenceTool />}
      {tab === "landing" && <LandingTool />}
      {tab === "stores" && <MultiStoreTool />}
      {tab === "adspy" && <AdSpyTool />}
      {tab === "ltv" && <LTVTool />}
      {tab === "bundles" && <BundleTool />}
      {tab === "ad-creative" && <AdCreativeTool />}
      {tab === "forecast" && <ForecastTool />}
      {tab === "winback" && <WinBackTool />}
      {tab === "competitor-full" && <CompetitorFullTool />}
      {tab === "funnel" && <FunnelTool />}
      {tab === "conversion" && <ConversionTool />}
      {tab === "video-script" && <VideoScriptTool />}
      {tab === "daily-profit" && <DailyProfitTool />}
    </div>
  );
};

// ====== CART RECOVERY ======
const CartRecovery = () => {
  const [carts, setCarts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/shopify/abandoned-carts`);
      if (res.ok) setCarts(await res.json());
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setLoading(false);
  };

  const recover = async (cart) => {
    setRecovering(cart.id);
    try {
      const res = await fetch(`${API}/shopify/abandoned-carts/recover`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkout_id: cart.id, email: cart.email, discount_code: "RECUPERA10" }),
      });
      if (res.ok) toast.success(`Email de recuperacion enviado a ${cart.email}`);
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setRecovering(null);
  };

  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <ShoppingCart size={13} className="text-accent" /> Carritos abandonados reales (Shopify)
        </p>
        <button onClick={load} disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 disabled:opacity-40">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Cargar carritos
        </button>
      </div>
      {carts && (
        <>
          <div className="grid grid-cols-3 gap-px bg-border border border-border">
            <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Carritos</p><p className="font-mono text-xl text-primary">{carts.total}</p></div>
            <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Revenue perdido</p><p className="font-mono text-xl text-accent">${carts.potential_revenue.toFixed(2)}</p></div>
            <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Recuperable</p><p className="font-mono text-xl text-emerald-400">${(carts.potential_revenue * 0.3).toFixed(2)}</p></div>
          </div>
          {carts.carts.map((c, i) => (
            <div key={i} data-testid={`cart-${i}`} className="border border-border bg-card p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium">{c.customer_name || c.email || "Cliente anonimo"}</p>
                  <p className="text-[10px] text-muted-foreground">{c.email || "Sin email"}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.items.map((item, j) => <span key={j} className="text-[10px] border border-border bg-secondary px-1.5 py-0.5">{item.quantity}x {item.title?.slice(0, 20)}</span>)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-accent">${c.total} {c.currency}</p>
                  <button data-testid={`recover-btn-${i}`} onClick={() => recover(c)} disabled={recovering === c.id || !c.email}
                    className="mt-2 px-3 py-1.5 border border-emerald-500/50 text-emerald-400 text-[11px] font-semibold hover:bg-emerald-500/10 disabled:opacity-40 flex items-center gap-1.5">
                    {recovering === c.id ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />} Recuperar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

// ====== CUSTOMERS ======
const CustomerManager = () => {
  const [customers, setCustomers] = useState(null);
  const [segments, setSegments] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([fetch(`${API}/shopify/customers`), fetch(`${API}/shopify/customers/segments`)]);
      if (cRes.ok) setCustomers(await cRes.json());
      if (sRes.ok) setSegments(await sRes.json());
      if (!cRes.ok) { const e = await cRes.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2"><Users size={13} className="text-primary" /> Clientes reales (Shopify)</p>
        <button onClick={load} disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 disabled:opacity-40">{loading ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />} Cargar</button>
      </div>
      {segments && (
        <div className="grid grid-cols-4 gap-px bg-border border border-border">
          <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Total</p><p className="font-mono text-lg text-primary">{segments.total}</p></div>
          <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">VIP</p><p className="font-mono text-lg text-accent">{segments.VIP}</p></div>
          <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Regulares</p><p className="font-mono text-lg text-foreground">{segments.regular}</p></div>
          <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Nuevos</p><p className="font-mono text-lg text-muted-foreground">{segments.nuevo}</p></div>
        </div>
      )}
      {customers && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {customers.map((c, i) => (
            <div key={i} data-testid={`customer-${i}`} className="border border-border bg-card p-3 flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full shrink-0 ${c.segment === "VIP" ? "bg-accent" : c.segment === "regular" ? "bg-primary" : "bg-muted-foreground"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{c.name || "Sin nombre"}</p>
                <p className="text-[10px] text-muted-foreground">{c.email}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-xs text-accent">${c.total_spent.toFixed(2)}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{c.orders_count} pedidos</p>
              </div>
              <span className={`font-mono text-[9px] uppercase px-1.5 py-0.5 ${c.segment === "VIP" ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"}`}>{c.segment}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ====== COMPETITOR PRICE TRACKER ======
const CompetitorTracker = () => {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);

  const track = async () => {
    if (!url.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/tools/track-prices`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
      if (res.ok) { setResult(await res.json()); toast.success("Precios rastreados"); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2"><TrendingUp size={13} className="text-accent" /> Rastreador de precios de competidores (scraping real)</p>
        <div className="flex gap-2">
          <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && track()}
            placeholder="https://tienda-competidora.com" className="flex-1 bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <button onClick={track} disabled={busy || !url.trim()} className="px-4 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} Rastrear</button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">// Lee products.json publico de la tienda Shopify del competidor. Uso etico y legal: solo datos publicos.</p>
      </div>
      {result && (
        <>
          <div className="grid grid-cols-4 gap-px bg-border border border-border">
            <div className="bg-card px-3 py-2 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Productos</p><p className="font-mono text-sm text-primary">{result.stats.total_products}</p></div>
            <div className="bg-card px-3 py-2 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Precio min</p><p className="font-mono text-sm text-foreground">${result.stats.min_price}</p></div>
            <div className="bg-card px-3 py-2 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Precio medio</p><p className="font-mono text-sm text-accent">${result.stats.avg_price}</p></div>
            <div className="bg-card px-3 py-2 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">En oferta</p><p className="font-mono text-sm text-emerald-400">{result.stats.products_on_sale}</p></div>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {result.products.slice(0, 20).map((p, i) => (
              <div key={i} data-testid={`price-${i}`} className="flex items-center gap-2 border border-border bg-card p-2">
                <span className="text-xs truncate flex-1">{p.title}</span>
                <span className="font-mono text-xs text-accent">${p.price}</span>
                {p.has_sale && p.compare_at_price && <span className="font-mono text-[10px] text-muted-foreground line-through">${p.compare_at_price}</span>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ====== PAGESPEED ======
const PageSpeedTool = () => {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [strategy, setStrategy] = useState("mobile");

  const run = async () => {
    if (!url.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/tools/pagespeed`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, strategy }) });
      if (res.ok) { setResult(await res.json()); toast.success("Auditoria completada"); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2"><Globe size={13} className="text-primary" /> Google PageSpeed Insights (API real gratis)</p>
        <div className="flex gap-2">
          <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && run()} placeholder="https://tu-tienda.myshopify.com" className="flex-1 bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <select value={strategy} onChange={e => setStrategy(e.target.value)} className="bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="mobile">Movil</option>
            <option value="desktop">Escritorio</option>
          </select>
          <button onClick={run} disabled={busy || !url.trim()} className="px-4 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={15} className="animate-spin" /> : <Globe size={15} />} Auditar</button>
        </div>
      </div>
      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(result.scores).map(([key, score]) => (
              <div key={key} data-testid={`pagespeed-score-${key}`} className="border border-border bg-card p-4 text-center">
                <p className="font-mono text-[9px] text-muted-foreground uppercase">{key.replace("-", " ")}</p>
                <p className={`font-mono text-2xl mt-1 ${score >= 90 ? "text-emerald-400" : score >= 50 ? "text-accent" : "text-destructive"}`}>{score}</p>
              </div>
            ))}
          </div>
          <div className="border border-border bg-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Metricas reales</p>
            {Object.entries(result.metrics).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-xs py-0.5"><span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</span><span className="font-mono text-primary">{v}</span></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ====== SEO ANALYZER ======
const SEOTool = () => {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!url.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/tools/seo-analyzer`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
      if (res.ok) { setResult(await res.json()); toast.success("Analisis SEO completado"); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2"><Search size={13} className="text-primary" /> Analizador SEO real</p>
        <div className="flex gap-2">
          <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && run()} placeholder="https://tu-tienda.com" className="flex-1 bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <button onClick={run} disabled={busy || !url.trim()} className="px-4 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} Analizar</button>
        </div>
      </div>
      {result && (
        <div className="space-y-3">
          <div className="border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">SEO Score</p>
              <p className={`font-mono text-2xl ${result.score >= 80 ? "text-emerald-400" : result.score >= 50 ? "text-accent" : "text-destructive"}`}>{result.score}/100</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs"><span className="text-muted-foreground">Title:</span> <span className="text-foreground">{result.title?.slice(0, 60)}</span></p>
              <p className="text-xs"><span className="text-muted-foreground">Description:</span> <span className="text-foreground">{result.description?.slice(0, 80)}</span></p>
              <p className="text-xs"><span className="text-muted-foreground">H1:</span> <span className="text-foreground">{result.h1_count}</span> · <span className="text-muted-foreground">H2:</span> <span className="text-foreground">{result.h2_count}</span> · <span className="text-muted-foreground">Imágenes sin alt:</span> <span className="text-destructive">{result.images_without_alt}/{result.total_images}</span></p>
            </div>
          </div>
          {result.passed?.length > 0 && (
            <div className="border border-emerald-500/30 bg-emerald-500/5 p-3"><p className="text-[10px] uppercase text-emerald-400 mb-1">Correcto</p>{result.passed.map((p, i) => <p key={i} className="text-xs text-emerald-400 flex items-center gap-1.5">✓ {p}</p>)}</div>
          )}
          {result.issues?.length > 0 && (
            <div className="border border-destructive/30 bg-destructive/5 p-3"><p className="text-[10px] uppercase text-destructive mb-1">Problemas</p>{result.issues.map((p, i) => <p key={i} className="text-xs text-destructive flex items-center gap-1.5">✗ {p}</p>)}</div>
          )}
        </div>
      )}
    </div>
  );
};

// ====== SSL CHECKER ======
const SSLTool = () => {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (!url.trim() || busy) return;
    setBusy(true);
    try { const res = await fetch(`${API}/tools/ssl-check`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
      if (res.ok) { setResult(await res.json()); toast.success("Check completado"); } else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2"><Lock size={13} className="text-primary" /> Comprobador SSL y seguridad (real)</p>
        <div className="flex gap-2">
          <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && run()} placeholder="https://tu-tienda.com" className="flex-1 bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <button onClick={run} disabled={busy || !url.trim()} className="px-4 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />} Comprobar</button>
        </div>
      </div>
      {result && (
        <div className="space-y-3">
          <div className={`border p-3 ${result.healthy ? "border-emerald-500/40 bg-emerald-500/10" : "border-destructive/40 bg-destructive/10"}`}>
            <p className={`text-sm font-semibold ${result.healthy ? "text-emerald-400" : "text-destructive"}`}>{result.healthy ? "Sitio saludable" : "Problemas detectados"}</p>
            <p className="font-mono text-[10px] text-muted-foreground mt-1">{result.is_https ? "HTTPS activo" : "Sin HTTPS"} · Status: {result.status_code}</p>
          </div>
          <div className="border border-border bg-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Headers de seguridad</p>
            {result.present_headers?.map(h => <p key={h} className="text-xs text-emerald-400">✓ {h}</p>)}
            {result.missing_headers?.map(h => <p key={h} className="text-xs text-destructive">✗ {h}</p>)}
          </div>
        </div>
      )}
    </div>
  );
};

// ====== QR CODE ======
const QRTool = () => {
  const [url, setUrl] = useState("");
  const [qr, setQr] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (!url.trim() || busy) return;
    setBusy(true);
    try { const res = await fetch(`${API}/tools/qr-code`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
      if (res.ok) setQr(await res.json());
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2"><QrCode size={13} className="text-accent" /> Generador de codigo QR (gratis, quickchart.io)</p>
        <div className="flex gap-2">
          <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && run()} placeholder="https://tu-tienda.com/producto" className="flex-1 bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <button onClick={run} disabled={busy || !url.trim()} className="px-4 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={15} className="animate-spin" /> : <QrCode size={15} />} Generar</button>
        </div>
      </div>
      {qr && <div className="border border-border bg-card p-4 text-center"><img src={qr.qr_url} alt="QR Code" className="mx-auto" /><p className="mt-2 font-mono text-[10px] text-muted-foreground">{qr.url}</p><a href={qr.qr_url} download="qr-code.png" className="mt-2 inline-block text-xs text-primary hover:underline">Descargar</a></div>}
    </div>
  );
};

// ====== UTM BUILDER ======
const UTMTool = () => {
  const [input, setInput] = useState({ url: "", source: "", medium: "", campaign: "", term: "", content: "" });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (!input.url.trim() || busy) return;
    setBusy(true);
    try { const res = await fetch(`${API}/tools/utm-builder`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      if (res.ok) setResult(await res.json());
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2"><Link2 size={13} className="text-primary" /> Constructor de enlaces UTM (para tracking de ads)</p>
        <input value={input.url} onChange={e => setInput({ ...input, url: e.target.value })} placeholder="URL destino: https://tu-tienda.com/producto" className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        <div className="grid grid-cols-2 gap-3">
          <input value={input.source} onChange={e => setInput({ ...input, source: e.target.value })} placeholder="utm_source (facebook)" className="bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input value={input.medium} onChange={e => setInput({ ...input, medium: e.target.value })} placeholder="utm_medium (cpc)" className="bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input value={input.campaign} onChange={e => setInput({ ...input, campaign: e.target.value })} placeholder="utm_campaign (verano2024)" className="bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input value={input.term} onChange={e => setInput({ ...input, term: e.target.value })} placeholder="utm_term (opcional)" className="bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input value={input.content} onChange={e => setInput({ ...input, content: e.target.value })} placeholder="utm_content (banner_top)" className="bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <button onClick={run} disabled={busy || !input.url.trim()} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />} Generar enlace</button>
      </div>
      {result && <div className="border border-border bg-card p-3"><p className="text-[10px] uppercase text-muted-foreground mb-1">Enlace UTM final</p><p className="font-mono text-xs text-primary break-all">{result.url}</p><button onClick={() => { navigator.clipboard?.writeText(result.url); toast.success("Copiado"); }} className="mt-2 text-xs text-primary hover:underline">Copiar</button></div>}
    </div>
  );
};

// ====== TAX CALCULATOR ======
const TaxTool = () => {
  const [input, setInput] = useState({ amount: 100, country_code: "ES" });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try { const res = await fetch(`${API}/tools/tax-calculator`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      if (res.ok) setResult(await res.json());
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2"><Calculator size={13} className="text-accent" /> Calculadora de impuestos (IVA real por pais)</p>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[10px] uppercase text-muted-foreground">Importe</label><input type="number" value={input.amount} onChange={e => setInput({ ...input, amount: parseFloat(e.target.value) || 0 })} className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" /></div>
          <div><label className="text-[10px] uppercase text-muted-foreground">Pais</label>
            <select value={input.country_code} onChange={e => setInput({ ...input, country_code: e.target.value })} className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              {["ES","PT","FR","DE","IT","GB","NL","BE","AT","IE","DK","SE","FI","PL","CZ","HU","RO","US","CA","MX","AU","JP","NO","CH"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <button onClick={run} disabled={busy} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <Calculator size={14} />} Calcular</button>
      </div>
      {result && (
        <div className="border border-border bg-card p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Importe base:</span> <span className="font-mono text-foreground">${result.amount}</span></div>
            <div><span className="text-muted-foreground">Pais:</span> <span className="font-mono text-foreground">{result.country}</span></div>
            <div><span className="text-muted-foreground">Tasa IVA:</span> <span className="font-mono text-primary">{result.vat_rate}%</span></div>
            <div><span className="text-muted-foreground">Impuesto:</span> <span className="font-mono text-accent">${result.tax_amount}</span></div>
            <div className="col-span-2 border-t border-border pt-2"><span className="text-muted-foreground">Total con IVA:</span> <span className="font-mono text-2xl text-accent">${result.total}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

// ====== LEGAL ======
const LegalTool = () => {
  const [input, setInput] = useState({ company_name: "", website_url: "", email: "", country: "Espana", gdpr: true, cookies: true, analytics: true, marketing: false });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try { const res = await fetch(`${API}/tools/privacy-policy`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      if (res.ok) { setResult(await res.json()); toast.success("Politica generada"); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2"><FileText size={13} className="text-accent" /> Generador de politicas legales (GDPR/LOPD)</p>
        <div className="grid grid-cols-2 gap-3">
          <input value={input.company_name} onChange={e => setInput({ ...input, company_name: e.target.value })} placeholder="Nombre empresa" className="bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input value={input.website_url} onChange={e => setInput({ ...input, website_url: e.target.value })} placeholder="https://tu-tienda.com" className="bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input value={input.email} onChange={e => setInput({ ...input, email: e.target.value })} placeholder="contacto@tienda.com" className="bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input value={input.country} onChange={e => setInput({ ...input, country: e.target.value })} placeholder="Pais" className="bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div className="flex gap-4 text-xs">
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={input.gdpr} onChange={e => setInput({ ...input, gdpr: e.target.checked })} /> GDPR</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={input.cookies} onChange={e => setInput({ ...input, cookies: e.target.checked })} /> Cookies</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={input.analytics} onChange={e => setInput({ ...input, analytics: e.target.checked })} /> Analytics</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={input.marketing} onChange={e => setInput({ ...input, marketing: e.target.checked })} /> Marketing</label>
        </div>
        <button onClick={run} disabled={busy} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />} Generar politicas</button>
        <p className="font-mono text-[10px] text-muted-foreground">// Genera politicas de privacidad y cookies compatibles con GDPR/LOPD. Revisar con un abogado antes de publicar.</p>
      </div>
      {result && (
        <div className="space-y-3">
          {result.privacy_policy && <div className="border border-border bg-card p-4"><p className="text-xs font-semibold mb-2">Politica de Privacidad</p><div className="text-xs text-muted-foreground prose-invert max-h-64 overflow-y-auto" dangerouslySetInnerHTML={{ __html: result.privacy_policy }} /></div>}
          {result.cookie_policy && <div className="border border-border bg-card p-4"><p className="text-xs font-semibold mb-2">Politica de Cookies</p><div className="text-xs text-muted-foreground prose-invert max-h-64 overflow-y-auto" dangerouslySetInnerHTML={{ __html: result.cookie_policy }} /></div>}
          {result.legal_warnings && <div className="border border-accent/30 bg-accent/5 p-3"><p className="text-[10px] uppercase text-accent mb-1">Avisos legales</p>{result.legal_warnings.map((w, i) => <p key={i} className="text-xs text-accent">⚠ {w}</p>)}</div>}
        </div>
      )}
    </div>
  );
};

// ====== FEEDS ======
const FeedsTool = () => {
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 mb-3"><FileCode size={13} className="text-accent" /> Generadores de feeds (desde productos reales de Shopify)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button onClick={() => window.open(`${API}/tools/product-feed`, "_blank")} data-testid="gen-xml-feed" className="border border-border bg-secondary p-4 hover:border-primary/50 transition-colors text-left">
            <FileCode size={20} className="text-accent mb-2" />
            <p className="text-sm font-semibold">Feed XML (Google Shopping)</p>
            <p className="text-[11px] text-muted-foreground mt-1">XML con todos tus productos reales para Google Merchant Center</p>
          </button>
          <button onClick={() => window.open(`${API}/tools/facebook-catalog`, "_blank")} data-testid="gen-fb-catalog" className="border border-border bg-secondary p-4 hover:border-primary/50 transition-colors text-left">
            <FileSpreadsheet size={20} className="text-accent mb-2" />
            <p className="text-sm font-semibold">Catalogo Facebook (CSV)</p>
            <p className="text-[11px] text-muted-foreground mt-1">CSV para Facebook Business Catalog</p>
          </button>
          <button onClick={() => window.open(`${API}/tools/sitemap`, "_blank")} data-testid="gen-sitemap" className="border border-border bg-secondary p-4 hover:border-primary/50 transition-colors text-left">
            <Globe size={20} className="text-primary mb-2" />
            <p className="text-sm font-semibold">Sitemap.xml</p>
            <p className="text-[11px] text-muted-foreground mt-1">Sitemap para Google Search Console</p>
          </button>
          <button onClick={() => window.open(`${API}/tools/robots-txt`, "_blank")} data-testid="gen-robots" className="border border-border bg-secondary p-4 hover:border-primary/50 transition-colors text-left">
            <FileCode size={20} className="text-primary mb-2" />
            <p className="text-sm font-semibold">robots.txt</p>
            <p className="text-[11px] text-muted-foreground mt-1">Archivo robots.txt optimizado para Shopify</p>
          </button>
        </div>
      </div>
    </div>
  );
};

// ====== RSS MONITOR ======
const RSSTool = () => {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (!url.trim() || busy) return;
    setBusy(true);
    try { const res = await fetch(`${API}/tools/rss-monitor`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ feed_url: url }) });
      if (res.ok) { setResult(await res.json()); toast.success("Feed cargado"); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2"><Rss size={13} className="text-primary" /> Monitor de RSS (vigilar blogs/tiendas competidoras)</p>
        <div className="flex gap-2">
          <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && run()} placeholder="https://blog-competidor.com/rss o /feed" className="flex-1 bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <button onClick={run} disabled={busy || !url.trim()} className="px-4 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={15} className="animate-spin" /> : <Rss size={15} />} Monitorear</button>
        </div>
      </div>
      {result && <div className="border border-border bg-card divide-y divide-border/60">{result.posts?.map((p, i) => <a key={i} href={p.link} target="_blank" rel="noreferrer" className="px-4 py-3 block hover:bg-secondary group"><p className="text-xs font-medium group-hover:text-primary">{p.title}</p><p className="text-[10px] text-muted-foreground mt-0.5">{p.date} · {p.description?.slice(0, 80)}</p></a>)}</div>}
    </div>
  );
};

// ====== WHATSAPP ======
const WhatsAppTool = () => {
  const [input, setInput] = useState({ phone: "", message: "" });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (!input.phone.trim() || busy) return;
    setBusy(true);
    try { const res = await fetch(`${API}/tools/whatsapp-send`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      if (res.ok) { setResult(await res.json()); toast.success("Enlace generado"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2"><Send size={13} className="text-accent" /> WhatsApp Business (enlaces wa.me gratis)</p>
        <input value={input.phone} onChange={e => setInput({ ...input, phone: e.target.value.replace(/[^0-9]/g, "") })} placeholder="Numero internacional sin + (ej: 34600000000)" className="w-full bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
        <textarea value={input.message} onChange={e => setInput({ ...input, message: e.target.value })} placeholder="Mensaje predefinido..." rows={3} className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        <button onClick={run} disabled={busy || !input.phone.trim()} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Generar enlace</button>
      </div>
      {result && <div className="border border-border bg-card p-4 text-center"><a href={result.whatsapp_link} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">Abrir WhatsApp con mensaje predefinido</a></div>}
    </div>
  );
};


// ====== AUTOPILOT (auto-create products, discounts, collections, fulfill, optimize) ======
const AutoPilotTool = () => {
  const [busy, setBusy] = useState(false);
  const [productForm, setProductForm] = useState({ title: "", price: "29.99", body_html: "", vendor: "Imperio AI", tags: "" });
  const [discountForm, setDiscountForm] = useState({ code: "OFERTA10", percentage: 10 });
  const [result, setResult] = useState(null);

  const createProduct = async () => {
    if (!productForm.title.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/shopify/auto-create-product`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(productForm) });
      if (res.ok) { setResult(await res.json()); toast.success("Producto REAL creado en Shopify (draft)"); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const createDiscount = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/shopify/auto-discount`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(discountForm) });
      if (res.ok) { toast.success(`Codigo ${discountForm.code} REAL creado`); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const optimizePrices = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/shopify/auto-optimize-prices`);
      if (res.ok) { setResult({ optimize: await res.json() }); toast.success("Analisis completado"); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Zap size={13} /> Auto-crear producto REAL en Shopify</p>
        <input value={productForm.title} onChange={e => setProductForm({ ...productForm, title: e.target.value })} placeholder="Nombre del producto" className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        <div className="grid grid-cols-3 gap-3">
          <input value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} placeholder="Precio" className="bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
          <input value={productForm.vendor} onChange={e => setProductForm({ ...productForm, vendor: e.target.value })} placeholder="Vendor" className="bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input value={productForm.tags} onChange={e => setProductForm({ ...productForm, tags: e.target.value })} placeholder="tags" className="bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <textarea value={productForm.body_html} onChange={e => setProductForm({ ...productForm, body_html: e.target.value })} placeholder="Descripcion HTML del producto" rows={3} className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        <button onClick={createProduct} disabled={busy || !productForm.title.trim()} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />} Crear producto (draft)</button>
      </div>
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Zap size={13} /> Crear codigo descuento REAL</p>
        <div className="grid grid-cols-2 gap-3">
          <input value={discountForm.code} onChange={e => setDiscountForm({ ...discountForm, code: e.target.value })} placeholder="OFERTA10" className="bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="number" value={discountForm.percentage} onChange={e => setDiscountForm({ ...discountForm, percentage: parseFloat(e.target.value) || 0 })} placeholder="10" className="bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <button onClick={createDiscount} disabled={busy} className="px-4 py-2 border border-accent/50 text-accent text-sm font-semibold hover:bg-accent/10 disabled:opacity-40 flex items-center gap-2"><Zap size={14} /> Crear descuento</button>
      </div>
      <div className="border border-border bg-card p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2 mb-2"><Zap size={13} /> Optimizacion automatica de precios</p>
        <button onClick={optimizePrices} disabled={busy} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />} Analizar precios</button>
        {result?.optimize?.suggestions?.length > 0 && (
          <div className="mt-3 space-y-1">
            {result.optimize.suggestions.map((s, i) => (
              <div key={i} className={`border p-2 text-xs ${s.action === "increase" ? "border-emerald-500/40 bg-emerald-500/10" : "border-accent/40 bg-accent/10"}`}>
                <span className="font-medium">{s.product}</span> · ${s.current_price} → ${s.suggested_price} · <span className="text-muted-foreground">{s.reason}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {result?.product_id && <div className="border border-emerald-500/40 bg-emerald-500/10 p-3"><p className="text-xs text-emerald-400">Producto creado. ID: {result.product_id}</p></div>}
    </div>
  );
};

// ====== BLOG SEO GENERATOR ======
const BlogTool = () => {
  const [input, setInput] = useState({ topic: "", keywords: "", store_url: "" });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (!input.topic.trim() || busy) return;
    setBusy(true);
    try { const res = await fetch(`${API}/tools/blog-generator`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      if (res.ok) { setResult(await res.json()); toast.success("Blog post generado"); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><FileText size={13} /> Generador de blog SEO (articulo completo)</p>
        <input value={input.topic} onChange={e => setInput({ ...input, topic: e.target.value })} placeholder="Tema del articulo" className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        <input value={input.keywords} onChange={e => setInput({ ...input, keywords: e.target.value })} placeholder="Keywords (separadas por comas)" className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        <input value={input.store_url} onChange={e => setInput({ ...input, store_url: e.target.value })} placeholder="URL de tu tienda (opcional)" className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        <button onClick={run} disabled={busy || !input.topic.trim()} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />} Generar blog post</button>
      </div>
      {result && (
        <div className="border border-border bg-card p-4 space-y-2">
          <p className="text-sm font-bold">{result.title}</p>
          <p className="text-xs text-muted-foreground">{result.meta_description}</p>
          <p className="font-mono text-[10px] text-primary">slug: /{result.slug}</p>
          {result.tags && <div className="flex flex-wrap gap-1">{result.tags.map((t, i) => <span key={i} className="text-[10px] border border-border bg-secondary px-1.5 py-0.5">{t}</span>)}</div>}
          <div className="mt-2 max-h-64 overflow-y-auto text-xs prose-invert" dangerouslySetInnerHTML={{ __html: result.content }} />
        </div>
      )}
    </div>
  );
};

// ====== PROFIT CALCULATOR ======
const ProfitTool = () => {
  const [input, setInput] = useState({ revenue: 1000, product_cost: 300, ad_spend: 200, shopify_plan: "basic", transaction_fees_pct: 2.9, shipping_cost: 50, other_costs: 0 });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try { const res = await fetch(`${API}/tools/profit-calculator`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      if (res.ok) setResult(await res.json());
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><DollarSign size={13} /> Calculadora de beneficio REAL (todos los costos)</p>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[10px] uppercase text-muted-foreground">Revenue</label><input type="number" value={input.revenue} onChange={e => setInput({ ...input, revenue: parseFloat(e.target.value) || 0 })} className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" /></div>
          <div><label className="text-[10px] uppercase text-muted-foreground">Coste producto</label><input type="number" value={input.product_cost} onChange={e => setInput({ ...input, product_cost: parseFloat(e.target.value) || 0 })} className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" /></div>
          <div><label className="text-[10px] uppercase text-muted-foreground">Ad spend</label><input type="number" value={input.ad_spend} onChange={e => setInput({ ...input, ad_spend: parseFloat(e.target.value) || 0 })} className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" /></div>
          <div><label className="text-[10px] uppercase text-muted-foreground">Envio</label><input type="number" value={input.shipping_cost} onChange={e => setInput({ ...input, shipping_cost: parseFloat(e.target.value) || 0 })} className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" /></div>
          <div><label className="text-[10px] uppercase text-muted-foreground">Otros costos</label><input type="number" value={input.other_costs} onChange={e => setInput({ ...input, other_costs: parseFloat(e.target.value) || 0 })} className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" /></div>
          <div><label className="text-[10px] uppercase text-muted-foreground">Plan Shopify</label><select value={input.shopify_plan} onChange={e => setInput({ ...input, shopify_plan: e.target.value })} className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"><option value="basic">Basic ($29/mes)</option><option value="shopify">Shopify ($79/mes)</option><option value="advanced">Advanced ($299/mes)</option></select></div>
        </div>
        <button onClick={run} disabled={busy} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />} Calcular beneficio real</button>
      </div>
      {result && (
        <div className="space-y-3">
          <div className={`border p-4 ${result.profitable ? "border-emerald-500/40 bg-emerald-500/10" : "border-destructive/40 bg-destructive/10"}`}>
            <p className={`text-2xl font-mono ${result.profitable ? "text-emerald-400" : "text-destructive"}`}>${result.net_profit}</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Beneficio neto real · Margen: {result.margin_percentage}%</p>
          </div>
          <div className="border border-border bg-card p-3 space-y-1">
            <p className="text-[10px] uppercase text-muted-foreground">Desglose de costos</p>
            {Object.entries(result.costs).filter(([k, v]) => k !== "total_costs").map(([k, v]) => <div key={k} className="flex justify-between text-xs"><span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</span><span className="font-mono text-foreground">${v}</span></div>)}
            <div className="border-t border-border pt-1 flex justify-between text-xs"><span className="text-muted-foreground">Total costos</span><span className="font-mono text-destructive">${result.costs.total_costs}</span></div>
          </div>
          <div className="border border-border bg-card p-3"><span className="text-xs text-muted-foreground">ROAS: </span><span className="font-mono text-accent">{result.roas}x</span> · <span className="text-xs text-muted-foreground">Breakeven: </span><span className="font-mono text-primary">${result.breakeven_revenue}</span></div>
        </div>
      )}
    </div>
  );
};

// ====== EMAIL SEQUENCE ======
const EmailSequenceTool = () => {
  const [input, setInput] = useState({ sequence_type: "welcome", store_name: "", product_name: "" });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (busy) return;
    setBusy(true);
    try { const res = await fetch(`${API}/tools/email-sequence`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      if (res.ok) { setResult(await res.json()); toast.success("Secuencia generada"); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Mail size={13} /> Generador de secuencia de emails</p>
        <div className="grid grid-cols-3 gap-3">
          <select value={input.sequence_type} onChange={e => setInput({ ...input, sequence_type: e.target.value })} className="bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="welcome">Bienvenida</option><option value="abandoned_cart">Carrito abandonado</option><option value="post_purchase">Post-compra</option><option value="re_engagement">Re-engagement</option>
          </select>
          <input value={input.store_name} onChange={e => setInput({ ...input, store_name: e.target.value })} placeholder="Tienda" className="bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input value={input.product_name} onChange={e => setInput({ ...input, product_name: e.target.value })} placeholder="Producto" className="bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <button onClick={run} disabled={busy} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />} Generar secuencia</button>
      </div>
      {result?.sequence?.map((email, i) => (
        <div key={i} className="border border-border bg-card p-3">
          <div className="flex items-center gap-2 mb-1"><span className="font-mono text-[10px] text-accent">Dia {email.day}</span><span className="text-xs font-medium">{email.subject}</span></div>
          <p className="text-xs text-muted-foreground whitespace-pre-wrap">{email.body}</p>
          <p className="font-mono text-[9px] text-primary mt-1">Objetivo: {email.goal}</p>
        </div>
      ))}
    </div>
  );
};

// ====== LANDING PAGE ======
const LandingTool = () => {
  const [input, setInput] = useState({ product_name: "", product_description: "", price: "29.99", image_url: "", cta_text: "Comprar ahora", store_url: "" });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (!input.product_name.trim() || busy) return;
    setBusy(true);
    try { const res = await fetch(`${API}/tools/landing-page`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      if (res.ok) { setResult(await res.json()); toast.success("Landing page generada"); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Globe size={13} /> Generador de landing page (HTML completo)</p>
        <input value={input.product_name} onChange={e => setInput({ ...input, product_name: e.target.value })} placeholder="Nombre del producto" className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        <textarea value={input.product_description} onChange={e => setInput({ ...input, product_description: e.target.value })} placeholder="Descripcion" rows={2} className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        <div className="grid grid-cols-3 gap-3">
          <input value={input.price} onChange={e => setInput({ ...input, price: e.target.value })} placeholder="Precio" className="bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
          <input value={input.cta_text} onChange={e => setInput({ ...input, cta_text: e.target.value })} placeholder="CTA" className="bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input value={input.store_url} onChange={e => setInput({ ...input, store_url: e.target.value })} placeholder="URL tienda" className="bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <input value={input.image_url} onChange={e => setInput({ ...input, image_url: e.target.value })} placeholder="URL de imagen" className="w-full bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
        <button onClick={run} disabled={busy || !input.product_name.trim()} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />} Generar landing page</button>
      </div>
      {result?.headline && <div className="border border-border bg-card p-3"><p className="text-xs font-bold">{result.headline}</p><p className="text-xs text-muted-foreground">{result.subheadline}</p><p className="font-mono text-[10px] text-accent mt-1">Urgencia: {result.urgency_trigger}</p></div>}
      {result?.html && <div className="border border-border bg-card p-3"><p className="text-[10px] uppercase text-muted-foreground mb-2">HTML completo (copiar y pegar)</p><textarea readOnly value={result.html} rows={8} className="w-full bg-secondary border border-border p-2 font-mono text-[10px]" /><button onClick={() => { navigator.clipboard?.writeText(result.html); toast.success("Copiado"); }} className="mt-1 text-xs text-primary hover:underline">Copiar HTML</button></div>}
    </div>
  );
};

// ====== MULTI-STORE ======
const MultiStoreTool = () => {
  const [stores, setStores] = useState([]);
  const [form, setForm] = useState({ name: "", shop_domain: "", access_token: "" });
  const [busy, setBusy] = useState(false);
  const load = async () => { try { const res = await fetch(`${API}/multi-store/list`); if (res.ok) setStores(await res.json()); } catch {} };
  useEffect(() => { load(); }, []);
  const add = async () => {
    if (!form.name.trim() || !form.shop_domain.trim() || busy) return;
    setBusy(true);
    try { const res = await fetch(`${API}/multi-store/add`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { toast.success("Tienda anadida"); setForm({ name: "", shop_domain: "", access_token: "" }); load(); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Layers size={13} /> Gestionar multiples tiendas Shopify</p>
        <div className="grid grid-cols-3 gap-3">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nombre tienda" className="bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input value={form.shop_domain} onChange={e => setForm({ ...form, shop_domain: e.target.value })} placeholder="tienda.myshopify.com" className="bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="password" value={form.access_token} onChange={e => setForm({ ...form, access_token: e.target.value })} placeholder="Access token" className="bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <button onClick={add} disabled={busy || !form.name.trim()} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <Layers size={14} />} Anadir tienda</button>
      </div>
      <div className="space-y-2">
        {stores.map((s, i) => (
          <div key={i} data-testid={`store-${i}`} className="border border-border bg-card p-3 flex items-center gap-3">
            <Layers size={14} className="text-primary" />
            <div className="flex-1"><p className="text-xs font-medium">{s.name}</p><p className="font-mono text-[10px] text-muted-foreground">{s.shop_domain}</p></div>
            <span className="font-mono text-[10px] text-muted-foreground">{s.created_at?.slice(0, 10)}</span>
          </div>
        ))}
        {stores.length === 0 && <p className="text-xs text-muted-foreground font-mono">// Sin tiendas adicionales. Anade mas para gestion multi-store.</p>}
      </div>
    </div>
  );
};


// ====== AD SPY (Facebook Ad Library) ======
const AdSpyTool = () => {
  const [input, setInput] = useState({ competitor_name: "", country: "ES" });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (!input.competitor_name.trim() || busy) return;
    setBusy(true);
    try { const res = await fetch(`${API}/tools/ad-spy`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      if (res.ok) { setResult(await res.json()); toast.success(`${result?.total || ""} anuncios encontrados`); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Eye size={13} /> Espia de anuncios (Facebook Ad Library - publico y gratis)</p>
        <div className="flex gap-2">
          <input value={input.competitor_name} onChange={e => setInput({ ...input, competitor_name: e.target.value })} placeholder="Nombre del competidor o marca" className="flex-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <select value={input.country} onChange={e => setInput({ ...input, country: e.target.value })} className="bg-secondary border border-border px-3 py-2 text-sm"><option value="ES">Espana</option><option value="US">USA</option><option value="FR">Francia</option><option value="DE">Alemania</option><option value="GB">UK</option><option value="IT">Italia</option><option value="MX">Mexico</option></select>
          <button onClick={run} disabled={busy} className="px-4 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Espiar</button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">// Legal y etico: Facebook Ad Library es publico. Ver que anuncios corren tus competidores.</p>
      </div>
      {result?.ads?.map((ad, i) => (
        <div key={i} data-testid={`ad-${i}`} className="border border-border bg-card p-3">
          {ad.title && <p className="text-sm font-medium">{ad.title}</p>}
          {ad.body && <p className="text-xs text-muted-foreground mt-1">{ad.body.slice(0, 200)}</p>}
          {ad.page_name && <p className="font-mono text-[10px] text-accent mt-1">{ad.page_name} · {ad.start_date}</p>}
          {ad.url && <a href={ad.url} target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline">Ver anuncio</a>}
        </div>
      ))}
    </div>
  );
};

// ====== LTV ======
const LTVTool = () => {
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try { const res = await fetch(`${API}/tools/customer-ltv`); if (res.ok) setResult(await res.json()); else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><DollarSign size={13} /> Customer LTV real (Shopify)</p>
        <button onClick={run} disabled={busy} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />} Calcular</button>
      </div>
      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
            <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">LTV</p><p className="font-mono text-lg text-accent">${result.ltv}</p></div>
            <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">AOV</p><p className="font-mono text-lg text-primary">${result.avg_order_value}</p></div>
            <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Repeat %</p><p className="font-mono text-lg text-emerald-400">{result.repeat_rate}%</p></div>
            <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Clientes</p><p className="font-mono text-lg text-foreground">{result.total_customers}</p></div>
          </div>
          {result.top_customers?.length > 0 && (
            <div className="border border-border bg-card"><div className="px-3 py-2 border-b border-border text-[10px] uppercase text-muted-foreground">Top clientes (VIP)</div>{result.top_customers.map((c, i) => <div key={i} className="px-3 py-2 flex items-center justify-between border-b border-border/40"><span className="text-xs">{c.name || c.email}</span><span className="font-mono text-xs text-accent">${c.total_spent} ({c.orders} pedidos)</span></div>)}</div>
          )}
        </>
      )}
    </div>
  );
};

// ====== BUNDLES ======
const BundleTool = () => {
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try { const res = await fetch(`${API}/tools/bundle-generator`); if (res.ok) setResult(await res.json()); else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Package size={13} /> Generador de bundles rentables (productos reales Shopify)</p>
        <button onClick={run} disabled={busy} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <Package size={14} />} Generar</button>
      </div>
      {result?.bundles?.map((b, i) => (
        <div key={i} data-testid={`bundle-${i}`} className="border border-border bg-card p-3">
          <p className="text-xs font-medium">{b.product_1} + {b.product_2}</p>
          <div className="grid grid-cols-4 gap-px bg-border border border-border mt-2">
            <div className="bg-secondary px-2 py-1 text-center"><p className="text-[8px] text-muted-foreground uppercase">Individual</p><p className="font-mono text-xs">${b.individual_total}</p></div>
            <div className="bg-secondary px-2 py-1 text-center"><p className="text-[8px] text-muted-foreground uppercase">Bundle</p><p className="font-mono text-xs text-primary">${b.bundle_price}</p></div>
            <div className="bg-secondary px-2 py-1 text-center"><p className="text-[8px] text-muted-foreground uppercase">Ahorro</p><p className="font-mono text-xs text-emerald-400">${b.customer_savings}</p></div>
            <div className="bg-secondary px-2 py-1 text-center"><p className="text-[8px] text-muted-foreground uppercase">Margen</p><p className="font-mono text-xs text-accent">${b.estimated_margin}</p></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ====== AD CREATIVE ======
const AdCreativeTool = () => {
  const [input, setInput] = useState({ product_name: "", product_description: "", price: "", platform: "facebook" });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (!input.product_name.trim() || busy) return;
    setBusy(true);
    try { const res = await fetch(`${API}/tools/ad-creative`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      if (res.ok) { setResult(await res.json()); toast.success("Creatividad generada"); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Zap size={13} /> Generador de creatividades de ads (copy + imagen + video)</p>
        <input value={input.product_name} onChange={e => setInput({ ...input, product_name: e.target.value })} placeholder="Producto" className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        <textarea value={input.product_description} onChange={e => setInput({ ...input, product_description: e.target.value })} placeholder="Descripcion" rows={2} className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        <div className="grid grid-cols-2 gap-3">
          <input value={input.price} onChange={e => setInput({ ...input, price: e.target.value })} placeholder="Precio" className="bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
          <select value={input.platform} onChange={e => setInput({ ...input, platform: e.target.value })} className="bg-secondary border border-border px-3 py-2 text-sm"><option value="facebook">Facebook</option><option value="tiktok">TikTok</option><option value="instagram">Instagram</option><option value="google">Google</option></select>
        </div>
        <button onClick={run} disabled={busy || !input.product_name.trim()} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />} Generar</button>
      </div>
      {result && (
        <div className="space-y-2">
          {result.primary_text && <div className="border border-border bg-card p-3"><p className="text-[10px] uppercase text-muted-foreground">Primary text</p><p className="text-xs mt-1">{result.primary_text}</p></div>}
          {result.headline && <div className="border border-border bg-card p-3"><p className="text-[10px] uppercase text-muted-foreground">Headline</p><p className="text-xs mt-1 font-medium">{result.headline}</p></div>}
          {result.image_prompt && <div className="border border-border bg-card p-3"><p className="text-[10px] uppercase text-muted-foreground">Prompt para imagen IA</p><p className="text-xs mt-1 font-mono text-accent">{result.image_prompt}</p></div>}
          {result.video_script && <div className="border border-border bg-card p-3"><p className="text-[10px] uppercase text-muted-foreground">Guion video</p><p className="text-xs mt-1">{result.video_script}</p></div>}
          {result.targeting_suggestions && <div className="border border-border bg-card p-3"><p className="text-[10px] uppercase text-muted-foreground">Targeting</p>{result.targeting_suggestions.map((t, i) => <p key={i} className="text-xs text-primary">{t}</p>)}</div>}
        </div>
      )}
    </div>
  );
};

// ====== FORECAST ======
const ForecastTool = () => {
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try { const res = await fetch(`${API}/tools/revenue-forecast`); if (res.ok) setResult(await res.json()); else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><BarChart3 size={13} /> Forecast de revenue real (basado en datos Shopify)</p>
        <button onClick={run} disabled={busy} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <BarChart3 size={14} />} Calcular</button>
      </div>
      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-px bg-border border border-border">
            <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Media diaria</p><p className="font-mono text-lg text-primary">${result.avg_daily_revenue}</p></div>
            <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Mejor dia</p><p className="font-mono text-lg text-emerald-400">${result.max_daily_revenue}</p></div>
            <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Tendencia</p><p className={`font-mono text-sm mt-1 ${result.trend === "creciendo" ? "text-emerald-400" : "text-muted-foreground"}`}>{result.trend}</p></div>
          </div>
          <div className="border border-border bg-card p-3"><p className="text-[10px] uppercase text-muted-foreground mb-2">Proyecciones</p>{Object.entries(result.projections).map(([k, v]) => <div key={k} className="flex justify-between text-xs"><span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</span><span className="font-mono text-accent">${v}</span></div>)}</div>
          <div className="border border-border bg-card p-3"><p className="text-[10px] uppercase text-muted-foreground mb-2">Escenarios de crecimiento</p>{Object.entries(result.growth_scenarios).map(([k, v]) => <div key={k} className="flex justify-between text-xs"><span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</span><span className="font-mono text-primary">${v}</span></div>)}</div>
          <div className="border border-accent/30 bg-accent/5 p-3"><p className="text-xs text-accent">{result.recommendation}</p></div>
        </div>
      )}
    </div>
  );
};

// ====== WIN-BACK ======
const WinBackTool = () => {
  const [input, setInput] = useState({ days_inactive: 30, discount_percent: 15 });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try { const res = await fetch(`${API}/tools/win-back`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      if (res.ok) { setResult(await res.json()); toast.success(`${(await res.json()).inactive_customers || ""} clientes inactivos`); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Target size={13} /> Win-back de clientes inactivos (reales de Shopify)</p>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[10px] uppercase text-muted-foreground">Dias inactivo</label><input type="number" value={input.days_inactive} onChange={e => setInput({ ...input, days_inactive: parseInt(e.target.value) || 30 })} className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" /></div>
          <div><label className="text-[10px] uppercase text-muted-foreground">Descuento %</label><input type="number" value={input.discount_percent} onChange={e => setInput({ ...input, discount_percent: parseFloat(e.target.value) || 15 })} className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" /></div>
        </div>
        <button onClick={run} disabled={busy} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <Target size={14} />} Buscar inactivos</button>
      </div>
      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-px bg-border border border-border">
            <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Inactivos</p><p className="font-mono text-lg text-accent">{result.inactive_customers}</p></div>
            <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Revenue perdido</p><p className="font-mono text-lg text-destructive">${result.potential_revenue}</p></div>
          </div>
          {result.email_template && <div className="border border-border bg-card p-3"><p className="text-[10px] uppercase text-muted-foreground">Email win-back generado</p><p className="text-xs font-medium mt-1">{result.email_template.subject}</p><p className="text-xs text-muted-foreground mt-1">{result.email_template.body?.slice(0, 200)}</p></div>}
          {result.customers?.slice(0, 10).map((c, i) => <div key={i} className="border border-border bg-card p-2 flex items-center justify-between"><span className="text-xs">{c.name || c.email}</span><span className="font-mono text-xs text-muted-foreground">{c.days_since_signup} dias · ${c.total_spent}</span></div>)}
        </div>
      )}
    </div>
  );
};

// ====== COMPETITOR FULL ANALYSIS ======
const CompetitorFullTool = () => {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (!url.trim() || busy) return;
    setBusy(true);
    try { const res = await fetch(`${API}/tools/competitor-analysis`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
      if (res.ok) { setResult(await res.json()); toast.success("Analisis completo"); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Eye size={13} /> Analizador completo de tienda competidora</p>
        <div className="flex gap-2">
          <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && run()} placeholder="https://tienda-competidora.com" className="flex-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <button onClick={run} disabled={busy || !url.trim()} className="px-4 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Analizar</button>
        </div>
      </div>
      {result?.sections?.products && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
          <div className="bg-card px-3 py-2 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Productos</p><p className="font-mono text-sm text-primary">{result.sections.products.total_products}</p></div>
          <div className="bg-card px-3 py-2 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Precio medio</p><p className="font-mono text-sm text-accent">${result.sections.products.avg_price}</p></div>
          <div className="bg-card px-3 py-2 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">En oferta</p><p className="font-mono text-sm text-emerald-400">{result.sections.products.products_on_sale}</p></div>
          <div className="bg-card px-3 py-2 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Tema</p><p className="font-mono text-sm text-foreground">{result.sections.store_info?.theme || "?"}</p></div>
        </div>
      )}
      {result?.sections?.store_info?.apps_detected?.length > 0 && (
        <div className="border border-border bg-card p-3"><p className="text-[10px] uppercase text-muted-foreground mb-1">Apps detectadas</p>{result.sections.store_info.apps_detected.map((a, i) => <span key={i} className="text-[10px] border border-border bg-secondary px-1.5 py-0.5 mr-1">{a}</span>)}</div>
      )}
      {result?.sections?.store_info?.social_media && Object.keys(result.sections.store_info.social_media).length > 0 && (
        <div className="border border-border bg-card p-3"><p className="text-[10px] uppercase text-muted-foreground mb-1">Redes sociales</p>{Object.entries(result.sections.store_info.social_media).map(([k, v]) => <a key={k} href={v} target="_blank" rel="noreferrer" className="text-[11px] text-primary mr-2">{k}</a>)}</div>
      )}
      {result?.sections?.strategy?.strengths && (
        <div className="space-y-2">
          {result.sections.strategy.strengths?.length > 0 && <div className="border border-emerald-500/30 bg-emerald-500/5 p-3"><p className="text-[10px] uppercase text-emerald-400 mb-1">Fortalezas</p>{result.sections.strategy.strengths.map((s, i) => <p key={i} className="text-xs text-emerald-400">+ {s}</p>)}</div>}
          {result.sections.strategy.weaknesses?.length > 0 && <div className="border border-destructive/30 bg-destructive/5 p-3"><p className="text-[10px] uppercase text-destructive mb-1">Debilidades</p>{result.sections.strategy.weaknesses.map((s, i) => <p key={i} className="text-xs text-destructive">- {s}</p>)}</div>}
          {result.sections.strategy.replication_plan?.length > 0 && <div className="border border-border bg-card p-3"><p className="text-[10px] uppercase text-accent mb-1">Plan de replicacion</p>{result.sections.strategy.replication_plan.map((s, i) => <p key={i} className="text-xs">{i+1}. {s}</p>)}</div>}
        </div>
      )}
    </div>
  );
};

// ====== FUNNEL ======
const FunnelTool = () => {
  const [input, setInput] = useState({ product_name: "", product_price: "", target_audience: "" });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (!input.product_name.trim() || busy) return;
    setBusy(true);
    try { const res = await fetch(`${API}/tools/sales-funnel`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      if (res.ok) { setResult(await res.json()); toast.success("Embudo generado"); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><TrendingUp size={13} /> Generador de embudo de venta</p>
        <input value={input.product_name} onChange={e => setInput({ ...input, product_name: e.target.value })} placeholder="Producto" className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        <div className="grid grid-cols-2 gap-3">
          <input value={input.product_price} onChange={e => setInput({ ...input, product_price: e.target.value })} placeholder="Precio" className="bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
          <input value={input.target_audience} onChange={e => setInput({ ...input, target_audience: e.target.value })} placeholder="Audiencia objetivo" className="bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <button onClick={run} disabled={busy || !input.product_name.trim()} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />} Generar</button>
      </div>
      {result && (
        <div className="space-y-2">
          <div className="border border-border bg-card p-3"><p className="text-xs font-bold">{result.funnel_name}</p></div>
          {result.stages?.map((s, i) => <div key={i} className="border border-border bg-card p-3"><p className="text-xs font-medium text-primary">{s.name}</p><p className="text-[11px] text-muted-foreground mt-0.5">{s.description}</p><p className="font-mono text-[10px] text-accent mt-1">Conv est: {s.conversion_rate_est} · Tools: {s.tools?.join(", ")}</p></div>)}
          {result.traffic_sources && <div className="border border-border bg-card p-3"><p className="text-[10px] uppercase text-muted-foreground">Fuentes de trafico</p>{result.traffic_sources.map((t, i) => <p key={i} className="text-xs">→ {t}</p>)}</div>}
          {result.estimated_cac && <div className="grid grid-cols-3 gap-px bg-border border border-border"><div className="bg-card px-3 py-2 text-center"><p className="text-[9px] text-muted-foreground uppercase">CAC</p><p className="font-mono text-sm text-destructive">{result.estimated_cac}</p></div><div className="bg-card px-3 py-2 text-center"><p className="text-[9px] text-muted-foreground uppercase">LTV</p><p className="font-mono text-sm text-accent">{result.estimated_ltv}</p></div><div className="bg-card px-3 py-2 text-center"><p className="text-[9px] text-muted-foreground uppercase">Breakeven</p><p className="font-mono text-sm text-primary">{result.break_even_point}</p></div></div>}
        </div>
      )}
    </div>
  );
};

// ====== CONVERSION ======
const ConversionTool = () => {
  const [input, setInput] = useState({ visitors: 1000, orders: 25, revenue: 750, ad_spend: 200 });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try { const res = await fetch(`${API}/tools/conversion-rate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      if (res.ok) setResult(await res.json());
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Percent size={13} /> Calculadora de conversion real</p>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-[10px] uppercase text-muted-foreground">Visitantes</label><input type="number" value={input.visitors} onChange={e => setInput({ ...input, visitors: parseInt(e.target.value) || 0 })} className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" /></div>
          <div><label className="text-[10px] uppercase text-muted-foreground">Pedidos</label><input type="number" value={input.orders} onChange={e => setInput({ ...input, orders: parseInt(e.target.value) || 0 })} className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" /></div>
          <div><label className="text-[10px] uppercase text-muted-foreground">Revenue</label><input type="number" value={input.revenue} onChange={e => setInput({ ...input, revenue: parseFloat(e.target.value) || 0 })} className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" /></div>
          <div><label className="text-[10px] uppercase text-muted-foreground">Ad spend</label><input type="number" value={input.ad_spend} onChange={e => setInput({ ...input, ad_spend: parseFloat(e.target.value) || 0 })} className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" /></div>
        </div>
        <button onClick={run} disabled={busy} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <Percent size={14} />} Calcular</button>
      </div>
      {result && (
        <div className="space-y-3">
          <div className={`border p-4 ${result.status === "EXCELENTE" ? "border-emerald-500/40 bg-emerald-500/10" : result.status === "BUENO" ? "border-primary/40 bg-primary/10" : "border-destructive/40 bg-destructive/10"}`}>
            <p className={`text-2xl font-mono ${result.status === "EXCELENTE" ? "text-emerald-400" : result.status === "BUENO" ? "text-primary" : "text-destructive"}`}>{result.conversion_rate}%</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{result.status}</p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-border border border-border">
            <div className="bg-card px-3 py-2"><span className="text-[10px] text-muted-foreground">AOV: </span><span className="font-mono text-sm text-accent">${result.avg_order_value}</span></div>
            <div className="bg-card px-3 py-2"><span className="text-[10px] text-muted-foreground">CPA: </span><span className="font-mono text-sm text-destructive">${result.cost_per_acquisition}</span></div>
            <div className="bg-card px-3 py-2"><span className="text-[10px] text-muted-foreground">CPC: </span><span className="font-mono text-sm">${result.cost_per_click}</span></div>
            <div className="bg-card px-3 py-2"><span className="text-[10px] text-muted-foreground">ROAS: </span><span className={`font-mono text-sm ${result.profitable ? "text-emerald-400" : "text-destructive"}`}>{result.roas}x</span></div>
          </div>
          {result.recommendations?.map((r, i) => <p key={i} className="text-xs text-accent border border-accent/30 bg-accent/5 p-2">→ {r}</p>)}
        </div>
      )}
    </div>
  );
};

// ====== VIDEO SCRIPT ======
const VideoScriptTool = () => {
  const [input, setInput] = useState({ product_name: "", product_description: "", platform: "tiktok" });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (!input.product_name.trim() || busy) return;
    setBusy(true);
    try { const res = await fetch(`${API}/tools/video-script`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      if (res.ok) { setResult(await res.json()); toast.success("Guion generado"); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Video size={13} /> Guion de video viral para producto</p>
        <input value={input.product_name} onChange={e => setInput({ ...input, product_name: e.target.value })} placeholder="Producto" className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        <textarea value={input.product_description} onChange={e => setInput({ ...input, product_description: e.target.value })} placeholder="Descripcion" rows={2} className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        <select value={input.platform} onChange={e => setInput({ ...input, platform: e.target.value })} className="bg-secondary border border-border px-3 py-2 text-sm"><option value="tiktok">TikTok</option><option value="reels">Instagram Reels</option><option value="shorts">YouTube Shorts</option></select>
        <button onClick={run} disabled={busy || !input.product_name.trim()} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <Video size={14} />} Generar</button>
      </div>
      {result && (
        <div className="space-y-2">
          {result.hook_0_3s && <div className="border border-accent/40 bg-accent/5 p-3"><p className="text-[10px] uppercase text-accent">Hook (0-3s)</p><p className="text-xs mt-1 font-medium">{result.hook_0_3s}</p></div>}
          {result.problem_3_10s && <div className="border border-border bg-card p-3"><p className="text-[10px] uppercase text-muted-foreground">Problema (3-10s)</p><p className="text-xs mt-1">{result.problem_3_10s}</p></div>}
          {result.solution_10_20s && <div className="border border-border bg-card p-3"><p className="text-[10px] uppercase text-muted-foreground">Solucion (10-20s)</p><p className="text-xs mt-1">{result.solution_10_20s}</p></div>}
          {result.proof_20_30s && <div className="border border-border bg-card p-3"><p className="text-[10px] uppercase text-muted-foreground">Prueba (20-30s)</p><p className="text-xs mt-1">{result.proof_20_30s}</p></div>}
          {result.cta_30_35s && <div className="border border-primary/40 bg-primary/5 p-3"><p className="text-[10px] uppercase text-primary">CTA (30-35s)</p><p className="text-xs mt-1">{result.cta_30_35s}</p></div>}
          {result.text_overlay && <div className="border border-border bg-card p-3"><p className="text-[10px] uppercase text-muted-foreground">Textos overlay</p>{result.text_overlay.map((t, i) => <p key={i} className="text-xs text-accent">"{t}"</p>)}</div>}
          {result.hashtags && <div className="flex flex-wrap gap-1.5">{result.hashtags.map((h, i) => <span key={i} className="text-[11px] text-primary border border-primary/30 px-1.5 py-0.5">{h}</span>)}</div>}
          {result.music_suggestion && <p className="font-mono text-[10px] text-muted-foreground">Musica: {result.music_suggestion} · Hora: {result.best_posting_time}</p>}
        </div>
      )}
    </div>
  );
};

// ====== DAILY PROFIT ======
const DailyProfitTool = () => {
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try { const res = await fetch(`${API}/tools/daily-profit`); if (res.ok) setResult(await res.json()); else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };
  return (
    <div className="space-y-4">
      <div className="border border-border bg-card p-4 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><DollarSign size={13} /> Beneficio diario real (ultimos 7 dias)</p>
        <button onClick={run} disabled={busy} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />} Cargar</button>
      </div>
      {result && (
        <>
          <div className="border border-border bg-card p-4 text-center">
            <p className="font-mono text-[10px] text-muted-foreground uppercase">Revenue semana</p>
            <p className="font-mono text-2xl text-accent">${result.total_week_revenue}</p>
          </div>
          {Object.entries(result.daily).map(([date, d]) => (
            <div key={date} data-testid={`profit-day-${date}`} className="border border-border bg-card p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">{date}</span>
                <span className="font-mono text-sm text-accent">${d.revenue} ({d.orders} pedidos)</span>
              </div>
              <div className="grid grid-cols-3 gap-px bg-border border border-border">
                <div className="bg-secondary px-2 py-1 text-center"><p className="text-[8px] text-muted-foreground uppercase">AOV</p><p className="font-mono text-xs">${d.avg_order}</p></div>
                <div className="bg-secondary px-2 py-1 text-center"><p className="text-[8px] text-muted-foreground uppercase">Benef est.</p><p className="font-mono text-xs text-emerald-400">${d.estimated_profit}</p></div>
                <div className="bg-secondary px-2 py-1 text-center"><p className="text-[8px] text-muted-foreground uppercase">Neto</p><p className="font-mono text-xs text-primary">${d.net_profit}</p></div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};
