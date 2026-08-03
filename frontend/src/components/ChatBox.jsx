import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Mic, Volume2, VolumeX, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiGet, streamChat } from "../lib/api";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ChatBox = ({ agentId, placeholder, voice = false, testPrefix }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speak, setSpeak] = useState(false);
  const endRef = useRef(null);
  const recRef = useRef(null);
  const speakRef = useRef(false);

  const loadMessages = useCallback(() => {
    apiGet(`/agents/${agentId}/messages`).then(setMessages).catch(() => {});
  }, [agentId]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const doSpeak = (text) => {
    if (!speakRef.current || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[#*_`]/g, "").slice(0, 800));
    u.lang = "es-ES";
    window.speechSynthesis.speak(u);
  };

  const send = useCallback(async (text) => {
    const msg = (text || "").trim();
    if (!msg || busy) return;
    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { id: Date.now() + "u", role: "user", content: msg }, { id: Date.now() + "a", role: "assistant", content: "" }]);
    let full = "";
    try {
      await streamChat(
        agentId, msg,
        (delta) => {
          full += delta;
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = { ...copy[copy.length - 1], content: full };
            return copy;
          });
        },
        () => { setBusy(false); doSpeak(full); },
        (err) => { toast.error("Error del agente: " + err); setBusy(false); }
      );
    } catch {
      toast.error("Error de conexion");
      setBusy(false);
    }
  }, [agentId, busy]);

  const clearChat = async () => {
    try {
      await fetch(`${API}/agents/${agentId}/messages`, { method: "DELETE" });
      setMessages([]);
      toast.success("Conversacion limpiada");
    } catch {
      toast.error("No se pudo limpiar la conversacion");
    }
  };

  const toggleMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error("Tu navegador no soporta entrada por voz. Usa Chrome."); return; }
    if (listening) { recRef.current?.stop(); return; }
    const rec = new SR();
    rec.lang = "es-ES";
    rec.interimResults = false;
    rec.onresult = (e) => { const t = e.results[0][0].transcript; setInput(t); send(t); };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div data-testid={`${testPrefix}-messages`} className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground font-mono">// Sin mensajes. Da tu primera orden.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary border border-border text-foreground"
            }`}>
              {m.content || (busy && (
                <span className="flex gap-1 py-1"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></span>
              ))}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="border-t border-border p-3">
        {messages.length > 0 && (
          <button
            data-testid={`${testPrefix}-clear-btn`}
            onClick={clearChat}
            className="mb-2 flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-destructive transition-colors duration-200"
          >
            <Trash2 size={11} /> Limpiar conversacion
          </button>
        )}
        <div className="flex items-center gap-2">
          {voice && (
            <>
              <button
                data-testid={`${testPrefix}-voice-btn`}
                onClick={toggleMic}
                className={`shrink-0 w-10 h-10 flex items-center justify-center border transition-colors duration-200 ${
                  listening ? "bg-primary text-primary-foreground border-primary mic-active" : "border-primary/50 text-primary hover:bg-primary/10"
                }`}
                title="Hablar"
              >
                <Mic size={16} />
              </button>
              <button
                data-testid={`${testPrefix}-tts-toggle`}
                onClick={() => { speakRef.current = !speak; setSpeak(!speak); if (speak) window.speechSynthesis?.cancel(); }}
                className={`shrink-0 w-10 h-10 flex items-center justify-center border transition-colors duration-200 ${
                  speak ? "border-accent text-accent" : "border-border text-muted-foreground hover:text-foreground"
                }`}
                title="Respuesta por voz"
              >
                {speak ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            </>
          )}
          <input
            data-testid={`${testPrefix}-input`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder={listening ? "Escuchando..." : placeholder}
            className="flex-1 bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
          />
          <button
            data-testid={`${testPrefix}-send-btn`}
            onClick={() => send(input)}
            disabled={busy || !input.trim()}
            className="shrink-0 w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground disabled:opacity-40 transition-opacity duration-200 glow-cyan"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
