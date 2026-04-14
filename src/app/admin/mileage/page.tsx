"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MileageLog } from "@/lib/types";
import { Car, Plus, Trash2, X, MapPin, ArrowRight } from "lucide-react";

const MILEAGE_RATE = 0.70;

export default function MileagePage() {
  const supabase = createClient();
  const [logs, setLogs] = useState<MileageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), origin: "", destination: "", purpose: "", miles: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const year = new Date().getFullYear();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("mileage_logs")
      .select("*")
      .gte("date", `${year}-01-01`)
      .order("date", { ascending: false });
    setLogs(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalMiles = logs.reduce((s, l) => s + l.miles, 0);
  const deduction = totalMiles * MILEAGE_RATE;

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    await supabase.from("mileage_logs").insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      date: form.date,
      origin: form.origin || null,
      destination: form.destination || null,
      purpose: form.purpose || null,
      miles: parseFloat(form.miles),
      notes: form.notes || null,
    });
    setSaving(false);
    setShowModal(false);
    setForm({ date: new Date().toISOString().slice(0, 10), origin: "", destination: "", purpose: "", miles: "", notes: "" });
    fetchLogs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar este registro?")) return;
    await supabase.from("mileage_logs").delete().eq("id", id);
    fetchLogs();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-black section-title">MILEAGE</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
          <Plus size={18} /> Nova Viagem
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-accent/10 border border-accent/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Car size={20} className="text-accent" />
            <span className="text-text-muted text-xs font-medium">Total Miles {year}</span>
          </div>
          <p className="text-2xl font-black section-title">{totalMiles.toFixed(1)} mi</p>
        </div>
        <div className="bg-success/10 border border-success/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Car size={20} className="text-success" />
            <span className="text-text-muted text-xs font-medium">IRS Deduction (${MILEAGE_RATE}/mi)</span>
          </div>
          <p className="text-2xl font-black text-success">${deduction.toFixed(2)}</p>
        </div>
      </div>

      {/* Mileage Logs */}
      {loading ? (
        <div className="space-y-4 py-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20">
          <Car size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted">Nenhuma viagem registrada</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl divide-y divide-border">
          {logs.map((l) => (
            <div key={l.id} className="flex items-center justify-between p-4 hover:bg-card/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <MapPin size={18} className="text-accent" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span>{l.origin || "?"}</span>
                    <ArrowRight size={14} className="text-text-muted" />
                    <span>{l.destination || "?"}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-text-muted mt-0.5">
                    <span>{l.date}</span>
                    {l.purpose && <span>| {l.purpose}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-accent">{l.miles} mi</span>
                <button onClick={() => handleDelete(l.id)} className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-accent">Nova Viagem</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-card rounded-lg"><X size={20} className="text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Data</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Origem</label>
                  <input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Destino</label>
                  <input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Miles *</label>
                  <input type="number" step="0.1" value={form.miles} onChange={(e) => setForm({ ...form, miles: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Proposito</label>
                  <input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Notas</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-border rounded-xl py-3 text-text-secondary hover:bg-card transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={!form.miles || saving} className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl py-3 hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
