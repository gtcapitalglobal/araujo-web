"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Settings } from "@/lib/types";
import { Settings as SettingsIcon, Save, LogOut } from "lucide-react";

export default function SettingsPage() {
  const supabase = createClient();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    tax_year: new Date().getFullYear().toString(),
    reserve_percent: "30",
    mileage_rate: "0.70",
    currency: "USD",
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (data) {
      setSettings(data);
      setForm({
        company_name: data.company_name || "",
        tax_year: data.tax_year || new Date().getFullYear().toString(),
        reserve_percent: data.reserve_percent?.toString() || "30",
        mileage_rate: data.mileage_rate?.toString() || "0.70",
        currency: data.currency || "USD",
      });
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const payload = {
      company_name: form.company_name || null,
      tax_year: form.tax_year || null,
      reserve_percent: form.reserve_percent ? parseFloat(form.reserve_percent) : null,
      mileage_rate: form.mileage_rate ? parseFloat(form.mileage_rate) : null,
      currency: form.currency || null,
    };
    if (settings) {
      await supabase.from("settings").update(payload).eq("id", settings.id);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("settings").insert({ id: crypto.randomUUID(), user_id: user.id, ...payload });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    fetchSettings();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) return <div className="space-y-4 py-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>;

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-black section-title mb-8">SETTINGS</h1>

      <div className="bg-surface border border-border rounded-2xl p-6 max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon size={20} className="text-secondary" />
          <h2 className="font-[family-name:var(--font-display)] text-sm font-bold text-secondary tracking-wider">CONFIGURACOES GERAIS</h2>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs text-text-muted mb-1 block">Nome da Empresa</label>
            <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" placeholder="Araujo Company LLC" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Ano Fiscal</label>
              <input value={form.tax_year} onChange={(e) => setForm({ ...form, tax_year: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" placeholder="2026" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Moeda</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none">
                <option value="USD">USD ($)</option>
                <option value="BRL">BRL (R$)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Reserva de Imposto (%)</label>
              <input type="number" step="1" value={form.reserve_percent} onChange={(e) => setForm({ ...form, reserve_percent: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" placeholder="30" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Mileage Rate ($/mi)</label>
              <input type="number" step="0.01" value={form.mileage_rate} onChange={(e) => setForm({ ...form, mileage_rate: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" placeholder="0.70" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-8">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
            <Save size={18} /> {saving ? "Salvando..." : "Salvar"}
          </button>
          {saved && <span className="text-success text-sm font-semibold">Salvo com sucesso!</span>}
        </div>
      </div>

      {/* Logout */}
      <div className="mt-8 bg-surface border border-border rounded-2xl p-6 max-w-xl">
        <h2 className="font-[family-name:var(--font-display)] text-sm font-bold text-error tracking-wider mb-4">ZONA DE PERIGO</h2>
        <button onClick={handleLogout} className="flex items-center gap-2 bg-error/10 border border-error/30 text-error font-bold px-6 py-3 rounded-xl hover:bg-error/20 transition-colors">
          <LogOut size={18} /> Sair da Conta
        </button>
      </div>
    </div>
  );
}
