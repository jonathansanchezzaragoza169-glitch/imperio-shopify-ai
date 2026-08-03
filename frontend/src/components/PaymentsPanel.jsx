import { useState, useEffect, useCallback } from "react";
import { CreditCard, Wallet, Loader2, Settings, ArrowDownToLine, RefreshCw, Banknote, Mail, Send, Download, Package, AlertTriangle, BarChart3 } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const PaymentsPanel = () => {
  const [tab, setTab] = useState("withdraw");
  const [config, setConfig] = useState({ paypal_client_id: "", paypal_client_secret: "", paypal_mode: "sandbox", stripe_secret_key: "" });
  const [showConfig, setShowConfig] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdraw, setWithdraw] = useState({ method: "paypal", amount: 0, destination: "", currency: "USD", note: "" });
  const [busy, setBusy] = useState(false);
  const [stripeBalance, setStripeBalance] = useState(null);
  const [emailConfig, setEmailConfig] = useState({ provider: "resend", api_key: "", from_email: "" });
  const [email, setEmail] = useState({ to: "", subject: "", body: "" });
  const [emailBusy, setEmailBusy] = useState(false);
  const [paypalBatchStatus, setPaypalBatchStatus] = useState(null);

  const loadAll = useCallback(() => {
    fetch(`${API}/payments/config`).then(r => r.json()).then(setConfig).catch(() => {});
    fetch(`${API}/payments/withdrawals`).then(r => r.json()).then(setWithdrawals).catch(() => {});
    fetch(`${API}/email/config`).then(r => r.json()).then(setEmailConfig).catch(() => {});
    fetch(`${API}/payments/stripe/balance`).then(r => r.ok ? r.json() : null).then(d => d && setStripeBalance(d)).catch(() => {});
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const saveConfig = async () => {
    setBusy(true);
    try {
      await fetch(`${API}/payments/config`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      toast.success("Credenciales guardadas");
      loadAll();
    } catch { toast.error("Error guardando credenciales"); }
    setBusy(false);
  };

  const doWithdraw = async () => {
    if (withdraw.amount <= 0) { toast.error("Importe debe ser mayor que 0"); return; }
    if (!withdraw.destination.trim()) { toast.error("Destino requerido (email PayPal o cuenta Stripe)"); return; }
    setBusy(true);
    try {
      const res = await fetch(`${API}/payments/withdraw`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withdraw),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.detail || "Error en el retiro");
      } else {
        toast.success(`Retiro REAL enviado: ${data.status}`);
        setWithdraw({ method: "paypal", amount: 0, destination: "", currency: "USD", note: "" });
        loadAll();
      }
    } catch { toast.error("Error procesando retiro"); }
    setBusy(false);
  };

  const saveEmailConfig = async () => {
    try {
      await fetch(`${API}/email/config`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailConfig),
      });
      toast.success("Email configurado");
      loadAll();
    } catch { toast.error("Error"); }
  };

  const sendEmail = async () => {
    if (!email.to || !email.subject) { toast.error("Destinatario y asunto requeridos"); return; }
    setEmailBusy(true);
    try {
      const res = await fetch(`${API}/email/send`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email),
      });
      if (res.ok) { toast.success(`Email REAL enviado a ${email.to}`); setEmail({ to: "", subject: "", body: "" }); }
      else { const e = await res.json(); toast.error(e.detail || "Error enviando email"); }
    } catch { toast.error("Error"); }
    setEmailBusy(false);
  };

  const checkBatch = async (batchId) => {
    try {
      const res = await fetch(`${API}/payments/paypal/batch/${batchId}`);
      if (res.ok) { setPaypalBatchStatus(await res.json()); toast.success("Estado actualizado"); }
      else toast.error("No se pudo consultar");
    } catch { toast.error("Error"); }
  };

  const downloadCSV = (type) => {
    window.open(`${API}/export/${type}`, "_blank");
  };

  return (
    <div data-testid="payments-panel" className="space-y-4">
      <div className="flex gap-1 border border-border bg-card p-1 flex-wrap">
        {[
          { id: "withdraw", label: "Retirar dinero", icon: ArrowDownToLine },
          { id: "history", label: "Historial", icon: Banknote },
          { id: "email", label: "Email", icon: Mail },
          { id: "export", label: "Exportar CSV", icon: Download },
        ].map(t => (
          <button key={t.id} data-testid={`payments-tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-colors duration-200 ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* WITHDRAW TAB */}
      {tab === "withdraw" && (
        <div className="space-y-4">
          {/* Config status */}
          <div className="border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${config.paypal_configured ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                  <span className="text-xs">PayPal {config.paypal_configured ? "conectado" : "no configurado"}</span>
                  {config.paypal_configured && <span className="font-mono text-[10px] text-muted-foreground">({config.paypal_mode})</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${config.stripe_configured ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                  <span className="text-xs">Stripe {config.stripe_configured ? "conectado" : "no configurado"}</span>
                </div>
              </div>
              <button data-testid="payments-config-btn" onClick={() => setShowConfig(!showConfig)}
                className="flex items-center gap-1.5 text-[11px] text-primary hover:text-primary/80">
                <Settings size={12} /> {showConfig ? "Ocultar config" : "Configurar"}
              </button>
            </div>

            {/* Stripe balance */}
            {stripeBalance && (
              <div className="mt-3 flex gap-4 text-xs">
                <span className="text-muted-foreground">Saldo disponible: <span className="text-accent font-mono">${stripeBalance.available_amount?.toFixed(2)} {stripeBalance.available_currency?.toUpperCase()}</span></span>
                <span className="text-muted-foreground">Pendiente: <span className="text-primary font-mono">${stripeBalance.pending_amount?.toFixed(2)} {stripeBalance.pending_currency?.toUpperCase()}</span></span>
              </div>
            )}
          </div>

          {/* Config form */}
          {showConfig && (
            <div data-testid="payments-config-form" className="border border-border bg-card p-4 space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Credenciales reales (necesarias para retiros reales)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">PayPal Client ID</label>
                  <input value={config.paypal_client_id} onChange={e => setConfig({ ...config, paypal_client_id: e.target.value })}
                    placeholder="client_id de PayPal Developer" className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">PayPal Secret</label>
                  <input type="password" value={config.paypal_client_secret} onChange={e => setConfig({ ...config, paypal_client_secret: e.target.value })}
                    placeholder="client_secret" className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Modo PayPal</label>
                  <select value={config.paypal_mode} onChange={e => setConfig({ ...config, paypal_mode: e.target.value })}
                    className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="sandbox">Sandbox (pruebas)</option>
                    <option value="live">Live (real)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Stripe Secret Key</label>
                  <input type="password" value={config.stripe_secret_key === "***" ? "" : config.stripe_secret_key} onChange={e => setConfig({ ...config, stripe_secret_key: e.target.value })}
                    placeholder="sk_live_... o sk_test_..." className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <button data-testid="save-payments-btn" onClick={saveConfig} disabled={busy}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2 glow-cyan">
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Settings size={14} />} Guardar credenciales
              </button>
              <p className="font-mono text-[10px] text-muted-foreground">// PayPal Developer: developer.paypal.com (gratis) · Stripe: dashboard.stripe.com/apikeys</p>
            </div>
          )}

          {/* Withdraw form */}
          <div data-testid="withdraw-form" className="border border-border bg-card p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <ArrowDownToLine size={13} className="text-accent" /> Retiro REAL de fondos
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Metodo</label>
                <select value={withdraw.method} onChange={e => setWithdraw({ ...withdraw, method: e.target.value })}
                  className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="paypal">PayPal (email)</option>
                  <option value="stripe">Stripe (cuenta bancaria/tarjeta)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Importe</label>
                <input type="number" value={withdraw.amount || ""} onChange={e => setWithdraw({ ...withdraw, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="100.00" step="0.01" min="0" className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Destino</label>
                <input value={withdraw.destination} onChange={e => setWithdraw({ ...withdraw, destination: e.target.value })}
                  placeholder={withdraw.method === "paypal" ? "email@paypal.com" : "ba_xxxx o card_xxxx"}
                  className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Moneda</label>
                <select value={withdraw.currency} onChange={e => setWithdraw({ ...withdraw, currency: e.target.value })}
                  className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  {["USD", "EUR", "GBP", "MXN", "BRL"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Nota (opcional)</label>
              <input value={withdraw.note} onChange={e => setWithdraw({ ...withdraw, note: e.target.value })}
                placeholder="Motivo del retiro" className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <button data-testid="execute-withdraw-btn" onClick={doWithdraw} disabled={busy}
              className="w-full py-2.5 bg-accent text-accent-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <ArrowDownToLine size={15} />}
              {busy ? "Procesando..." : `Retirar ${withdraw.amount || 0} ${withdraw.currency} via ${withdraw.method === "paypal" ? "PayPal" : "Stripe"}`}
            </button>
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === "history" && (
        <div data-testid="withdrawals-history" className="border border-border bg-card">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Historial de retiros reales</span>
            <button onClick={loadAll} className="p-1 text-muted-foreground hover:text-primary"><RefreshCw size={12} /></button>
          </div>
          {withdrawals.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground font-mono">// Sin retiros aun. Ve a Retirar dinero para hacer uno.</p>
          ) : (
            <div className="divide-y divide-border/60">
              {withdrawals.map((w, i) => (
                <div key={w.id || i} data-testid={`withdrawal-${i}`} className="px-4 py-3 flex items-center gap-3">
                  <div className={`w-8 h-8 flex items-center justify-center ${w.method === "paypal" ? "bg-[#0070ba]/20 text-[#0070ba]" : "bg-[#635bff]/20 text-[#635bff]"}`}>
                    {w.method === "paypal" ? <Wallet size={15} /> : <CreditCard size={15} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{w.method === "paypal" ? "PayPal" : "Stripe"} · {w.destination}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {w.created_at ? new Date(w.created_at).toLocaleString("es-ES") : ""} · {w.note || "Sin nota"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-accent">${w.amount} {w.currency}</p>
                    <span className={`font-mono text-[10px] uppercase ${w.status === "success" || w.status === "processing" || w.status === "paid" || w.status === "in_transit" || w.status === "pending" ? "text-emerald-400" : "text-destructive"}`}>
                      {w.status}
                    </span>
                  </div>
                  {w.batch_id && w.method === "paypal" && (
                    <button onClick={() => checkBatch(w.batch_id)} className="text-[10px] text-primary hover:underline">Ver estado</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EMAIL TAB */}
      {tab === "email" && (
        <div className="space-y-4">
          <div className="border border-border bg-card p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Mail size={13} className="text-primary" /> Email REAL (Resend o Brevo - gratis)
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Proveedor</label>
                <select value={emailConfig.provider} onChange={e => setEmailConfig({ ...emailConfig, provider: e.target.value })}
                  className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="resend">Resend (100/dia gratis)</option>
                  <option value="brevo">Brevo (300/dia gratis)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">API Key</label>
                <input type="password" value={emailConfig.api_key === "***" ? "" : emailConfig.api_key} onChange={e => setEmailConfig({ ...emailConfig, api_key: e.target.value })}
                  placeholder="re_xxx o xkeysib-xxx" className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Email remitente</label>
                <input value={emailConfig.from_email} onChange={e => setEmailConfig({ ...emailConfig, from_email: e.target.value })}
                  placeholder="noreply@tudominio.com" className="w-full mt-1 bg-secondary border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <button onClick={saveEmailConfig} className="px-4 py-2 border border-border text-xs hover:border-primary/50 hover:text-primary transition-colors">
              Guardar config
            </button>
            <p className="font-mono text-[10px] text-muted-foreground">// Resend: resend.com (gratis 100/dia) · Brevo: brevo.com (gratis 300/dia)</p>
          </div>

          <div className="border border-border bg-card p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Enviar email</p>
            <input value={email.to} onChange={e => setEmail({ ...email, to: e.target.value })}
              placeholder="destinatario@email.com" className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            <input value={email.subject} onChange={e => setEmail({ ...email, subject: e.target.value })}
              placeholder="Asunto" className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            <textarea value={email.body} onChange={e => setEmail({ ...email, body: e.target.value })}
              placeholder="Mensaje..." rows={4} className="w-full bg-secondary border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            <button data-testid="send-email-btn" onClick={sendEmail} disabled={emailBusy}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 disabled:opacity-40 glow-cyan">
              {emailBusy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Enviar email real
            </button>
          </div>
        </div>
      )}

      {/* EXPORT TAB */}
      {tab === "export" && (
        <div data-testid="export-panel" className="border border-border bg-card p-4 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Download size={13} className="text-accent" /> Exportar datos reales a CSV
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button data-testid="export-orders-btn" onClick={() => downloadCSV("orders")}
              className="border border-border bg-secondary p-4 hover:border-primary/50 transition-colors duration-200 text-left">
              <BarChart3 size={20} className="text-primary mb-2" />
              <p className="text-sm font-semibold">Pedidos</p>
              <p className="text-[11px] text-muted-foreground mt-1">Todos los pedidos reales de Shopify</p>
            </button>
            <button data-testid="export-products-btn" onClick={() => downloadCSV("products")}
              className="border border-border bg-secondary p-4 hover:border-primary/50 transition-colors duration-200 text-left">
              <Package size={20} className="text-primary mb-2" />
              <p className="text-sm font-semibold">Productos</p>
              <p className="text-[11px] text-muted-foreground mt-1">Inventario y precios reales</p>
            </button>
            <button data-testid="export-tasks-btn" onClick={() => downloadCSV("tasks")}
              className="border border-border bg-secondary p-4 hover:border-primary/50 transition-colors duration-200 text-left">
              <Banknote size={20} className="text-primary mb-2" />
              <p className="text-sm font-semibold">Tareas</p>
              <p className="text-[11px] text-muted-foreground mt-1">Todas las tareas de los agentes</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
