import { useState, useEffect, useCallback } from "react";
import { Send, Loader2, Settings, Calendar, Sparkles, Hash, Zap, Trash2, RefreshCw, CheckCircle, XCircle, Youtube, MessageCircle, Globe, Radio, Clock } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PLATFORMS = [
  { id: "telegram", label: "Telegram", icon: Send, color: "#0088cc", desc: "Gratis e ilimitado. Bot API." },
  { id: "discord", label: "Discord", icon: MessageCircle, color: "#5865F2", desc: "Webhook gratis." },
  { id: "mastodon", label: "Mastodon", icon: Globe, color: "#6364FF", desc: "Libre y gratuito." },
  { id: "reddit", label: "Reddit", icon: Radio, color: "#FF4500", desc: "API OAuth gratis." },
];

export const SocialPanel = () => {
  const [tab, setTab] = useState("publish");
  const [config, setConfig] = useState({ telegram_bot_token: "", telegram_channel_id: "", discord_webhook_url: "", mastodon_instance: "", mastodon_access_token: "", reddit_client_id: "", reddit_client_secret: "", reddit_username: "", reddit_password: "" });
  const [showConfig, setShowConfig] = useState(false);
  const [socialStatus, setSocialStatus] = useState({});
  const [post, setPost] = useState({ platforms: [], content: "", image_url: "", subreddit: "", title: "" });
  const [busy, setBusy] = useState(false);
  const [postHistory, setPostHistory] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [generated, setGenerated] = useState(null);
  const [genInput, setGenInput] = useState({ product_name: "", platform: "tiktok", niche: "" });
  const [hashtags, setHashtags] = useState(null);
  const [hashtagInput, setHashtagInput] = useState("");
  const [schedulePost, setSchedulePost] = useState({ platform: "telegram", content: "", scheduled_time: "", image_url: "" });

  const loadAll = useCallback(() => {
    fetch(`${API}/social/config`).then(r => r.json()).then(setSocialStatus).catch(() => {});
    fetch(`${API}/social/posts`).then(r => r.json()).then(setPostHistory).catch(() => {});
    fetch(`${API}/social/scheduled`).then(r => r.json()).then(setScheduled).catch(() => {});
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const saveConfig = async () => {
    setBusy(true);
    try {
      await fetch(`${API}/social/config`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      toast.success("Configuracion guardada");
      loadAll();
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const togglePlatform = (id) => {
    const current = post.platforms;
    if (current.includes(id)) {
      setPost({ ...post, platforms: current.filter(p => p !== id) });
    } else {
      setPost({ ...post, platforms: [...current, id] });
    }
  };

  const publish = async () => {
    if (post.platforms.length === 0) { toast.error("Selecciona al menos una red"); return; }
    if (!post.content.trim()) { toast.error("Escribe el contenido"); return; }
    setBusy(true);
    try {
      const res = await fetch(`${API}/social/publish`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.detail || "Error publicando"); }
      else {
        const results = data.results || {};
        const sent = Object.entries(results).filter(([_, v]) => v.status === "sent").map(([k]) => k);
        const errors = Object.entries(results).filter(([_, v]) => v.status === "error").map(([k]) => k);
        if (sent.length > 0) toast.success(`Publicado en: ${sent.join(", ")}`);
        if (errors.length > 0) toast.error(`Error en: ${errors.join(", ")}`);
        setPost({ platforms: post.platforms, content: "", image_url: "", subreddit: "", title: "" });
        loadAll();
      }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const generateContent = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${API}/social/generate-content`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(genInput),
      });
      if (res.ok) { setGenerated(await res.json()); toast.success("Contenido viral generado"); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const generateHashtags = async () => {
    if (!hashtagInput.trim()) { toast.error("Pon un keyword"); return; }
    setBusy(true);
    try {
      const res = await fetch(`${API}/social/hashtags`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: hashtagInput }),
      });
      if (res.ok) { setHashtags(await res.json()); toast.success("Hashtags generados"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const doSchedule = async () => {
    if (!schedulePost.content.trim() || !schedulePost.scheduled_time) { toast.error("Falta contenido o fecha"); return; }
    setBusy(true);
    try {
      const res = await fetch(`${API}/social/schedule`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedulePost),
      });
      if (res.ok) { toast.success("Post programado"); setSchedulePost({ platform: "telegram", content: "", scheduled_time: "", image_url: "" }); loadAll(); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const cancelScheduled = async (id) => {
    await fetch(`${API}/social/scheduled/${id}`, { method: "DELETE" });
    loadAll();
    toast.success("Post cancelado");
  };

  const useGenerated = (text) => {
    setPost({ ...post, content: text });
    setTab("publish");
  };

  const tabs = [
    { id: "publish", label: "Publicar", icon: Send },
    { id: "generate", label: "Generar IA", icon: Sparkles },
    { id: "hashtags", label: "Hashtags", icon: Hash },
    { id: "schedule", label: "Programar", icon: Calendar },
    { id: "history", label: "Historial", icon: Clock },
    { id: "config", label: "Config", icon: Settings },
  ];

  return (
    <div data-testid="social-panel" className="space-y-4">
      {/* Platform status bar */}
      <div className="flex gap-2 flex-wrap">
        {PLATFORMS.map(p => {
          const configured = socialStatus[`${p.id}_configured`];
          return (
            <div key={p.id} data-testid={`social-status-${p.id}`}
              className={`flex items-center gap-2 border px-3 py-2 ${configured ? "border-emerald-500/40 bg-emerald-500/10" : "border-border bg-secondary"}`}>
              <p.icon size={14} style={{ color: configured ? "#10b981" : p.color }} />
              <span className="text-xs">{p.label}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${configured ? "bg-emerald-400" : "bg-muted-foreground"}`} />
            </div>
          );
        })}
      </div>

      <div className="flex gap-1 border border-border bg-card p-1 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} data-testid={`social-tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors duration-200 ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      {/* PUBLISH TAB */}
      {tab === "publish" && (
        <div className="space-y-4">
          {/* Platform selector */}
          <div className="border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Selecciona redes (publicacion real simultanea)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PLATFORMS.map(p => {
                const configured = socialStatus[`${p.id}_configured`];
                const selected = post.platforms.includes(p.id);
                return (
                  <button key={p.id} data-testid={`select-platform-${p.id}`}
                    onClick={() => togglePlatform(p.id)}
                    disabled={!configured}
                    className={`border p-3 text-left transition-colors ${selected ? "border-primary bg-primary/10" : "border-border"} ${!configured ? "opacity-40 cursor-not-allowed" : "hover:border-primary/50"}`}>
                    <div className="flex items-center gap-2">
                      <p.icon size={16} style={{ color: p.color }} />
                      <span className="text-xs font-medium">{p.label}</span>
                    </div>
                    {!configured && <p className="text-[9px] text-muted-foreground mt-1">No configurado</p>}
                    {selected && <CheckCircle size={12} className="text-primary mt-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Post editor */}
          <div data-testid="post-editor" className="border border-border bg-card p-4 space-y-3">
            {post.platforms.includes("reddit") && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Subreddit (sin r/)</label>
                  <input value={post.subreddit} onChange={e => setPost({ ...post, subreddit: e.target.value })}
                    placeholder="entrepreneur" className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Titulo (Reddit)</label>
                  <input value={post.title} onChange={e => setPost({ ...post, title: e.target.value })}
                    placeholder="Titulo del post" className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
            )}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Contenido del post</label>
              <textarea value={post.content} onChange={e => setPost({ ...post, content: e.target.value })}
                placeholder="Escribe o pega el contenido. Usa la pestana Generar IA para crear contenido viral automaticamente."
                rows={5} className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              <p className="font-mono text-[10px] text-muted-foreground mt-1">{post.content.length} caracteres</p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">URL de imagen (opcional)</label>
              <input value={post.image_url} onChange={e => setPost({ ...post, image_url: e.target.value })}
                placeholder="https://..." className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <button data-testid="publish-btn" onClick={publish} disabled={busy || post.platforms.length === 0}
              className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 glow-cyan">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {busy ? "Publicando..." : `Publicar en ${post.platforms.length} red(es)`}
            </button>
          </div>
        </div>
      )}

      {/* GENERATE TAB */}
      {tab === "generate" && (
        <div className="space-y-4">
          <div className="border border-border bg-card p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Sparkles size={13} className="text-accent" /> Generador de contenido viral con IA
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Producto</label>
                <input value={genInput.product_name} onChange={e => setGenInput({ ...genInput, product_name: e.target.value })}
                  placeholder="Lampara Galaxy" className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Nicho</label>
                <input value={genInput.niche} onChange={e => setGenInput({ ...genInput, niche: e.target.value })}
                  placeholder="hogar inteligente" className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Plataforma</label>
                <select value={genInput.platform} onChange={e => setGenInput({ ...genInput, platform: e.target.value })}
                  className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram Reels</option>
                  <option value="youtube_short">YouTube Shorts</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
            <button data-testid="gen-content-btn" onClick={generateContent} disabled={busy}
              className="px-4 py-2 bg-accent text-accent-foreground text-sm font-semibold flex items-center gap-2 disabled:opacity-40">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Generar contenido viral
            </button>
          </div>

          {generated && (
            <div data-testid="generated-content" className="border border-border bg-card p-4 space-y-3 fade-up">
              {generated.hook && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-accent mb-1">Hook (gancho)</p>
                  <p className="text-sm bg-secondary border border-border p-2">{generated.hook}</p>
                </div>
              )}
              {generated.script && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-accent mb-1">Guion completo</p>
                  <pre className="text-xs bg-secondary border border-border p-2 whitespace-pre-wrap font-mono">{generated.script}</pre>
                </div>
              )}
              {generated.caption && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-accent mb-1">Caption</p>
                  <p className="text-sm bg-secondary border border-border p-2">{generated.caption}</p>
                </div>
              )}
              {generated.hashtags && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-accent mb-1">Hashtags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {generated.hashtags.map((h, i) => <span key={i} className="text-[11px] text-primary border border-primary/30 px-1.5 py-0.5">{h}</span>)}
                  </div>
                </div>
              )}
              {generated.call_to_action && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-accent mb-1">Call to Action</p>
                  <p className="text-sm bg-secondary border border-border p-2">{generated.call_to_action}</p>
                </div>
              )}
              {generated.best_posting_time && (
                <div className="flex gap-4 text-xs">
                  <span className="text-muted-foreground">Mejor hora: <span className="text-primary font-mono">{generated.best_posting_time}</span></span>
                  {generated.estimated_reach && <span className="text-muted-foreground">Reach est.: <span className="text-accent">{generated.estimated_reach}</span></span>}
                </div>
              )}
              <button onClick={() => useGenerated(generated.caption || generated.hook || generated.content || "")}
                className="mt-2 px-4 py-2 border border-primary/50 text-primary text-xs font-semibold hover:bg-primary/10 transition-colors">
                Usar este contenido para publicar
              </button>
            </div>
          )}
        </div>
      )}

      {/* HASHTAGS TAB */}
      {tab === "hashtags" && (
        <div className="space-y-4">
          <div className="border border-border bg-card p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Hash size={13} className="text-accent" /> Generador de hashtags (basado en Google Trends real)
            </p>
            <div className="flex gap-2">
              <input value={hashtagInput} onChange={e => setHashtagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && generateHashtags()}
                placeholder="keyword, ej: lampara LED, fitness, mascotas..." className="flex-1 bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <button onClick={generateHashtags} disabled={busy || !hashtagInput.trim()}
                className="px-4 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">
                {busy ? <Loader2 size={15} className="animate-spin" /> : <Hash size={15} />} Generar
              </button>
            </div>
          </div>

          {hashtags && (
            <div data-testid="hashtags-result" className="space-y-3">
              {hashtags.google_suggestions?.length > 0 && (
                <div className="border border-border bg-card p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Busquedas reales de Google</p>
                  <div className="flex flex-wrap gap-1.5">
                    {hashtags.google_suggestions.map((s, i) => <span key={i} className="text-[11px] border border-border bg-secondary px-2 py-1">{s}</span>)}
                  </div>
                </div>
              )}
              {hashtags.hashtags?.length > 0 && (
                <div className="border border-border bg-card p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Hashtags generados</p>
                  <div className="flex flex-wrap gap-1.5">
                    {hashtags.hashtags.map((h, i) => (
                      <button key={i} onClick={() => { setPost({ ...post, content: (post.content + " " + h).trim() }); toast.success(`Hashtag anadido: ${h}`); }}
                        className="text-[11px] text-primary border border-primary/30 px-2 py-1 hover:bg-primary/10 transition-colors">{h}</button>
                    ))}
                  </div>
                </div>
              )}
              {hashtags.trending?.length > 0 && (
                <div className="border border-border bg-card p-3">
                  <p className="text-[10px] uppercase tracking-wider text-accent mb-2">Trending</p>
                  <div className="flex flex-wrap gap-1.5">
                    {hashtags.trending.map((h, i) => <span key={i} className="text-[11px] text-accent border border-accent/30 px-2 py-1">{h}</span>)}
                  </div>
                </div>
              )}
              <button onClick={() => { setPost({ ...post, content: hashtags.hashtags?.join(" ") || "" }); setTab("publish"); }}
                className="px-4 py-2 border border-primary/50 text-primary text-xs font-semibold hover:bg-primary/10 transition-colors">
                Usar en post
              </button>
            </div>
          )}
        </div>
      )}

      {/* SCHEDULE TAB */}
      {tab === "schedule" && (
        <div className="space-y-4">
          <div className="border border-border bg-card p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Calendar size={13} className="text-accent" /> Programar publicacion
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Red social</label>
                <select value={schedulePost.platform} onChange={e => setSchedulePost({ ...schedulePost, platform: e.target.value })}
                  className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Fecha y hora</label>
                <input type="datetime-local" value={schedulePost.scheduled_time} onChange={e => setSchedulePost({ ...schedulePost, scheduled_time: e.target.value })}
                  className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <textarea value={schedulePost.content} onChange={e => setSchedulePost({ ...schedulePost, content: e.target.value })}
              placeholder="Contenido del post programado..." rows={4} className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            <input value={schedulePost.image_url} onChange={e => setSchedulePost({ ...schedulePost, image_url: e.target.value })}
              placeholder="URL imagen (opcional)" className="w-full bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
            <button data-testid="schedule-btn" onClick={doSchedule} disabled={busy}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 disabled:opacity-40">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />} Programar
            </button>
          </div>

          {scheduled.length > 0 && (
            <div className="border border-border bg-card">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Posts programados</span>
                <button onClick={loadAll} className="p-1 text-muted-foreground hover:text-primary"><RefreshCw size={12} /></button>
              </div>
              <div className="divide-y divide-border/60">
                {scheduled.map((s, i) => (
                  <div key={s.id || i} data-testid={`scheduled-${i}`} className="px-4 py-3 flex items-center gap-3">
                    <Calendar size={14} className="text-accent shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate">{s.content}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{s.platform} · {new Date(s.scheduled_time).toLocaleString("es-ES")}</p>
                    </div>
                    <button onClick={() => cancelScheduled(s.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === "history" && (
        <div data-testid="post-history" className="border border-border bg-card">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Historial de publicaciones reales</span>
            <button onClick={loadAll} className="p-1 text-muted-foreground hover:text-primary"><RefreshCw size={12} /></button>
          </div>
          {postHistory.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground font-mono">// Sin publicaciones aun. Publica algo en la pestana Publicar.</p>
          ) : (
            <div className="divide-y divide-border/60">
              {postHistory.map((p, i) => (
                <div key={p.id || i} data-testid={`history-${i}`} className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    {p.platforms?.map(pl => {
                      const plat = PLATFORMS.find(x => x.id === pl);
                      return plat ? <plat.icon key={pl} size={12} style={{ color: plat.color }} /> : null;
                    })}
                    <span className="font-mono text-[10px] text-muted-foreground">{p.created_at ? new Date(p.created_at).toLocaleString("es-ES") : ""}</span>
                  </div>
                  <p className="text-xs">{p.content}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {Object.entries(p.results || {}).map(([plat, res]) => (
                      <span key={plat} className={`font-mono text-[10px] flex items-center gap-1 ${res.status === "sent" ? "text-emerald-400" : "text-destructive"}`}>
                        {res.status === "sent" ? <CheckCircle size={10} /> : <XCircle size={10} />}
                        {plat}: {res.status}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONFIG TAB */}
      {tab === "config" && (
        <div className="space-y-4">
          {/* Telegram */}
          <div className="border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Send size={16} className="text-[#0088cc]" />
              <p className="text-xs font-semibold uppercase tracking-wider">Telegram (gratis e ilimitado)</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Bot Token</label>
                <input type="password" value={config.telegram_bot_token} onChange={e => setConfig({ ...config, telegram_bot_token: e.target.value })}
                  placeholder="123456:ABC-DEF..." className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Channel/Chat ID</label>
                <input value={config.telegram_channel_id} onChange={e => setConfig({ ...config, telegram_channel_id: e.target.value })}
                  placeholder="@tucanal o -100123..." className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground">// Crear bot gratis: @BotFather en Telegram > /newbot. Anadir bot al canal como admin.</p>
          </div>

          {/* Discord */}
          <div className="border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <MessageCircle size={16} className="text-[#5865F2]" />
              <p className="text-xs font-semibold uppercase tracking-wider">Discord Webhook (gratis)</p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Webhook URL</label>
              <input type="password" value={config.discord_webhook_url} onChange={e => setConfig({ ...config, discord_webhook_url: e.target.value })}
                placeholder="https://discord.com/api/webhooks/..." className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <p className="font-mono text-[10px] text-muted-foreground">// Configuracion del canal > Integraciones > Webhooks > Nuevo webhook > Copiar URL.</p>
          </div>

          {/* Mastodon */}
          <div className="border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-[#6364FF]" />
              <p className="text-xs font-semibold uppercase tracking-wider">Mastodon (libre y gratis)</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Instancia</label>
                <input value={config.mastodon_instance} onChange={e => setConfig({ ...config, mastodon_instance: e.target.value })}
                  placeholder="https://mastodon.social" className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Access Token</label>
                <input type="password" value={config.mastodon_access_token} onChange={e => setConfig({ ...config, mastodon_access_token: e.target.value })}
                  placeholder="token..." className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground">// Crear cuenta gratis en mastodon.social > Preferencias > Desarrollo > Nueva aplicacion > Generar token.</p>
          </div>

          {/* Reddit */}
          <div className="border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Radio size={16} className="text-[#FF4500]" />
              <p className="text-xs font-semibold uppercase tracking-wider">Reddit (API gratis)</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Client ID</label>
                <input value={config.reddit_client_id} onChange={e => setConfig({ ...config, reddit_client_id: e.target.value })}
                  placeholder="client_id" className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Client Secret</label>
                <input type="password" value={config.reddit_client_secret} onChange={e => setConfig({ ...config, reddit_client_secret: e.target.value })}
                  placeholder="client_secret" className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Username</label>
                <input value={config.reddit_username} onChange={e => setConfig({ ...config, reddit_username: e.target.value })}
                  placeholder="tu_usuario" className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Password</label>
                <input type="password" value={config.reddit_password} onChange={e => setConfig({ ...config, reddit_password: e.target.value })}
                  placeholder="password" className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground">// Crear app gratis: reddit.com/prefs/apps > create another app > script type.</p>
          </div>

          <button data-testid="save-social-config" onClick={saveConfig} disabled={busy}
            className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 glow-cyan">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Settings size={15} />} Guardar configuracion
          </button>
        </div>
      )}
    </div>
  );
};
