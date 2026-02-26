"use client";

import React, { useState, useEffect, useRef } from "react";
import { API_URL } from "../../../../../lib/api";
import { supabase } from "../../../../../lib/supabase";
import { Upload, Check, AlertCircle, Image as ImageIcon, Palette, Store, Loader2 } from "lucide-react";

export default function SettingsPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = React.use(params);

  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [brandName, setBrandName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [accentColor, setAccentColor] = useState("#0a84ff");
  const [themeMode, setThemeMode] = useState("dark");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/tenants/${tenantSlug}/settings`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
          setBrandName(data.brandName || "");
          setLogoUrl(data.logoUrl || "");
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 2MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const timestamp = Date.now();
      const ext = file.name.split(".").pop();
      const filePath = `logos/${tenantSlug}/logo-${timestamp}.${ext}`;

      const { data, error: uploadError } = await supabase.storage.from("gridiron-images").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from("gridiron-images").getPublicUrl(filePath);

      setLogoUrl(publicData.publicUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
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
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          brandName,
          logoUrl: logoUrl || null,
          primaryColor,
          accentColor,
          themeMode,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const text = await res.text();
        setError(`Erro ao salvar: ${text}`);
      }
    } catch (err: any) {
      setError(`Erro: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Configurações da Loja</h1>
        <p className="text-neutral-400">Personalize a identidade visual da sua loja.</p>
      </div>

      {/* Error/Success banners */}
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

      {/* Logo Upload */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <ImageIcon className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Logo da Loja</h2>
        </div>

        <p className="text-sm text-neutral-400 leading-relaxed">
          Envie o logo da sua loja. Ele será exibido no header e footer de todas as páginas.
          <br />
          <strong className="text-neutral-300">Tamanho recomendado:</strong> 400×120 pixels (proporcional, horizontal).
          <br />
          <strong className="text-neutral-300">Dica:</strong> Use fundo transparente (PNG/SVG) para melhor resultado.
          <br />
          <strong className="text-neutral-300">Dark Mode:</strong> Logos escuros serão invertidos automaticamente no tema escuro.
          <br />
          <strong className="text-neutral-300">Máximo:</strong> 2MB.
        </p>

        <div className="flex items-start gap-6">
          {/* Preview - Light & Dark */}
          <div className="flex flex-col gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Modo Claro</span>
              <div className="w-[240px] h-[80px] rounded-xl border-2 border-dashed border-neutral-700 flex items-center justify-center bg-white overflow-hidden flex-shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo preview light" className="max-w-full max-h-full object-contain p-2" />
                ) : (
                  <span className="text-xs text-neutral-400 text-center px-2">Sem logo</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1 block">Modo Escuro (auto-invertido)</span>
              <div className="w-[240px] h-[80px] rounded-xl border-2 border-dashed border-neutral-700 flex items-center justify-center bg-neutral-950 overflow-hidden flex-shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo preview dark" className="max-w-full max-h-full object-contain p-2 brightness-0 invert" />
                ) : (
                  <span className="text-xs text-neutral-600 text-center px-2">Sem logo</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={handleLogoUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Fazer Upload
                </>
              )}
            </button>
            {logoUrl && (
              <button onClick={() => setLogoUrl("")} className="text-xs text-red-400 hover:text-red-300 transition-colors text-left">
                Remover logo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
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

      {/* Colors & Theme */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <Palette className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Cores e Tema</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Cor Primária</label>
            <div className="flex items-center gap-3">
              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded-lg border border-neutral-700 cursor-pointer bg-transparent" />
              <input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono text-sm focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Cor de Destaque (Accent)</label>
            <div className="flex items-center gap-3">
              <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-10 h-10 rounded-lg border border-neutral-700 cursor-pointer bg-transparent" />
              <input
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono text-sm focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Modo do Tema</label>
          <div className="flex gap-3">
            {["dark", "light"].map((mode) => (
              <button
                key={mode}
                onClick={() => setThemeMode(mode)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all border ${
                  themeMode === mode ? "bg-blue-600 text-white border-blue-600" : "bg-neutral-950 text-neutral-400 border-neutral-700 hover:border-neutral-500"
                }`}
              >
                {mode === "dark" ? "🌙 Escuro" : "☀️ Claro"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Pré-visualização do Header</h2>
        <div className="rounded-xl border border-neutral-700 p-4 flex items-center gap-4" style={{ backgroundColor: themeMode === "dark" ? "#0a0a0a" : "#fafafa" }}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo preview" className="h-12 max-w-[180px] object-contain" style={themeMode === "dark" ? { filter: "brightness(0) invert(1)" } : {}} />
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

      {/* Save Button */}
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
