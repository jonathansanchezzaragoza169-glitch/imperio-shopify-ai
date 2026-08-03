import { useEffect, useState } from "react";
import { AGENT_ICONS } from "../data/agents";
import { Newspaper, ExternalLink } from "lucide-react";

export const ActivityFeed = ({ items, agentsById }) => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/market/news`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setNews(data.slice(0, 5)); })
      .catch(() => {});
  }, []);

  return (
    <div data-testid="activity-feed" className="space-y-3">
      <div className="border border-border bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Actividad en tiempo real</h2>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
        </div>
        <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
          {items.map((it) => {
            const agent = agentsById[it.agent_id];
            const Icon = agent ? AGENT_ICONS[agent.icon] : null;
            return (
              <div key={it.id} data-testid="activity-item" className="px-4 py-2.5 flex items-center gap-3">
                {Icon && <Icon size={14} className="text-primary shrink-0" />}
                <div className="min-w-0">
                  <p className="text-xs text-foreground truncate">{it.text}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {it.agent_name} · {new Date(it.timestamp).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {news.length > 0 && (
        <div data-testid="news-ticker" className="border border-border bg-card">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Newspaper size={13} className="text-accent" /> Noticias tech / e-commerce
            </h2>
            <span className="font-mono text-[10px] text-muted-foreground">Hacker News · en vivo</span>
          </div>
          <div className="max-h-40 overflow-y-auto divide-y divide-border/60">
            {news.map((n, i) => (
              <a key={n.id || i} href={n.url} target="_blank" rel="noreferrer" data-testid={`feed-news-item-${i}`}
                className="px-4 py-2 flex items-center gap-2 hover:bg-secondary transition-colors duration-150 group">
                <ExternalLink size={11} className="text-muted-foreground shrink-0 group-hover:text-primary" />
                <p className="text-xs text-foreground truncate flex-1">{n.title}</p>
                <span className="font-mono text-[10px] text-muted-foreground shrink-0">{n.score}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
