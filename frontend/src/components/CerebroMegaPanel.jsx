import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Zap, Volume2, Brain, Sparkles, TrendingUp, Image, Bell, Box, Activity, DollarSign } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Web Audio API for sound alerts (100% browser native, free)
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const sounds = {
      cash: { freq: 800, duration: 0.1, repeat: 2 },
      alarm: { freq: 300, duration: 0.5, repeat: 3 },
      warning: { freq: 500, duration: 0.2, repeat: 1 },
      ding: { freq: 1000, duration: 0.1, repeat: 1 },
      celebration: { freq: 600, duration: 0.3, repeat: 3 },
    };
    const config = sounds[type] || sounds.ding;
    for (let i = 0; i < config.repeat; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = config.freq;
      osc.type = "sine";
      const start = ctx.currentTime + i * (config.duration + 0.05);
      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + config.duration);
      osc.start(start);
      osc.stop(start + config.duration);
    }
  } catch (e) {}
};

export const CerebroMegaPanel = () => {
  const [busy, setBusy] = useState("");
  const [data, setData] = useState({});
  const [products3D, setProducts3D] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [realtime, setRealtime] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [autoPilotRunning, setAutoPilotRunning] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  const speak = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    u.rate = 1.0;
    synthRef.current.speak(u);
  };

  const call = async (endpoint, key, method = "GET", body = null) => {
    setBusy(key);
    try {
      const opts = { method };
      if (body) { opts.headers = { "Content-Type": "application/json" }; opts.body = JSON.stringify(body); }
      const res = await fetch(`${API}/${endpoint}`, opts);
      if (res.ok) {
        const result = await res.json();
        setData(prev => ({ ...prev, [key]: result }));
        if (result.voice_message) speak(result.voice_message);
        if (result.voice_summary) speak(result.voice_summary);
        toast.success(`${key} OK`);
      } else toast.error("Error");
    } catch { toast.error("Error de conexion"); }
    setBusy("");
  };

  // Load hologram products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch(`${API}/hologram/products`);
        const d = await res.json();
        setProducts3D(d.products || []);
      } catch {}
    };
    loadProducts();
    const interval = setInterval(loadProducts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Rotation animation
  useEffect(() => {
    const interval = setInterval(() => setRotation(r => r + 1), 50);
    return () => clearInterval(interval);
  }, []);

  // Load notifications with sound
  useEffect(() => {
    const loadNotifs = async () => {
      try {
        const res = await fetch(`${API}/notifications/smart`);
        const d = await res.json();
        setNotifications(d.notifications || []);
        // Play sounds for new critical alerts
        const critical = (d.notifications || []).filter(n => n.priority === "critical");
        if (critical.length > 0) playSound("alarm");
      } catch {}
    };
    loadNotifs();
    const interval = setInterval(loadNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load predictions
  useEffect(() => {
    const loadPreds = async () => {
      try {
        const res = await fetch(`${API}/analytics/predictions`);
        const d = await res.json();
        setPredictions(d);
      } catch {}
    };
    loadPreds();
  }, []);

  // Load realtime dashboard
  useEffect(() => {
    const loadRT = async () => {
      try {
        const res = await fetch(`${API}/dashboard/realtime`);
        const d = await res.json();
        setRealtime(d);
      } catch {}
    };
    loadRT();
    const interval = setInterval(loadRT, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-pilot loop
  const toggleAutoPilot = () => {
    if (!autoPilotRunning) {
      setAutoPilotRunning(true);
      speak("Autopiloto activado. Maximizando beneficio automaticamente.");
      call("profit/maximize", "autopilot", "POST");
      const interval = setInterval(() => {
        if (!autoPilotRunning) { clearInterval(interval); return; }
        call("profit/maximize", "autopilot", "POST");
      }, 120000); // Every 2 min
    } else {
      setAutoPilotRunning(false);
      speak("Autopiloto desactivado.");
    }
  };

  const glowColors = {
    emerald: "shadow-[0_0_20px_rgba(16,185,129,0.4)]",
    amber: "shadow-[0_0_20px_rgba(251,191,36,0.4)]",
    purple: "shadow-[0_0_20px_rgba(168,85,247,0.4)]",
  };

  const Btn = ({ id, label, endpoint, method, body, icon: Icon }) => (
    <button onClick={() => call(endpoint, id, method, body)} disabled={busy === id}
      className="px-3 py-2 bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-40 flex items-center justify-center gap-1.5">
      {busy === id ? <Loader2 size={12} className="animate-spin" /> : Icon ? <Icon size={12} /> : <Zap size={12} />} {label}
    </button>
  );

  return (
    <div data-testid="cerebro-mega" className="space-y-4">
      {/* HEADER */}
      <div className="border border-primary/40 bg-primary/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain size={28} className="text-primary animate-pulse" />
            <div>
              <h2 className="text-base font-bold">Cerebro Mega — Autonomía + Imagen + Sonido + Hologramas</h2>
              <p className="text-xs text-muted-foreground">Todo real, todo gratis, sin alucinaciones. El sistema piensa, habla, ve y decide solo.</p>
            </div>
          </div>
          {realtime && (
            <div className="flex gap-3 text-xs">
              <div className="text-center"><p className="font-mono text-lg text-emerald-400">{realtime.panels?.revenue || 0}</p><p className="text-[9px] uppercase text-muted-foreground">Revenue</p></div>
              <div className="text-center"><p className="font-mono text-lg text-primary">{realtime.panels?.orders || 0}</p><p className="text-[9px] uppercase text-muted-foreground">Pedidos</p></div>
              <div className="text-center"><p className="font-mono text-lg text-amber-400">{realtime.panels?.notifications || 0}</p><p className="text-[9px] uppercase text-muted-foreground">Alertas</p></div>
            </div>
          )}
        </div>
      </div>

      {/* AUTOPILOTO */}
      <div className={`border p-3 ${autoPilotRunning ? "border-purple-500/40 bg-purple-500/5" : "border-border bg-card"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold flex items-center gap-1.5"><Zap size={14} className="text-purple-400" /> Autopiloto de Beneficio</p>
            <p className="text-[10px] text-muted-foreground">{autoPilotRunning ? "Ejecutando maximizacion cada 2 min" : "Activa para maximizar beneficio solo"}</p>
          </div>
          <button onClick={toggleAutoPilot}
            className={`px-4 py-2 text-xs font-bold ${autoPilotRunning ? "bg-purple-500 text-white" : "bg-primary text-primary-foreground"}`}>
            {autoPilotRunning ? "DETENER" : "ACTIVAR AUTOPILOTO"}
          </button>
        </div>
        {data.autopilot && (
          <div className="mt-2 space-y-1">
            <p className="text-[10px] text-emerald-400">{data.autopilot.voice_summary}</p>
            {(data.autopilot.actions || []).slice(0, 5).map((a, i) => (
              <div key={i} className="flex justify-between text-[10px] border border-border/40 px-2 py-1">
                <span>{a.type}</span>
                <span className={a.status === "ok" ? "text-emerald-400" : a.status === "warning" ? "text-amber-400" : "text-destructive"}>{a.result}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PROFIT MAXIMIZER + EVOLVE */}
      <div className="grid grid-cols-2 gap-2">
        <Btn id="profit" label="Maximizar Beneficio" endpoint="profit/maximize" method="POST" icon={DollarSign} />
        <Btn id="evolve" label="Evolucionar Sistema" endpoint="system/evolve" method="POST" icon={TrendingUp} />
      </div>
      {data.profit && (
        <div className="border border-emerald-500/20 bg-emerald-500/5 p-2">
          <p className="text-[10px] text-emerald-400">{data.profit.voice_message}</p>
          <p className="text-sm font-mono text-emerald-400 mt-1">+${data.profit.estimated_daily_increase}/dia</p>
        </div>
      )}

      {/* PREDICTIVE ANALYTICS */}
      {predictions && predictions.trend && (
        <div className="border border-border bg-card p-3">
          <p className="text-xs font-bold mb-2 flex items-center gap-1.5"><TrendingUp size={12} className="text-primary" /> Predicciones (datos reales)</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="border border-border/40 p-2"><p className="text-[9px] uppercase text-muted-foreground">Tendencia</p><p className="font-mono text-sm">{predictions.trend_emoji} {predictions.trend}</p></div>
            <div className="border border-border/40 p-2"><p className="text-[9px] uppercase text-muted-foreground">7 dias</p><p className="font-mono text-sm text-primary">${predictions.total_predicted_7d}</p></div>
            <div className="border border-border/40 p-2"><p className="text-[9px] uppercase text-muted-foreground">Mejor dia</p><p className="font-mono text-sm text-emerald-400">{predictions.best_day}</p></div>
            <div className="border border-border/40 p-2"><p className="text-[9px] uppercase text-muted-foreground">Repeticion</p><p className="font-mono text-sm text-amber-400">{predictions.repeat_rate}%</p></div>
          </div>
        </div>
      )}

      {/* HOLOGRAMAS 3D */}
      <div className="border border-border bg-card p-3">
        <p className="text-xs font-bold mb-2 flex items-center gap-1.5"><Box size={12} className="text-purple-400" /> Hologramas 3D de Productos</p>
        <div className="grid grid-cols-4 gap-3 overflow-x-auto">
          {products3D.slice(0, 8).map((p, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="relative w-20 h-20 flex items-center justify-center"
                style={{ perspective: "200px" }}>
                <div className="w-16 h-16 transition-transform"
                  style={{
                    transform: `rotateY(${rotation * (p.rotation_speed || 0.5)}deg)`,
                    transformStyle: "preserve-3d",
                  }}>
                  {p.image ? (
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover rounded-lg"
                      style={{ filter: "drop-shadow(0 0 8px rgba(168,85,247,0.3))" }}
                      onError={(e) => e.target.style.display = "none"} />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-gradient-to-br from-purple-500/20 to-transparent flex items-center justify-center">
                      <Box size={20} className="text-purple-400" />
                    </div>
                  )}
                </div>
                <div className={`absolute inset-0 rounded-lg ${glowColors[p.glow_color] || glowColors.purple} opacity-50 pointer-events-none`} />
              </div>
              <p className="text-[9px] text-center truncate w-20 mt-1">{p.title}</p>
              <p className="text-[10px] font-mono text-primary">${p.price}</p>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-muted-foreground mt-2">Productos rotando en 3D real (CSS transforms). Precio alto = rotacion lenta = mas glow.</p>
      </div>

      {/* IMAGENES IA */}
      <div className="border border-border bg-card p-3 space-y-2">
        <p className="text-xs font-bold flex items-center gap-1.5"><Image size={12} className="text-emerald-400" /> Imagenes IA (Pollinations — Gratis)</p>
        <div className="flex gap-2">
          <input id="img-product" placeholder="Nombre del producto" className="flex-1 border border-border px-2 py-1.5 text-xs" />
          <select id="img-style" className="border border-border px-2 py-1.5 text-xs">
            <option value="professional">Profesional</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="minimalist">Minimalista</option>
            <option value="creative">Creativo</option>
            <option value="3d">3D Render</option>
          </select>
          <button onClick={() => {
            const t = document.getElementById("img-product").value;
            const s = document.getElementById("img-style").value;
            if (t) call(`images/generate-product?product_title=${t}&style=${s}`, "gen_img", "POST");
          }} disabled={busy === "gen_img"}
            className="px-3 py-1.5 bg-primary text-primary-foreground text-xs disabled:opacity-40">
            {busy === "gen_img" ? <Loader2 size={12} className="animate-spin" /> : "Generar"}
          </button>
        </div>
        {data.gen_img && (
          <div className="text-center">
            <img src={data.gen_img.url} alt="IA" className="mx-auto max-h-40 rounded-lg"
              onError={(e) => e.target.style.opacity = 0.3} />
            <p className="text-[9px] text-muted-foreground mt-1">Generada con Pollinations AI (gratis, sin API key)</p>
          </div>
        )}
        <Btn id="bulk_img" label="Generar imagenes para productos sin foto" endpoint="images/bulk-generate" method="POST" icon={Image} />
      </div>

      {/* CONTENT GENERATOR */}
      <div className="border border-border bg-card p-3 space-y-2">
        <p className="text-xs font-bold flex items-center gap-1.5"><Sparkles size={12} className="text-amber-400" /> Generador de Contenido IA</p>
        <div className="flex gap-2">
          <input id="blog-topic" placeholder="Tema del blog" className="flex-1 border border-border px-2 py-1.5 text-xs" />
          <input id="blog-keywords" placeholder="Keywords" className="w-32 border border-border px-2 py-1.5 text-xs" />
          <button onClick={() => {
            const t = document.getElementById("blog-topic").value;
            const k = document.getElementById("blog-keywords").value;
            if (t) call(`content/generate-blog?topic=${t}&keywords=${k}`, "blog", "POST");
          }} disabled={busy === "blog"}
            className="px-3 py-1.5 bg-primary text-primary-foreground text-xs disabled:opacity-40">
            Blog
          </button>
        </div>
        {data.blog && <p className="text-[10px] border border-border/40 p-2 max-h-32 overflow-y-auto">{data.blog.content?.slice(0, 500)}</p>}
        
        <div className="flex gap-2">
          <input id="ad-product" placeholder="Producto" className="flex-1 border border-border px-2 py-1.5 text-xs" />
          <select id="ad-platform" className="border border-border px-2 py-1.5 text-xs">
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="google">Google Ads</option>
            <option value="tiktok">TikTok</option>
            <option value="email">Email</option>
          </select>
          <button onClick={() => {
            const p = document.getElementById("ad-product").value;
            const pl = document.getElementById("ad-platform").value;
            if (p) call(`content/generate-ad?product=${p}&platform=${pl}`, "ad", "POST");
          }} disabled={busy === "ad"}
            className="px-3 py-1.5 bg-primary text-primary-foreground text-xs disabled:opacity-40">
            Anuncio
          </button>
        </div>
        {data.ad && <p className="text-[10px] border border-border/40 p-2 max-h-32 overflow-y-auto">{data.ad.ad_copy?.slice(0, 400)}</p>}
      </div>

      {/* SMART NOTIFICATIONS WITH SOUND */}
      <div className="border border-border bg-card p-3">
        <p className="text-xs font-bold mb-2 flex items-center gap-1.5"><Bell size={12} className="text-amber-400" /> Notificaciones Inteligentes con Sonido</p>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-[10px] text-muted-foreground italic">Sin notificaciones. Todo en orden.</p>
          ) : notifications.map((n, i) => (
            <div key={i} className={`flex items-start gap-2 p-2 border text-xs ${
              n.priority === "critical" ? "border-red-500/30 bg-red-500/5" :
              n.priority === "urgent" ? "border-amber-500/30 bg-amber-500/5" :
              n.priority === "success" ? "border-emerald-500/30 bg-emerald-500/5" :
              n.priority === "celebration" ? "border-purple-500/30 bg-purple-500/5" :
              "border-border/40"
            }`}>
              <span className="text-base">{n.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-[11px]">{n.title}</p>
                <p className="text-[10px] text-muted-foreground">{n.message}</p>
              </div>
              <button onClick={() => playSound(n.sound)} className="px-2 py-1 text-[9px] border border-border/40 hover:bg-accent">
                <Volume2 size={10} />
              </button>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-muted-foreground mt-2">Sonidos generados con Web Audio API (browser native, gratis). Alarmas criticas suenan solas.</p>
      </div>

      {/* REAL-TIME DASHBOARD */}
      {realtime && (
        <div className="border border-border bg-card p-3">
          <p className="text-xs font-bold mb-2 flex items-center gap-1.5"><Activity size={12} className="text-primary" /> Dashboard Tiempo Real</p>
          <div className="grid grid-cols-6 gap-2 text-center">
            <div className="border border-border/40 p-2">
              <p className="font-mono text-sm text-emerald-400">${realtime.panels?.revenue || 0}</p>
              <p className="text-[8px] uppercase text-muted-foreground">Revenue</p>
            </div>
            <div className="border border-border/40 p-2">
              <p className="font-mono text-sm text-primary">{realtime.panels?.orders || 0}</p>
              <p className="text-[8px] uppercase text-muted-foreground">Pedidos</p>
            </div>
            <div className="border border-border/40 p-2">
              <p className="font-mono text-sm text-amber-400">{realtime.panels?.products || 0}</p>
              <p className="text-[8px] uppercase text-muted-foreground">Productos</p>
            </div>
            <div className="border border-border/40 p-2">
              <p className="font-mono text-sm text-purple-400">{realtime.panels?.trends || 0}</p>
              <p className="text-[8px] uppercase text-muted-foreground">Trends</p>
            </div>
            <div className="border border-border/40 p-2">
              <p className="font-mono text-sm text-cyan-400">{realtime.panels?.free_apis || 31}</p>
              <p className="text-[8px] uppercase text-muted-foreground">APIs</p>
            </div>
            <div className="border border-border/40 p-2">
              <p className={`font-mono text-sm ${realtime.panels?.motor ? "text-emerald-400" : "text-red-400"}`}>
                {realtime.panels?.motor ? "ON" : "OFF"}
              </p>
              <p className="text-[8px] uppercase text-muted-foreground">Motor</p>
            </div>
          </div>
        </div>
      )}

      {/* VOICE COMMANDS LIBRARY */}
      <div className="border border-border bg-card p-3">
        <p className="text-xs font-bold mb-2 flex items-center gap-1.5"><Volume2 size={12} className="text-primary" /> Comandos de Voz del Cerebro</p>
        <div className="grid grid-cols-2 gap-1 text-[10px]">
          {[
            { p: "Dame un reporte", d: "Estado del sistema" },
            { p: "Buscar productos", d: "Trending products" },
            { p: "Publica en redes", d: "Auto-programar posts" },
            { p: "Optimiza precios", d: "Auto-pricing" },
            { p: "Como va el dinero", d: "Reporte financiero" },
            { p: "Revisa inventario", d: "Alertas de stock" },
            { p: "Activa autopiloto", d: "Modo autopiloto" },
            { p: "Genera imagen", d: "Imagen IA producto" },
            { p: "Escribe un blog", d: "Blog post SEO" },
            { p: "Crea un anuncio", d: "Copy de anuncio" },
          ].map((c, i) => (
            <div key={i} className="border border-border/40 px-2 py-1 flex justify-between">
              <span className="font-medium">"{c.p}"</span>
              <span className="text-muted-foreground">{c.d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
