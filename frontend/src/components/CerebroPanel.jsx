import { Brain } from "lucide-react";
import { ChatBox } from "./ChatBox";

export const CerebroPanel = () => (
  <aside data-testid="cerebro-panel" className="w-full lg:w-96 shrink-0 border-l border-border bg-black/40 backdrop-blur-xl h-full flex flex-col">
    <div className="px-4 py-4 border-b border-border flex items-center gap-3">
      <div className="w-10 h-10 flex items-center justify-center border border-accent/50 text-accent glow-gold">
        <Brain size={20} />
      </div>
      <div>
        <h2 className="text-sm font-bold tracking-tight">CEREBRO MASTER</h2>
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          Tú diriges · voz o chat
        </p>
      </div>
      <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
    </div>
    <ChatBox agentId="cerebro" voice placeholder="Da una orden a tu imperio..." testPrefix="cerebro" />
  </aside>
);
