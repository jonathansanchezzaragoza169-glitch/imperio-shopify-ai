import { AGENT_ICONS } from "../data/agents";

export const AgentCard = ({ agent, index, onClick }) => {
  const Icon = AGENT_ICONS[agent.icon];
  const isGold = agent.color === "gold";
  return (
    <button
      data-testid={`agent-card-${agent.id}`}
      onClick={onClick}
      className="agent-card fade-up text-left bg-card border border-border p-4 focus:outline-none focus:ring-2 focus:ring-primary"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className={`p-2 border ${isGold ? "border-accent/40 text-accent" : "border-primary/40 text-primary"}`}>
          <Icon size={18} />
        </div>
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className={`w-1.5 h-1.5 rounded-full pulse-dot ${agent.status === "activo" ? "bg-emerald-400" : "bg-accent"}`} />
          {agent.status}
        </span>
      </div>
      <h3 className="mt-3 text-sm font-semibold">{agent.name}</h3>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{agent.role}</p>
      <p className="mt-3 font-mono text-[11px] text-primary">{agent.tasks} tareas en curso</p>
    </button>
  );
};
