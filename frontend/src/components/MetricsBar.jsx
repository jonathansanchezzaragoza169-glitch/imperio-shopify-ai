import { useEffect, useState } from "react";
import { DollarSign, Store, Package, Activity, TrendingUp, PiggyBank, Globe, AlertTriangle } from "lucide-react";

const fmt = (n) => new Intl.NumberFormat("es-ES").format(n);

export const MetricsBar = ({ metrics }) => {
  const [eurRate, setEurRate] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/market/exchange-rates`)
      .then((r) => r.json())
      .then((d) => { if (d?.rates?.EUR) setEurRate(d.rates.EUR); })
      .catch(() => {});
  }, []);

  if (!metrics) return null;
  const items = [
    { label: "Ingresos", value: `$${fmt(metrics.ingresos)}`, icon: DollarSign, gold: true },
    { label: "Beneficio", value: `$${fmt(metrics.beneficio)}`, icon: PiggyBank, gold: true },
    { label: "Tiendas", value: metrics.tiendas, icon: Store },
    { label: "Productos", value: metrics.productos, icon: Package },
    { label: "Tareas activas", value: metrics.tareas_activas, icon: Activity },
    { label: "ROAS", value: metrics.roas > 0 ? `${metrics.roas}x` : "—", icon: TrendingUp },
  ];
  return (
    <div className="space-y-2">
      {!metrics.shopify_conectado && (
        <div data-testid="shopify-warning" className="flex items-center gap-2 border border-accent/40 bg-accent/10 px-4 py-2 text-xs text-accent">
          <AlertTriangle size={14} />
          Shopify no conectado. Conecta tu tienda en la pestana Shopify para ver datos reales de ingresos y pedidos.
        </div>
      )}
      <div data-testid="metrics-bar" className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-px bg-border border border-border">
        {items.map((m, i) => (
          <div key={m.label} data-testid={`metric-${i}`} className="bg-card px-4 py-4 fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-2 text-muted-foreground">
              <m.icon size={13} className={m.gold ? "text-accent" : "text-primary"} />
              <span className="text-[10px] uppercase tracking-[0.15em]">{m.label}</span>
            </div>
            <p className={`mt-1 font-mono text-lg md:text-xl font-medium ${m.gold ? "text-accent" : "text-foreground"}`}>{m.value}</p>
          </div>
        ))}
        <div data-testid="metric-eur" className="bg-card px-4 py-4 fade-up" style={{ animationDelay: `${items.length * 60}ms` }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe size={13} className="text-primary" />
            <span className="text-[10px] uppercase tracking-[0.15em]">USD/EUR</span>
          </div>
          <p className="mt-1 font-mono text-lg md:text-xl font-medium text-primary">
            {eurRate ? eurRate.toFixed(4) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
};
