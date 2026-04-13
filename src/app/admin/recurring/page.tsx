"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { RefreshCw, Plus, Pencil, Trash2, X, DollarSign, ToggleLeft, ToggleRight, CheckCircle } from "lucide-react";
import { frequencyOptions, getNextDueDate } from "@/lib/recurring";

interface RecurringExpense {
  id: string;
  user_id: string;
  category: string;
  description: string | null;
  amount: number;
  frequency: string;
  next_due: string | null;
  is_active: boolean;
  created_at: string;
}

const categoryOptions = [
  "Seguro", "Aluguel", "Software", "Telefone", "Internet",
  "Ferramenta", "Veiculo", "Marketing", "Assinatura", "Outro",
];

const emptyForm = {
  category: "",
  description: "",
  amount: "",
  frequency: "mensal",
  next_due: "",
};

export default function RecurringPage() {
  const supabase = createClient();
  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RecurringExpense | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [paidId, setPaidId] = useState<string | null>(null);

  const handleMarkPaid = async (e: RecurringExpense) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // Create money entry
    await supabase.from("money_entries").insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      kind: "expense",
      category: e.category,
      subcategory: e.description,
      amount: e.amount,
      date: new Date().toISOString().split("T")[0],
      notes: `Despesa recorrente: ${e.category}${e.description ? " - " + e.description : ""}`,
    });
    // Update next_due
    const nextDue = getNextDueDate(e.next_due || new Date().toISOString().split("T")[0], e.frequency);
    await supabase.from("recurring_expenses").update({ next_due: nextDue }).eq("id", e.id);
    setPaidId(e.id);
    setTimeout(() => setPaidId(null), 2000);
    fetchExpenses();
  };

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("recurring_expenses")
      .select("*")
      .order("is_active", { ascending: false })
      .order("category");
    setExpenses(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const totalMonthly = expenses
    .filter((e) => e.is_active)
    .reduce((sum, e) => {
      const freq = frequencyOptions.find((f) => f.key === e.frequency);
      return sum + e.amount * (freq?.monthlyFactor || 1);
    }, 0);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (e: RecurringExpense) => {
    setEditing(e);
    setForm({
      category: e.category || "",
      description: e.description || "",
      amount: e.amount.toString(),
      frequency: e.frequency || "mensal",
      next_due: e.next_due || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      category: form.category,
      description: form.description || null,
      amount: parseFloat(form.amount),
      frequency: form.frequency,
      next_due: form.next_due || null,
    };
    if (editing) {
      await supabase.from("recurring_expenses").update(payload).eq("id", editing.id);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("recurring_expenses").insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        ...payload,
        is_active: true,
        created_at: new Date().toISOString(),
      });
    }
    setSaving(false);
    setShowModal(false);
    fetchExpenses();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar esta despesa recorrente?")) return;
    await supabase.from("recurring_expenses").delete().eq("id", id);
    fetchExpenses();
  };

  const toggleActive = async (e: RecurringExpense) => {
    await supabase.from("recurring_expenses").update({ is_active: !e.is_active }).eq("id", e.id);
    fetchExpenses();
  };

  const getFrequencyLabel = (key: string) =>
    frequencyOptions.find((f) => f.key === key)?.label || key;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-black section-title">DESPESAS RECORRENTES</h1>
        <button onClick={openNew} className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
          <Plus size={18} /> Nova Despesa
        </button>
      </div>

      {/* Monthly Total */}
      <div className="bg-money-out/10 border border-money-out/30 rounded-2xl p-5 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign size={20} className="text-money-out" />
          <span className="text-text-muted text-xs font-medium">Custo Mensal Recorrente</span>
        </div>
        <p className="text-2xl font-black text-money-out">${totalMonthly.toFixed(2)}</p>
      </div>

      {/* Expenses List */}
      {loading ? (
        <div className="space-y-4 py-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-20">
          <RefreshCw size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted">Nenhuma despesa recorrente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((e) => (
            <div
              key={e.id}
              className={`bg-surface border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                e.is_active ? "hover:border-primary/30" : "opacity-50"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-text">{e.category}</h3>
                  <span className="rounded-full px-3 py-0.5 text-xs font-bold bg-secondary/20 text-secondary">
                    {getFrequencyLabel(e.frequency)}
                  </span>
                  {!e.is_active && (
                    <span className="rounded-full px-3 py-0.5 text-xs font-bold bg-text-muted/20 text-text-muted">
                      Inativo
                    </span>
                  )}
                </div>
                {e.description && (
                  <p className="text-sm text-text-secondary mt-0.5">{e.description}</p>
                )}
                {e.next_due && (
                  <p className="text-xs text-text-muted mt-1">
                    Proximo vencimento: {new Date(e.next_due).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-bold text-money-out text-lg">${e.amount.toFixed(2)}</span>
                {e.is_active && (
                  <button
                    onClick={() => handleMarkPaid(e)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${paidId === e.id ? "bg-success/20 text-success" : "bg-accent/20 text-accent hover:bg-accent/30"}`}
                  >
                    {paidId === e.id ? <span className="flex items-center gap-1"><CheckCircle size={14} /> Pago!</span> : <span className="flex items-center gap-1"><DollarSign size={12} /> Pagar</span>}
                  </button>
                )}
                <button
                  onClick={() => toggleActive(e)}
                  className="p-2 rounded-lg hover:bg-card text-text-secondary transition-colors"
                  title={e.is_active ? "Desativar" : "Ativar"}
                >
                  {e.is_active ? <ToggleRight size={20} className="text-success" /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => openEdit(e)} className="p-2 rounded-lg hover:bg-card text-text-secondary hover:text-secondary transition-colors">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(e.id)} className="p-2 rounded-lg hover:bg-error/10 text-text-secondary hover:text-error transition-colors">
                  <Trash2 size={16} />
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
                {editing ? "Editar Despesa" : "Nova Despesa Recorrente"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-card rounded-lg transition-colors">
                <X size={20} className="text-text-muted" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Categoria *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none"
                >
                  <option value="">Selecionar...</option>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Descricao</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none"
                  placeholder="Ex: Seguro do carro..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Valor ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Frequencia *</label>
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none"
                  >
                    {frequencyOptions.map((f) => (
                      <option key={f.key} value={f.key}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Proximo Vencimento</label>
                <input
                  type="date"
                  value={form.next_due}
                  onChange={(e) => setForm({ ...form, next_due: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-border rounded-xl py-3 text-text-secondary hover:bg-card transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.category || !form.amount || saving}
                className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl py-3 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
