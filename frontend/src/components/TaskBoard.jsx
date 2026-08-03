import { useState, useEffect } from "react";
import { ListTodo, Trash2, ArrowRight, Loader2, Brain } from "lucide-react";
import { toast } from "sonner";
import { apiGet } from "../lib/api";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const COLS = [
  { key: "pendiente", label: "Pendiente" },
  { key: "en_progreso", label: "En progreso" },
  { key: "completada", label: "Completada" },
];
const NEXT = { pendiente: "en_progreso", en_progreso: "completada" };
const PRIO = { alta: "text-destructive border-destructive/40", media: "text-accent border-accent/40", baja: "text-muted-foreground border-border" };

export const TaskBoard = ({ agentsById }) => {
  const [tasks, setTasks] = useState([]);
  const [objective, setObjective] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => apiGet("/tasks").then(setTasks).catch(() => {});
  useEffect(() => { load(); }, []);

  const delegate = async () => {
    if (!objective.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/tasks/delegate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objective }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      toast.success(`Cerebro asignó ${created.length} tareas a tus agentes`);
      setObjective("");
      load();
    } catch {
      toast.error("Cerebro no pudo delegar, inténtalo de nuevo");
    }
    setBusy(false);
  };

  const setStatus = async (id, status) => {
    await fetch(`${API}/tasks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  };

  const remove = async (id) => {
    await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div data-testid="task-board" className="space-y-4">
      <div className="border border-border bg-card p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
          <Brain size={13} className="text-accent" /> Dale un objetivo a Cerebro y él reparte las tareas
        </p>
        <div className="flex gap-2">
          <input
            data-testid="delegate-input"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && delegate()}
            placeholder="Ej: Lanzar una tienda de gadgets de cocina este mes"
            className="flex-1 bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            data-testid="delegate-btn"
            onClick={delegate}
            disabled={busy || !objective.trim()}
            className="px-4 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2 glow-cyan"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <ListTodo size={15} />}
            {busy ? "Delegando..." : "Delegar"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {COLS.map((col) => (
          <div key={col.key} data-testid={`task-col-${col.key}`} className="border border-border bg-card">
            <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{col.label}</span>
              <span className="font-mono text-[11px] text-primary">{tasks.filter((t) => t.status === col.key).length}</span>
            </div>
            <div className="p-2 space-y-2 min-h-[80px] max-h-96 overflow-y-auto">
              {tasks.filter((t) => t.status === col.key).map((t) => (
                <div key={t.id} data-testid="task-card" className="border border-border bg-secondary p-3 fade-up">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold leading-snug">{t.titulo}</p>
                    <span className={`shrink-0 border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${PRIO[t.prioridad] || PRIO.media}`}>{t.prioridad}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{t.descripcion}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-primary">{agentsById[t.agente_id]?.name || t.agente_id}</span>
                    <div className="flex gap-1">
                      {NEXT[t.status] && (
                        <button data-testid="task-advance-btn" onClick={() => setStatus(t.id, NEXT[t.status])}
                          className="p-1 border border-primary/40 text-primary hover:bg-primary/10" title="Avanzar">
                          <ArrowRight size={12} />
                        </button>
                      )}
                      <button data-testid="task-delete-btn" onClick={() => remove(t.id)}
                        className="p-1 border border-border text-muted-foreground hover:text-destructive" title="Eliminar">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
