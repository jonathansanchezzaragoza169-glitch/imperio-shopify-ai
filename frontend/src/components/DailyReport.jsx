import { useState, useRef } from "react";
import { AudioLines, Loader2, Square } from "lucide-react";
import { toast } from "sonner";
import { apiGet } from "../lib/api";

export const DailyReport = () => {
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const textRef = useRef("");

  const play = async () => {
    if (speaking) {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      if (!textRef.current) {
        const data = await apiGet("/report/daily");
        textRef.current = data.text;
      }
      toast.message("Informe diario de Cerebro", { description: textRef.current, duration: 20000 });
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(textRef.current);
        u.lang = "es-ES";
        u.onend = () => setSpeaking(false);
        setSpeaking(true);
        window.speechSynthesis.speak(u);
      }
    } catch {
      toast.error("No se pudo generar el informe");
    }
    setBusy(false);
  };

  return (
    <button
      data-testid="daily-report-btn"
      onClick={play}
      className={`flex items-center gap-2 px-4 py-2 border text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${
        speaking ? "border-accent text-accent glow-gold" : "border-primary/50 text-primary hover:bg-primary/10"
      }`}
    >
      {busy ? <Loader2 size={14} className="animate-spin" /> : speaking ? <Square size={14} /> : <AudioLines size={14} />}
      {speaking ? "Detener" : "Informe diario"}
    </button>
  );
};
