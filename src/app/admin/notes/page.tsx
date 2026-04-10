"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { StickyNote, Plus, Pencil, Trash2, X, Pin } from "lucide-react";

interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

const colorOptions = [
  { key: "default", label: "Padrao", bg: "bg-surface", border: "border-border", dot: "bg-text-muted" },
  { key: "yellow", label: "Amarelo", bg: "bg-yellow-900/20", border: "border-yellow-700/30", dot: "bg-yellow-500" },
  { key: "green", label: "Verde", bg: "bg-green-900/20", border: "border-green-700/30", dot: "bg-green-500" },
  { key: "blue", label: "Azul", bg: "bg-blue-900/20", border: "border-blue-700/30", dot: "bg-blue-500" },
  { key: "red", label: "Vermelho", bg: "bg-red-900/20", border: "border-red-700/30", dot: "bg-red-500" },
];

const getColorClasses = (color: string) =>
  colorOptions.find((c) => c.key === color) || colorOptions[0];

const emptyNote = { title: "", content: "", color: "default" };

export default function NotesPage() {
  const supabase = createClient();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [form, setForm] = useState(emptyNote);
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("notes")
      .select("*")
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false });
    setNotes(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyNote);
    setShowModal(true);
  };

  const openEdit = (n: Note) => {
    setEditing(n);
    setForm({ title: n.title || "", content: n.content || "", color: n.color || "default" });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const now = new Date().toISOString();
    if (editing) {
      await supabase.from("notes").update({
        title: form.title || null,
        content: form.content || null,
        color: form.color,
        updated_at: now,
      }).eq("id", editing.id);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("notes").insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        title: form.title || null,
        content: form.content || null,
        color: form.color,
        pinned: false,
        created_at: now,
        updated_at: now,
      });
    }
    setSaving(false);
    setShowModal(false);
    fetchNotes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar esta nota?")) return;
    await supabase.from("notes").delete().eq("id", id);
    fetchNotes();
  };

  const togglePin = async (note: Note) => {
    await supabase.from("notes").update({ pinned: !note.pinned }).eq("id", note.id);
    fetchNotes();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-black text-accent">NOTAS</h1>
        <button onClick={openNew} className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
          <Plus size={18} /> Nova Nota
        </button>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="space-y-4 py-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20">
          <StickyNote size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted">Nenhuma nota criada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((n) => {
            const colors = getColorClasses(n.color);
            return (
              <div
                key={n.id}
                className={`${colors.bg} border ${colors.border} rounded-2xl p-5 flex flex-col justify-between hover:shadow-lg transition-shadow relative group`}
              >
                {/* Pin indicator */}
                {n.pinned && (
                  <div className="absolute top-3 right-3">
                    <Pin size={14} className="text-accent fill-accent" />
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                    <h3 className="font-bold text-text truncate flex-1">{n.title || "Sem titulo"}</h3>
                  </div>
                  <p className="text-sm text-text-secondary whitespace-pre-wrap line-clamp-4">
                    {n.content || ""}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-text-muted">
                    {new Date(n.updated_at).toLocaleDateString("pt-BR")}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => togglePin(n)}
                      className={`p-1.5 rounded-lg hover:bg-card transition-colors ${n.pinned ? "text-accent" : "text-text-muted hover:text-accent"}`}
                      title={n.pinned ? "Desafixar" : "Fixar"}
                    >
                      <Pin size={14} />
                    </button>
                    <button onClick={() => openEdit(n)} className="p-1.5 rounded-lg hover:bg-card text-text-muted hover:text-secondary transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(n.id)} className="p-1.5 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-accent">
                {editing ? "Editar Nota" : "Nova Nota"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-card rounded-lg transition-colors">
                <X size={20} className="text-text-muted" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Titulo</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none"
                  placeholder="Titulo da nota..."
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Conteudo</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={5}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none resize-none"
                  placeholder="Escreva sua nota..."
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-2 block">Cor</label>
                <div className="flex gap-3">
                  {colorOptions.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setForm({ ...form, color: c.key })}
                      className={`w-8 h-8 rounded-full ${c.dot} border-2 transition-all ${
                        form.color === c.key ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-border rounded-xl py-3 text-text-secondary hover:bg-card transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
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
