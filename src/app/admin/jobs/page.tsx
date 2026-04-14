"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Job, Client, JobStatus } from "@/lib/types";
import { Briefcase, Plus, Pencil, Trash2, X, Search, LayoutGrid, List } from "lucide-react";

const statuses: { key: JobStatus | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "lead", label: "Lead" },
  { key: "estimated", label: "Estimated" },
  { key: "scheduled", label: "Scheduled" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "invoiced", label: "Invoiced" },
  { key: "paid", label: "Paid" },
];

const statusColors: Record<string, string> = {
  lead: "bg-text-muted/20 text-text-muted",
  estimated: "bg-warning/20 text-warning",
  scheduled: "bg-secondary/20 text-secondary",
  in_progress: "bg-primary/20 text-primary-light",
  completed: "bg-success/20 text-success",
  invoiced: "bg-accent/20 text-accent",
  paid: "bg-money-in/20 text-money-in",
  cancelled: "bg-error/20 text-error",
};

const emptyJob = {
  title: "", service_type: "", client_id: "", address: "", city: "", state: "", zip: "",
  start_date: "", end_date: "", estimate_amount: "", invoice_amount: "", status: "lead" as JobStatus, notes: "",
};

export default function JobsPage() {
  const supabase = createClient();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Pick<Client, "id" | "name">[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<JobStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [form, setForm] = useState(emptyJob);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "board">("list");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [jobsRes, clientsRes] = await Promise.all([
      supabase.from("jobs").select("*, client:clients(name)").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name").order("name"),
    ]);
    setJobs(jobsRes.data || []);
    setClients(clientsRes.data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openNew = () => { setEditing(null); setForm(emptyJob); setShowModal(true); };

  const openEdit = (j: Job) => {
    setEditing(j);
    setForm({
      title: j.title, service_type: j.service_type || "", client_id: j.client_id || "",
      address: j.address || "", city: j.city || "", state: j.state || "", zip: j.zip || "",
      start_date: j.start_date || "", end_date: j.end_date || "",
      estimate_amount: j.estimate_amount?.toString() || "", invoice_amount: j.invoice_amount?.toString() || "",
      status: j.status, notes: j.notes || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      title: form.title,
      service_type: form.service_type || null,
      client_id: form.client_id || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      zip: form.zip || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      estimate_amount: form.estimate_amount ? parseFloat(form.estimate_amount) : null,
      invoice_amount: form.invoice_amount ? parseFloat(form.invoice_amount) : null,
      status: form.status,
      notes: form.notes || null,
    };
    if (editing) {
      await supabase.from("jobs").update(payload).eq("id", editing.id);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("jobs").insert({ id: crypto.randomUUID(), user_id: user.id, ...payload });
    }
    setSaving(false);
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deletar este job?")) return;
    await supabase.from("jobs").delete().eq("id", id);
    fetchData();
  };

  const filtered = jobs.filter((j) => {
    if (filter !== "all" && j.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      const clientName = (j.client as unknown as { name: string })?.name || "";
      return j.title.toLowerCase().includes(s) || clientName.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-black section-title">JOBS</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-card border border-border rounded-xl overflow-hidden">
            <button onClick={() => setViewMode("list")} className={`px-3 py-2 transition-colors ${viewMode === "list" ? "bg-primary text-white" : "text-text-secondary hover:text-text"}`}>
              <List size={18} />
            </button>
            <button onClick={() => setViewMode("board")} className={`px-3 py-2 transition-colors ${viewMode === "board" ? "bg-primary text-white" : "text-text-secondary hover:text-text"}`}>
              <LayoutGrid size={18} />
            </button>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
            <Plus size={18} /> Novo Job
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {statuses.map((s) => (
          <button key={s.key} onClick={() => setFilter(s.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === s.key ? "bg-primary text-white" : "bg-card border border-border text-text-secondary hover:text-text"}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" placeholder="Buscar jobs..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-3 text-text focus:border-primary focus:outline-none transition-colors" />
      </div>

      {/* Jobs List / Board */}
      {loading ? (
        <div className="space-y-4 py-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted">Nenhum job encontrado</p>
        </div>
      ) : viewMode === "board" ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3" style={{ minWidth: "900px" }}>
            {statuses.filter((s) => s.key !== "all").map((s) => {
              const colJobs = filtered.filter((j) => j.status === s.key);
              return (
                <div key={s.key} className="flex-1 min-w-[140px]">
                  <div className={`text-xs font-bold px-3 py-2 rounded-t-xl flex items-center justify-between ${statusColors[s.key] || "bg-card text-text-muted"}`}>
                    <span>{s.label}</span>
                    <span className="opacity-70">{colJobs.length}</span>
                  </div>
                  <div className="bg-card/30 border border-border border-t-0 rounded-b-xl p-2 space-y-2 min-h-[120px]">
                    {colJobs.map((j) => {
                      const clientName = (j.client as unknown as { name: string })?.name;
                      return (
                        <div key={j.id} onClick={() => openEdit(j)} className="bg-surface border border-border rounded-xl p-3 cursor-pointer hover:border-primary/30 transition-colors">
                          <p className="text-sm font-bold text-text truncate">{j.title}</p>
                          {clientName && <p className="text-xs text-text-muted mt-1">{clientName}</p>}
                          {j.estimate_amount != null && <p className="text-xs text-accent font-bold mt-1">${j.estimate_amount.toLocaleString()}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((j) => {
            const clientName = (j.client as unknown as { name: string })?.name;
            return (
              <div key={j.id} className="bg-surface border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text truncate">{j.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColors[j.status] || ""}`}>
                      {j.status.replace("_", " ")}
                    </span>
                    {clientName && <span className="text-xs text-text-secondary">{clientName}</span>}
                    {j.service_type && <span className="text-xs text-text-muted">| {j.service_type}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {j.estimate_amount != null && (
                    <span className="text-accent font-bold text-sm">${j.estimate_amount.toLocaleString()}</span>
                  )}
                  <button onClick={() => openEdit(j)} className="p-2 rounded-lg hover:bg-card text-text-secondary hover:text-secondary transition-colors">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(j.id)} className="p-2 rounded-lg hover:bg-error/10 text-text-secondary hover:text-error transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-accent">
                {editing ? "Editar Job" : "Novo Job"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-card rounded-lg"><X size={20} className="text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Titulo *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Tipo de Servico</label>
                  <input value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Cliente</label>
                  <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none">
                    <option value="">Selecionar...</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Endereco</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Cidade</label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Estado</label>
                  <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">ZIP</label>
                  <input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Data Inicio</label>
                  <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Data Fim</label>
                  <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Estimativa ($)</label>
                  <input type="number" step="0.01" value={form.estimate_amount} onChange={(e) => setForm({ ...form, estimate_amount: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Invoice ($)</label>
                  <input type="number" step="0.01" value={form.invoice_amount} onChange={(e) => setForm({ ...form, invoice_amount: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as JobStatus })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none">
                  {statuses.filter((s) => s.key !== "all").map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Notas</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-border rounded-xl py-3 text-text-secondary hover:bg-card transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={!form.title || saving} className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl py-3 hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
