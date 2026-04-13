"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ExternalLink, Plus, Pencil, Trash2, X, FolderOpen, Link2,
  Building2, Shield, Landmark, FileText, Car, HardHat, Heart, BookOpen
} from "lucide-react";

interface DocLink {
  id: string;
  category: string;
  name: string;
  url: string;
  notes: string | null;
  sort_order: number;
  created_at: string;
}

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  empresa: { label: "Empresa", icon: Building2, color: "from-primary to-secondary" },
  seguro: { label: "Seguro", icon: Shield, color: "from-success to-secondary" },
  banco: { label: "Banco e Financeiro", icon: Landmark, color: "from-accent to-legendary" },
  impostos: { label: "Impostos", icon: FileText, color: "from-error to-warning" },
  veiculo: { label: "Veiculo", icon: Car, color: "from-secondary to-primary" },
  ajudantes: { label: "Ajudantes", icon: HardHat, color: "from-warning to-accent" },
  saude: { label: "Saude e Pessoal", icon: Heart, color: "from-error to-epic" },
  outros: { label: "Outros", icon: BookOpen, color: "from-epic to-primary" },
};

const categoryOptions = Object.entries(categoryConfig).map(([key, val]) => ({
  value: key,
  label: val.label,
}));

const emptyForm = { category: "empresa", name: "", url: "", notes: "" };

export default function DocsPage() {
  const supabase = createClient();
  const [links, setLinks] = useState<DocLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DocLink | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("todos");

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("doc_links")
      .select("*")
      .order("category")
      .order("sort_order")
      .order("name");
    setLinks(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (link: DocLink) => {
    setEditing(link);
    setForm({ category: link.category, name: link.name, url: link.url, notes: link.notes || "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.url.trim()) return;
    setSaving(true);

    let url = form.url.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const payload = {
      category: form.category,
      name: form.name.trim(),
      url,
      notes: form.notes.trim() || null,
    };

    if (editing) {
      await supabase.from("doc_links").update(payload).eq("id", editing.id);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("doc_links").insert({ id: crypto.randomUUID(), user_id: user.id, ...payload });
    }
    setSaving(false);
    setShowModal(false);
    fetchLinks();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar este link?")) return;
    await supabase.from("doc_links").delete().eq("id", id);
    fetchLinks();
  };

  const filtered = filter === "todos" ? links : links.filter((l) => l.category === filter);
  const grouped = filtered.reduce<Record<string, DocLink[]>>((acc, link) => {
    if (!acc[link.category]) acc[link.category] = [];
    acc[link.category].push(link);
    return acc;
  }, {});

  const usedCategories = [...new Set(links.map((l) => l.category))];

  if (loading) return <div className="space-y-4 py-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-black section-title">DOCUMENTOS E LINKS</h1>
          <p className="text-text-muted text-sm mt-1">Todos os documentos importantes da empresa em um so lugar. Clique para abrir.</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-gradient-to-r from-accent to-legendary text-bg font-bold px-4 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity">
          <Plus size={16} /> Novo Link
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("todos")}
          className={`text-xs font-bold px-4 py-2 rounded-full transition ${filter === "todos" ? "bg-primary text-white" : "bg-surface text-text-muted border border-border hover:text-text"}`}
        >
          Todos ({links.length})
        </button>
        {usedCategories.map((cat) => {
          const config = categoryConfig[cat];
          const count = links.filter((l) => l.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-xs font-bold px-4 py-2 rounded-full transition ${filter === cat ? "bg-primary text-white" : "bg-surface text-text-muted border border-border hover:text-text"}`}
            >
              {config?.label || cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Links by category */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center">
          <FolderOpen size={48} className="text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text mb-2">Nenhum documento salvo</h3>
          <p className="text-text-muted text-sm mb-6">Adicione links para documentos importantes da empresa.</p>
          <p className="text-text-muted text-xs mb-4">Exemplos do que guardar aqui:</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              "Certificado LLC (Georgia)",
              "Carta do EIN (IRS)",
              "Apolice de seguro",
              "BOI Report",
              "Registro anual Georgia",
              "Conta bancaria online",
              "Login do QuickBooks",
              "Seguro do carro",
            ].map((example) => (
              <div key={example} className="bg-card rounded-lg p-3 text-xs text-text-secondary">{example}</div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, categoryLinks]) => {
            const config = categoryConfig[category] || { label: category, icon: Link2, color: "from-primary to-secondary" };
            const Icon = config.icon;
            return (
              <div key={category}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 bg-gradient-to-br ${config.color} rounded-lg flex items-center justify-center`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <h2 className="font-bold text-text text-sm">{config.label}</h2>
                  <span className="text-text-muted text-xs">({categoryLinks.length})</span>
                </div>
                <div className="grid gap-2">
                  {categoryLinks.map((link) => (
                    <div key={link.id} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 group hover:border-primary/30 transition">
                      <div className="flex-1 min-w-0">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text font-semibold text-sm hover:text-secondary transition flex items-center gap-2"
                        >
                          {link.name}
                          <ExternalLink size={12} className="text-text-muted shrink-0" />
                        </a>
                        {link.notes && <p className="text-text-muted text-xs mt-1 truncate">{link.notes}</p>}
                        <p className="text-text-muted/50 text-[10px] mt-1 truncate">{link.url}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                        <button onClick={() => openEdit(link)} className="p-2 rounded-lg hover:bg-card text-text-muted hover:text-secondary transition">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(link.id)} className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-accent">
                {editing ? "Editar Link" : "Novo Link"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-card rounded-lg">
                <X size={20} className="text-text-muted" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Categoria</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Nome do Documento</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Certificado LLC Georgia"
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Link (URL)</label>
                <input
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="Ex: https://drive.google.com/..."
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Notas (opcional)</label>
                <input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Ex: Validade ate dezembro 2026"
                  className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-border rounded-xl py-3 text-text-secondary hover:bg-card transition">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.url} className="flex-1 bg-gradient-to-r from-accent to-legendary text-bg font-bold rounded-xl py-3 hover:opacity-90 transition disabled:opacity-50">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
