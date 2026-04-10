"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, Plus, Trash2, X, Check, Clock, AlertTriangle } from "lucide-react";

interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string;
  is_done: boolean;
  done_at: string | null;
  created_at: string;
}

type FilterKey = "todos" | "pendentes" | "concluidos" | "atrasados";

const filters: { key: FilterKey; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "pendentes", label: "Pendentes" },
  { key: "concluidos", label: "Concluidos" },
  { key: "atrasados", label: "Atrasados" },
];

const emptyForm = { title: "", description: "", due_date: "" };

export default function RemindersPage() {
  const supabase = createClient();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("todos");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reminders")
      .select("*")
      .order("due_date", { ascending: true });
    setReminders(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const now = new Date();

  const isOverdue = (r: Reminder) => !r.is_done && new Date(r.due_date) < now;

  const filtered = reminders.filter((r) => {
    switch (filter) {
      case "pendentes":
        return !r.is_done;
      case "concluidos":
        return r.is_done;
      case "atrasados":
        return isOverdue(r);
      default:
        return true;
    }
  });

  const toggleDone = async (r: Reminder) => {
    const newDone = !r.is_done;
    await supabase.from("reminders").update({
      is_done: newDone,
      done_at: newDone ? new Date().toISOString() : null,
    }).eq("id", r.id);
    fetchReminders();
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("reminders").insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      title: form.title,
      description: form.description || null,
      due_date: form.due_date,
      is_done: false,
      created_at: new Date().toISOString(),
    });
    setSaving(false);
    setShowModal(false);
    setForm(emptyForm);
    fetchReminders();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar este lembrete?")) return;
    await supabase.from("reminders").delete().eq("id", id);
    fetchReminders();
  };

  const overdueCount = reminders.filter(isOverdue).length;
  const pendingCount = reminders.filter((r) => !r.is_done).length;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-black text-accent">LEMBRETES</h1>
        <button onClick={() => { setForm(emptyForm); setShowModal(true); }} className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
          <Plus size={18} /> Novo Lembrete
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} className="text-primary-light" />
            <span className="text-text-muted text-xs font-medium">Pendentes</span>
          </div>
          <p className="text-2xl font-black text-primary-light">{pendingCount}</p>
        </div>
        {overdueCount > 0 && (
          <div className="bg-warning/10 border border-warning/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={20} className="text-warning" />
              <span className="text-text-muted text-xs font-medium">Atrasados</span>
            </div>
            <p className="text-2xl font-black text-warning">{overdueCount}</p>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              filter === f.key ? "bg-primary text-white" : "bg-card border border-border text-text-secondary hover:text-text"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      {loading ? (
        <div className="space-y-4 py-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Bell size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted">Nenhum lembrete encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const overdue = isOverdue(r);
            return (
              <div
                key={r.id}
                className={`bg-surface border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  overdue ? "border-warning/50 bg-warning/5" : r.is_done ? "border-border opacity-60" : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleDone(r)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      r.is_done
                        ? "bg-success border-success"
                        : overdue
                        ? "border-warning hover:bg-warning/20"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {r.is_done && <Check size={14} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold truncate ${r.is_done ? "line-through text-text-muted" : "text-text"}`}>
                      {r.title}
                    </h3>
                    {r.description && (
                      <p className="text-sm text-text-secondary mt-0.5 line-clamp-2">{r.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={12} className={overdue ? "text-warning" : "text-text-muted"} />
                      <span className={`text-xs ${overdue ? "text-warning font-bold" : "text-text-muted"}`}>
                        {formatDate(r.due_date)}
                        {overdue && " - Atrasado!"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-colors shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-accent">Novo Lembrete</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-card rounded-lg transition-colors">
                <X size={20} className="text-text-muted" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Titulo *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none"
                  placeholder="Ex: Ligar para cliente..."
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Descricao</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none resize-none"
                  placeholder="Detalhes adicionais..."
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Data/Hora *</label>
                <input
                  type="datetime-local"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
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
                disabled={!form.title || !form.due_date || saving}
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
