import { useState, useEffect, useCallback } from "react";
import { Loader2, Wallet, CreditCard, ArrowLeftRight, Building, RefreshCw, Plus, Trash2, Shield, DollarSign, Banknote, PiggyBank, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const WalletPanel = () => {
  const [dashboard, setDashboard] = useState(null);
  const [walletTxns, setWalletTxns] = useState(null);
  const [bankCards, setBankCards] = useState([]);
  const [busy, setBusy] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [newCard, setNewCard] = useState({ name: "", bank: "", card_type: "debit", last4: "", balance_eur: 0, currency: "EUR", expiry_month: "", expiry_year: "", is_shopify_card: false, auto_refill: false, refill_threshold: 50, refill_amount: 200 });
  const [transfer, setTransfer] = useState({ from_source: "paypal", to_source: "bank_card", amount: 0, currency: "EUR" });
  const [wiseConfig, setWiseConfig] = useState({ api_key: "", profile_id: "" });
  const [nordigenConfig, setNordigenConfig] = useState({ secret_id: "", secret_key: "" });
  const [nordigenBanks, setNordigenBanks] = useState(null);
  const [nordigenAccounts, setNordigenAccounts] = useState(null);

  const load = useCallback(async () => {
    try {
      const [dashRes, cardsRes] = await Promise.all([
        fetch(`${API}/money/dashboard`),
        fetch(`${API}/bank-cards/list`),
      ]);
      if (dashRes.ok) setDashboard(await dashRes.json());
      if (cardsRes.ok) setBankCards(await cardsRes.json());
    } catch {}
  }, []);

  useEffect(() => { load(); const i = setInterval(load, 30000); return () => clearInterval(i); }, [load]);

  const loadTxns = async () => {
    setBusy(true);
    try { const res = await fetch(`${API}/wallet/transactions?limit=30`); if (res.ok) setWalletTxns(await res.json()); } catch {}
    setBusy(false);
  };

  const addCard = async () => {
    if (!newCard.name.trim() || !newCard.last4.trim()) return;
    setBusy(true);
    try {
      await fetch(`${API}/bank-cards/add`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newCard) });
      toast.success("Tarjeta anadida");
      setNewCard({ name: "", bank: "", card_type: "debit", last4: "", balance_eur: 0, currency: "EUR", expiry_month: "", expiry_year: "", is_shopify_card: false, auto_refill: false, refill_threshold: 50, refill_amount: 200 });
      setShowAddCard(false);
      load();
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const removeCard = async (name) => {
    await fetch(`${API}/bank-cards/${encodeURIComponent(name)}`, { method: "DELETE" });
    toast.success("Tarjeta eliminada");
    load();
  };

  const doTransfer = async () => {
    if (transfer.amount <= 0) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/wallet/transfer`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(transfer) });
      if (res.ok) { toast.success(`Transferencia ${transfer.from_source} → ${transfer.to_source}: ${transfer.amount} EUR`); setShowTransfer(false); setTransfer({ ...transfer, amount: 0 }); load(); }
      else { const e = await res.json(); toast.error(e.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const saveWise = async () => {
    if (!wiseConfig.api_key.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/wise/config`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(wiseConfig) });
      if (res.ok) { const data = await res.json(); if (data.ok) toast.success("Wise conectado"); else toast.error(data.error || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const saveNordigen = async () => {
    if (!nordigenConfig.secret_id.trim() || !nordigenConfig.secret_key.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/nordigen/config`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nordigenConfig) });
      if (res.ok) { const data = await res.json(); if (data.ok) toast.success("Nordigen conectado"); else toast.error(data.detail || "Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const loadNordigenBanks = async () => {
    setBusy(true);
    try { const res = await fetch(`${API}/nordigen/banks`); if (res.ok) setNordigenBanks(await res.json()); else { const e = await res.json(); toast.error(e.detail || "Error"); } } catch { toast.error("Error"); }
    setBusy(false);
  };

  const linkBank = async (bankId) => {
    setBusy(true);
    try {
      const res = await fetch(`${API}/nordigen/link-bank`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bank_id: bankId }) });
      if (res.ok) { const data = await res.json(); if (data.ok) { toast.success("Banco vinculado! Autoriza en el link."); window.open(data.link, "_blank"); } else toast.error("Error"); }
    } catch { toast.error("Error"); }
    setBusy(false);
  };

  const loadNordigenAccounts = async () => {
    setBusy(true);
    try { const res = await fetch(`${API}/nordigen/accounts`); if (res.ok) setNordigenAccounts(await res.json()); else { const e = await res.json(); toast.error(e.detail || "Error"); } } catch { toast.error("Error"); }
    setBusy(false);
  };

  return (
    <div data-testid="wallet-panel" className="space-y-4">
      {/* TOTAL BALANCE */}
      {dashboard && (
        <div className="border border-primary/40 bg-primary/5 p-4 text-center">
          <p className="font-mono text-[10px] text-muted-foreground uppercase">Dinero total (todas las fuentes)</p>
          <p className="font-mono text-4xl text-accent">{dashboard.total_eur} EUR</p>
          <p className="font-mono text-[10px] text-muted-foreground mt-1">{Object.keys(dashboard.sources || {}).length} fuentes conectadas</p>
        </div>
      )}

      {/* SOURCES GRID */}
      {dashboard?.sources && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(dashboard.sources).map(([key, val]) => (
            <div key={key} data-testid={`source-${key}`} className="border border-border bg-card p-3">
              <div className="flex items-center gap-2 mb-1">
                {key === "paypal" && <DollarSign size={13} className="text-primary" />}
                {key === "stripe" && <CreditCard size={13} className="text-primary" />}
                {key === "wise" && <Wallet size={13} className="text-primary" />}
                {key === "bank_cards" && <Banknote size={13} className="text-primary" />}
                {key === "wallet" && <PiggyBank size={13} className="text-primary" />}
                {key === "nordigen" && <Building size={13} className="text-primary" />}
                <span className="text-xs font-medium capitalize">{key.replace(/_/g, " ")}</span>
              </div>
              {val.balance_eur !== undefined ? (
                <p className="font-mono text-lg text-accent">{val.balance_eur} EUR</p>
              ) : (
                <p className="text-xs text-muted-foreground">{val.note || "Configurado"}</p>
              )}
              {val.count && <p className="font-mono text-[9px] text-muted-foreground">{val.count} tarjetas</p>}
              <span className={`font-mono text-[9px] ${val.type === "external" ? "text-emerald-400" : val.type === "tracked" ? "text-amber-400" : "text-muted-foreground"}`}>{val.type}</span>
            </div>
          ))}
        </div>
      )}

      {/* AGENT SPENDING */}
      {dashboard?.agent_spending && Object.keys(dashboard.agent_spending).length > 0 && (
        <div className="border border-border bg-card p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Gastos por agente</p>
          <div className="space-y-1">
            {Object.entries(dashboard.agent_spending).map(([agent, amount]) => (
              <div key={agent} className="flex justify-between text-xs">
                <span className="capitalize">{agent}</span>
                <span className="font-mono text-destructive">-{amount} EUR</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TRANSFER BETWEEN SOURCES */}
      <div className="border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><ArrowLeftRight size={13} /> Transferir dinero</p>
          <button onClick={() => setShowTransfer(!showTransfer)} className="text-xs text-primary">{showTransfer ? "Cancelar" : "Transferir"}</button>
        </div>
        {showTransfer && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase text-muted-foreground">Desde</label>
                <select value={transfer.from_source} onChange={e => setTransfer({ ...transfer, from_source: e.target.value })} className="w-full mt-1 bg-secondary border border-border px-2 py-1.5 text-sm">
                  <option value="paypal">PayPal</option><option value="stripe">Stripe</option><option value="wallet">Wallet</option><option value="bank_card">Tarjeta</option><option value="wise">Wise</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase text-muted-foreground">Hacia</label>
                <select value={transfer.to_source} onChange={e => setTransfer({ ...transfer, to_source: e.target.value })} className="w-full mt-1 bg-secondary border border-border px-2 py-1.5 text-sm">
                  <option value="bank_card">Tarjeta</option><option value="paypal">PayPal</option><option value="stripe">Stripe</option><option value="wallet">Wallet</option><option value="wise">Wise</option>
                </select>
              </div>
            </div>
            <input type="number" value={transfer.amount} onChange={e => setTransfer({ ...transfer, amount: parseFloat(e.target.value) || 0 })} placeholder="Cantidad EUR" className="w-full bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
            <button onClick={doTransfer} disabled={busy || transfer.amount <= 0} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <ArrowLeftRight size={14} />} Transferir {transfer.amount} EUR</button>
          </div>
        )}
      </div>

      {/* BANK CARDS */}
      <div className="border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Banknote size={13} /> Tarjetas bancarias</p>
          <button onClick={() => setShowAddCard(!showAddCard)} className="text-xs text-primary flex items-center gap-1"><Plus size={12} /> Anadir</button>
        </div>
        {bankCards.map((card, i) => (
          <div key={i} data-testid={`card-${card.name}`} className="border border-border/40 p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium flex items-center gap-2">{card.name} {card.is_shopify_card && <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5">SHOPIFY</span>}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{card.bank} ****{card.last4} · {card.card_type}</p>
              <p className="font-mono text-sm text-accent">{card.balance_eur} EUR</p>
              {card.auto_refill && <p className="font-mono text-[9px] text-emerald-400">auto-refill: +{card.refill_amount} cuando < {card.refill_threshold}</p>}
            </div>
            <button onClick={() => removeCard(card.name)} className="text-destructive"><Trash2 size={13} /></button>
          </div>
        ))}
        {showAddCard && (
          <div className="border-t border-border pt-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input value={newCard.name} onChange={e => setNewCard({ ...newCard, name: e.target.value })} placeholder="Nombre (ej: BBVA Principal)" className="bg-secondary border border-border px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              <input value={newCard.bank} onChange={e => setNewCard({ ...newCard, bank: e.target.value })} placeholder="Banco (BBVA, Santander...)" className="bg-secondary border border-border px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              <input value={newCard.last4} onChange={e => setNewCard({ ...newCard, last4: e.target.value })} placeholder="Ultimos 4 digitos" maxLength="4" className="bg-secondary border border-border px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
              <select value={newCard.card_type} onChange={e => setNewCard({ ...newCard, card_type: e.target.value })} className="bg-secondary border border-border px-2 py-1.5 text-sm"><option value="debit">Debito</option><option value="credit">Credito</option><option value="prepaid">Prepago</option></select>
              <input type="number" value={newCard.balance_eur} onChange={e => setNewCard({ ...newCard, balance_eur: parseFloat(e.target.value) || 0 })} placeholder="Saldo EUR" className="bg-secondary border border-border px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
              <input value={newCard.expiry_month} onChange={e => setNewCard({ ...newCard, expiry_month: e.target.value })} placeholder="MM" maxLength="2" className="bg-secondary border border-border px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={newCard.is_shopify_card} onChange={e => setNewCard({ ...newCard, is_shopify_card: e.target.checked })} className="accent-primary" /> Es la tarjeta que cobra Shopify</label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={newCard.auto_refill} onChange={e => setNewCard({ ...newCard, auto_refill: e.target.checked })} className="accent-primary" /> Auto-refill desde PayPal cuando saldo bajo</label>
            {newCard.auto_refill && (
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-[10px] uppercase text-muted-foreground">Recargar cuando < </label><input type="number" value={newCard.refill_threshold} onChange={e => setNewCard({ ...newCard, refill_threshold: parseFloat(e.target.value) || 0 })} className="w-full bg-secondary border border-border px-2 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" /></div>
                <div><label className="text-[10px] uppercase text-muted-foreground">Cantidad recarga</label><input type="number" value={newCard.refill_amount} onChange={e => setNewCard({ ...newCard, refill_amount: parseFloat(e.target.value) || 0 })} className="w-full bg-secondary border border-border px-2 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" /></div>
              </div>
            )}
            <button onClick={addCard} disabled={busy || !newCard.name.trim()} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2">{busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Guardar tarjeta</button>
          </div>
        )}
      </div>

      {/* WISE CONFIG */}
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Wallet size={13} /> Wise (TransferWise)</p>
        <p className="text-[11px] text-muted-foreground">Wallet multi-moneda real. API gratuita. Obtén tu API key en wise.com/api</p>
        <input type="password" value={wiseConfig.api_key} onChange={e => setWiseConfig({ ...wiseConfig, api_key: e.target.value })} placeholder="API Key Wise" className="w-full bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
        <button onClick={saveWise} disabled={busy || !wiseConfig.api_key.trim()} className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-40">Conectar Wise</button>
      </div>

      {/* NORDIGEN OPEN BANKING */}
      <div className="border border-border bg-card p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><Building size={13} /> Open Banking (Nordigen) - GRATIS</p>
        <p className="text-[11px] text-muted-foreground">Conecta tu banco real (BBVA, Santander, CaixaBank...). Saldo y transacciones reales. Gratis. Registrate en nordigen.com</p>
        <div className="grid grid-cols-2 gap-2">
          <input type="password" value={nordigenConfig.secret_id} onChange={e => setNordigenConfig({ ...nordigenConfig, secret_id: e.target.value })} placeholder="Secret ID" className="bg-secondary border border-border px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
          <input type="password" value={nordigenConfig.secret_key} onChange={e => setNordigenConfig({ ...nordigenConfig, secret_key: e.target.value })} placeholder="Secret Key" className="bg-secondary border border-border px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <button onClick={saveNordigen} disabled={busy || !nordigenConfig.secret_id.trim()} className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-40">Conectar Nordigen</button>
        <button onClick={loadNordigenBanks} disabled={busy} className="px-3 py-1.5 border border-primary/50 text-primary text-xs font-semibold ml-2">Ver bancos</button>
        {nordigenBanks?.banks?.length > 0 && (
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {nordigenBanks.banks.map(b => (
              <button key={b.id} onClick={() => linkBank(b.id)} className="w-full text-left border border-border/40 px-3 py-2 hover:border-primary/40 flex items-center gap-2">
                {b.logo && <img src={b.logo} alt="" className="w-6 h-6" />}
                <span className="text-xs">{b.name}</span>
              </button>
            ))}
          </div>
        )}
        {nordigenBanks?.banks?.length > 0 && <button onClick={loadNordigenAccounts} disabled={busy} className="px-3 py-1.5 bg-secondary border border-primary/50 text-primary text-xs font-semibold">Ver cuentas reales</button>}
        {nordigenAccounts?.accounts?.length > 0 && (
          <div className="space-y-2">
            {nordigenAccounts.accounts.map((acc, i) => (
              <div key={i} className="border border-border/40 p-2">
                <p className="text-xs font-medium">{acc.name}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{acc.iban}</p>
                {acc.balances?.map((b, j) => <p key={j} className="font-mono text-sm text-accent">{b.amount} {b.currency} ({b.type})</p>)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WALLET TRANSACTIONS */}
      <div className="border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-[0.2em] text-accent flex items-center gap-2"><RefreshCw size={13} /> Movimientos wallet</p>
          <button onClick={loadTxns} disabled={busy} className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-40">Ver</button>
        </div>
        {walletTxns?.transactions?.length > 0 && (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {walletTxns.transactions.map((t, i) => (
              <div key={i} className="border border-border/40 px-3 py-2 flex items-center justify-between">
                <div><p className="text-xs">{t.description}</p><p className="font-mono text-[9px] text-muted-foreground">{t.timestamp?.slice(0, 16)} · {t.agent} · {t.source}</p></div>
                <p className={`font-mono text-xs ${t.amount >= 0 ? "text-emerald-400" : "text-destructive"}`}>{t.amount >= 0 ? "+" : ""}{t.amount} {t.currency}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HOW IT WORKS */}
      <div className="border border-border bg-card p-4 space-y-2">
        <p className="text-xs font-bold flex items-center gap-2"><Shield size={13} className="text-primary" /> Como funciona el dinero 24/7</p>
        <ol className="text-[11px] text-muted-foreground space-y-1 list-decimal list-inside">
          <li>PayPal: saldo real + retiros reales (ya conectado)</li>
          <li>Stripe: saldo real + retiros a banco (ya conectado)</li>
          <li>Wise: wallet multi-moneda real (API gratuita)</li>
          <li>Nordigen: banco real BBVA/Santander/CaixaBank (gratis, Open Banking)</li>
          <li>Tarjetas: registra tus tarjetas para auto-refill</li>
          <li>Wallet interna: los agentes mueven dinero aqui</li>
          <li>Auto-refill: si tarjeta baja de X, recarga desde PayPal</li>
          <li>Transferencias: mueve dinero entre PayPal, Stripe, banco, Wise</li>
          <li>Agentes: cada agente tiene limite de gasto (capital: $1000, rrss: $300...)</li>
          <li>Todo 24/7 automatico</li>
        </ol>
      </div>
    </div>
  );
};
