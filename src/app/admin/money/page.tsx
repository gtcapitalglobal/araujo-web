"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { MoneyEntry } from "@/lib/types";
import { DollarSign, TrendingUp, TrendingDown, Plus, Trash2, X, RefreshCw, Calendar, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { frequencyOptions, getNextDueDate } from "@/lib/recurring";

const incomeCategories = ["Service", "Material Reimbursement", "Referral", "Other Income"];
const expenseCategories = ["Materials", "Equipment", "Gas", "Insurance", "Tools", "Supplies", "Marketing", "Software", "Helper Payment", "Other Expense"];

export default function MoneyPage() {
  return (
    <Suspense fallback={<div className="skeleton h-10 w-48" />}>
      <MoneyPageContent />
    </Suspense>
  );
}

function MoneyPageContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [entries, setEntries] = useState<MoneyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalKind, setModalKind] = useState<"income" | "expense">("income");
  const [form, setForm] = useState({ category: "", subcategory: "", amount: "", date: new Date().toISOString().slice(0, 10), notes: "", isRecurring: false, frequency: "mensal" });
  const [saving, setSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MoneyEntry | null>(null);

  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);

  const monthStart = `${filterYear}-${String(filterMonth).padStart(2, "0")}-01`;
  const nextMonth = filterMonth === 12 ? `${filterYear + 1}-01-01` : `${filterYear}-${String(filterMonth + 1).padStart(2, "0")}-01`;

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("money_entries")
      .select("*")
      .gte("date", monthStart)
      .lt("date", nextMonth)
      .order("date", { ascending: false });
    setEntries(data || []);
    setLoading(false);
  }, [supabase, monthStart, nextMonth]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  // Auto-open modal from query param (e.g. /admin/money?new=income)
  useEffect(() => {
    const newParam = searchParams.get("new");
    if (newParam === "income" || newParam === "expense") {
      setModalKind(newParam);
      setForm({ category: "", subcategory: "", amount: "", date: new Date().toISOString().slice(0, 10), notes: "", isRecurring: false, frequency: "mensal" });
      setShowModal(true);
      // Clean the URL so refresh doesn't reopen
      router.replace("/admin/money");
    }
  }, [searchParams, router]);

  const monthIncome = entries.filter((e) => e.kind === "income").reduce((s, e) => s + e.amount, 0);
  const monthExpenses = entries.filter((e) => e.kind === "expense").reduce((s, e) => s + e.amount, 0);
  const monthProfit = monthIncome - monthExpenses;

  const navigateMonth = (delta: number) => {
    let m = filterMonth + delta;
    let y = filterYear;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setFilterMonth(m);
    setFilterYear(y);
  };

  const getDefaultDate = () => {
    const now = new Date();
    if (filterYear === now.getFullYear() && filterMonth === now.getMonth() + 1) return now.toISOString().slice(0, 10);
    return `${filterYear}-${String(filterMonth).padStart(2, "0")}-01`;
  };

  const openModal = (kind: "income" | "expense") => {
    setEditingEntry(null);
    setModalKind(kind);
    setForm({ category: "", subcategory: "", amount: "", date: getDefaultDate(), notes: "", isRecurring: false, frequency: "mensal" });
    setShowModal(true);
  };

  const openEdit = (entry: MoneyEntry) => {
    setEditingEntry(entry);
    setModalKind(entry.kind);
    setForm({
      category: entry.category || "",
      subcategory: entry.subcategory || "",
      amount: entry.amount.toString(),
      date: entry.date,
      notes: entry.notes || "",
      isRecurring: false,
      frequency: "mensal",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    if (editingEntry) {
      await supabase.from("money_entries").update({
        kind: modalKind,
        category: form.category || null,
        subcategory: form.subcategory || null,
        amount: parseFloat(form.amount),
        date: form.date,
        notes: form.notes || null,
      }).eq("id", editingEntry.id);
    } else {
      await supabase.from("money_entries").insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        kind: modalKind,
        category: form.category || null,
        subcategory: form.subcategory || null,
        amount: parseFloat(form.amount),
        date: form.date,
        notes: form.notes || null,
      });
    }
    // Create recurring expense if checked
    if (!editingEntry && form.isRecurring && modalKind === "expense") {
      const nextDue = getNextDueDate(form.date, form.frequency);
      await supabase.from("recurring_expenses").insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        category: form.category || "Outro",
        description: form.subcategory || form.notes || null,
        amount: parseFloat(form.amount),
        frequency: form.frequency,
        next_due: nextDue,
        is_active: true,
        created_at: new Date().toISOString(),
      });
    }
    setSaving(false);
    setShowModal(false);
    fetchEntries();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar esta entrada?")) return;
    await supabase.from("money_entries").delete().eq("id", id);
    fetchEntries();
  };

  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-black section-title">DINHEIRO</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => navigateMonth(-1)} className="p-2 rounded-lg hover:bg-card border border-border text-text-secondary hover:text-text transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2">
            <Calendar size={16} className="text-primary" />
            <span className="font-bold text-text text-sm">{monthNames[filterMonth - 1]} {filterYear}</span>
          </div>
          <button onClick={() => navigateMonth(1)} className="p-2 rounded-lg hover:bg-card border border-border text-text-secondary hover:text-text transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="stat-card bg-money-in/10 border border-money-in/30 rounded-2xl p-5" style={{ "--stat-glow": "rgba(34,197,94,0.3)" } as React.CSSProperties}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} className="text-money-in" />
            <span className="text-text-muted text-xs font-medium">Receita - {monthNames[filterMonth - 1]}</span>
          </div>
          <p className="text-2xl font-black text-money-in">${monthIncome.toFixed(2)}</p>
        </div>
        <div className="stat-card bg-money-out/10 border border-money-out/30 rounded-2xl p-5" style={{ "--stat-glow": "rgba(255,77,77,0.3)" } as React.CSSProperties}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={20} className="text-money-out" />
            <span className="text-text-muted text-xs font-medium">Despesas - {monthNames[filterMonth - 1]}</span>
          </div>
          <p className="text-2xl font-black text-money-out">${monthExpenses.toFixed(2)}</p>
        </div>
        <div className="stat-card bg-profit/10 border border-profit/30 rounded-2xl p-5" style={{ "--stat-glow": "rgba(255,214,0,0.3)" } as React.CSSProperties}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={20} className="text-profit" />
            <span className="text-text-muted text-xs font-medium">Lucro - {monthNames[filterMonth - 1]}</span>
          </div>
          <p className={`text-2xl font-black ${monthProfit >= 0 ? "text-profit" : "text-money-out"}`}>${monthProfit.toFixed(2)}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => openModal("income")} className="flex items-center gap-2 bg-gradient-to-r from-success to-money-in text-bg font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
          <Plus size={18} /> Money In
        </button>
        <button onClick={() => openModal("expense")} className="flex items-center gap-2 bg-gradient-to-r from-error to-money-out text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
          <Plus size={18} /> Expense
        </button>
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20">
          <DollarSign size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted">Nenhuma entrada ainda</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          {entries.map((e, idx) => (
            <div key={e.id} className={`flex items-center justify-between p-4 border-b border-border/30 transition-colors ${idx % 2 === 0 ? "bg-transparent" : "bg-card/30"} hover:bg-primary/5`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${e.kind === "income" ? "bg-money-in/20" : "bg-money-out/20"}`}>
                  {e.kind === "income" ? <TrendingUp size={18} className="text-money-in" /> : <TrendingDown size={18} className="text-money-out" />}
                </div>
                <div>
                  <p className="text-sm font-semibold">{e.category || "Sem categoria"}</p>
                  <p className="text-xs text-text-muted">{new Date(e.date + "T00:00:00").toLocaleDateString("pt-BR")}{e.notes ? ` - ${e.notes}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-bold ${e.kind === "income" ? "text-money-in" : "text-money-out"}`}>
                  {e.kind === "income" ? "+" : "-"}${e.amount.toFixed(2)}
                </span>
                <button onClick={() => openEdit(e)} className="p-2 rounded-lg hover:bg-card text-text-muted hover:text-secondary transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(e.id)} className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-colors">
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
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-accent">
                {editingEntry ? "Editar Entrada" : modalKind === "income" ? "Money In" : "Nova Despesa"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-card rounded-lg"><X size={20} className="text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Categoria</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none">
                  <option value="">Selecionar...</option>
                  {(modalKind === "income" ? incomeCategories : expenseCategories).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Valor ($) *</label>
                <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Data de Vencimento</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Notas</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none resize-none" />
              </div>
              {modalKind === "expense" && !editingEntry && (
                <div className="bg-card/50 border border-border rounded-xl p-4 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isRecurring}
                      onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                      className="w-5 h-5 rounded accent-primary"
                    />
                    <span className="text-sm font-medium text-text flex items-center gap-2">
                      <RefreshCw size={14} className="text-secondary" />
                      Despesa Recorrente?
                    </span>
                  </label>
                  {form.isRecurring && (
                    <select
                      value={form.frequency}
                      onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none"
                    >
                      {frequencyOptions.map((f) => (
                        <option key={f.key} value={f.key}>{f.label}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-border rounded-xl py-3 text-text-secondary hover:bg-card transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={!form.amount || saving} className={`flex-1 bg-gradient-to-r ${modalKind === "income" ? "from-success to-money-in text-bg" : "from-error to-money-out text-white"} font-bold rounded-xl py-3 hover:opacity-90 transition-opacity disabled:opacity-50`}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
