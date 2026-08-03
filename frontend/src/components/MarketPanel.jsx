import { useState, useEffect, useCallback } from "react";
import { Globe, TrendingUp, Newspaper, ShoppingBag, Bitcoin, RefreshCw, Loader2, ExternalLink, DollarSign } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const MarketPanel = () => {
  const [rates, setRates] = useState(null);
  const [news, setNews] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [nicheInsights, setNicheInsights] = useState(null);
  const [trends, setTrends] = useState([]);
  const [crypto, setCrypto] = useState(null);
  const [loading, setLoading] = useState({});
  const [convert, setConvert] = useState({ amount: 100, from: "USD", to: "EUR" });
  const [convertResult, setConvertResult] = useState(null);

  const fetchWithKey = useCallback(async (key, path) => {
    setLoading((l) => ({ ...l, [key]: true }));
    try {
      const res = await fetch(`${API}${path}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      toast.error(`Error cargando ${key}`);
      return null;
    } finally {
      setLoading((l) => ({ ...l, [key]: false }));
    }
  }, []);

  const loadAll = useCallback(() => {
    fetchWithKey("rates", "/market/exchange-rates").then((d) => d && setRates(d));
    fetchWithKey("news", "/market/news").then((d) => d && setNews(d));
    fetchWithKey("products", "/market/trending-products").then((d) => d && setTrendingProducts(d));
    fetchWithKey("insights", "/market/niche-insights").then((d) => d && setNicheInsights(d));
    fetchWithKey("trends", "/market/trends").then((d) => d && setTrends(d));
    fetchWithKey("crypto", "/market/crypto-rates").then((d) => d && setCrypto(d));
  }, [fetchWithKey]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const doConvert = () => {
    if (!rates?.rates) return;
    const r = rates.rates[convert.to];
    if (r) setConvertResult((convert.amount * r).toFixed(2));
  };

  useEffect(() => { if (rates?.rates) doConvert(); }, [rates, convert]);

  const Section = ({ icon: Icon, title, children, isLoading, onRefresh, testId }) => (
    <div data-testid={testId} className="border border-border bg-card">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <Icon size={13} className="text-primary" /> {title}
        </span>
        <button onClick={onRefresh} disabled={isLoading}
          className="p-1 text-muted-foreground hover:text-primary transition-colors duration-200" title="Actualizar">
          {isLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
        </button>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );

  return (
    <div data-testid="market-panel" className="space-y-4">
      {/* Exchange Rates + Crypto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Section icon={Globe} title="Tipos de cambio en vivo" loading={loading.rates} onRefresh={() => fetchWithKey("rates", "/market/exchange-rates").then((d) => d && setRates(d))} testId="exchange-rates-section">
          {rates ? (
            <>
              <div className="grid grid-cols-5 gap-px bg-border border border-border">
                {Object.entries(rates.rates).slice(0, 10).map(([cur, val]) => (
                  <div key={cur} className="bg-secondary px-2 py-2 text-center">
                    <p className="font-mono text-[9px] text-muted-foreground uppercase">{cur}</p>
                    <p className="font-mono text-xs text-foreground mt-0.5">{val.toFixed(val < 1 ? 4 : 2)}</p>
                  </div>
                ))}
              </div>
              {/* Currency Converter */}
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="number"
                  value={convert.amount}
                  onChange={(e) => setConvert({ ...convert, amount: parseFloat(e.target.value) || 0 })}
                  className="w-20 bg-secondary border border-border px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <select
                  value={convert.from}
                  onChange={(e) => setConvert({ ...convert, from: e.target.value })}
                  className="bg-secondary border border-border px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>USD</option>
                  {rates.rates && Object.keys(rates.rates).map((c) => <option key={c}>{c}</option>)}
                </select>
                <span className="text-muted-foreground text-xs">→</span>
                <select
                  value={convert.to}
                  onChange={(e) => setConvert({ ...convert, to: e.target.value })}
                  className="bg-secondary border border-border px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>USD</option>
                  {rates.rates && Object.keys(rates.rates).map((c) => <option key={c}>{c}</option>)}
                </select>
                <span className="font-mono text-sm text-accent">{convertResult ? `${convertResult} ${convert.to}` : "—"}</span>
              </div>
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">Base: USD · Actualizado: {rates.updated ? new Date(rates.updated).toLocaleTimeString("es-ES") : "—"}</p>
            </>
          ) : (
            <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div>
          )}
        </Section>

        <Section icon={Bitcoin} title="Cripto (BTC/ETH)" loading={loading.crypto} onRefresh={() => fetchWithKey("crypto", "/market/crypto-rates").then((d) => d && setCrypto(d))} testId="crypto-section">
          {crypto ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-border bg-secondary p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-[#f7931a] flex items-center justify-center text-[10px] font-bold text-white">B</div>
                  <span className="text-xs font-semibold">Bitcoin</span>
                </div>
                <p className="font-mono text-lg text-accent">${crypto.btc_usd.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="border border-border bg-secondary p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-[#627eea] flex items-center justify-center text-[10px] font-bold text-white">E</div>
                  <span className="text-xs font-semibold">Ethereum</span>
                </div>
                <p className="font-mono text-lg text-primary">${crypto.eth_usd.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
              </div>
              <p className="col-span-2 font-mono text-[10px] text-muted-foreground">Actualizado: {crypto.updated ? new Date(crypto.updated).toLocaleTimeString("es-ES") : "—"}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div>
          )}
        </Section>
      </div>

      {/* Google Trends */}
      <Section icon={TrendingUp} title="Tendencias Google (Top 20)" loading={loading.trends} onRefresh={() => fetchWithKey("trends", "/market/trends").then((d) => d && setTrends(d))} testId="trends-section">
        {trends.length > 0 ? (
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {trends.map((t, i) => (
              <a
                key={i}
                href={t.url || "#"}
                target="_blank"
                rel="noreferrer"
                data-testid={`trend-item-${i}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-secondary hover:border-primary/50 hover:bg-primary/10 transition-colors duration-200 text-xs"
              >
                <span className="font-mono text-[10px] text-primary">{i + 1}</span>
                <span className="text-foreground">{t.title}</span>
                {t.traffic && <span className="font-mono text-[10px] text-muted-foreground">{t.traffic}</span>}
              </a>
            ))}
          </div>
        ) : loading.trends ? (
          <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div>
        ) : <p className="text-xs text-muted-foreground font-mono">// No hay datos disponibles</p>}
      </Section>

      {/* Niche Insights */}
      {nicheInsights && (
        <Section icon={DollarSign} title="Analisis de nichos por categoria" loading={loading.insights} onRefresh={() => fetchWithKey("insights", "/market/niche-insights").then((d) => d && setNicheInsights(d))} testId="niche-insights-section">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 px-2 font-medium uppercase tracking-wider text-[10px]">Categoria</th>
                  <th className="text-center py-2 px-2 font-medium uppercase tracking-wider text-[10px]">Productos</th>
                  <th className="text-center py-2 px-2 font-medium uppercase tracking-wider text-[10px]">Precio medio</th>
                  <th className="text-center py-2 px-2 font-medium uppercase tracking-wider text-[10px]">Rating</th>
                  <th className="text-center py-2 px-2 font-medium uppercase tracking-wider text-[10px]">Rango</th>
                </tr>
              </thead>
              <tbody>
                {nicheInsights.categories?.map((c, i) => (
                  <tr key={i} data-testid={`niche-row-${i}`} className="border-b border-border/60 hover:bg-secondary transition-colors duration-150">
                    <td className="py-2 px-2 font-medium capitalize">{c.name}</td>
                    <td className="py-2 px-2 text-center font-mono">{c.product_count}</td>
                    <td className="py-2 px-2 text-center font-mono text-accent">${c.avg_price?.toFixed(2)}</td>
                    <td className="py-2 px-2 text-center font-mono text-primary">{c.avg_rating?.toFixed(1)}</td>
                    <td className="py-2 px-2 text-center font-mono text-muted-foreground">${c.price_range?.[0]?.toFixed(0)}-${c.price_range?.[1]?.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Trending Products + News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Section icon={ShoppingBag} title="Productos en tendencia" loading={loading.products} onRefresh={() => fetchWithKey("products", "/market/trending-products").then((d) => d && setTrendingProducts(d))} testId="trending-products-section">
          {trendingProducts.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {trendingProducts.map((p, i) => (
                <div key={i} data-testid={`market-product-${i}`} className="flex items-center gap-3 border border-border bg-secondary p-2 hover:border-primary/30 transition-colors duration-200">
                  <img src={p.image} alt={p.title} loading="lazy" className="w-10 h-10 object-cover border border-border shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.title}</p>
                    <p className="font-mono text-[10px] text-muted-foreground capitalize">{p.category} · {p.rating}</p>
                  </div>
                  <span className="font-mono text-xs text-accent shrink-0">${p.price}</span>
                </div>
              ))}
            </div>
          ) : loading.products ? (
            <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div>
          ) : <p className="text-xs text-muted-foreground font-mono">// No hay datos disponibles</p>}
        </Section>

        <Section icon={Newspaper} title="Noticias tech/e-commerce" loading={loading.news} onRefresh={() => fetchWithKey("news", "/market/news").then((d) => d && setNews(d))} testId="news-section">
          {news.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {news.map((n, i) => (
                <a key={n.id || i} href={n.url} target="_blank" rel="noreferrer" data-testid={`news-item-${i}`}
                  className="block border border-border bg-secondary p-2.5 hover:border-primary/30 transition-colors duration-200 group">
                  <div className="flex items-start gap-2">
                    <ExternalLink size={12} className="text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium leading-snug">{n.title}</p>
                      <p className="font-mono text-[10px] text-muted-foreground mt-1">{n.score} puntos · {n.by}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : loading.news ? (
            <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div>
          ) : <p className="text-xs text-muted-foreground font-mono">// No hay datos disponibles</p>}
        </Section>
      </div>
    </div>
  );
};
