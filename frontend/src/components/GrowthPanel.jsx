import { useState, useEffect } from "react";
import { Loader2, Zap, TrendingUp, Gift, Mail, Box, Users, Image as ImageIcon, Globe, DollarSign, Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const GrowthPanel = () => {
  const [busy, setBusy] = useState("");
  const [data, setData] = useState({});
  const [analysis, setAnalysis] = useState(null);
  const [connectors, setConnectors] = useState(null);

  const call = async (endpoint, key, method = "GET", body = null) => {
    setBusy(key);
    try {
      const opts = { method };
      if (body) { opts.headers = { "Content-Type": "application/json" }; opts.body = JSON.stringify(body); }
      const res = await fetch(`${API}/${endpoint}`, opts);
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
    } catch { toast.error("Error de conexion"); }
    setBusy("");
  };

  useEffect(() => {
    const load = async () => {
      try {
        const r1 = await fetch(`${API}/growth/analysis`); setAnalysis(await r1.json());
        const r2 = await fetch(`${API}/connectors/all-available`); setConnectors(await r2.json());
      } catch {}
    };
    load();
  }, []);

  const Btn = ({ id, label, endpoint, method, body, icon: Icon }) => (
    <button onClick={() => call(endpoint, id, method, body)} disabled={busy === id}
      className="px-3 py-2 bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-40 flex items-center justify-center gap-1.5 w-full">
      {busy === id ? <Loader2 size={12} className="animate-spin" /> : Icon ? <Icon size={12} /> : <Zap size={12} />} {label}
    </button>
  );

  return (
    <div data-testid="growth-panel" className="space-y-4">
      {/* HEADER */}
      <div className="border border-emerald-500/40 bg-emerald-500/5 p-4">
        <h2 className="text-base font-bold flex items-center gap-2"><TrendingUp size={18} className="text-emerald-400" /> Growth — Crecimiento Gratis y Rentable</h2>
        <p className="text-xs text-muted-foreground">Analiza el sistema, identifica oportunidades reales y ejecuta todo de golpe. Todo gratis.</p>
      </div>

      {/* GROWTH ANALYSIS */}
      {analysis && (
        <div className="border border-border bg-card p-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold flex items-center gap-1.5"><Sparkles size={12} className="text-amber-400" /> Analisis de Crecimiento</p>
            <p className="text-sm font-mono text-emerald-400">+${analysis.profit_estimate}/dia estimado</p>
          </div>

          {/* OPPORTUNITIES */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Oportunidades detectadas</p>
            {(analysis.opportunities || []).map((opp, i) => (
              <div key={i} className="border border-border/40 p-2 flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-xs font-medium">{opp.opportunity}</p>
                  <p className="text-[10px] text-muted-foreground">{opp.action}</p>
                </div>
                <p className="text-xs font-mono text-emerald-400 ml-2">+${opp.potential}/dia</p>
              </div>
            ))}
          </div>

          {/* CONNECTORS TO ADD */}
          {(analysis.connectors_to_add || []).length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Conectores gratis disponibles</p>
              {analysis.connectors_to_add.map((c, i) => (
                <div key={i} className="flex items-center justify-between border border-border/40 p-2">
                  <div>
                    <p className="text-xs font-medium flex items-center gap-1">
                      {c.name}
                      <span className={`text-[9px] px-1.5 py-0.5 ${c.impact === "alto" ? "bg-red-500/10 text-red-400" : c.impact === "medio" ? "bg-amber-500/10 text-amber-400" : "bg-muted text-muted-foreground"}`}>
                        {c.impact}
                      </span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">{c.benefit}</p>
                  </div>
                  <a href={`https://${c.setup}`} target="_blank" rel="noopener" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                    Conectar <ExternalLink size={9} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EXECUTE ALL */}
      <div className="border border-purple-500/40 bg-purple-500/5 p-3">
        <p className="text-xs font-bold mb-2 flex items-center gap-1.5"><Zap size={12} className="text-purple-400" /> Ejecutar TODO de golpe</p>
        <Btn id="execute_all" label="Ejecutar todas las oportunidades de crecimiento" endpoint="growth/execute-all" method="POST" icon={Zap} />
        {data.execute_all && (
          <div className="mt-2 space-y-1">
            <p className="text-[10px] text-emerald-400">{data.execute_all.voice_message}</p>
            {(data.execute_all.results || []).map((r, i) => (
              <div key={i} className="flex justify-between text-[10px] border border-border/40 px-2 py-1">
                <span>{r.action}</span>
                <span className={r.status === "ok" ? "text-emerald-400" : "text-destructive"}>
                  {r.status === "ok" ? `✓ ${r.result}` : "✗ error"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DROPSHIPPING */}
      <div className="border border-border bg-card p-3 space-y-2">
        <p className="text-xs font-bold flex items-center gap-1.5"><Box size={12} className="text-blue-400" /> Dropshipping Gratis (sin inventario)</p>
        <div className="grid grid-cols-2 gap-2">
          <Btn id="printify" label="Printify" endpoint="dropshipping/printify-products" method="POST" icon={Box} />
          <Btn id="printful" label="Printful" endpoint="dropshipping/printful-products" method="POST" icon={Box} />
          <Btn id="cj" label="CJ Dropshipping" endpoint="dropshipping/cj-products" icon={Box} />
          <Btn id="ali_drop" label="AliExpress Trending" endpoint="dropshipping/aliexpress-trending" icon={Box} />
        </div>
        {data.printify && data.printify.products && (
          <p className="text-[10px] text-emerald-400">Printify: {data.printify.total} productos disponibles</p>
        )}
        {data.printful && data.printful.products && (
          <p className="text-[10px] text-emerald-400">Printful: {data.printful.total} productos disponibles</p>
        )}
        {data.cj && data.cj.products && (
          <p className="text-[10px] text-emerald-400">CJ: {data.cj.products.length} productos encontrados</p>
        )}
      </div>

      {/* PINTEREST */}
      <div className="border border-border bg-card p-3 space-y-2">
        <p className="text-xs font-bold flex items-center gap-1.5"><Globe size={12} className="text-red-400" /> Pinterest (trafico masivo gratis)</p>
        <div className="grid grid-cols-1 gap-2">
          <Btn id="pins" label="Auto-generar pins para todos los productos" endpoint="pinterest/auto-pins" method="POST" icon={Globe} />
        </div>
        {data.pins && <p className="text-[10px] text-muted-foreground">{data.pins.message}</p>}
      </div>

      {/* LINKEDIN + TUMBLR */}
      <div className="border border-border bg-card p-3 space-y-2">
        <p className="text-xs font-bold flex items-center gap-1.5"><Users size={12} className="text-blue-400" /> Redes profesionales</p>
        <div className="grid grid-cols-2 gap-2">
          <Btn id="linkedin" label="LinkedIn Post" endpoint="linkedin/post?text=Hola red profesional! Tenemos productos nuevos." method="POST" icon={Users} />
          <Btn id="tumblr" label="Tumblr Post" endpoint="tumblr/post?title=Nuevo producto&body=Descubre nuestro nuevo producto&tags=shop" method="POST" icon={Users} />
        </div>
      </div>

      {/* EMAIL RECOVERY */}
      <div className="border border-border bg-card p-3 space-y-2">
        <p className="text-xs font-bold flex items-center gap-1.5"><Mail size={12} className="text-amber-400" /> Recuperacion de Carritos + Email Masivo</p>
        <div className="grid grid-cols-2 gap-2">
          <Btn id="recover" label="Recuperar carritos" endpoint="email/auto-recover-all" method="POST" icon={Mail} />
          <Btn id="brevo" label="Email masivo (Brevo)" endpoint="email/brevo-bulk?subject=Oferta especial&html=<h1>Oferta!</h1><p>Descubre nuestros productos</p>" method="POST" icon={Mail} />
        </div>
        {data.recover && <p className="text-[10px] text-emerald-400">{data.recover.message}</p>}
        {data.brevo && <p className="text-[10px] text-emerald-400">{data.brevo.sent || 0} emails enviados</p>}
      </div>

      {/* DYNAMIC PRICING */}
      <div className="border border-border bg-card p-3 space-y-2">
        <p className="text-xs font-bold flex items-center gap-1.5"><DollarSign size={12} className="text-emerald-400" /> Pricing Dinamico AI</p>
        <Btn id="dynamic" label="Optimizar precios dinamicamente (stock + ventas + tendencia)" endpoint="pricing/dynamic" method="POST" icon={DollarSign} />
        {data.dynamic && (data.dynamic.changes || []).slice(0, 5).map((c, i) => (
          <div key={i} className="flex justify-between text-[10px] border border-border/40 px-2 py-1">
            <span>{c.product}</span>
            <span className="font-mono">${c.old} → ${c.new}</span>
            <span className="text-muted-foreground text-[9px]">{c.reason}</span>
          </div>
        ))}
      </div>

      {/* BUNDLES */}
      <div className="border border-border bg-card p-3 space-y-2">
        <p className="text-xs font-bold flex items-center gap-1.5"><Gift size={12} className="text-purple-400" /> Bundles AI (comprados juntos)</p>
        <Btn id="bundles" label="Crear bundles automaticos con 10% descuento" endpoint="bundles/auto-create" method="POST" icon={Gift} />
        {data.bundles && (data.bundles.bundles || []).map((b, i) => (
          <div key={i} className="border border-border/40 p-2 text-[10px]">
            <p className="font-medium">{b.products.join(" + ")}</p>
            <p className="text-muted-foreground">${b.individual_price} → <span className="text-emerald-400">${b.bundle_price} ({b.discount})</span> · {b.times_bought_together}x juntos</p>
          </div>
        ))}
      </div>

      {/* AFFILIATES */}
      <div className="border border-border bg-card p-3 space-y-2">
        <p className="text-xs font-bold flex items-center gap-1.5"><Users size={12} className="text-primary" /> Programa de Afiliados</p>
        <div className="flex gap-2">
          <input id="aff-name" placeholder="Nombre afiliado" className="flex-1 border border-border px-2 py-1.5 text-xs" />
          <input id="aff-email" placeholder="Email" className="flex-1 border border-border px-2 py-1.5 text-xs" />
          <button onClick={() => {
            const n = document.getElementById("aff-name").value;
            const e = document.getElementById("aff-email").value;
            if (n && e) call(`affiliate/create?name=${n}&email=${e}`, "aff_create", "POST");
          }} disabled={busy === "aff_create"}
            className="px-3 py-1.5 bg-primary text-primary-foreground text-xs disabled:opacity-40">
            Crear
          </button>
        </div>
        <Btn id="aff_list" label="Ver afiliados y rendimiento" endpoint="affiliate/list" icon={Users} />
        {data.aff_create && (
          <p className="text-[10px] text-emerald-400">Afiliado creado: {data.aff_create.code} → {data.aff_create.url}</p>
        )}
        {data.aff_list && (
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground">Total: {data.aff_list.total} afiliados · {data.aff_list.total_sales} ventas · ${data.aff_list.total_commission} comisiones</p>
            {(data.aff_list.affiliates || []).slice(0, 5).map((a, i) => (
              <div key={i} className="flex justify-between text-[10px] border border-border/40 px-2 py-1">
                <span>{a.name} ({a.code})</span>
                <span className="font-mono">{a.clicks} clicks · {a.sales} ventas · ${a.commission}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FREE IMAGE CDN */}
      <div className="border border-border bg-card p-3 space-y-2">
        <p className="text-xs font-bold flex items-center gap-1.5"><ImageIcon size={12} className="text-cyan-400" /> CDN Imagenes Gratis (ImgBB)</p>
        <div className="flex gap-2">
          <input id="imgbb-url" placeholder="URL de imagen a subir a CDN" className="flex-1 border border-border px-2 py-1.5 text-xs" />
          <button onClick={() => {
            const u = document.getElementById("imgbb-url").value;
            if (u) call(`images/upload-free?image_url=${u}`, "imgbb", "POST");
          }} disabled={busy === "imgbb"}
            className="px-3 py-1.5 bg-primary text-primary-foreground text-xs disabled:opacity-40">
            Subir
          </button>
        </div>
        {data.imgbb && data.imgbb.url && (
          <p className="text-[10px] text-emerald-400 break-all">CDN: {data.imgbb.url}</p>
        )}
      </div>

      {/* ALL CONNECTORS STATUS */}
      {connectors && (
        <div className="border border-border bg-card p-3">
          <p className="text-xs font-bold mb-2 flex items-center gap-1.5"><Globe size={12} className="text-primary" /> Estado de Conectores ({connectors.connected}/{connectors.total})</p>
          <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
            {connectors.connectors.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-[10px] border border-border/40 px-2 py-1">
                <div>
                  <span className={c.new ? "text-primary font-medium" : ""}>{c.name} {c.new && "✨"}</span>
                  <span className="text-[8px] text-muted-foreground block">{c.benefit}</span>
                </div>
                <span className={c.status === "connected" ? "text-emerald-400" : "text-muted-foreground"}>
                  {c.status === "connected" ? "✓" : "✗"}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground mt-2">{connectors.free} de {connectors.total} son 100% gratis · {connectors.missing} sin conectar</p>
        </div>
      )}

      {/* FREE APIs AVAILABLE */}
      {analysis && (
        <div className="border border-border bg-card p-3">
          <p className="text-xs font-bold mb-2 flex items-center gap-1.5"><Sparkles size={12} className="text-amber-400" /> APIs Gratis Disponibles</p>
          <div className="grid grid-cols-2 gap-1">
            {(analysis.free_apis_available || []).map((api, i) => (
              <div key={i} className="border border-border/40 px-2 py-1 text-[10px]">
                <p className="font-medium">{api.name}</p>
                <p className="text-muted-foreground text-[9px]">{api.benefit} · {api.cost}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
