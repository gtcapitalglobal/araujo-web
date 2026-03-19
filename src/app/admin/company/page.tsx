"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CompanyInfo, CompanyContact } from "@/lib/types";
import { Building2, Plus, Pencil, Trash2, X, Phone, Mail, Save, User } from "lucide-react";

const contactTypeLabels: Record<string, string> = {
  accountant: "Contador",
  insurance: "Seguro",
  bank: "Banco",
  other: "Outro",
};

const contactTypeColors: Record<string, string> = {
  accountant: "bg-accent/20 text-accent",
  insurance: "bg-secondary/20 text-secondary",
  bank: "bg-success/20 text-success",
  other: "bg-text-muted/20 text-text-muted",
};

const emptyContact = { type: "other" as CompanyContact["type"], name: "", company: "", phone: "", email: "", notes: "" };

export default function CompanyPage() {
  const supabase = createClient();
  const [info, setInfo] = useState<CompanyInfo | null>(null);
  const [contacts, setContacts] = useState<CompanyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    legal_name: "", ein: "", phone: "", email: "", website: "",
    address_line1: "", address_line2: "", city: "", state: "", zip: "", notes: "",
  });

  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<CompanyContact | null>(null);
  const [contactForm, setContactForm] = useState(emptyContact);
  const [savingContact, setSavingContact] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [infoRes, contactsRes] = await Promise.all([
      supabase.from("company_info").select("*").limit(1).maybeSingle(),
      supabase.from("company_contacts").select("*").order("type"),
    ]);
    if (infoRes.data) {
      setInfo(infoRes.data);
      setInfoForm({
        legal_name: infoRes.data.legal_name || "",
        ein: infoRes.data.ein || "",
        phone: infoRes.data.phone || "",
        email: infoRes.data.email || "",
        website: infoRes.data.website || "",
        address_line1: infoRes.data.address_line1 || "",
        address_line2: infoRes.data.address_line2 || "",
        city: infoRes.data.city || "",
        state: infoRes.data.state || "",
        zip: infoRes.data.zip || "",
        notes: infoRes.data.notes || "",
      });
    }
    setContacts(contactsRes.data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    const payload = {
      legal_name: infoForm.legal_name || null,
      ein: infoForm.ein || null,
      phone: infoForm.phone || null,
      email: infoForm.email || null,
      website: infoForm.website || null,
      address_line1: infoForm.address_line1 || null,
      address_line2: infoForm.address_line2 || null,
      city: infoForm.city || null,
      state: infoForm.state || null,
      zip: infoForm.zip || null,
      notes: infoForm.notes || null,
    };
    if (info) {
      await supabase.from("company_info").update(payload).eq("id", info.id);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("company_info").insert({ id: crypto.randomUUID(), user_id: user.id, ...payload });
    }
    setSavingInfo(false);
    fetchData();
  };

  const openNewContact = () => { setEditingContact(null); setContactForm(emptyContact); setShowContactModal(true); };
  const openEditContact = (c: CompanyContact) => {
    setEditingContact(c);
    setContactForm({ type: c.type, name: c.name || "", company: c.company || "", phone: c.phone || "", email: c.email || "", notes: c.notes || "" });
    setShowContactModal(true);
  };

  const handleSaveContact = async () => {
    setSavingContact(true);
    const payload = {
      type: contactForm.type,
      name: contactForm.name || null,
      company: contactForm.company || null,
      phone: contactForm.phone || null,
      email: contactForm.email || null,
      notes: contactForm.notes || null,
    };
    if (editingContact) {
      await supabase.from("company_contacts").update(payload).eq("id", editingContact.id);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("company_contacts").insert({ id: crypto.randomUUID(), user_id: user.id, ...payload });
    }
    setSavingContact(false);
    setShowContactModal(false);
    fetchData();
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Deletar este contato?")) return;
    await supabase.from("company_contacts").delete().eq("id", id);
    fetchData();
  };

  if (loading) return <div className="text-center py-20 text-text-muted">Carregando...</div>;

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-black text-accent mb-8">EMPRESA</h1>

      {/* Company Info */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
        <h2 className="font-[family-name:var(--font-display)] text-sm font-bold text-secondary tracking-wider mb-6">DADOS DA EMPRESA</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Razao Social</label>
              <input value={infoForm.legal_name} onChange={(e) => setInfoForm({ ...infoForm, legal_name: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">EIN</label>
              <input value={infoForm.ein} onChange={(e) => setInfoForm({ ...infoForm, ein: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Telefone</label>
              <input value={infoForm.phone} onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Email</label>
              <input value={infoForm.email} onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Horario (ex: Mon - Sat: 7AM - 6PM)</label>
              <input value={infoForm.website} onChange={(e) => setInfoForm({ ...infoForm, website: e.target.value })} placeholder="Mon - Sat: 7:00 AM - 6:00 PM" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Endereco Linha 1</label>
            <input value={infoForm.address_line1} onChange={(e) => setInfoForm({ ...infoForm, address_line1: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Endereco Linha 2</label>
            <input value={infoForm.address_line2} onChange={(e) => setInfoForm({ ...infoForm, address_line2: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Cidade</label>
              <input value={infoForm.city} onChange={(e) => setInfoForm({ ...infoForm, city: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Estado</label>
              <input value={infoForm.state} onChange={(e) => setInfoForm({ ...infoForm, state: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">ZIP</label>
              <input value={infoForm.zip} onChange={(e) => setInfoForm({ ...infoForm, zip: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Notas</label>
            <textarea value={infoForm.notes} onChange={(e) => setInfoForm({ ...infoForm, notes: e.target.value })} rows={3} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none resize-none" />
          </div>
          <button onClick={handleSaveInfo} disabled={savingInfo} className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
            <Save size={18} /> {savingInfo ? "Salvando..." : "Salvar Dados"}
          </button>
        </div>
      </div>

      {/* Company Contacts */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-[family-name:var(--font-display)] text-sm font-bold text-secondary tracking-wider">CONTATOS DA EMPRESA</h2>
          <button onClick={openNewContact} className="flex items-center gap-2 bg-gradient-to-r from-accent to-legendary text-bg font-bold px-4 py-2 rounded-xl text-sm hover:opacity-90 transition-opacity">
            <Plus size={16} /> Novo Contato
          </button>
        </div>

        {contacts.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-8">Nenhum contato cadastrado</p>
        ) : (
          <div className="grid gap-3">
            {contacts.map((c) => (
              <div key={c.id} className="bg-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${contactTypeColors[c.type] || ""}`}>
                      {contactTypeLabels[c.type] || c.type}
                    </span>
                    <span className="font-bold text-text text-sm">{c.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 text-xs text-text-secondary">
                    {c.company && <span>{c.company}</span>}
                    {c.phone && <span className="flex items-center gap-1"><Phone size={11} /> {c.phone}</span>}
                    {c.email && <span className="flex items-center gap-1"><Mail size={11} /> {c.email}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEditContact(c)} className="p-2 rounded-lg hover:bg-surface text-text-secondary hover:text-secondary transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDeleteContact(c.id)} className="p-2 rounded-lg hover:bg-error/10 text-text-secondary hover:text-error transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowContactModal(false)}>
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-accent">
                {editingContact ? "Editar Contato" : "Novo Contato"}
              </h2>
              <button onClick={() => setShowContactModal(false)} className="p-1 hover:bg-card rounded-lg"><X size={20} className="text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Tipo</label>
                <select value={contactForm.type} onChange={(e) => setContactForm({ ...contactForm, type: e.target.value as CompanyContact["type"] })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none">
                  <option value="accountant">Contador</option>
                  <option value="insurance">Seguro</option>
                  <option value="bank">Banco</option>
                  <option value="other">Outro</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Nome</label>
                <input value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Empresa</label>
                <input value={contactForm.company} onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Telefone</label>
                  <input value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Email</label>
                  <input value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Notas</label>
                <textarea value={contactForm.notes} onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })} rows={2} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowContactModal(false)} className="flex-1 border border-border rounded-xl py-3 text-text-secondary hover:bg-card transition-colors">Cancelar</button>
              <button onClick={handleSaveContact} disabled={savingContact} className="flex-1 bg-gradient-to-r from-accent to-legendary text-bg font-bold rounded-xl py-3 hover:opacity-90 transition-opacity disabled:opacity-50">
                {savingContact ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
