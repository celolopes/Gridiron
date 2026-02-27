"use client";

import React, { useState, useEffect, useRef } from "react";
import { API_URL } from "../../../../../lib/api";
import { supabase } from "../../../../../lib/supabase";
import { Upload, Check, AlertCircle, Image as ImageIcon, Palette, Store, Loader2, LayoutTemplate } from "lucide-react";

// --- reusable uploader ---
async function uploadToSupabase(file: File, path: string): Promise<string> {
  const { error } = await supabase.storage.from("gridiron-images").upload(path, file, { cacheControl: "3600", upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("gridiron-images").getPublicUrl(path);
  return data.publicUrl;
}

export default function SettingsPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = React.use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const [brandName, setBrandName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [accentColor, setAccentColor] = useState("#0a84ff");
  const [themeMode, setThemeMode] = useState("dark");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/tenants/${tenantSlug}/settings`);
        if (res.ok) {
          const data = await res.json();
          setBrandName(data.brandName || "");
          setLogoUrl(data.logoUrl || "");
          setHeroImageUrl(data.heroImageUrl || "");
          setPrimaryColor(data.primaryColor || "#000000");
          setAccentColor(data.accentColor || "#0a84ff");
          setThemeMode(data.themeMode || "dark");
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [tenantSlug]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, folder: string, setUrl: (url: string) => void, setUploading: (v: boolean) => void, maxMB = 5) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Selecione uma imagem válida (PNG, JPG, SVG, WebP).");
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      setError(`A imagem deve ter no máximo ${maxMB}MB.`);
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop();
      const path = `${folder}/${tenantSlug}/${folder}-${Date.now()}.${ext}`;
      const url = await uploadToSupabase(file, path);
      setUrl(url);
    } catch (err: any) {
      setError(`Erro ao fazer upload: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const token = document.cookie
        .split("; ")
        .find((c) => c.startsWith("adminToken="))
        ?.split("=")[1];
      const res = await fetch(`${API_URL}/tenants/${tenantSlug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ brandName, logoUrl: logoUrl || null, heroImageUrl: heroImageUrl || null, primaryColor, accentColor, themeMode }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(`Erro ao salvar: ${await res.text()}`);
      }
    } catch (err: any) {
      setError(`Erro: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-600" />
      </div>
    );

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Configurações da Loja</h1>
        <p className="text-neutral-400">Personalize a identidade visual da sua loja.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <Check className="w-5 h-5 flex-shrink-0" />
          Configurações salvas com sucesso!
        </div>
      )}

      {/* ── LOGO ── */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Logo da Loja</h2>
        </div>
        <p className="text-sm text-neutral-400 leading-relaxed">
          Exibida no header e footer. <strong className="text-neutral-300">Tamanho recomendado:</strong> 400×120px (PNG/SVG, fundo transparente).
          <br />
          <strong className="text-neutral-300">Dark Mode:</strong> Logos escuros são invertidos automaticamente. <strong className="text-neutral-300">Máximo:</strong> 2MB.
        </p>
        <div className="flex items-start gap-6">
          <div className="flex flex-col gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Modo Claro</span>
              <div className="w-[240px] h-[80px] rounded-xl border-2 border-dashed border-neutral-700 flex items-center justify-center bg-white overflow-hidden">
                {logoUrl ? <img src={logoUrl} alt="" className="max-w-full max-h-full object-contain p-2" /> : <span className="text-xs text-neutral-400">Sem logo</span>}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Modo Escuro (auto-invertido)</span>
              <div className="w-[240px] h-[80px] rounded-xl border-2 border-dashed border-neutral-700 flex items-center justify-center bg-neutral-950 overflow-hidden">
                {logoUrl ? <img src={logoUrl} alt="" className="max-w-full max-h-full object-contain p-2 brightness-0 invert" /> : <span className="text-xs text-neutral-600">Sem logo</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-auto">
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "logos", setLogoUrl, setUploadingLogo, 2)} />
            <button
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all disabled:opacity-50"
            >
              {uploadingLogo ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </>
              )}
            </button>
            {logoUrl && (
              <button onClick={() => setLogoUrl("")} className="text-xs text-red-400 hover:text-red-300">
                Remover logo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <LayoutTemplate className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Banner Hero (Página Inicial)</h2>
        </div>
        <p className="text-sm text-neutral-400 leading-relaxed">
          Imagem de fundo exibida na seção Hero da sua loja.
          <br />
          <strong className="text-neutral-300">Tamanho recomendado:</strong> 2560×1440px (16:9, widescreen).
          <br />
          <strong className="text-neutral-300">Formatos:</strong> JPG ou WebP (melhor performance). <strong className="text-neutral-300">Máximo:</strong> 5MB.
        </p>

        {/* Hero preview */}
        <div className="relative w-full h-[160px] rounded-2xl overflow-hidden border-2 border-dashed border-neutral-700 bg-neutral-950 flex items-center justify-center">
          {heroImageUrl ? (
            <>
              <img src={heroImageUrl} alt="Hero preview" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
              <div className="relative z-10 text-left px-8">
                <p className="text-white text-xs uppercase font-black tracking-widest opacity-60 mb-1">Preview</p>
                <p className="text-white text-2xl font-black italic uppercase tracking-tighter">
                  The Elite
                  <br />
                  <span className="text-blue-400">Collection</span>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center">
              <LayoutTemplate className="w-10 h-10 text-neutral-700 mx-auto mb-2" />
              <p className="text-sm text-neutral-600">Sem banner. Usando imagem padrão.</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <input
            ref={heroInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/webp,image/png"
            className="hidden"
            onChange={(e) => handleUpload(e, "heroes", setHeroImageUrl, setUploadingHero, 5)}
          />
          <button
            onClick={() => heroInputRef.current?.click()}
            disabled={uploadingHero}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all disabled:opacity-50"
          >
            {uploadingHero ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Banner Hero
              </>
            )}
          </button>
          {heroImageUrl && (
            <button onClick={() => setHeroImageUrl("")} className="text-xs text-red-400 hover:text-red-300">
              Remover banner
            </button>
          )}
        </div>
      </div>

      {/* ── BRANDING ── */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <Store className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Identidade da Marca</h2>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Nome da Loja</label>
          <input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Ex: Gridiron NFL"
            className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none transition-colors text-sm"
          />
        </div>
      </div>

      {/* ── COLORS ── */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <Palette className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Cores e Tema</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: "Cor Primária", value: primaryColor, set: setPrimaryColor },
            { label: "Cor de Destaque (Accent)", value: accentColor, set: setAccentColor },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-neutral-300 mb-2">{label}</label>
              <div className="flex items-center gap-3">
                <input type="color" value={value} onChange={(e) => set(e.target.value)} className="w-10 h-10 rounded-lg border border-neutral-700 cursor-pointer bg-transparent" />
                <input
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono text-sm focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Modo do Tema (padrão)</label>
          <div className="flex gap-3">
            {["dark", "light"].map((mode) => (
              <button
                key={mode}
                onClick={() => setThemeMode(mode)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all border ${themeMode === mode ? "bg-blue-600 text-white border-blue-600" : "bg-neutral-950 text-neutral-400 border-neutral-700 hover:border-neutral-500"}`}
              >
                {mode === "dark" ? "🌙 Escuro" : "☀️ Claro"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── HEADER PREVIEW ── */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Pré-visualização do Header</h2>
        <div className="rounded-xl border border-neutral-700 p-4 flex items-center gap-4" style={{ backgroundColor: themeMode === "dark" ? "#0a0a0a" : "#fafafa" }}>
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-12 max-w-[180px] object-contain" style={themeMode === "dark" ? { filter: "brightness(0) invert(1)" } : {}} />
          ) : (
            <span className="text-xl font-black tracking-tighter uppercase italic" style={{ color: themeMode === "dark" ? "#fff" : "#000" }}>
              {brandName || "Sua Loja"}
            </span>
          )}
          <div className="flex items-center gap-4 ml-auto text-xs font-bold uppercase tracking-widest" style={{ color: themeMode === "dark" ? "#999" : "#666" }}>
            <span>Início</span>
            <span>Catálogo</span>
          </div>
        </div>
      </div>

      {/* ── SAVE ── */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Salvando...
          </>
        ) : saved ? (
          <>
            <Check className="w-5 h-5" />
            Salvo!
          </>
        ) : (
          "Salvar Configurações"
        )}
      </button>
    </div>
  );
}
