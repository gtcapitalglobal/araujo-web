"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Folder, Document } from "@/lib/types";
import { FolderOpen, FileText, Plus, Trash2, X, Upload, Folder as FolderIcon } from "lucide-react";

const defaultFolders = [
  "Receipts",
  "Invoices",
  "Contracts",
  "Tax Documents",
  "Insurance",
  "Licenses",
  "Other",
];

export default function FilesPage() {
  const supabase = createClient();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [foldersRes, docsRes] = await Promise.all([
      supabase.from("folders").select("*").order("order_index"),
      supabase.from("documents").select("*").eq("status", "active").order("created_at", { ascending: false }),
    ]);
    setFolders(foldersRes.data || []);
    setDocuments(docsRes.data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    setSaving(true);
    await supabase.from("folders").insert({
      id: crypto.randomUUID(),
      name: folderName.trim(),
      order_index: folders.length,
    });
    setSaving(false);
    setShowFolderModal(false);
    setFolderName("");
    fetchData();
  };

  const handleDeleteFolder = async (id: string) => {
    if (!confirm("Deletar esta pasta?")) return;
    await supabase.from("folders").delete().eq("id", id);
    if (selectedFolder === id) setSelectedFolder(null);
    fetchData();
  };

  const folderDocs = selectedFolder
    ? documents.filter((d) => d.folder_id === selectedFolder)
    : documents;

  const handleDeleteDoc = async (id: string) => {
    if (!confirm("Deletar este arquivo?")) return;
    await supabase.from("documents").update({ status: "archived" as const }).eq("id", id);
    fetchData();
  };

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-black text-accent mb-8">ARQUIVOS</h1>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Folder Sidebar */}
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-display)] text-xs font-bold text-secondary tracking-wider">PASTAS</h2>
            <button onClick={() => setShowFolderModal(true)} className="p-1.5 rounded-lg hover:bg-card text-text-muted hover:text-secondary transition-colors">
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-1">
            <button onClick={() => setSelectedFolder(null)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${!selectedFolder ? "bg-primary/20 text-accent border border-primary/30" : "text-text-secondary hover:bg-card hover:text-text"}`}>
              <FolderOpen size={16} /> Todos
              <span className="ml-auto text-xs text-text-muted">{documents.length}</span>
            </button>

            {loading ? (
              <div className="text-center py-4 text-text-muted text-xs">Carregando...</div>
            ) : folders.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-4">Nenhuma pasta</p>
            ) : (
              folders.map((f) => {
                const count = documents.filter((d) => d.folder_id === f.id).length;
                return (
                  <div key={f.id} className="flex items-center group">
                    <button onClick={() => setSelectedFolder(f.id)}
                      className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${selectedFolder === f.id ? "bg-primary/20 text-accent border border-primary/30" : "text-text-secondary hover:bg-card hover:text-text"}`}>
                      <FolderIcon size={16} /> {f.name}
                      <span className="ml-auto text-xs text-text-muted">{count}</span>
                    </button>
                    <button onClick={() => handleDeleteFolder(f.id)} className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-error/10 text-text-muted hover:text-error transition-all ml-1">
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main Content */}
        <div>
          {/* Upload Area */}
          <div className="bg-surface border-2 border-dashed border-border rounded-2xl p-8 text-center mb-6 hover:border-primary/50 transition-colors">
            <Upload size={40} className="mx-auto text-text-muted mb-3" />
            <p className="text-text-secondary text-sm mb-1">Arraste arquivos aqui ou clique para upload</p>
            <p className="text-text-muted text-xs">Feature em desenvolvimento - em breve!</p>
          </div>

          {/* Documents */}
          {folderDocs.length === 0 ? (
            <div className="text-center py-16">
              <FileText size={48} className="mx-auto text-text-muted mb-4" />
              <p className="text-text-muted">Nenhum arquivo nesta pasta</p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl divide-y divide-border">
              {folderDocs.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-4 hover:bg-card/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                      <FileText size={18} className="text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">{d.title}</p>
                      <div className="flex gap-3 text-xs text-text-muted">
                        {d.category && <span>{d.category}</span>}
                        <span>{d.created_at.slice(0, 10)}</span>
                        {d.amount != null && <span className="text-accent">${d.amount}</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteDoc(d.id)} className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowFolderModal(false)}>
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-accent">Nova Pasta</h2>
              <button onClick={() => setShowFolderModal(false)} className="p-1 hover:bg-card rounded-lg"><X size={20} className="text-text-muted" /></button>
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Nome da Pasta</label>
              <input value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="Ex: Receipts 2026" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowFolderModal(false)} className="flex-1 border border-border rounded-xl py-3 text-text-secondary hover:bg-card transition-colors">Cancelar</button>
              <button onClick={handleCreateFolder} disabled={!folderName.trim() || saving} className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl py-3 hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? "Criando..." : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
