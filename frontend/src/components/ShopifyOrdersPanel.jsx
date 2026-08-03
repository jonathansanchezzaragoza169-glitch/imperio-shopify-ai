import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, Package, AlertTriangle, BarChart3, TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ShopifyOrdersPanel = () => {
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [alerts, setAlerts] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState({});

  const fetchWithKey = useCallback(async (key, path) => {
    setLoading((l) => ({ ...l, [key]: true }));
    try {
      const res = await fetch(`${API}${path}`);
      if (!res.ok) {
        const e = await res.json();
        toast.error(e.detail || "Error");
        return null;
      }
      return await res.json();
    } catch {
      toast.error("Error de conexion");
      return null;
    } finally {
      setLoading((l) => ({ ...l, [key]: false }));
    }
  }, []);

  const loadAll = useCallback(() => {
    fetchWithKey("orders", "/shopify/orders").then((d) => d && setOrders(d));
    fetchWithKey("alerts", "/shopify/inventory-alerts").then((d) => d && setAlerts(d));
    fetchWithKey("analytics", "/shopify/analytics").then((d) => d && setAnalytics(d));
  }, [fetchWithKey]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const Section = ({ icon: Icon, title, children, isLoading, onRefresh, testId }) => (
    <div data-testid={testId} className="border border-border bg-card">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <Icon size={13} className="text-primary" /> {title}
        </span>
        <button onClick={onRefresh} disabled={isLoading} className="p-1 text-muted-foreground hover:text-primary transition-colors">
          {isLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
        </button>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );

  return (
    <div data-testid="shopify-orders-panel" className="space-y-4">
      <div className="flex gap-1 border border-border bg-card p-1 flex-wrap">
        {[
          { id: "orders", label: "Pedidos reales", icon: ShoppingCart },
          { id: "alerts", label: "Alertas inventario", icon: AlertTriangle },
          { id: "analytics", label: "Analiticas", icon: BarChart3 },
        ].map(t => (
          <button key={t.id} data-testid={`orders-tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-colors duration-200 ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* ORDERS */}
      {tab === "orders" && (
        <Section icon={ShoppingCart} title={`Pedidos reales (${orders.length})`} isLoading={loading.orders} onRefresh={() => fetchWithKey("orders", "/shopify/orders").then((d) => d && setOrders(d))} testId="real-orders-section">
          {orders.length === 0 ? (
            loading.orders ? (
              <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div>
            ) : (
              <p className="text-xs text-muted-foreground font-mono">// Sin pedidos o Shopify no conectado. Conecta tu tienda en la pestana Shopify.</p>
            )
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {orders.map((o, i) => (
                <div key={o.id || i} data-testid={`order-${i}`} className="border border-border bg-secondary p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold">#{o.order_number || o.id}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{o.customer_name || "Cliente"} · {o.customer_email || ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm text-accent">${o.total} {o.currency}</p>
                      <span className={`font-mono text-[10px] uppercase ${o.financial_status === "paid" ? "text-emerald-400" : "text-muted-foreground"}`}>
                        {o.financial_status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {o.items?.map((item, j) => (
                      <span key={j} className="text-[10px] border border-border px-1.5 py-0.5">
                        {item.quantity}x {item.name?.slice(0, 30)}
                      </span>
                    ))}
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <span className={`font-mono text-[9px] uppercase ${o.fulfillment_status === "fulfilled" ? "text-emerald-400" : "text-accent"}`}>
                      {o.fulfillment_status || "unfulfilled"}
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground">{o.date?.slice(0, 10)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* INVENTORY ALERTS */}
      {tab === "alerts" && (
        <Section icon={AlertTriangle} title="Alertas de inventario real" isLoading={loading.alerts} onRefresh={() => fetchWithKey("alerts", "/shopify/inventory-alerts").then((d) => d && setAlerts(d))} testId="inventory-alerts-section">
          {!alerts ? (
            <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div>
          ) : alerts.total === 0 ? (
            <div className="text-center py-8">
              <Package size={32} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-emerald-400">Todo el inventario esta bien. Sin alertas.</p>
            </div>
          ) : (
            <>
              <div className="flex gap-4 mb-3 text-xs">
                <span className="text-muted-foreground">Total: <span className="text-foreground font-mono">{alerts.total}</span></span>
                <span className="text-muted-foreground">Criticos (0 stock): <span className="text-destructive font-mono">{alerts.critical}</span></span>
                <span className="text-muted-foreground">Bajo (<=5): <span className="text-accent font-mono">{alerts.total - alerts.critical}</span></span>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {alerts.alerts.map((a, i) => (
                  <div key={i} data-testid={`alert-${i}`} className={`border p-2.5 ${a.severity === "critical" ? "border-destructive/50 bg-destructive/10" : "border-accent/40 bg-accent/5"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium">{a.product_title}</p>
                        {a.variant_title && a.variant_title !== "Default Title" && <p className="text-[10px] text-muted-foreground">{a.variant_title}</p>}
                        {a.sku && <p className="font-mono text-[10px] text-muted-foreground">SKU: {a.sku}</p>}
                      </div>
                      <div className="text-right">
                        <span className={`font-mono text-sm ${a.severity === "critical" ? "text-destructive" : "text-accent"}`}>{a.inventory}</span>
                        <p className="font-mono text-[9px] text-muted-foreground uppercase">{a.severity === "critical" ? "SIN STOCK" : "Stock bajo"}</p>
                      </div>
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground mt-1">Precio: ${a.price}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </Section>
      )}

      {/* ANALYTICS */}
      {tab === "analytics" && (
        <Section icon={BarChart3} title="Analiticas reales de revenue" isLoading={loading.analytics} onRefresh={() => fetchWithKey("analytics", "/shopify/analytics").then((d) => d && setAnalytics(d))} testId="analytics-section">
          {!analytics ? (
            <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-px bg-border border border-border">
                <div className="bg-secondary px-3 py-3 text-center">
                  <TrendingUp size={14} className="text-accent mx-auto mb-1" />
                  <p className="font-mono text-[9px] text-muted-foreground uppercase">Revenue total</p>
                  <p className="font-mono text-lg text-accent mt-1">${analytics.total_revenue?.toFixed(2)}</p>
                </div>
                <div className="bg-secondary px-3 py-3 text-center">
                  <ShoppingCart size={14} className="text-primary mx-auto mb-1" />
                  <p className="font-mono text-[9px] text-muted-foreground uppercase">Pedidos</p>
                  <p className="font-mono text-lg text-primary mt-1">{analytics.total_orders}</p>
                </div>
                <div className="bg-secondary px-3 py-3 text-center">
                  <BarChart3 size={14} className="text-primary mx-auto mb-1" />
                  <p className="font-mono text-[9px] text-muted-foreground uppercase">Ticket medio</p>
                  <p className="font-mono text-lg text-foreground mt-1">${analytics.avg_order_value?.toFixed(2)}</p>
                </div>
              </div>

              {/* Revenue by day */}
              {analytics.revenue_by_day?.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Revenue por dia</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {analytics.revenue_by_day.map((d, i) => {
                      const maxRev = Math.max(...analytics.revenue_by_day.map(x => x.revenue), 1);
                      const pct = (d.revenue / maxRev) * 100;
                      return (
                        <div key={i} data-testid={`revenue-day-${i}`} className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-muted-foreground w-24 shrink-0">{d.date}</span>
                          <div className="flex-1 h-4 bg-secondary border border-border">
                            <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="font-mono text-[10px] text-accent w-20 text-right shrink-0">${d.revenue.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top products */}
              {analytics.top_products?.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Top productos por revenue</p>
                  <div className="space-y-1">
                    {analytics.top_products.map((p, i) => (
                      <div key={i} data-testid={`top-product-${i}`} className="flex items-center justify-between border border-border bg-secondary px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-[10px] text-primary shrink-0">#{i + 1}</span>
                          <span className="text-xs text-foreground truncate">{p.name}</span>
                        </div>
                        <div className="flex gap-3 shrink-0">
                          <span className="font-mono text-[10px] text-muted-foreground">{p.quantity}u</span>
                          <span className="font-mono text-xs text-accent">${p.revenue.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Section>
      )}
    </div>
  );
};
