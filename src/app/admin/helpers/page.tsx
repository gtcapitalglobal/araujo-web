"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Helper, HelperPayment } from "@/lib/types";
import { HardHat, Plus, Pencil, Trash2, X, Phone, DollarSign } from "lucide-react";

const taxStatusColors: Record<string, string> = {
  w9_received: "bg-success/20 text-success",
  w9_pending: "bg-warning/20 text-warning",
  "1099_sent": "bg-secondary/20 text-secondary",
  not_required: "bg-text-muted/20 text-text-muted",
};

const emptyHelper = { name: "", phone: "", email: "", address: "", tax_id_status: "", notes: "" };
const emptyPayment = { helper_id: "", date: new Date().toISOString().slice(0, 10), amount: "", method: "", notes: "" };

export default function HelpersPage() {
  const supabase = createClient();
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [payments, setPayments] = useState<HelperPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHelperModal, setShowHelperModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editing, setEditing] = useState<Helper | null>(null);
  const [helperForm, setHelperForm] = useState(emptyHelper);
  const [paymentForm, setPaymentForm] = useState(emptyPayment);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [h, p] = await Promise.all([
      supabase.from("helpers").select("*").order("name"),
      supabase.from("helper_payments").select("*").order("date", { ascending: false }),
    ]);
    setHelpers(h.data || []);
    setPayments(p.data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPaidFor = (helperId: string) =>
    payments.filter((p) => p.helper_id === helperId).reduce((s, p) => s + p.amount, 0);

  const openNewHelper = () => { setEditing(null); setHelperForm(emptyHelper); setShowHelperModal(true); };
  const openEditHelper = (h: Helper) => {
    setEditing(h);
    setHelperForm({ name: h.name, phone: h.phone || "", email: h.email || "", address: h.address || "", tax_id_status: h.tax_id_status || "", notes: h.notes || "" });
    setShowHelperModal(true);
  };

  const handleSaveHelper = async () => {
    setSaving(true);
    const payload = {
      name: helperForm.name,
      phone: helperForm.phone || null,
      email: helperForm.email || null,
      address: helperForm.address || null,
      tax_id_status: helperForm.tax_id_status || null,
      notes: helperForm.notes || null,
    };
    if (editing) {
      await supabase.from("helpers").update(payload).eq("id", editing.id);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("helpers").insert({ id: crypto.randomUUID(), user_id: user.id, ...payload });
    }
    setSaving(false);
    setShowHelperModal(false);
    fetchData();
  };

  const handleDeleteHelper = async (id: string) => {
    if (!confirm("Deletar este helper?")) return;
    await supabase.from("helpers").delete().eq("id", id);
    fetchData();
  };

  const openPayment = (helperId?: string) => {
    setPaymentForm({ ...emptyPayment, helper_id: helperId || "" });
    setShowPaymentModal(true);
  };

  const handleSavePayment = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("helper_payments").insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      helper_id: paymentForm.helper_id,
      date: paymentForm.date,
      amount: parseFloat(paymentForm.amount),
      method: paymentForm.method || null,
      notes: paymentForm.notes || null,
    });
    setSaving(false);
    setShowPaymentModal(false);
    fetchData();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-black text-accent">HELPERS</h1>
        <div className="flex gap-3">
          <button onClick={() => openPayment()} className="flex items-center gap-2 bg-gradient-to-r from-accent to-legendary text-bg font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
            <DollarSign size={18} /> Add Payment
          </button>
          <button onClick={openNewHelper} className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
            <Plus size={18} /> Add Helper
          </button>
        </div>
      </div>

      {/* Helpers List */}
      {loading ? (
        <div className="text-center py-20 text-text-muted">Carregando...</div>
      ) : helpers.length === 0 ? (
        <div className="text-center py-20">
          <HardHat size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted">Nenhum helper cadastrado</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {helpers.map((h) => {
            const paid = totalPaidFor(h.id);
            return (
              <div key={h.id} className="bg-surface border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-text">{h.name}</h3>
                      {h.tax_id_status && (
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${taxStatusColors[h.tax_id_status] || "bg-text-muted/20 text-text-muted"}`}>
                          {h.tax_id_status.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-text-secondary">
                      {h.phone && <span className="flex items-center gap-1"><Phone size={13} /> {h.phone}</span>}
                      <span className="flex items-center gap-1"><DollarSign size={13} /> Total pago: ${paid.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => openPayment(h.id)} className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-bold hover:bg-accent/20 transition-colors">
                      + Payment
                    </button>
                    <button onClick={() => openEditHelper(h)} className="p-2 rounded-lg hover:bg-card text-text-secondary hover:text-secondary transition-colors">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDeleteHelper(h.id)} className="p-2 rounded-lg hover:bg-error/10 text-text-secondary hover:text-error transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Helper Modal */}
      {showHelperModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowHelperModal(false)}>
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-accent">{editing ? "Editar Helper" : "Novo Helper"}</h2>
              <button onClick={() => setShowHelperModal(false)} className="p-1 hover:bg-card rounded-lg"><X size={20} className="text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Nome *</label>
                <input value={helperForm.name} onChange={(e) => setHelperForm({ ...helperForm, name: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Telefone</label>
                  <input value={helperForm.phone} onChange={(e) => setHelperForm({ ...helperForm, phone: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Email</label>
                  <input value={helperForm.email} onChange={(e) => setHelperForm({ ...helperForm, email: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Tax ID Status</label>
                <select value={helperForm.tax_id_status} onChange={(e) => setHelperForm({ ...helperForm, tax_id_status: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none">
                  <option value="">Selecionar...</option>
                  <option value="w9_received">W9 Received</option>
                  <option value="w9_pending">W9 Pending</option>
                  <option value="1099_sent">1099 Sent</option>
                  <option value="not_required">Not Required</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Notas</label>
                <textarea value={helperForm.notes} onChange={(e) => setHelperForm({ ...helperForm, notes: e.target.value })} rows={2} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowHelperModal(false)} className="flex-1 border border-border rounded-xl py-3 text-text-secondary hover:bg-card transition-colors">Cancelar</button>
              <button onClick={handleSaveHelper} disabled={!helperForm.name || saving} className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl py-3 hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-accent">Novo Pagamento</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-card rounded-lg"><X size={20} className="text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Helper *</label>
                <select value={paymentForm.helper_id} onChange={(e) => setPaymentForm({ ...paymentForm, helper_id: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none">
                  <option value="">Selecionar...</option>
                  {helpers.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Valor ($) *</label>
                  <input type="number" step="0.01" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Data</label>
                  <input type="date" value={paymentForm.date} onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Metodo</label>
                <select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none">
                  <option value="">Selecionar...</option>
                  <option value="cash">Cash</option>
                  <option value="zelle">Zelle</option>
                  <option value="check">Check</option>
                  <option value="venmo">Venmo</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Notas</label>
                <textarea value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} rows={2} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPaymentModal(false)} className="flex-1 border border-border rounded-xl py-3 text-text-secondary hover:bg-card transition-colors">Cancelar</button>
              <button onClick={handleSavePayment} disabled={!paymentForm.helper_id || !paymentForm.amount || saving} className="flex-1 bg-gradient-to-r from-accent to-legendary text-bg font-bold rounded-xl py-3 hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? "Salvando..." : "Pagar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
