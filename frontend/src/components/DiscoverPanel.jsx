import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Globe, Youtube, MessageCircle, Package, TrendingUp, Sparkles, ArrowRight, ExternalLink, Settings, Map } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const DiscoverPanel = () => {
  const [tab, setTab] = useState("search");
  const [keyword, setKeyword] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState(null);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [redditPosts, setRedditPosts] = useState([]);
  const [productHunt, setProductHunt] = useState([]);
  const [etsyProducts, setEtsyProducts] = useState([]);
  const [trendsData, setTrendsData] = useState(null);
  const [news, setNews] = useState([]);
  const [googleConfig, setGoogleConfig] = useState({ youtube_api_key: "", google_search_key: "", google_search_cx: "" });
  const [showGoogleConfig, setShowGoogleConfig] = useState(false);
  const [unsplashQuery, setUnsplashQuery] = useState("");
  const [unsplashPhotos, setUnsplashPhotos] = useState([]);

  // Load cached data on mount
  useEffect(() => {
    fetch(`${API}/discover/reddit-trending`).then(r => r.json()).then(d => Array.isArray(d) && setRedditPosts(d)).catch(() => {});
    fetch(`${API}/discover/product-hunt`).then(r => r.json()).then(d => Array.isArray(d) && setProductHunt(d)).catch(() => {});
    fetch(`${API}/discover/etsy-trending`).then(r => r.json()).then(d => Array.isArray(d) && setEtsyProducts(d)).catch(() => {});
    fetch(`${API}/discover/news-multi`).then(r => r.json()).then(d => Array.isArray(d) && setNews(d)).catch(() => {});
    fetch(`${API}/google/config`).then(r => r.json()).then(setGoogleConfig).catch(() => {});
  }, []);

  const searchAll = async () => {
    if (!keyword.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/discover/all`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });
      if (!res.ok) throw new Error();
      setResults(await res.json());
    } catch { toast.error("Error en busqueda multi-fuente"); }
    setBusy(false);
  };

  const searchAliexpress = async () => {
    if (!keyword.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/discover/aliexpress`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.detail || "Error"); return; }
      setResults({ keyword, sources: { aliexpress: { count: data.length, data } } });
    } catch { toast.error("Error buscando en AliExpress"); }
    setBusy(false);
  };

  const loadYoutube = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${API}/google/youtube-trending`);
      if (res.ok) { setYoutubeVideos(await res.json()); toast.success("Videos reales de YouTube cargados"); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const loadTrends = async () => {
    if (!keyword.trim()) { toast.error("Pon un keyword"); return; }
    setBusy(true);
    try {
      const res = await fetch(`${API}/discover/trends-analysis?keyword=${encodeURIComponent(keyword)}`);
      if (res.ok) { setTrendsData(await res.json()); toast.success("Trends de Google cargados"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const searchUnsplash = async () => {
    if (!unsplashQuery.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/unsplash/search`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: unsplashQuery, per_page: 6 }),
      });
      if (res.ok) { setUnsplashPhotos(await res.json()); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const saveGoogleConfig = async () => {
    try {
      await fetch(`${API}/google/config`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(googleConfig),
      });
      toast.success("Configuracion de Google guardada");
    } catch { toast.error("Error"); }
  };

  const tabs = [
    { id: "search", label: "Buscar todo", icon: Search },
    { id: "aliexpress", label: "AliExpress", icon: Package },
    { id: "youtube", label: "YouTube", icon: Youtube },
    { id: "trends", label: "Google Trends", icon: TrendingUp },
    { id: "social", label: "Reddit/PH/Etsy", icon: Globe },
    { id: "photos", label: "Fotos", icon: Sparkles },
    { id: "news", label: "Noticias", icon: MessageCircle },
    { id: "config", label: "Config", icon: Settings },
  ];

  return (
    <div data-testid="discover-panel" className="space-y-4">
      <div className="flex gap-1 border border-border bg-card p-1 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} data-testid={`discover-tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors duration-200 ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      {/* SEARCH ALL */}
      {tab === "search" && (
        <div className="space-y-4">
          <div className="border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
              <Sparkles size={13} className="text-accent" /> Busqueda multi-fuente (todas las APIs gratuitas a la vez)
            </p>
            <div className="flex gap-2">
              <input data-testid="discover-keyword" value={keyword} onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && searchAll()}
                placeholder="ej: lampara LED, masajeador, organizador cocina..." className="flex-1 bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <button data-testid="discover-search-btn" onClick={searchAll} disabled={busy || !keyword.trim()}
                className="px-4 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2 glow-cyan">
                {busy ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} Buscar en todo
              </button>
            </div>
            <p className="mt-2 font-mono text-[10px] text-muted-foreground">// Busca en Reddit, AliExpress, Google Trends, Fake Store API y Google Suggest a la vez</p>
          </div>

          {results && (
            <div className="space-y-4">
              {results.sources?.google_suggest?.suggestions?.length > 0 && (
                <div data-testid="google-suggestions" className="border border-border bg-card p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"><TrendingUp size={11} className="text-primary" /> Sugerencias de Google (reales)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {results.sources.google_suggest.suggestions.map((s, i) => (
                      <button key={i} onClick={() => setKeyword(s)} className="text-[11px] border border-border bg-secondary px-2 py-1 hover:border-primary/50 hover:bg-primary/10 transition-colors">{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {results.sources?.aliexpress?.data?.length > 0 && (
                <div data-testid="aliexpress-results" className="border border-border bg-card p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"><Package size={11} className="text-accent" /> AliExpress ({results.sources.aliexpress.count} productos reales)</p>
                  <div className="space-y-2">
                    {results.sources.aliexpress.data.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 border border-border bg-secondary p-2">
                        {p.imagen && <img src={p.imagen} alt="" className="w-12 h-12 object-cover" onError={(e) => e.target.style.display = "none"} />}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs truncate">{p.nombre}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">Coste: ${p.coste_proveedor} · Venta: ${p.precio_venta_estimado} · Margen: {p.margen_estimado}%</p>
                        </div>
                        <a href={p.url} target="_blank" rel="noreferrer" className="text-primary hover:opacity-70 shrink-0"><ExternalLink size={12} /></a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.sources?.reddit?.data?.length > 0 && (
                <div data-testid="reddit-results" className="border border-border bg-card p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"><MessageCircle size={11} className="text-primary" /> Reddit r/entrepreneur (reales)</p>
                  <div className="space-y-1.5">
                    {results.sources.reddit.data.map((p, i) => (
                      <a key={i} href={p.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:bg-secondary p-1.5 transition-colors group">
                        <span className="font-mono text-[10px] text-accent shrink-0">↑{p.score}</span>
                        <span className="text-xs truncate flex-1 group-hover:text-primary">{p.title}</span>
                        <ExternalLink size={11} className="text-muted-foreground shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {results.sources?.google_trends?.trending_now?.length > 0 && (
                <div data-testid="trends-results" className="border border-border bg-card p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"><Globe size={11} className="text-primary" /> Google Trends (trending ahora)</p>
                  <div className="space-y-1">
                    {results.sources.google_trends.trending_now.map((t, i) => (
                      <div key={i} className={`flex items-center justify-between text-xs p-1 ${t.relevant ? "border border-accent/40 bg-accent/10" : ""}`}>
                        <span>{t.title}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{t.traffic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.sources?.fake_store?.data?.length > 0 && (
                <div data-testid="fakestore-results" className="border border-border bg-card p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5"><Package size={11} className="text-accent" /> Fake Store API (productos reales)</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {results.sources.fake_store.data.map((p, i) => (
                      <div key={i} className="border border-border bg-secondary p-2">
                        <img src={p.image} alt="" className="h-16 w-full object-contain mb-1" />
                        <p className="text-[10px] truncate">{p.title}</p>
                        <p className="font-mono text-xs text-accent">${p.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ALIEXPRESS */}
      {tab === "aliexpress" && (
        <div className="space-y-4">
          <div className="border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
              <Package size={13} className="text-accent" /> AliExpress (precios reales con scraping)
            </p>
            <div className="flex gap-2">
              <input value={keyword} onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && searchAliexpress()}
                placeholder="producto a buscar en AliExpress..." className="flex-1 bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <button onClick={searchAliexpress} disabled={busy || !keyword.trim()}
                className="px-4 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2 glow-cyan">
                {busy ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} Buscar
              </button>
            </div>
          </div>
          {results?.sources?.aliexpress?.data?.map((p, i) => (
            <div key={i} data-testid={`ali-product-${i}`} className="border border-border bg-card p-3 fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex gap-3">
                {p.imagen && <img src={p.imagen} alt="" className="w-20 h-20 object-cover shrink-0" onError={(e) => e.target.style.display = "none"} />}
                <div className="flex-1">
                  <p className="text-sm font-medium">{p.nombre}</p>
                  <div className="mt-2 grid grid-cols-3 gap-px bg-border border border-border font-mono text-center">
                    <div className="bg-secondary py-1"><p className="text-[9px] text-muted-foreground uppercase">Coste</p><p className="text-xs">${p.coste_proveedor}</p></div>
                    <div className="bg-secondary py-1"><p className="text-[9px] text-muted-foreground uppercase">Venta est.</p><p className="text-xs text-primary">${p.precio_venta_estimado}</p></div>
                    <div className="bg-secondary py-1"><p className="text-[9px] text-muted-foreground uppercase">Margen</p><p className="text-xs text-accent">{p.margen_estimado}%</p></div>
                  </div>
                  <a href={p.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary hover:opacity-70">
                    Ver en AliExpress <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* YOUTUBE */}
      {tab === "youtube" && (
        <div className="space-y-4">
          <div className="border border-border bg-card p-4 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Youtube size={13} className="text-primary" /> YouTube Trending (videos reales)
            </p>
            <button data-testid="load-youtube-btn" onClick={loadYoutube} disabled={busy}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Youtube size={14} />} Cargar trending
            </button>
          </div>
          {youtubeVideos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {youtubeVideos.map((v, i) => (
                <a key={i} data-testid={`yt-video-${i}`} href={v.url} target="_blank" rel="noreferrer"
                  className="border border-border bg-card p-3 hover:border-primary/50 transition-colors group">
                  {v.thumbnail && <img src={v.thumbnail} alt="" className="w-full h-32 object-cover mb-2" />}
                  <p className="text-xs font-medium group-hover:text-primary">{v.title}</p>
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">{v.channel} · {v.views?.toLocaleString()} vistas · {v.likes?.toLocaleString()} likes</p>
                  <p className="font-mono text-[9px] text-accent mt-0.5">{v.source}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* GOOGLE TRENDS */}
      {tab === "trends" && (
        <div className="space-y-4">
          <div className="border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
              <TrendingUp size={13} className="text-accent" /> Google Trends + Sugerencias (datos reales)
            </p>
            <div className="flex gap-2">
              <input value={keyword} onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && loadTrends()}
                placeholder="keyword a analizar..." className="flex-1 bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <button onClick={loadTrends} disabled={busy || !keyword.trim()}
                className="px-4 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">
                {busy ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} Analizar
              </button>
            </div>
          </div>
          {trendsData && (
            <div className="space-y-3">
              {trendsData.related_queries?.length > 0 && (
                <div data-testid="related-queries" className="border border-border bg-card p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Busquedas relacionadas (Google Suggest real)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {trendsData.related_queries.map((q, i) => (
                      <button key={i} onClick={() => setKeyword(q)} className="text-[11px] border border-border bg-secondary px-2 py-1 hover:border-accent/50 hover:bg-accent/10">{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {trendsData.trending_now?.length > 0 && (
                <div className="border border-border bg-card p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Trending ahora en Espana</p>
                  <div className="space-y-1">
                    {trendsData.trending_now.map((t, i) => (
                      <div key={i} className={`flex items-center justify-between text-xs p-1 ${t.relevant ? "border border-accent/40 bg-accent/10" : "border-b border-border/40"}`}>
                        <span>{t.title}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{t.traffic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SOCIAL: Reddit / Product Hunt / Etsy */}
      {tab === "social" && (
        <div className="space-y-4">
          {/* Reddit */}
          <div data-testid="reddit-section" className="border border-border bg-card">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <MessageCircle size={13} className="text-primary" />
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Reddit r/entrepreneur (posts reales)</span>
            </div>
            <div className="divide-y divide-border/60">
              {redditPosts.map((p, i) => (
                <a key={i} data-testid={`reddit-post-${i}`} href={p.url} target="_blank" rel="noreferrer" className="px-4 py-2.5 flex items-center gap-2 hover:bg-secondary transition-colors group">
                  <span className="font-mono text-[10px] text-accent shrink-0">↑{p.score}</span>
                  <span className="text-xs truncate flex-1 group-hover:text-primary">{p.title}</span>
                  <span className="font-mono text-[10px] text-muted-foreground shrink-0">{p.comments} comentarios</span>
                </a>
              ))}
              {redditPosts.length === 0 && <p className="p-4 text-xs text-muted-foreground font-mono">// Cargando...</p>}
            </div>
          </div>

          {/* Product Hunt */}
          <div data-testid="producthunt-section" className="border border-border bg-card">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Sparkles size={13} className="text-accent" />
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Product Hunt (productos reales)</span>
            </div>
            <div className="divide-y divide-border/60">
              {productHunt.map((p, i) => (
                <div key={i} data-testid={`ph-product-${i}`} className="px-4 py-2.5">
                  <p className="text-xs font-medium">{p.name}</p>
                  {p.tagline && <p className="text-[11px] text-muted-foreground mt-0.5">{p.tagline}</p>}
                </div>
              ))}
              {productHunt.length === 0 && <p className="p-4 text-xs text-muted-foreground font-mono">// Cargando...</p>}
            </div>
          </div>

          {/* Etsy */}
          <div data-testid="etsy-section" className="border border-border bg-card">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Package size={13} className="text-primary" />
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Etsy Trending (productos reales)</span>
            </div>
            <div className="divide-y divide-border/60">
              {etsyProducts.map((p, i) => (
                <a key={i} data-testid={`etsy-product-${i}`} href={p.url} target="_blank" rel="noreferrer" className="px-4 py-2.5 flex items-center gap-2 hover:bg-secondary transition-colors group">
                  <span className="text-xs truncate flex-1 group-hover:text-primary">{p.title}</span>
                  {p.price && <span className="font-mono text-xs text-accent shrink-0">{p.price}</span>}
                  <ExternalLink size={11} className="text-muted-foreground shrink-0" />
                </a>
              ))}
              {etsyProducts.length === 0 && <p className="p-4 text-xs text-muted-foreground font-mono">// Cargando...</p>}
            </div>
          </div>
        </div>
      )}

      {/* PHOTOS */}
      {tab === "photos" && (
        <div className="space-y-4">
          <div className="border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
              <Sparkles size={13} className="text-accent" /> Fotos de producto (Unsplash o IA, gratis)
            </p>
            <div className="flex gap-2">
              <input value={unsplashQuery} onChange={e => setUnsplashQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && searchUnsplash()}
                placeholder="ej: minimalista lampara, cocina gadgets..." className="flex-1 bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <button onClick={searchUnsplash} disabled={busy || !unsplashQuery.trim()}
                className="px-4 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">
                {busy ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} Buscar
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {unsplashPhotos.map((p, i) => (
              <div key={i} data-testid={`photo-${i}`} className="border border-border bg-card overflow-hidden fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <img src={p.url} alt={p.description || ""} loading="lazy" className="w-full h-40 object-cover" />
                <div className="p-2">
                  <p className="text-[10px] text-muted-foreground truncate">{p.description || "Foto"}</p>
                  {p.photographer && <p className="font-mono text-[9px] text-accent">{p.photographer}</p>}
                  <p className="font-mono text-[9px] text-primary mt-0.5">{p.source}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEWS */}
      {tab === "news" && (
        <div data-testid="news-section" className="border border-border bg-card">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <MessageCircle size={13} className="text-accent" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Noticias reales multi-fuente</span>
          </div>
          <div className="divide-y divide-border/60">
            {news.map((n, i) => (
              <a key={i} data-testid={`news-item-${i}`} href={n.url} target="_blank" rel="noreferrer" className="px-4 py-2.5 flex items-center gap-3 hover:bg-secondary transition-colors group">
                <span className="font-mono text-[9px] text-accent uppercase shrink-0 w-32 truncate">{n.source}</span>
                <span className="text-xs truncate flex-1 group-hover:text-primary">{n.title}</span>
                {n.score && <span className="font-mono text-[10px] text-muted-foreground shrink-0">↑{n.score}</span>}
                <ExternalLink size={11} className="text-muted-foreground shrink-0" />
              </a>
            ))}
            {news.length === 0 && <p className="p-4 text-xs text-muted-foreground font-mono">// Cargando noticias reales...</p>}
          </div>
        </div>
      )}

      {/* CONFIG */}
      {tab === "config" && (
        <div className="space-y-4">
          <div className="border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Settings size={13} className="text-primary" /> Configuracion de Google (APIs gratuitas)
              </p>
              <button onClick={() => setShowGoogleConfig(!showGoogleConfig)} className="text-[11px] text-primary hover:opacity-70">
                {showGoogleConfig ? "Ocultar" : "Configurar"}
              </button>
            </div>
            {showGoogleConfig && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">YouTube Data API Key (gratis: 10.000 unidades/dia)</label>
                  <input type="password" value={googleConfig.youtube_api_key} onChange={e => setGoogleConfig({ ...googleConfig, youtube_api_key: e.target.value })}
                    placeholder="AIzaSy..." className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">// Obtener gratis: console.cloud.google.com > YouTube Data API v3</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Google Custom Search API Key (gratis: 100/dia)</label>
                  <input type="password" value={googleConfig.google_search_key} onChange={e => setGoogleConfig({ ...googleConfig, google_search_key: e.target.value })}
                    placeholder="AIzaSy..." className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Custom Search Engine ID (CX)</label>
                  <input value={googleConfig.google_search_cx} onChange={e => setGoogleConfig({ ...googleConfig, google_search_cx: e.target.value })}
                    placeholder="xxxxxxxxx:xxxxxxx" className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">// Crear gratis: cse.google.com</p>
                </div>
                <button onClick={saveGoogleConfig} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold">Guardar</button>
              </div>
            )}
            <div className="border-t border-border pt-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">APIs que funcionan SIN configuracion (gratis, sin key)</p>
              <div className="space-y-1 text-[11px] text-muted-foreground">
                <p>✓ Reddit API (trending posts de r/entrepreneur, r/dropship)</p>
                <p>✓ Google Trends RSS (trending topics)</p>
                <p>✓ Google Suggest (autocompletado)</p>
                <p>✓ AliExpress (scraping de productos reales)</p>
                <p>✓ Etsy (scraping de productos trending)</p>
                <p>✓ Product Hunt (scraping)</p>
                <p>✓ Hacker News (noticias tech)</p>
                <p>✓ Pollinations.ai (imagenes por IA, ilimitado)</p>
                <p>✓ DuckDuckGo (busqueda web, fallback de Google)</p>
                <p>✓ RestCountries (datos de paises para envios)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
