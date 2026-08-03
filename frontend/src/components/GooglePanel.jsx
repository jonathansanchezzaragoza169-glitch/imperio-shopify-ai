import { useState, useEffect, useCallback } from "react";
import { Loader2, Settings, BarChart3, Search, Package, Youtube, FileSpreadsheet, MapPin, LogIn, LogOut, CheckCircle, User } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const GooglePanel = () => {
  const [tab, setTab] = useState("connect");
  const [status, setStatus] = useState({ connected: false });
  const [config, setConfig] = useState({ client_id: "", client_secret: "", redirect_uri: "http://localhost:3000/auth/google/callback" });
  const [configExists, setConfigExists] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loginUrl, setLoginUrl] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [searchConsole, setSearchConsole] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [youtube, setYouTube] = useState(null);
  const [myBusiness, setMyBusiness] = useState(null);

  const load = useCallback(async () => {
    try {
      const [statusRes, configRes] = await Promise.all([
        fetch(`${API}/google/status`),
        fetch(`${API}/google/config`),
      ]);
      if (statusRes.ok) setStatus(await statusRes.json());
      if (configRes.ok) {
        const cfg = await configRes.json();
        setConfigExists(cfg.configured || false);
        if (cfg.client_id) setConfig(c => ({ ...c, client_id: cfg.client_id, redirect_uri: cfg.redirect_uri || c.redirect_uri }));
      }
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveConfig = async () => {
    setBusy(true);
    try {
      await fetch(`${API}/google/config`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
      toast.success("Configuracion Google guardada");
      load();
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const getLoginUrl = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${API}/google/login-url`);
      if (res.ok) {
        const data = await res.json();
        setLoginUrl(data.login_url);
        window.open(data.login_url, "_blank");
      } else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const handleCallback = async (code) => {
    setBusy(true);
    try {
      const res = await fetch(`${API}/google/callback`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      if (res.ok) { toast.success("Google conectado"); load(); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const logout = async () => {
    await fetch(`${API}/google/logout`, { method: "POST" });
    setStatus({ connected: false });
    setAnalytics(null); setSearchConsole(null); setMerchant(null); setYouTube(null); setMyBusiness(null);
    toast.success("Google desconectado");
  };

  const loadAnalytics = async () => {
    setBusy(true);
    try { const res = await fetch(`${API}/google/analytics`); if (res.ok) setAnalytics(await res.json()); else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const loadSearchConsole = async () => {
    setBusy(true);
    try { const res = await fetch(`${API}/google/search-console`); if (res.ok) setSearchConsole(await res.json()); else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const loadMerchant = async () => {
    setBusy(true);
    try { const res = await fetch(`${API}/google/merchant`); if (res.ok) setMerchant(await res.json()); else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const loadYouTube = async () => {
    setBusy(true);
    try { const res = await fetch(`${API}/google/youtube`); if (res.ok) setYouTube(await res.json()); else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const loadMyBusiness = async () => {
    setBusy(true);
    try { const res = await fetch(`${API}/google/my-business`); if (res.ok) setMyBusiness(await res.json()); else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const exportToSheets = async (data, title) => {
    setBusy(true);
    try {
      const res = await fetch(`${API}/google/sheets/export`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data, title }) });
      if (res.ok) { const r = await res.json(); toast.success(`Exportado a Google Sheets: ${r.url}`); window.open(r.url, "_blank"); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  // Auto-detect callback code in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      handleCallback(code);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const tabs = [
    { id: "connect", label: "Conectar", icon: LogIn },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "search-console", label: "Search Console", icon: Search },
    { id: "merchant", label: "Merchant", icon: Package },
    { id: "youtube", label: "YouTube", icon: Youtube },
    { id: "my-business", label: "Mi Negocio", icon: MapPin },
  ];

  return (
    <div data-testid="google-panel" className="space-y-4">
      {/* Status bar */}
      <div className={`border p-4 flex items-center justify-between ${status.connected ? "border-emerald-500/40 bg-emerald-500/10" : "border-border bg-card"}`}>
        <div className="flex items-center gap-3">
          {status.connected ? (
            <>
              {status.picture && <img src={status.picture} alt="avatar" className="w-10 h-10 rounded-full" />}
              <div>
                <p className="text-sm font-medium flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-400" /> {status.name}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{status.email}</p>
              </div>
            </>
          ) : (
            <>
              <User size={20} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Google no conectado</p>
                <p className="font-mono text-[10px] text-muted-foreground">Configura OAuth y conecta tu cuenta</p>
              </div>
            </>
          )}
        </div>
        {status.connected ? (
          <button onClick={logout} className="px-4 py-2 border border-destructive/50 text-destructive text-sm font-semibold hover:bg-destructive/10 flex items-center gap-2"><LogOut size={14} /> Desconectar</button>
        ) : (
          <button data-testid="google-login-btn" onClick={getLoginUrl} disabled={busy || !configExists}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2 glow-cyan">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />} Conectar con Google
          </button>
        )}
      </div>

      <div className="flex gap-1 border border-border bg-card p-1 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} data-testid={`google-tab-${t.id}`} onClick={() => setTab(t.id)} disabled={!status.connected && t.id !== "connect"}
            className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-30 ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      {/* CONNECT / CONFIG TAB */}
      {tab === "connect" && (
        <div className="space-y-4">
          {loginUrl && !status.connected && (
            <div className="border border-primary/40 bg-primary/5 p-3">
              <p className="text-xs text-primary">Si no se abrio automaticamente, haz clic aqui:</p>
              <a href={loginUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline break-all">{loginUrl.slice(0, 80)}...</a>
            </div>
          )}
          <div className="border border-border bg-card p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Settings size={13} /> Configuracion Google OAuth 2.0</p>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Client ID</label>
              <input value={config.client_id} onChange={e => setConfig({ ...config, client_id: e.target.value })} placeholder="xxxx.apps.googleusercontent.com" className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Client Secret</label>
              <input type="password" value={config.client_secret} onChange={e => setConfig({ ...config, client_secret: e.target.value })} placeholder="GOCSPX-xxxx" className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Redirect URI</label>
              <input value={config.redirect_uri} onChange={e => setConfig({ ...config, redirect_uri: e.target.value })} className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <button data-testid="save-google-config" onClick={saveConfig} disabled={busy || !config.client_id.trim() || !config.client_secret.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <Settings size={14} />} Guardar configuracion</button>
          </div>
          <div className="border border-border bg-card p-4 space-y-2">
            <p className="text-xs font-semibold">Como configurar Google OAuth (gratis):</p>
            <ol className="text-[11px] text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Ve a <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google Cloud Console</a></li>
              <li>Crea un proyecto nuevo o usa uno existente</li>
              <li>Activa las APIs: Analytics Data, Search Console, Content API for Shopping, YouTube Data API v3, Google Business Profile API, Google Sheets API</li>
              <li>Ve a "Credenciales" > "Crear credenciales" > "OAuth client ID"</li>
              <li>Tipo: Web application. Anade tu Redirect URI</li>
              <li>Copia Client ID y Client Secret aqui</li>
              <li>Guarda y haz clic en "Conectar con Google"</li>
            </ol>
            <p className="font-mono text-[10px] text-muted-foreground">// Todo gratuito. Google da 250K requests/dia Analytics, 10K units/dia YouTube.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div className={`border p-3 ${status.connected ? "border-emerald-500/40 bg-emerald-500/10" : "border-border"}`}>
              <BarChart3 size={16} className={status.connected ? "text-emerald-400" : "text-muted-foreground"} />
              <p className="text-xs mt-1">Analytics 4</p>
              <p className="text-[10px] text-muted-foreground">Visitantes, revenue, conversiones</p>
            </div>
            <div className={`border p-3 ${status.connected ? "border-emerald-500/40 bg-emerald-500/10" : "border-border"}`}>
              <Search size={16} className={status.connected ? "text-emerald-400" : "text-muted-foreground"} />
              <p className="text-xs mt-1">Search Console</p>
              <p className="text-[10px] text-muted-foreground">Clicks, impresiones, CTR, posicion</p>
            </div>
            <div className={`border p-3 ${status.connected ? "border-emerald-500/40 bg-emerald-500/10" : "border-border"}`}>
              <Package size={16} className={status.connected ? "text-emerald-400" : "text-muted-foreground"} />
              <p className="text-xs mt-1">Merchant Center</p>
              <p className="text-[10px] text-muted-foreground">Productos en Google Shopping</p>
            </div>
            <div className={`border p-3 ${status.connected ? "border-emerald-500/40 bg-emerald-500/10" : "border-border"}`}>
              <Youtube size={16} className={status.connected ? "text-emerald-400" : "text-muted-foreground"} />
              <p className="text-xs mt-1">YouTube</p>
              <p className="text-[10px] text-muted-foreground">Subs, views, videos recientes</p>
            </div>
            <div className={`border p-3 ${status.connected ? "border-emerald-500/40 bg-emerald-500/10" : "border-border"}`}>
              <FileSpreadsheet size={16} className={status.connected ? "text-emerald-400" : "text-muted-foreground"} />
              <p className="text-xs mt-1">Google Sheets</p>
              <p className="text-[10px] text-muted-foreground">Exportar datos a hojas reales</p>
            </div>
            <div className={`border p-3 ${status.connected ? "border-emerald-500/40 bg-emerald-500/10" : "border-border"}`}>
              <MapPin size={16} className={status.connected ? "text-emerald-400" : "text-muted-foreground"} />
              <p className="text-xs mt-1">Mi Negocio</p>
              <p className="text-[10px] text-muted-foreground">Ubicaciones y perfil business</p>
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {tab === "analytics" && (
        <div className="space-y-4">
          <div className="border border-border bg-card p-4 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><BarChart3 size={13} /> Google Analytics 4 (datos reales)</p>
            <button onClick={loadAnalytics} disabled={busy} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <BarChart3 size={14} />} Cargar</button>
          </div>
          {analytics?.totals && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
                <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Usuarios</p><p className="font-mono text-lg text-primary">{analytics.totals.users}</p></div>
                <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Sesiones</p><p className="font-mono text-lg text-foreground">{analytics.totals.sessions}</p></div>
                <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Conversiones</p><p className="font-mono text-lg text-emerald-400">{analytics.totals.conversions}</p></div>
                <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Revenue</p><p className="font-mono text-lg text-accent">${analytics.totals.revenue.toFixed(2)}</p></div>
              </div>
              {analytics.daily && (
                <div className="border border-border bg-card">
                  <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                    <span className="text-[10px] uppercase text-muted-foreground">Diario (30 dias)</span>
                    <button onClick={() => exportToSheets(analytics.daily, "Analytics GA4")} className="text-[11px] text-primary hover:underline flex items-center gap-1"><FileSpreadsheet size={11} /> Exportar a Sheets</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {analytics.daily.slice(-15).reverse().map((d, i) => (
                      <div key={i} className="px-3 py-2 border-b border-border/40 flex items-center justify-between text-xs">
                        <span className="font-mono">{d.date}</span>
                        <span className="text-muted-foreground">{d.users} users · {d.sessions} sesiones · ${d.revenue.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          {analytics?.error && <div className="border border-destructive/40 bg-destructive/5 p-3"><p className="text-xs text-destructive">{analytics.error}: {analytics.detail}</p><p className="text-[10px] text-muted-foreground mt-1">Asegurate de tener una propiedad de Analytics 4 vinculada a tu cuenta de Google.</p></div>}
          {analytics?.note && <p className="text-xs text-muted-foreground font-mono">{analytics.note}</p>}
        </div>
      )}

      {/* SEARCH CONSOLE TAB */}
      {tab === "search-console" && (
        <div className="space-y-4">
          <div className="border border-border bg-card p-4 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Search size={13} /> Google Search Console (datos reales)</p>
            <button onClick={loadSearchConsole} disabled={busy} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Cargar</button>
          </div>
          {searchConsole?.totals && (
            <>
              <div className="grid grid-cols-4 gap-px bg-border border border-border">
                <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Clicks</p><p className="font-mono text-lg text-primary">{searchConsole.totals.clicks}</p></div>
                <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Impresiones</p><p className="font-mono text-lg text-foreground">{searchConsole.totals.impressions}</p></div>
                <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">CTR</p><p className="font-mono text-lg text-accent">{searchConsole.totals.ctr}%</p></div>
                <div className="bg-card px-3 py-3 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Posicion</p><p className="font-mono text-lg text-emerald-400">{searchConsole.totals.position}</p></div>
              </div>
              {searchConsole.sites && <div className="border border-border bg-card p-3"><p className="text-[10px] uppercase text-muted-foreground mb-1">Sitios</p>{searchConsole.sites.map((s, i) => <p key={i} className="text-xs font-mono">{s.url} ({s.permission})</p>)}</div>}
              {searchConsole.daily && (
                <div className="border border-border bg-card">
                  <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                    <span className="text-[10px] uppercase text-muted-foreground">Datos diarios</span>
                    <button onClick={() => exportToSheets(searchConsole.daily, "Search Console")} className="text-[11px] text-primary hover:underline flex items-center gap-1"><FileSpreadsheet size={11} /> Exportar a Sheets</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {searchConsole.daily.slice(-15).reverse().map((d, i) => (
                      <div key={i} className="px-3 py-2 border-b border-border/40 flex items-center justify-between text-xs">
                        <span className="font-mono">{d.date}</span>
                        <span className="text-muted-foreground">{d.clicks} clicks · {d.impressions} imp · CTR {d.ctr}% · pos {d.position}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          {searchConsole?.note && <p className="text-xs text-muted-foreground font-mono">{searchConsole.note}</p>}
        </div>
      )}

      {/* MERCHANT TAB */}
      {tab === "merchant" && (
        <div className="space-y-4">
          <div className="border border-border bg-card p-4 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Package size={13} /> Google Merchant Center (productos reales)</p>
            <div className="flex gap-2">
              {merchant?.products && <button onClick={() => exportToSheets(merchant.products, "Merchant Center")} className="px-3 py-2 border border-primary/50 text-primary text-sm flex items-center gap-1"><FileSpreadsheet size={12} /> Sheets</button>}
              <button onClick={loadMerchant} disabled={busy} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <Package size={14} />} Cargar</button>
            </div>
          </div>
          {merchant?.products?.length > 0 && (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {merchant.products.map((p, i) => (
                <div key={i} data-testid={`merchant-product-${i}`} className="border border-border bg-card p-2 flex items-center gap-2">
                  {p.image_link && <img src={p.image_link} alt="" className="w-10 h-10 object-cover shrink-0" />}
                  <div className="flex-1 min-w-0"><p className="text-xs truncate">{p.title}</p><p className="font-mono text-[10px] text-muted-foreground">{p.brand} · {p.availability}</p></div>
                  <span className="font-mono text-xs text-accent">{p.price}</span>
                </div>
              ))}
            </div>
          )}
          {merchant?.note && <p className="text-xs text-muted-foreground font-mono">{merchant.note}</p>}
        </div>
      )}

      {/* YOUTUBE TAB */}
      {tab === "youtube" && (
        <div className="space-y-4">
          <div className="border border-border bg-card p-4 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Youtube size={13} /> YouTube Channel (datos reales)</p>
            <div className="flex gap-2">
              {youtube?.recent_videos && <button onClick={() => exportToSheets(youtube.recent_videos, "YouTube Videos")} className="px-3 py-2 border border-primary/50 text-primary text-sm flex items-center gap-1"><FileSpreadsheet size={12} /> Sheets</button>}
              <button onClick={loadYouTube} disabled={busy} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <Youtube size={14} />} Cargar</button>
            </div>
          </div>
          {youtube?.channel_name && (
            <>
              <div className="border border-border bg-card p-4 flex items-center gap-4">
                {youtube.thumbnail && <img src={youtube.thumbnail} alt="channel" className="w-16 h-16 rounded-full" />}
                <div>
                  <p className="text-sm font-bold">{youtube.channel_name}</p>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs text-muted-foreground"><span className="font-mono text-primary">{youtube.subscribers}</span> subs</span>
                    <span className="text-xs text-muted-foreground"><span className="font-mono text-accent">{youtube.total_views}</span> views</span>
                    <span className="text-xs text-muted-foreground"><span className="font-mono text-foreground">{youtube.total_videos}</span> videos</span>
                  </div>
                </div>
              </div>
              {youtube.recent_videos?.length > 0 && (
                <div className="border border-border bg-card">
                  <div className="px-3 py-2 border-b border-border text-[10px] uppercase text-muted-foreground">Videos recientes</div>
                  {youtube.recent_videos.map((v, i) => (
                    <a key={i} href={`https://youtube.com/watch?v=${v.video_id}`} target="_blank" rel="noreferrer" className="px-3 py-2 border-b border-border/40 flex items-center gap-2 hover:bg-secondary group">
                      {v.thumbnail && <img src={v.thumbnail} alt="" className="w-16 h-10 object-cover" />}
                      <div className="flex-1 min-w-0"><p className="text-xs truncate group-hover:text-primary">{v.title}</p><p className="font-mono text-[10px] text-muted-foreground">{v.published_at?.slice(0, 10)}</p></div>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
          {youtube?.note && <p className="text-xs text-muted-foreground font-mono">{youtube.note}</p>}
        </div>
      )}

      {/* MY BUSINESS TAB */}
      {tab === "my-business" && (
        <div className="space-y-4">
          <div className="border border-border bg-card p-4 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><MapPin size={13} /> Google Business Profile (datos reales)</p>
            <button onClick={loadMyBusiness} disabled={busy} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />} Cargar</button>
          </div>
          {myBusiness?.locations?.length > 0 && (
            <div className="space-y-2">
              {myBusiness.locations.map((loc, i) => (
                <div key={i} className="border border-border bg-card p-3">
                  <p className="text-sm font-medium flex items-center gap-2"><MapPin size={14} className="text-accent" /> {loc.name}</p>
                  {loc.address?.length > 0 && <p className="text-xs text-muted-foreground mt-1">{loc.address.join(", ")}</p>}
                  {loc.phone && <p className="font-mono text-xs text-primary mt-0.5">{loc.phone}</p>}
                  {loc.website && <a href={loc.website} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">{loc.website}</a>}
                </div>
              ))}
            </div>
          )}
          {myBusiness?.note && <p className="text-xs text-muted-foreground font-mono">{myBusiness.note}</p>}
        </div>
      )}
    </div>
  );
};
