"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Client, Job, MoneyEntry } from "@/lib/types";
import {
  ArrowLeft, User, Phone, Mail, MapPin, Briefcase, DollarSign,
  Pencil, X, TrendingUp, TrendingDown,
} from "lucide-react";

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

const statusLabels: Record<string, string> = {
  lead: "Lead",
  estimated: "Estimado",
  scheduled: "Agendado",
  in_progress: "Em Andamento",
  completed: "Concluido",
  invoiced: "Faturado",
  paid: "Pago",
  cancelled: "Cancelado",
};

type TabKey = "jobs" | "pagamentos" | "notas";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const supabase = createClient();

  const [client, setClient] = useState<Client | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [payments, setPayments] = useState<MoneyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("jobs");
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "", state: "", zip: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [clientRes, jobsRes, paymentsRes] = await Promise.all([
      supabase.from("clients").select("*").eq("id", clientId).single(),
      supabase.from("jobs").select("*").eq("client_id", clientId).order("start_date", { ascending: false }),
      supabase.from("money_entries").select("*").eq("client_id", clientId).order("date", { ascending: false }),
    ]);
    setClient(clientRes.data);
    setJobs(jobsRes.data || []);
    setPayments(paymentsRes.data || []);
    setLoading(false);
  }, [supabase, clientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openEdit = () => {
    if (!client) return;
    setForm({
      name: client.name || "",
      phone: client.phone || "",
      email: client.email || "",
      address: client.address || "",
      city: client.city || "",
      state: client.state || "",
      zip: client.zip || "",
      notes: client.notes || "",
    });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("clients").update({
      name: form.name,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      zip: form.zip || null,
      notes: form.notes || null,
    }).eq("id", clientId);
    setSaving(false);
    setShowEditModal(false);
    fetchData();
  };

  // Stats
  const totalJobs = jobs.length;
  const totalPaid = payments
    .filter((p) => p.kind === "income")
    .reduce((s, p) => s + p.amount, 0);
  const lastJobDate = jobs.length > 0
    ? jobs.reduce((latest, j) => {
        const d = j.start_date || j.created_at;
        return d > latest ? d : latest;
      }, "")
    : null;

  if (loading) {
    return <div className="space-y-4 py-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>;
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <User size={48} className="mx-auto text-text-muted mb-4" />
        <p className="text-text-muted">Cliente nao encontrado</p>
        <button onClick={() => router.push("/admin/clients")} className="mt-4 text-primary hover:underline text-sm">
          Voltar para clientes
        </button>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "jobs", label: "Jobs", count: jobs.length },
    { key: "pagamentos", label: "Pagamentos", count: payments.length },
    { key: "notas", label: "Notas", count: 0 },
  ];

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => router.push("/admin/clients")}
        className="flex items-center gap-2 text-text-secondary hover:text-text mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> Voltar
      </button>

      {/* Client Header */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-black text-accent mb-3">
              {client.name}
            </h1>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-secondary">
              {client.phone && (
                <span className="flex items-center gap-1.5"><Phone size={14} /> {client.phone}</span>
              )}
              {client.email && (
                <span className="flex items-center gap-1.5"><Mail size={14} /> {client.email}</span>
              )}
              {(client.address || client.city || client.state) && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {[client.address, client.city, client.state, client.zip].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={openEdit}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shrink-0"
          >
            <Pencil size={16} /> Editar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase size={18} className="text-secondary" />
            <span className="text-text-muted text-xs font-medium">Total de Jobs</span>
          </div>
          <p className="text-2xl font-black text-secondary">{totalJobs}</p>
        </div>
        <div className="bg-money-in/10 border border-money-in/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} className="text-money-in" />
            <span className="text-text-muted text-xs font-medium">Total Recebido</span>
          </div>
          <p className="text-2xl font-black text-money-in">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-accent/10 border border-accent/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase size={18} className="text-accent" />
            <span className="text-text-muted text-xs font-medium">Ultimo Job</span>
          </div>
          <p className="text-lg font-black text-accent">
            {lastJobDate ? new Date(lastJobDate).toLocaleDateString("pt-BR") : "—"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              tab === t.key ? "bg-primary text-white" : "bg-card border border-border text-text-secondary hover:text-text"
            }`}
          >
            {t.label} {t.count > 0 && `(${t.count})`}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "jobs" && (
        <div>
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase size={36} className="mx-auto text-text-muted mb-3" />
              <p className="text-text-muted text-sm">Nenhum job para este cliente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((j) => (
                <div key={j.id} className="bg-surface border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text truncate">{j.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColors[j.status] || ""}`}>
                        {statusLabels[j.status] || j.status}
                      </span>
                      {j.service_type && <span className="text-xs text-text-muted">{j.service_type}</span>}
                      {j.start_date && <span className="text-xs text-text-muted">{new Date(j.start_date).toLocaleDateString("pt-BR")}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {j.estimate_amount != null && (
                      <span className="text-accent font-bold text-sm">${j.estimate_amount.toLocaleString()}</span>
                    )}
                    {j.invoice_amount != null && (
                      <span className="text-money-in font-bold text-sm">${j.invoice_amount.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "pagamentos" && (
        <div>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign size={36} className="mx-auto text-text-muted mb-3" />
              <p className="text-text-muted text-sm">Nenhum pagamento para este cliente</p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl divide-y divide-border">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 hover:bg-card/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.kind === "income" ? "bg-money-in/20" : "bg-money-out/20"}`}>
                      {p.kind === "income" ? <TrendingUp size={18} className="text-money-in" /> : <TrendingDown size={18} className="text-money-out" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{p.category || "Sem categoria"}</p>
                      <p className="text-xs text-text-muted">{p.date}{p.notes ? ` - ${p.notes}` : ""}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${p.kind === "income" ? "text-money-in" : "text-money-out"}`}>
                    {p.kind === "income" ? "+" : "-"}${p.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "notas" && (
        <div className="bg-surface border border-border rounded-2xl p-6">
          {client.notes ? (
            <p className="text-text-secondary whitespace-pre-wrap">{client.notes}</p>
          ) : (
            <div className="text-center py-8">
              <p className="text-text-muted text-sm">Nenhuma nota para este cliente</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-accent">Editar Cliente</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-card rounded-lg transition-colors">
                <X size={20} className="text-text-muted" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Nome *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Telefone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Email</label>
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
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
              <div>
                <label className="text-xs text-text-muted mb-1 block">Notas</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowEditModal(false)} className="flex-1 border border-border rounded-xl py-3 text-text-secondary hover:bg-card transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={!form.name || saving} className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl py-3 hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
