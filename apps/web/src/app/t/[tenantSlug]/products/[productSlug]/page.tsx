"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "../../CartProvider";
import { ShoppingCart, ChevronLeft, Star, Shield, Truck, RotateCcw, Check, ShoppingBag } from "lucide-react";
import { API_URL } from "../../../../../../lib/api";

export default function ProductDetailPage({ params }: { params: Promise<{ tenantSlug: string; productSlug: string }> }) {
  const { tenantSlug, productSlug } = React.use(params);
  const { addItem } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/tenants/${tenantSlug}/catalog/products/${productSlug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          if (data.variants?.length > 0) {
            setSelectedVariant(data.variants[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to load product", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [tenantSlug, productSlug]);

  const handleAddToCart = () => {
    if (!product) return;
    const variant = product.variants?.find((v: any) => v.id === selectedVariant);
    addItem({
      productId: product.id,
      variantId: variant?.id,
      name: product.name,
      variantName: variant ? variant.name.split(" - ")[0] : undefined,
      price: variant?.price || product.price,
      imageUrl: product.images?.[0]?.url,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-6 pt-32 pb-24 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-zinc-600" />
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-4 text-white">Produto não encontrado</h1>
        <Link href={`/t/${tenantSlug}/products`} className="text-accent font-bold hover:underline">
          ← Voltar ao catálogo
        </Link>
      </div>
    );
  }

  const images = product.images || [];
  const currentImage = images[selectedImage]?.url;

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Breadcrumb */}
        <Link href={`/t/${tenantSlug}/products`} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-accent transition-colors mb-8 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-[11px]">Voltar ao Catálogo</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* LEFT: Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 relative">
              {currentImage ? (
                <img src={currentImage} alt={product.name} className="w-full h-full object-cover transition-opacity duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                  <ShoppingBag className="w-20 h-20" />
                </div>
              )}
              {/* Category Badge */}
              {product.category && (
                <span className="absolute top-4 left-4 bg-accent/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
                  {product.category}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img: any, i: number) => (
                  <button
                    key={img.id || i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      i === selectedImage ? "border-accent shadow-lg shadow-accent/20" : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex flex-col lg:pt-4">
            {/* Name & Price */}
            <div className="mb-6">
              <span className="inline-block bg-accent/10 text-accent text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4">NFL Autêntica</span>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-tight mb-4">{product.name}</h1>
              <div className="flex items-center gap-4">
                <p className="text-3xl md:text-4xl font-black text-accent">{fmt(product.price)}</p>
                <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  ))}
                  <span className="text-xs font-bold text-zinc-400 ml-1">5.0</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-base text-zinc-400 leading-relaxed mb-8">{product.description || "Jersey autêntica de alta performance, ideal para os verdadeiros fãs."}</p>

            {/* Variants / Size */}
            {product.variants?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-300 mb-3">Tamanho</h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v.id)}
                      className={`h-12 px-6 rounded-xl font-bold text-sm transition-all border ${
                        selectedVariant === v.id ? "bg-accent text-white border-accent shadow-lg shadow-accent/20" : "bg-white/5 text-zinc-300 border-white/10 hover:border-accent/50 hover:text-white"
                      }`}
                    >
                      {v.name.split(" - ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className="space-y-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={addedToCart}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-xl ${
                  addedToCart ? "bg-emerald-600 text-white shadow-emerald-600/20" : "bg-accent text-white hover:bg-accent/90 shadow-accent/20 hover:shadow-accent/40 active:scale-[0.98]"
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Adicionado ao Carrinho!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Adicionar ao Carrinho
                  </>
                )}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
              {[
                { icon: <Shield className="w-5 h-5" />, text: "Produto Original" },
                { icon: <Truck className="w-5 h-5" />, text: "Envio Nacional" },
                { icon: <RotateCcw className="w-5 h-5" />, text: "Troca Fácil" },
              ].map((badge, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-2 py-3">
                  <div className="text-accent">{badge.icon}</div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
