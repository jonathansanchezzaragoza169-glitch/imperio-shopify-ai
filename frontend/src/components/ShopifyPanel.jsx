import { useState, useEffect } from "react";
import { Store, Loader2, Unplug, Package } from "lucide-react";
import { toast } from "sonner";
import { apiGet } from "../lib/api";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ShopifyPanel = ({ status, onStatusChange }) => {
  const [domain, setDomain] = useState("");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (status?.connected) apiGet("/shopify/products").then(setProducts).catch(() => {});
  }, [status?.connected]);

  const connect = async () => {
    if (!domain.trim() || !token.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/shopify/connect`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop_domain: domain, access_token: token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      toast.success(`Tienda "${data.shop_name}" conectada`);
      onStatusChange();
    } catch (e) {
      toast.error(e.message || "Error al conectar");
    }
    setBusy(false);
  };

  const disconnect = async () => {
    await fetch(`${API}/shopify/disconnect`, { method: "DELETE" });
    setProducts([]);
    onStatusChange();
    toast.success("Tienda desconectada");
  };

  if (!status?.connected) {
    return (
      <div data-testid="shopify-connect-panel" className="border border-border bg-card p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 border border-primary/40 text-primary"><Store size={18} /></div>
          <div>
            <h3 className="text-sm font-bold">Conecta tu tienda Shopify real</h3>
            <p className="text-xs text-muted-foreground">Tus agentes trabajarán con tus productos y pedidos reales</p>
          </div>
        </div>
        <div className="space-y-3">
          <input
            data-testid="shopify-domain-input"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Dominio: mitienda.myshopify.com"
            className="w-full bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            data-testid="shopify-token-input"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            type="password"
            placeholder="Admin API Access Token (shpat_...)"
            className="w-full bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            data-testid="shopify-connect-btn"
            onClick={connect}
            disabled={busy || !domain.trim() || !token.trim()}
            className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2 glow-cyan"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Store size={15} />}
            {busy ? "Conectando..." : "Conectar tienda"}
          </button>
        </div>
        <div className="mt-5 border-t border-border pt-4 font-mono text-[11px] text-muted-foreground leading-relaxed">
          <p className="text-foreground mb-1">Cómo obtener tu Access Token:</p>
          1. En tu admin de Shopify → Configuración → Apps y canales de venta<br />
          2. "Desarrollar apps" → "Crear una app" (ej: "Imperio AI")<br />
          3. Configura los permisos Admin API: read_products, write_products, read_orders<br />
          4. Instala la app y copia el token (empieza por shpat_)
        </div>
      </div>
    );
  }

  return (
    <div data-testid="shopify-store-panel" className="space-y-4">
      <div className="border border-border bg-card p-4 flex items-center gap-3">
        <div className="p-2 border border-accent/50 text-accent glow-gold"><Store size={18} /></div>
        <div className="flex-1">
          <h3 className="text-sm font-bold">{status.shop_name}</h3>
          <p className="font-mono text-[10px] text-muted-foreground">{status.shop_domain} · CONECTADA</p>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
        <button data-testid="shopify-disconnect-btn" onClick={disconnect}
          className="p-2 border border-border text-muted-foreground hover:text-destructive" title="Desconectar">
          <Unplug size={15} />
        </button>
      </div>

      <div className="border border-border bg-card">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Productos reales ({products.length})</h3>
        </div>
        {products.length === 0 ? (
          <p className="p-4 text-xs text-muted-foreground font-mono">// Sin productos aún. Importa desde la pestaña Productos.</p>
        ) : (
          <div className="divide-y divide-border/60 max-h-96 overflow-y-auto">
            {products.map((p) => (
              <div key={p.id} data-testid="shopify-product-row" className="px-4 py-2.5 flex items-center gap-3">
                {p.image ? (
                  <img src={p.image} alt={p.title} className="w-9 h-9 object-cover border border-border" />
                ) : (
                  <div className="w-9 h-9 flex items-center justify-center bg-secondary text-muted-foreground"><Package size={14} /></div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{p.title}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{p.status} · stock: {p.inventory ?? "—"}</p>
                </div>
                <span className="font-mono text-xs text-primary">${p.price}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
