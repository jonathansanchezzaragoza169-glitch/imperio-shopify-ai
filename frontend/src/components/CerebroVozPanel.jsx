import { useState, useRef, useCallback, useEffect } from "react";
import { Loader2, Mic, MicOff, Volume2, Brain, Zap, Radio, Activity, Users } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CerebroVozPanel = () => {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [cerebroResponse, setCerebroResponse] = useState("");
  const [autoMode, setAutoMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [briefing, setBriefing] = useState(null);
  const [conversation, setConversation] = useState([]);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis || null);
  const voicesRef = useRef([]);

  // Load Spanish voices
  useEffect(() => {
    if (synthRef.current) {
      const loadVoices = () => {
        voicesRef.current = synthRef.current.getVoices();
      };
      loadVoices();
      synthRef.current.onvoiceschanged = loadVoices;
    }
  }, []);

  // Speak function - Web Speech API (100% gratis, browser native)
  const speak = useCallback((text) => {
    if (!synthRef.current) {
      toast.error("Tu navegador no soporta voz");
      return;
    }
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Find Spanish voice
    const esVoice = voicesRef.current.find(v => v.lang.startsWith("es"));
    if (esVoice) utterance.voice = esVoice;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    synthRef.current.speak(utterance);
  }, []);

  // Listen function - Web Speech API (100% gratis)
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (e) => {
      setListening(false);
      toast.error("Error de microfono: " + e.error);
    };

    recognition.onresult = (event) => {
      let finalText = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        }
      }
      if (finalText) {
        setTranscript(finalText);
        sendCommand(finalText);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  // Send command to Cerebro
  const sendCommand = async (text) => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/cerebro/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice_input: text }),
      });
      const data = await res.json();
      const response = data.response || "No entendi eso.";
      setCerebroResponse(response);

      // Add to conversation
      const now = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
      setConversation(prev => [...prev, {
        role: "ceo",
        text: text,
        time: now,
      }, {
        role: "cerebro",
        text: response,
        time: now,
        intention: data.intention,
        action: data.action,
      }]);

      // Cerebro speaks the response
      speak(response);
    } catch {
      toast.error("Error conectando con el Cerebro");
    }
    setBusy(false);
  };

  // Quick voice commands
  const quickCommands = [
    { label: "Reporte", text: "Dame un reporte del estado", icon: Activity },
    { label: "Tendencias", text: "Buscar productos con tendencia", icon: Zap },
    { label: "Publicar", text: "Publica en redes sociales", icon: Radio },
    { label: "Precios", text: "Optimiza los precios", icon: Zap },
    { label: "Dinero", text: "Como va el dinero", icon: Activity },
    { label: "Inventario", text: "Revisa el inventario", icon: Activity },
  ];

  // Auto-direct mode
  const toggleAutoMode = async () => {
    if (!autoMode) {
      setAutoMode(true);
      speak("Modo automatico activado. Voy a dirigir a todos los agentes sin que tengas que decir nada. Tu eres el CEO, yo ejecuto.");
      
      // Run auto-direct every 60 seconds
      const interval = setInterval(async () => {
        if (!autoModeRef.current) {
          clearInterval(interval);
          return;
        }
        try {
          const res = await fetch(`${API}/cerebro/auto-direct`, { method: "POST" });
          const data = await res.json();
          if (data.voice_message) {
            setConversation(prev => [...prev, {
              role: "cerebro",
              text: data.voice_message,
              time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
              auto: true,
            }]);
            // Only speak if not already speaking
            if (!speakingRef.current) speak(data.voice_message);
          }
        } catch {}
      }, 60000);

      // Run immediately
      try {
        const res = await fetch(`${API}/cerebro/auto-direct`, { method: "POST" });
        const data = await res.json();
        if (data.voice_message) speak(data.voice_message);
      } catch {}
    } else {
      setAutoMode(false);
      speak("Modo automatico desactivado. Espero tus ordenes, Jonathan.");
    }
  };

  // Refs for interval
  const autoModeRef = useRef(false);
  const speakingRef = useRef(false);
  useEffect(() => { autoModeRef.current = autoMode; }, [autoMode]);
  useEffect(() => { speakingRef.current = speaking; }, [speaking]);

  // Load briefing on mount
  useEffect(() => {
    const loadBriefing = async () => {
      try {
        const res = await fetch(`${API}/cerebro/briefing`);
        const data = await res.json();
        setBriefing(data);
      } catch {}
    };
    loadBriefing();
    const interval = setInterval(loadBriefing, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load history
  const loadHistory = async () => {
    try {
      const res = await fetch(`${API}/cerebro/history`);
      const data = await res.json();
      setHistory(data.history || []);
    } catch {}
  };

  useEffect(() => { loadHistory(); }, []);

  const agentColors = {
    "activo": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    "esperando": "text-amber-400 bg-amber-400/10 border-amber-400/20",
  };

  return (
    <div data-testid="cerebro-voz" className="space-y-4">
      {/* HEADER */}
      <div className="border border-primary/40 bg-primary/5 p-4">
        <div className="flex items-center gap-3">
          <div className={`relative w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center ${speaking ? "animate-pulse" : ""}`}>
            <Brain size={28} className="text-primary" />
            {speaking && (
              <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping" />
            )}
          </div>
          <div>
            <h2 className="text-base font-bold">Cerebro Vocal</h2>
            <p className="text-xs text-muted-foreground">
              {speaking ? "🗣️ Hablando..." : listening ? "🎤 Escuchando..." : autoMode ? "🤖 Modo automático activo" : "Listo para tus órdenes"}
            </p>
          </div>
        </div>
      </div>

      {/* VOICE CONTROLS */}
      <div className="grid grid-cols-3 gap-2">
        {/* MIC BUTTON */}
        <button
          onClick={listening ? stopListening : startListening}
          disabled={busy}
          className={`col-span-1 py-6 flex flex-col items-center gap-2 border transition-colors disabled:opacity-40 ${
            listening
              ? "border-red-500/40 bg-red-500/10 text-red-400"
              : "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
          }`}
        >
          {listening ? <MicOff size={28} className="animate-pulse" /> : <Mic size={28} />}
          <span className="text-xs font-semibold">
            {listening ? "Escuchando..." : "Hablar"}
          </span>
        </button>

        {/* SPEAK STATUS */}
        <button
          onClick={() => speak(cerebroResponse || "Hola Jonathan, soy el Cerebro. Dime que necesitas.")}
          className={`col-span-1 py-6 flex flex-col items-center gap-2 border transition-colors ${
            speaking
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-border bg-card hover:bg-accent"
          }`}
        >
          <Volume2 size={28} />
          <span className="text-xs font-semibold">
            {speaking ? "Hablando" : "Repetir"}
          </span>
        </button>

        {/* AUTO MODE */}
        <button
          onClick={toggleAutoMode}
          className={`col-span-1 py-6 flex flex-col items-center gap-2 border transition-colors ${
            autoMode
              ? "border-purple-500/40 bg-purple-500/10 text-purple-400 animate-pulse"
              : "border-border bg-card hover:bg-accent"
          }`}
        >
          <Zap size={28} />
          <span className="text-xs font-semibold">
            {autoMode ? "Auto ON" : "Auto OFF"}
          </span>
        </button>
      </div>

      {/* QUICK COMMANDS */}
      <div>
        <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Comandos rápidos</p>
        <div className="grid grid-cols-3 gap-2">
          {quickCommands.map((cmd, i) => {
            const Icon = cmd.icon;
            return (
              <button
                key={i}
                onClick={() => sendCommand(cmd.text)}
                disabled={busy}
                className="px-2 py-2 border border-border bg-card hover:bg-accent text-xs flex flex-col items-center gap-1 disabled:opacity-40"
              >
                <Icon size={14} className="text-primary" />
                {cmd.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TEXT INPUT FALLBACK */}
      <div className="flex gap-2">
        <input
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendCommand(transcript)}
          placeholder="Escribe o usa el micrófono..."
          className="flex-1 border border-border px-3 py-2 text-sm bg-card"
        />
        <button
          onClick={() => sendCommand(transcript)}
          disabled={busy || !transcript.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm disabled:opacity-40 flex items-center gap-1"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
          Enviar
        </button>
      </div>

      {/* CONVERSATION */}
      <div className="border border-border bg-card p-3 space-y-2 max-h-64 overflow-y-auto">
        <p className="text-xs font-bold uppercase text-muted-foreground sticky top-0 bg-card pb-1">Conversación</p>
        {conversation.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Habla al Cerebro o usa los comandos rápidos...</p>
        ) : (
          conversation.slice(-20).map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "ceo" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-3 py-2 text-xs ${msg.auto ? "border-l-2 border-purple-500/40 pl-3" : ""}`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`font-bold ${msg.role === "ceo" ? "text-primary" : "text-emerald-400"}`}>
                    {msg.role === "ceo" ? "Jonathan (CEO)" : msg.auto ? "🤖 Cerebro (auto)" : "🧠 Cerebro"}
                  </span>
                  <span className="text-[9px] text-muted-foreground">{msg.time}</span>
                </div>
                <p className={msg.role === "ceo" ? "text-foreground" : "text-muted-foreground"}>{msg.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AGENTS STATUS */}
      {briefing && (
        <div className="border border-border bg-card p-3">
          <p className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
            <Users size={12} className="text-primary" /> Agentes bajo mando del Cerebro
          </p>
          <div className="space-y-1">
            {(briefing.agents || []).map((agent, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${agent.status === "activo" ? "bg-emerald-400" : "bg-amber-400"}`} />
                  <span className="font-medium">{agent.name}</span>
                  <span className="text-muted-foreground text-[10px]">{agent.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{agent.task}</span>
                  {agent.pending_tasks > 0 && (
                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-mono">{agent.pending_tasks}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 italic border-t border-border/40 pt-2">
            🧠 {briefing.cerebro_speaks}
          </p>
        </div>
      )}

      {/* CEREBRO STATUS BAR */}
      <div className="border border-border bg-card p-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1 ${speaking ? "text-emerald-400" : "text-muted-foreground"}`}>
            <Volume2 size={12} /> {speaking ? "Hablando" : "Silencio"}
          </span>
          <span className={`flex items-center gap-1 ${listening ? "text-red-400" : "text-muted-foreground"}`}>
            <Mic size={12} /> {listening ? "Escuchando" : "Mic off"}
          </span>
          <span className={`flex items-center gap-1 ${autoMode ? "text-purple-400" : "text-muted-foreground"}`}>
            <Zap size={12} /> {autoMode ? "Auto ON" : "Auto OFF"}
          </span>
        </div>
        <span className="text-muted-foreground text-[10px]">
          {briefing?.active || 0}/{briefing?.total_agents || 10} agentes activos
        </span>
      </div>
    </div>
  );
};
