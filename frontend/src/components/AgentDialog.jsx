import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { AGENT_ICONS } from "../data/agents";
import { ChatBox } from "./ChatBox";

export const AgentDialog = ({ agent, onClose }) => {
  if (!agent) return null;
  const Icon = AGENT_ICONS[agent.icon];
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-testid="agent-dialog" className="max-w-2xl h-[80vh] flex flex-col bg-card border-border p-0 gap-0">
        <DialogHeader className="px-4 py-4 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-3 text-base">
            <span className="p-2 border border-primary/40 text-primary"><Icon size={16} /></span>
            {agent.name}
          </DialogTitle>
          <DialogDescription className="text-xs">{agent.role}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0">
          <ChatBox agentId={agent.id} placeholder={`Pregunta al ${agent.name}...`} testPrefix={`agent-${agent.id}`} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
