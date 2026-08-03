import { useState, useEffect, useCallback } from "react";
import { Loader2, CreditCard, DollarSign, AlertCircle, CheckCircle, Plus, Trash2, RefreshCw, Wallet, Calendar, ArrowRight, Shield } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const SubscriptionsPanel = () => {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [shopSub, setShopSub] = useState(null);
  const [subs, setSubs] = useState([]);
  const [totalCost, setTotalCost] = useState(null);
  const [busy, setBusy] = useState(false);
  const [newSub, setNewSub] = useState({ name: "", amount: 0, billing_cycle: "monthly", next_billing_date: "", payment_method: "paypal", auto_pay: true });
  const [autoTransfer, setAutoTransfer] = useState({ target_amount: 200, bank_email: "", threshold: 50 });

  const load = useCallback(async () => {
    try {
      const [subsRes, costRes] = await Promise.all([
        fetch(`${API}/subscriptions/list`),
        fetch(`${API}/subscriptions/total-cost`),
      ]);
      if (subsRes.ok) setSubs(await subsRes.json());
      if (costRes.ok) setTotalCost(await costRes.json());
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadBalance = async () => {
    setBusy(true);
    try { const res = await fetch(`${API}/paypal/balance`); if (res.ok) setBalance(await res.json()); else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const loadTransactions = async () => {
    setBusy(true);
    try { const res = await fetch(`${API}/paypal/transactions`); if (res.ok) setTransactions(await res.json()); else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const loadShopSub = async () => {
    setBusy(true);
    try { const res = await fetch(`${API}/shopify/subscription`); if (res.ok) setShopSub(await res.json()); else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const addSub = async () => {
    if (!newSub.name.trim() || !newSub.amount) return;
    setBusy(true);
    try {
      await fetch(`${API}/subscriptions/add`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newSub) });
      toast.success("Suscripcion anadida");
      setNewSub({ name: "", amount: 0, billing_cycle: "monthly", next_billing_date: "", payment_method: "paypal", auto_pay: true });
      load();
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const removeSub = async (name) => {
    await fetch(`${API}/subscriptions/${encodeURIComponent(name)}`, { method: "DELETE" });
    toast.success("Suscripcion eliminada");
    load();
  };

  const setupTransfer = async () => {
    if (!autoTransfer.bank_email.trim()) { toast.error("Email del banco requerido"); return; }
    setBusy(true);
    try {
      const res = await fetch(`${API}/paypal/auto-transfer`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(autoTransfer) });
      if (res.ok) { const data = await res.json(); toast.success(data.message); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  return (
    <div data-testid="subscriptions-panel" className="space-y-4">
      {/* PayPal Balance */}
      <div className="border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Wallet size={13} /> PayPal Balance Real</p>
          <button onClick={loadBalance} disabled={busy} className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5">{busy ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Ver saldo</button>
        </div>
        {balance && (
          <div className="space-y-2">
            <div className="border border-primary/40 bg-primary/5 p-4 text-center">
              <p className="font-mono text-[10px] text-muted-foreground uppercase">Saldo disponible</p>
              <p className="font-mono text-3xl text-accent">{balance.total_available_eur} EUR</p>
            </div>
            {balance.balances?.map((b, i) => (
              <div key={i} className="flex justify-between text-xs"><span className="text-muted-foreground">{b.currency}</span><span className="font-mono">{b.available} (pending: {b.pending})</span></div>
            ))}
          </div>
        )}
      </div>

      {/* Shopify Subscription */}
      <div className="border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><CreditCard size={13} /> Suscripcion Shopify Real</p>
          <button onClick={loadShopSub} disabled={busy} className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5">{busy ? <Loader2 size={12} className="animate-spin" /> : <CreditCard size={12} />} Ver plan</button>
        </div>
        {shopSub && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-px bg-border border border-border">
              <div className="bg-secondary px-3 py-2 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Plan</p><p className="text-sm font-medium">{shopSub.plan_name}</p></div>
              <div className="bg-secondary px-3 py-2 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Costo est.</p><p className="font-mono text-sm text-accent">${shopSub.estimated_monthly_cost_usd}/mes</p></div>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground">{shopSub.note}</p>
            <p className="text-xs">Facturacion: {shopSub.billing_email}</p>
            {shopSub.pending_charges?.length > 0 && (
              <div className="border border-amber-500/40 bg-amber-500/10 p-2"><p className="text-[10px] uppercase text-amber-400">Cargos pendientes</p>{shopSub.pending_charges.map((c, i) => <p key={i} className="text-xs">{c.name}: ${c.price} ({c.status})</p>)}</div>
            )}
          </div>
        )}
      </div>

      {/* Total costs */}
      {totalCost && (
        <div className="border border-border bg-card p-4 space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Costo total suscripciones</p>
          <div className="grid grid-cols-3 gap-px bg-border border border-border">
            <div className="bg-secondary px-3 py-2 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Mes</p><p className="font-mono text-lg text-accent">${totalCost.monthly_total}</p></div>
            <div className="bg-secondary px-3 py-2 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">Ano</p><p className="font-mono text-sm text-primary">${totalCost.yearly_total}</p></div>
            <div className="bg-secondary px-3 py-2 text-center"><p className="font-mono text-[9px] text-muted-foreground uppercase">PayPal</p><p className={`font-mono text-sm ${totalCost.can_cover_monthly ? "text-emerald-400" : "text-destructive"}`}>{totalCost.paypal_balance_eur !== null ? `${totalCost.paypal_balance_eur} EUR` : "N/A"}</p></div>
          </div>
          {totalCost.can_cover_monthly !== null && (
            <div className={`border p-2 ${totalCost.can_cover_monthly ? "border-emerald-500/40 bg-emerald-500/10" : "border-destructive/40 bg-destructive/10"}`}>
              <p className={`text-xs flex items-center gap-1.5 ${totalCost.can_cover_monthly ? "text-emerald-400" : "text-destructive"}`}>
                {totalCost.can_cover_monthly ? <><CheckCircle size={12} /> PayPal cubre {totalCost.months_covered} meses de suscripciones</> : <><AlertCircle size={12} /> PayPal NO tiene saldo suficiente. Fondea la cuenta.</>}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Auto-transfer setup */}
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><ArrowRight size={13} /> Auto-transfer PayPal → Banco</p>
        <p className="text-[11px] text-muted-foreground">Transfiere dinero automaticamente de PayPal a tu banco para que Shopify pueda cobrar la tarjeta. Shopify cobra a la tarjeta, no a PayPal.</p>
        <div className="grid grid-cols-3 gap-2">
          <div><label className="text-[10px] uppercase text-muted-foreground">Mantener en banco</label><input type="number" value={autoTransfer.target_amount} onChange={e => setAutoTransfer({ ...autoTransfer, target_amount: parseFloat(e.target.value) || 0 })} className="w-full mt-1 bg-secondary border border-border px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" /></div>
          <div><label className="text-[10px] uppercase text-muted-foreground">Threshold EUR</label><input type="number" value={autoTransfer.threshold} onChange={e => setAutoTransfer({ ...autoTransfer, threshold: parseFloat(e.target.value) || 0 })} className="w-full mt-1 bg-secondary border border-border px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" /></div>
          <div><label className="text-[10px] uppercase text-muted-foreground">Email banco</label><input value={autoTransfer.bank_email} onChange={e => setAutoTransfer({ ...autoTransfer, bank_email: e.target.value })} placeholder="banco@email.com" className="w-full mt-1 bg-secondary border border-border px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" /></div>
        </div>
        <button onClick={setupTransfer} disabled={busy || !autoTransfer.bank_email.trim()} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />} Activar auto-transfer</button>
      </div>

      {/* Tracked subscriptions */}
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Calendar size={13} /> Suscripciones registradas</p>
        <div className="space-y-1">
          {subs.map((s, i) => (
            <div key={i} data-testid={`sub-${s.name}`} className="border border-border/40 px-3 py-2 flex items-center justify-between">
              <div><p className="text-xs font-medium">{s.name} {s.auto_added && <span className="text-[9px] text-muted-foreground">(auto)</span>}</p><p className="font-mono text-[10px] text-muted-foreground">${s.amount}/{s.billing_cycle} · {s.payment_method}{s.auto_pay && " · auto-pay"}</p></div>
              {!s.auto_added && <button onClick={() => removeSub(s.name)} className="text-destructive hover:text-destructive/80"><Trash2 size={13} /></button>}
            </div>
          ))}
          {subs.length === 0 && <p className="text-xs text-muted-foreground">Sin suscripciones registradas</p>}
        </div>
        {/* Add new subscription */}
        <div className="border-t border-border pt-3 space-y-2">
          <p className="text-[10px] uppercase text-muted-foreground">Anadir suscripcion</p>
          <div className="grid grid-cols-2 gap-2">
            <input value={newSub.name} onChange={e => setNewSub({ ...newSub, name: e.target.value })} placeholder="Nombre (ej: Shopify, Hosting)" className="bg-secondary border border-border px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            <input type="number" value={newSub.amount} onChange={e => setNewSub({ ...newSub, amount: parseFloat(e.target.value) || 0 })} placeholder="Costo $" className="bg-secondary border border-border px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
            <select value={newSub.billing_cycle} onChange={e => setNewSub({ ...newSub, billing_cycle: e.target.value })} className="bg-secondary border border-border px-2 py-1.5 text-sm"><option value="monthly">Mensual</option><option value="yearly">Anual</option><option value="weekly">Semanal</option></select>
            <input type="date" value={newSub.next_billing_date} onChange={e => setNewSub({ ...newSub, next_billing_date: e.target.value })} className="bg-secondary border border-border px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={newSub.auto_pay} onChange={e => setNewSub({ ...newSub, auto_pay: e.target.checked })} className="accent-primary" /> Auto-pay via PayPal</label>
          <button onClick={addSub} disabled={busy || !newSub.name.trim()} className="px-3 py-1.5 bg-secondary border border-primary/50 text-primary text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5"><Plus size={12} /> Anadir</button>
        </div>
      </div>

      {/* PayPal transactions */}
      <div className="border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><DollarSign size={13} /> Transacciones PayPal (30 dias)</p>
          <button onClick={loadTransactions} disabled={busy} className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5">{busy ? <Loader2 size={12} className="animate-spin" /> : <DollarSign size={12} />} Ver</button>
        </div>
        {transactions?.transactions?.length > 0 && (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {transactions.transactions.map((t, i) => (
              <div key={i} className="border border-border/40 px-3 py-2 flex items-center justify-between">
                <div><p className="text-xs">{t.description || t.type}</p><p className="font-mono text-[9px] text-muted-foreground">{t.date?.slice(0, 10)} · {t.payer}</p></div>
                <div className="text-right"><p className={`font-mono text-xs ${t.amount >= 0 ? "text-emerald-400" : "text-destructive"}`}>{t.amount >= 0 ? "+" : ""}{t.amount} {t.currency}</p>{t.fee > 0 && <p className="font-mono text-[9px] text-muted-foreground">fee: -{t.fee}</p>}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="border border-border bg-card p-4 space-y-2">
        <p className="text-xs font-bold flex items-center gap-2"><Shield size={13} className="text-primary" /> Como funciona el pago de suscripciones</p>
        <ol className="text-[11px] text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Conecta PayPal en Conectores (Client ID + Secret)</li>
          <li>El sistema revisa tu saldo PayPal real automaticamente</li>
          <li>Shopify cobra a la tarjeta en archivo (no a PayPal directamente)</li>
          <li>Configura auto-transfer PayPal → Banco para asegurar que la tarjeta tenga fondos</li>
          <li>El sistema alerta si no hay saldo suficiente antes de la fecha de cobro</li>
          <li>Auto-pay paga suscripciones que si aceptan PayPal automaticamente</li>
          <li>Todo corre 24/7 sin que tengas que hacer nada</li>
        </ol>
      </div>
    </div>
  );
};
