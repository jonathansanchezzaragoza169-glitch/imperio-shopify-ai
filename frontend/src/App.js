import { Brain, useEffect, useState, useCallback } from "react";
import "@/App.css";
import { Brain, Toaster } from "sonner";
import { Brain, Crown, Store, LayoutDashboard, ListTodo, Search, Globe, Bot, Users, Layers, CreditCard, ShoppingCart, Compass, Share2, Wrench, Crown, Plug, Power, Rocket, CreditCard, Wallet, Trophy } from "lucide-react";
import { Brain, apiGet } from "./lib/api";
import { Brain, Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import { Brain, MetricsBar } from "./components/MetricsBar";
import { Brain, AgentCard } from "./components/AgentCard";
import { Brain, ActivityFeed } from "./components/ActivityFeed";
import { Brain, CerebroPanel } from "./components/CerebroPanel";
import { Brain, AgentDialog } from "./components/AgentDialog";
import { Brain, TaskBoard } from "./components/TaskBoard";
import { Brain, ProductFinder } from "./components/ProductFinder";
import { Brain, ShopifyPanel } from "./components/ShopifyPanel";
import { Brain, DailyReport } from "./components/DailyReport";
import { Brain, MarketPanel } from "./components/MarketPanel";
import { Brain, StoresPanel } from "./components/StoresPanel";
import { Brain, AutonomyPanel } from "./components/AutonomyPanel";
import { Brain, CollaborationPanel } from "./components/CollaborationPanel";
import { Brain, PaymentsPanel } from "./components/PaymentsPanel";
import { Brain, ShopifyOrdersPanel } from "./components/ShopifyOrdersPanel";
import { Brain, DiscoverPanel } from "./components/DiscoverPanel";
import { Brain, SocialPanel } from "./components/SocialPanel";
import { Brain, ToolsPanel } from "./components/ToolsPanel";
import { Brain, GooglePanel } from "./components/GooglePanel";
import { Brain, ConnectorsPanel } from "./components/ConnectorsPanel";
import { Brain, AutoSystemPanel } from "./components/AutoSystemPanel";
import { Brain, SubscriptionsPanel } from "./components/SubscriptionsPanel";
import { Brain, WalletPanel } from "./components/WalletPanel";
import { Brain, IMASDPanel } from "./components/IMASDPanel";
import { Brain, AutoConnectPanel } from "./components/AutoConnectPanel";
import { Brain, MegaToolsPanel } from "./components/MegaToolsPanel";
import { Brain, AutonomousEnginePanel } from "./components/AutonomousEnginePanel";
import { Brain, PanelImprovements } from "./components/PanelImprovements";
import { Brain, CerebroVozPanel } from "./components/CerebroVozPanel";
import { Brain, CEODashboard } from "./components/CEODashboard";

export default function App() {
  const [agents, setAgents] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [activity, setActivity] = useState([]);
  const [selected, setSelected] = useState(null);
  const [shopify, setShopify] = useState(null);

  const loadShopify = useCallback(() => {
    apiGet("/shopify/status").then(setShopify).catch(() => {});
  }, []);

  useEffect(() => {
    const load = () => {
      apiGet("/agents").then(setAgents).catch(() => {});
      apiGet("/metrics").then(setMetrics).catch(() => {});
      apiGet("/activity").then(setActivity).catch(() => {});
    };
    load();
    loadShopify();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [loadShopify]);

  const agentsById = Object.fromEntries(agents.map((a) => [a.id, a]));
  const gridAgents = agents.filter((a) => a.id !== "cerebro");

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-background text-foreground">
      <Toaster theme="dark" position="top-center" richColors />
      <main className="flex-1 flex flex-col h-full overflow-y-auto px-4 md:px-8 py-6">
        <header data-testid="app-header" className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground glow-cyan">
            <Store size={20} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
              IMPERIO <span className="text-primary text-glow">SHOPIFY AI</span>
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-1.5">
              <Crown size={10} className="text-accent" /> Tu eres el CEO · 10 agentes · APIs reales gratuitas
            </p>
          </div>
          <DailyReport />
        </header>

        <Tabs defaultValue="panel">
          <TabsList data-testid="main-tabs" className="bg-secondary border border-border rounded-none h-auto p-1 mb-6 flex-wrap">
            <TabsTrigger data-testid="tab-autonomous" value="autonomous" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Brain size={13} /> Autónomo</TabsTrigger>
            <TabsTrigger data-testid="tab-autoconnect" value="autoconnect" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Power size={13} /> Auto</TabsTrigger>
            <TabsTrigger data-testid="tab-imasd" value="imasd" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Crown size={13} /> IMASD</TabsTrigger>
            <TabsTrigger data-testid="tab-panel" value="panel" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><LayoutDashboard size={13} /> Panel</TabsTrigger>
            <TabsTrigger data-testid="tab-tareas" value="tareas" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><ListTodo size={13} /> Tareas</TabsTrigger>
            <TabsTrigger data-testid="tab-productos" value="productos" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Search size={13} /> Productos</TabsTrigger>
            <TabsTrigger data-testid="tab-descubrir" value="descubrir" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Compass size={13} /> Descubrir</TabsTrigger>
            <TabsTrigger data-testid="tab-mercado" value="mercado" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Globe size={13} /> Mercado</TabsTrigger>
            <TabsTrigger data-testid="tab-tiendas" value="tiendas" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Layers size={13} /> Tiendas</TabsTrigger>
            <TabsTrigger data-testid="tab-pedidos" value="pedidos" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><ShoppingCart size={13} /> Pedidos</TabsTrigger>
            <TabsTrigger data-testid="tab-pagos" value="pagos" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><CreditCard size={13} /> Pagos</TabsTrigger>
            <TabsTrigger data-testid="tab-redes" value="redes" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Share2 size={13} /> Redes</TabsTrigger>
            <TabsTrigger data-testid="tab-agentes" value="agentes" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Users size={13} /> Agentes</TabsTrigger>
            <TabsTrigger data-testid="tab-master" value="master" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Crown size={13} /> MASTER</TabsTrigger>
            <TabsTrigger data-testid="tab-ultimate" value="ultimate" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Crown size={13} /> ULTIMATE</TabsTrigger>
            <TabsTrigger data-testid="tab-mega-max" value="mega-max" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Crown size={13} /> MEGA MAX</TabsTrigger>
            <TabsTrigger data-testid="tab-auto" value="auto" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Power size={13} /> 24/7</TabsTrigger>
            <TabsTrigger data-testid="tab-suscripciones" value="suscripciones" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><CreditCard size={13} /> Suscripciones</TabsTrigger>
            <TabsTrigger data-testid="tab-wallet" value="wallet" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Wallet size={13} /> Wallet</TabsTrigger>
            <TabsTrigger data-testid="tab-master" value="master" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Crown size={13} /> MASTER</TabsTrigger>
            <TabsTrigger data-testid="tab-ultimate" value="ultimate" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Crown size={13} /> ULTIMATE</TabsTrigger>
            <TabsTrigger data-testid="tab-mega-max" value="mega-max" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Crown size={13} /> MEGA MAX</TabsTrigger>
            <TabsTrigger data-testid="tab-auto" value="auto" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Rocket size={13} /> Auto-Mejoras</TabsTrigger>
            <TabsTrigger data-testid="tab-growth" value="growth" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><TrendingUp size={13} /> Growth</TabsTrigger>
            <TabsTrigger data-testid="tab-mega" value="mega" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Rocket size={13} /> Mega Tools</TabsTrigger>
            <TabsTrigger data-testid="tab-cerebro" value="cerebro" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Brain size={13} /> Cerebro</TabsTrigger>
            <TabsTrigger data-testid="tab-panels" value="panels" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Activity size={13} /> Mejoras</TabsTrigger>
            <TabsTrigger data-testid="tab-conectores" value="conectores" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Plug size={13} /> Conectores</TabsTrigger>
            <TabsTrigger data-testid="tab-google" value="google" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Globe size={13} /> Google</TabsTrigger>
            <TabsTrigger data-testid="tab-herramientas" value="herramientas" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Wrench size={13} /> Herramientas</TabsTrigger>
            <TabsTrigger data-testid="tab-colaboracion" value="colaboracion" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Users size={13} /> Colaboracion</TabsTrigger>
            <TabsTrigger data-testid="tab-autonomia" value="autonomia" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Bot size={13} /> Autonomo</TabsTrigger>
            <TabsTrigger data-testid="tab-shopify" value="shopify" className="rounded-none text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Store size={13} /> Shopify
              <span className={`w-1.5 h-1.5 rounded-full ${shopify?.connected ? "bg-emerald-400" : "bg-muted-foreground"}`} />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="autonomous"><AutonomousEnginePanel /></TabsContent>
          <TabsContent value="autoconnect"><AutoConnectPanel /></TabsContent>
          <TabsContent value="imasd"><IMASDPanel /></TabsContent>
          <TabsContent value="panel">
            <CEODashboard />
          </TabsContent>

          <TabsContent value="tareas"><TaskBoard agentsById={agentsById} /></TabsContent>
          <TabsContent value="productos"><ProductFinder shopifyConnected={shopify?.connected} /></TabsContent>
          <TabsContent value="descubrir"><DiscoverPanel /></TabsContent>
          <TabsContent value="mercado"><MarketPanel /></TabsContent>
          <TabsContent value="tiendas"><StoresPanel /></TabsContent>
          <TabsContent value="pedidos"><ShopifyOrdersPanel /></TabsContent>
          <TabsContent value="pagos"><PaymentsPanel /></TabsContent>
          <TabsContent value="redes"><SocialPanel /></TabsContent>
          <TabsContent value="agentes">
            <MetricsBar metrics={metrics} />
            <h2 className="mt-8 mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Agentes Master</h2>
            <div data-testid="agents-grid" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {gridAgents.map((a, i) => (
                <AgentCard key={a.id} agent={a} index={i} onClick={() => setSelected(a)} />
              ))}
            </div>
            <div className="mt-8 mb-6">
              <ActivityFeed items={activity} agentsById={agentsById} />
            </div>
          </TabsContent>
          <TabsContent value="auto"><AutoSystemPanel /></TabsContent>
          <TabsContent value="suscripciones"><SubscriptionsPanel /></TabsContent>
          <TabsContent value="wallet"><WalletPanel /></TabsContent>
          <TabsContent value="mega"><MegaToolsPanel /></TabsContent>
          <TabsContent value="cerebro"><CerebroVozPanel /></TabsContent>
          <TabsContent value="mega"><CerebroMegaPanel /></TabsContent>
          <TabsContent value="growth"><GrowthPanel /></TabsContent>
          <TabsContent value="auto"><AutoMejorasPanel /></TabsContent>
          <TabsContent value="mega-max"><MegaMaxPanel /></TabsContent>
          <TabsContent value="ultimate"><UltimatePanel /></TabsContent>
          <TabsContent value="master"><MasterPanel /></TabsContent>
          <TabsContent value="panels"><PanelImprovements /></TabsContent>
          <TabsContent value="conectores"><ConnectorsPanel /></TabsContent>
          <TabsContent value="google"><GooglePanel /></TabsContent>
          <TabsContent value="herramientas"><ToolsPanel /></TabsContent>
          <TabsContent value="colaboracion"><CollaborationPanel /></TabsContent>
          <TabsContent value="autonomia"><AutonomyPanel /></TabsContent>
          <TabsContent value="shopify"><ShopifyPanel status={shopify} onStatusChange={loadShopify} /></TabsContent>
        </Tabs>
      </main>

      <div className="hidden lg:flex h-full">
        <CerebroPanel />
      </div>

      <AgentDialog agent={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
