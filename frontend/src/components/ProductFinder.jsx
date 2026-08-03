import { useState, useEffect } from "react";
import { Search, Loader2, Package, Upload, Trash2, Lightbulb, Star } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProductImage = ({ prompt, name, imageUrl }) => {
  const [err, setErr] = useState(false);
  // Use real product image if available, otherwise generate with Pollinations
  const src = imageUrl || `https://image.pollinations.ai/prompt/${encodeURIComponent("professional product photo, " + prompt)}?width=400&height=300&nologo=true`;
  if (err) return (
    <div className="h-40 flex items-center justify-center bg-secondary text-muted-foreground"><Package size={32} /></div>
  );
  return (
    <img
      src={src}
      alt={name} loading="lazy" onError={() => setErr(true)}
      className="h-40 w-full object-cover"
    />
  );
};

export const ProductFinder = ({ shopifyConnected }) => {
  const [niche, setNiche] = useState("");
  const [products, setProducts] = useState([]);
  const [busy, setBusy] = useState(false);
  const [importing, setImporting] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetch(`${API}/market/trending-products`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const cats = [...new Set(data.map((p) => p.category))].slice(0, 6);
          setSuggestions(cats);
        }
      })
      .catch(() => {});
  }, []);

  const discover = async () => {
    if (!niche.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/products/discover`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche }),
      });
      if (!res.ok) throw new Error();
      setProducts(await res.json());
    } catch {
      toast.error("No se pudieron buscar productos, intenta de nuevo");
    }
    setBusy(false);
  };

  const importProduct = async (p, i) => {
    if (!shopifyConnected) { toast.error("Conecta tu tienda Shopify primero (pestana Shopify)"); return; }
    setImporting(i);
    try {
      const res = await fetch(`${API}/shopify/import`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: p.nombre, descripcion: p.descripcion, precio: p.precio }),
      });
      if (!res.ok) throw new Error();
      toast.success(`"${p.nombre}" importado a tu Shopify como borrador`);
    } catch {
      toast.error("Error al importar a Shopify");
    }
    setImporting(null);
  };

  return (
    <div data-testid="product-finder" className="space-y-4">
      <div className="border border-border bg-card p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Buscador de productos reales · Master Productos</p>
        <div className="flex gap-2">
          <input
            data-testid="niche-input"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && discover()}
            placeholder="Nicho, ej: mascotas, fitness, hogar inteligente..."
            className="flex-1 bg-secondary border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            data-testid="discover-btn"
            onClick={discover}
            disabled={busy || !niche.trim()}
            className="px-4 bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center gap-2 glow-cyan"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            {busy ? "Buscando..." : "Buscar"}
          </button>
        </div>
        {suggestions.length > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Lightbulb size={11} className="text-accent" /> Categorias reales disponibles:
            </span>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setNiche(s)}
                data-testid={`niche-suggestion-${s}`}
                className="px-2 py-1 border border-border bg-secondary text-[11px] capitalize hover:border-primary/50 hover:bg-primary/10 transition-colors duration-200"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {products.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {products.length} productos reales encontrados · {products[0]?.real_source || "API"}
            </p>
            <button
              onClick={() => setProducts([])}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-destructive transition-colors duration-200"
            >
              <Trash2 size={12} /> Limpiar resultados
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {products.map((p, i) => (
              <div key={i} data-testid={`product-card-${i}`} className="border border-border bg-card fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <ProductImage prompt={p.imagen_prompt} name={p.nombre} imageUrl={p.image_url} />
                <div className="p-3">
                  <h3 className="text-sm font-semibold">{p.nombre}</h3>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{p.descripcion}</p>
                  {p.rating > 0 && (
                    <div className="mt-1 flex items-center gap-1">
                      <Star size={11} className="text-accent" />
                      <span className="font-mono text-[10px] text-muted-foreground">{p.rating} / 5 · {p.category}</span>
                    </div>
                  )}
                  <div className="mt-3 grid grid-cols-3 gap-px bg-border border border-border font-mono text-center">
                    <div className="bg-secondary py-1.5"><p className="text-[9px] text-muted-foreground uppercase">Coste</p><p className="text-xs">${p.coste}</p></div>
                    <div className="bg-secondary py-1.5"><p className="text-[9px] text-muted-foreground uppercase">Venta</p><p className="text-xs text-primary">${p.precio}</p></div>
                    <div className="bg-secondary py-1.5"><p className="text-[9px] text-muted-foreground uppercase">Margen</p><p className="text-xs text-accent">{p.margen}%</p></div>
                  </div>
                  <button
                    data-testid={`import-btn-${i}`}
                    onClick={() => importProduct(p, i)}
                    disabled={importing === i}
                    className="mt-3 w-full py-2 border border-accent/50 text-accent text-xs font-semibold hover:bg-accent/10 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    {importing === i ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                    Importar a Shopify
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
