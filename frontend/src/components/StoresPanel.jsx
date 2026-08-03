import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Copy, Trash2, Sparkles, Globe, Eye, Plus, Package, Link2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const StoresPanel = () => {
  const [tab, setTab] = useState("analyze");
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyses, setAnalyses] = useState([]);
  const [replicating, setReplicating] = useState(null);
  const [blueprints, setBlueprints] = useState({});

  const loadAnalyses = useCallback(() => {
    fetch(`${API}/stores/analyses`)
      .then((r) => r.json())
      .then(setAnalyses)
      .catch(() => {});
  }, []);

  useEffect(() => { loadAnalyses(); }, [loadAnalyses]);

  const analyze = async () => {
    if (!url.trim() || analyzing) return;
    setAnalyzing(true);
    try {
      const res = await fetch(`${API}/stores/analyze`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success("Scraping real completado");
      setUrl("");
      loadAnalyses();
    } catch {
      toast.error("Error analizando la tienda");
    }
    setAnalyzing(false);
  };

  const replicate = async (id) => {
    setReplicating(id);
    try {
      const res = await fetch(`${API}/stores/replicate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis_id: id }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBlueprints({ ...blueprints, [id]: data });
      toast.success("Blueprint de replicacion generado");
    } catch {
      toast.error("Error generando blueprint");
    }
    setReplicating(null);
  };

  const deleteAnalysis = async (id) => {
    await fetch(`${API}/stores/analyses/${id}`, { method: "DELETE" });
    loadAnalyses();
    toast.success("Analisis eliminado");
  };

  return (
    <div data-testid="stores-panel" className="space-y-4">
      <div className="flex gap-1 border border-border bg-card p-1">
        <button
          data-testid="stores-tab-analyze"
          onClick={() => setTab("analyze")}
          className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-colors duration-200 ${tab === "analyze" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Search size={13} /> Analizar tiendas reales
        </button>
        <button
          data-testid="stores-tab-editor"
          onClick={() => setTab("editor")}
          className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-colors duration-200 ${tab === "editor" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Plus size={13} /> Editor de tiendas
        </button>
      </div>

      {tab === "analyze" && (
        <>
          <div className="border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
              <Globe size={13} className="text-primary" /> Analiza tiendas Shopify reales (scraping real)
            </p>
            <div className="flex gap-2">
              <input
                data-testid="store-url-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyze()}
                placeholder="https://tienda-ejemplo.com o mitienda.myshopify.com"
                className="flex-1 bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                data-testid="analyze-btn"
                onClick={analyze}
                disabled={analyzing || !url.trim()}
                className="px-4 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2 glow-cyan"
              >
                {analyzing ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                {analyzing ? "Scrapeando..." : "Analizar"}
              </button>
            </div>
            <p className="mt-2 font-mono text-[10px] text-muted-foreground">// Scraping real: extrae titulo, meta tags, productos reales (via products.json), colecciones, redes sociales detectadas en el HTML</p>
          </div>

          {analyses.length === 0 && (
            <div className="border border-border bg-card p-8 text-center">
              <Eye size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Sin analisis aun. Introduce una URL arriba para empezar.</p>
            </div>
          )}

          {analyses.map((a, i) => {
            const scraped = a.scraped_data || {};
            const analysis = a.analysis || {};
            return (
              <div key={a.id || i} data-testid={`analysis-card-${i}`} className="border border-border bg-card fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye size={14} className="text-primary" />
                    <span className="text-sm font-semibold">{analysis.store_name || scraped.page_title || a.url}</span>
                    {scraped.has_shopify && (
                      <span className="px-1.5 py-0.5 border border-emerald-500/40 text-emerald-400 text-[9px] uppercase tracking-wider font-mono">Shopify detectado</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      data-testid={`replicate-btn-${i}`}
                      onClick={() => replicate(a.id)}
                      disabled={replicating === a.id}
                      className="px-3 py-1.5 border border-accent/50 text-accent text-[11px] font-semibold hover:bg-accent/10 transition-colors duration-200 flex items-center gap-1.5 disabled:opacity-40"
                    >
                      {replicating === a.id ? <Loader2 size={12} className="animate-spin" /> : <Copy size={12} />}
                      Replicar
                    </button>
                    <button
                      onClick={() => deleteAnalysis(a.id)}
                      className="p-1.5 border border-border text-muted-foreground hover:text-destructive transition-colors duration-200"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {/* Real scraped data */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
                    <div className="bg-secondary px-3 py-2">
                      <p className="text-[9px] text-muted-foreground uppercase">Productos reales</p>
                      <p className="font-mono text-sm text-primary mt-0.5">{scraped.real_product_count || scraped.product_count_hint || 0}</p>
                    </div>
                    <div className="bg-secondary px-3 py-2">
                      <p className="text-[9px] text-muted-foreground uppercase">Moneda</p>
                      <p className="font-mono text-sm text-foreground mt-0.5">{scraped.currency || "No detectada"}</p>
                    </div>
                    <div className="bg-secondary px-3 py-2">
                      <p className="text-[9px] text-muted-foreground uppercase">Colecciones</p>
                      <p className="font-mono text-sm text-foreground mt-0.5">{scraped.real_collections?.length || 0}</p>
                    </div>
                    <div className="bg-secondary px-3 py-2">
                      <p className="text-[9px] text-muted-foreground uppercase">Redes sociales</p>
                      <p className="font-mono text-sm text-accent mt-0.5">{scraped.social_links?.length || 0}</p>
                    </div>
                  </div>

                  {scraped.social_links && scraped.social_links.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Redes detectadas:</span>
                      {scraped.social_links.map((s) => (
                        <span key={s} className="font-mono text-[10px] text-accent border border-accent/30 px-1.5 py-0.5">{s}</span>
                      ))}
                    </div>
                  )}

                  {analysis.niche && (
                    <div className="flex gap-2 text-xs">
                      <span className="text-muted-foreground w-24 shrink-0">Nicho detectado:</span>
                      <span className="text-foreground capitalize">{analysis.niche}</span>
                    </div>
                  )}

                  {analysis.strengths && analysis.strengths.length > 0 && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Fortalezas (datos reales):</span>
                      <ul className="mt-1 ml-4 space-y-0.5">
                        {analysis.strengths.map((s, j) => (
                          <li key={j} className="text-foreground flex items-start gap-1.5">
                            <CheckCircle size={11} className="text-emerald-400 shrink-0 mt-0.5" /> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Debilidades:</span>
                      <ul className="mt-1 ml-4 space-y-0.5">
                        {analysis.weaknesses.map((s, j) => (
                          <li key={j} className="text-muted-foreground">- {s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Real products found via scraping */}
                  {scraped.real_products && scraped.real_products.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                        <Package size={12} className="text-primary" /> Productos reales encontrados ({scraped.real_products.length})
                      </p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {scraped.real_products.slice(0, 10).map((p, j) => (
                          <div key={j} data-testid={`real-product-${j}`} className="flex items-center gap-2 border border-border bg-secondary px-2 py-1.5">
                            <span className="text-[11px] text-foreground flex-1 truncate">{p.title}</span>
                            {p.variants && p.variants.length > 0 && (
                              <span className="font-mono text-[10px] text-accent">${p.variants[0].price}</span>
                            )}
                            {p.product_type && (
                              <span className="font-mono text-[9px] text-muted-foreground">{p.product_type}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Real collections */}
                  {scraped.real_collections && scraped.real_collections.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                        <Link2 size={12} className="text-primary" /> Colecciones reales ({scraped.real_collections.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {scraped.real_collections.map((c, j) => (
                          <span key={j} className="text-[11px] border border-border bg-secondary px-2 py-1">
                            {c.title} <span className="font-mono text-[10px] text-muted-foreground">({c.products_count})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.replication_plan && analysis.replication_plan.length > 0 && (
                    <div className="mt-2 text-xs">
                      <span className="text-muted-foreground">Plan de replicacion:</span>
                      <div className="mt-1 space-y-1">
                        {analysis.replication_plan.map((step, j) => (
                          <div key={j} className="flex gap-2 items-start">
                            <span className="font-mono text-[10px] text-primary shrink-0 mt-0.5">{j + 1}</span>
                            <div>
                              <span className="text-foreground">{step.step || step.detail}</span>
                              <span className="font-mono text-[10px] text-muted-foreground ml-2">[{step.agent_id}]</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {blueprints[a.id] && (
                    <div className="mt-3 border-t border-border pt-3">
                      <p className="text-xs font-semibold text-accent mb-2 flex items-center gap-1.5">
                        <Sparkles size={12} /> Blueprint de replicacion
                      </p>
                      {blueprints[a.id].blueprint?.map((phase, j) => (
                        <div key={j} data-testid={`blueprint-phase-${j}`} className="border border-border bg-secondary p-2 mb-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">{phase.phase}</span>
                            <span className="font-mono text-[10px] text-primary">{phase.agent_id}</span>
                          </div>
                          <p className="font-mono text-[10px] text-muted-foreground mt-1">Timeline: {phase.timeline}</p>
                          <ul className="mt-1 ml-4 space-y-0.5">
                            {phase.tasks?.map((t, k) => <li key={k} className="text-[11px] text-foreground">- {t}</li>)}
                          </ul>
                        </div>
                      ))}
                      {blueprints[a.id].estimated_budget && (
                        <div className="flex gap-4 mt-2 text-xs">
                          <span className="text-muted-foreground">Presupuesto: <span className="text-accent font-mono">{blueprints[a.id].estimated_budget}</span></span>
                          <span className="text-muted-foreground">Revenue est.: <span className="text-primary font-mono">{blueprints[a.id].expected_revenue}</span></span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}

      {tab === "editor" && <StoreEditor />}
    </div>
  );
};

const THEMES = ["dark", "light", "minimal", "luxury", "tech", "vibrant"];
const FONTS = ["Outfit", "Inter", "Poppins", "Roboto", "Montserrat", "IBM Plex Sans"];

const StoreEditor = () => {
  const [stores, setStores] = useState([]);
  const [editing, setEditing] = useState(null);
  const [generating, setGenerating] = useState(false);

  const load = () => {
    fetch(`${API}/stores`).then((r) => r.json()).then(setStores).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const newStore = () => {
    setEditing({
      name: "", niche: "", theme: "dark",
      color_primary: "#00d4ff", color_secondary: "#ffd700",
      font_heading: "Outfit", font_body: "IBM Plex Sans",
      pages: [{ title: "Inicio", sections: ["Hero", "Productos destacados", "Testimonios", "CTA"] }],
    });
  };

  const save = async () => {
    if (!editing.name.trim()) { toast.error("Ponle un nombre a la tienda"); return; }
    try {
      const res = await fetch(`${API}/stores/create`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (!res.ok) throw new Error();
      toast.success("Tienda creada");
      setEditing(null);
      load();
    } catch {
      toast.error("Error al crear la tienda");
    }
  };

  const generateContent = async (id) => {
    setGenerating(true);
    try {
      const res = await fetch(`${API}/stores/${id}/generate-llm`, { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success("Contenido generado por IA");
      load();
    } catch {
      toast.error("Error generando contenido");
    }
    setGenerating(false);
  };

  const deleteStore = async (id) => {
    await fetch(`${API}/stores/${id}`, { method: "DELETE" });
    load();
    toast.success("Tienda eliminada");
  };

  if (editing) {
    return (
      <div data-testid="store-editor-form" className="border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Editor de tienda</p>
          <button onClick={() => setEditing(null)} className="text-[11px] text-muted-foreground hover:text-foreground">Cancelar</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Nombre</label>
            <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="Mi tienda pro" className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Nicho</label>
            <input value={editing.niche} onChange={(e) => setEditing({ ...editing, niche: e.target.value })}
              placeholder="ej: gadgets cocina" className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Tema</label>
            <select value={editing.theme} onChange={(e) => setEditing({ ...editing, theme: e.target.value })}
              className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Color primario</label>
            <div className="flex gap-2 mt-1">
              <input type="color" value={editing.color_primary} onChange={(e) => setEditing({ ...editing, color_primary: e.target.value })}
                className="w-12 h-9 bg-secondary border border-border cursor-pointer" />
              <input value={editing.color_primary} onChange={(e) => setEditing({ ...editing, color_primary: e.target.value })}
                className="flex-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Color secundario</label>
            <div className="flex gap-2 mt-1">
              <input type="color" value={editing.color_secondary} onChange={(e) => setEditing({ ...editing, color_secondary: e.target.value })}
                className="w-12 h-9 bg-secondary border border-border cursor-pointer" />
              <input value={editing.color_secondary} onChange={(e) => setEditing({ ...editing, color_secondary: e.target.value })}
                className="flex-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Fuente titulos</label>
            <select value={editing.font_heading} onChange={(e) => setEditing({ ...editing, font_heading: e.target.value })}
              className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              {FONTS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Fuente cuerpo</label>
            <select value={editing.font_body} onChange={(e) => setEditing({ ...editing, font_body: e.target.value })}
              className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              {FONTS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Paginas</label>
          {editing.pages.map((page, pi) => (
            <div key={pi} data-testid={`editor-page-${pi}`} className="mt-2 border border-border bg-secondary p-2">
              <div className="flex items-center gap-2">
                <input value={page.title} onChange={(e) => {
                  const pages = [...editing.pages]; pages[pi] = { ...page, title: e.target.value };
                  setEditing({ ...editing, pages });
                }} placeholder="Titulo de pagina" className="flex-1 bg-background border border-border px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                <button onClick={() => {
                  const pages = editing.pages.filter((_, j) => j !== pi);
                  setEditing({ ...editing, pages });
                }} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>
              </div>
              <input value={page.sections?.join(", ") || ""} onChange={(e) => {
                const sections = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                const pages = [...editing.pages]; pages[pi] = { ...page, sections };
                setEditing({ ...editing, pages });
              }} placeholder="Secciones separadas por comas: Hero, Productos, CTA" className="w-full mt-1.5 bg-background border border-border px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          ))}
          <button onClick={() => setEditing({ ...editing, pages: [...editing.pages, { title: "", sections: [] }] })}
            data-testid="add-page-btn"
            className="mt-2 flex items-center gap-1.5 text-[11px] text-primary hover:text-primary/80 transition-colors">
            <Plus size={12} /> Anadir pagina
          </button>
        </div>
        <div className="border border-border bg-secondary p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Vista previa</p>
          <div className="border border-border p-4" style={{ background: editing.theme === "dark" ? "#0a0a0f" : "#fff", fontFamily: editing.font_body }}>
            <h3 style={{ color: editing.color_primary, fontFamily: editing.font_heading, fontWeight: 700 }} className="text-lg">
              {editing.name || "Nombre de tu tienda"}
            </h3>
            <p style={{ color: editing.theme === "dark" ? "#999" : "#666" }} className="text-xs mt-1">{editing.niche || "Tu nicho aqui"}</p>
            <div className="flex gap-2 mt-3">
              <span style={{ background: editing.color_primary, color: "#000" }} className="px-3 py-1 text-[10px] font-semibold">Boton primario</span>
              <span style={{ background: editing.color_secondary, color: "#000" }} className="px-3 py-1 text-[10px] font-semibold">Boton sec.</span>
            </div>
          </div>
        </div>
        <button data-testid="save-store-btn" onClick={save}
          className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 glow-cyan">
          <Plus size={15} /> Crear tienda
        </button>
      </div>
    );
  }

  return (
    <div data-testid="store-editor-list" className="space-y-4">
      <div className="border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Editor de tiendas</p>
            <p className="text-[11px] text-muted-foreground mt-1">Crea plantillas de tiendas Shopify con diseno personalizado</p>
          </div>
          <button data-testid="new-store-btn" onClick={newStore}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 glow-cyan">
            <Plus size={15} /> Nueva tienda
          </button>
        </div>
      </div>
      {stores.length === 0 && (
        <div className="border border-border bg-card p-8 text-center">
          <Plus size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Sin tiendas creadas. Crea una nueva arriba.</p>
        </div>
      )}
      {stores.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {stores.map((s, i) => (
            <div key={s.id || i} data-testid={`store-card-${i}`} className="border border-border bg-card p-3 fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: s.color_primary }} />
                  <span className="text-sm font-semibold">{s.name}</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground uppercase">{s.status}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 capitalize">{s.niche} · {s.theme}</p>
              <div className="flex gap-2 mt-1.5">
                <div className="w-4 h-4 border border-border" style={{ background: s.color_primary }} />
                <div className="w-4 h-4 border border-border" style={{ background: s.color_secondary }} />
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground">
                {s.pages?.length || 0} paginas · {s.font_heading}/{s.font_body}
              </div>
              <div className="mt-3 flex gap-1">
                <button data-testid={`generate-content-btn-${i}`} onClick={() => generateContent(s.id)} disabled={generating}
                  className="flex-1 py-1.5 border border-accent/50 text-accent text-[11px] font-semibold hover:bg-accent/10 transition-colors duration-200 flex items-center justify-center gap-1.5 disabled:opacity-40">
                  {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Generar IA
                </button>
                <button onClick={() => deleteStore(s.id)}
                  className="p-1.5 border border-border text-muted-foreground hover:text-destructive transition-colors duration-200">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
