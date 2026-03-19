"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CompanyContact } from "@/lib/types";
import { Plus, Pencil, Trash2, X, Phone, Mail, Save, Share2 } from "lucide-react";

const contactTypeLabels: Record<string, string> = { accountant: "Contador", insurance: "Seguro", bank: "Banco", other: "Outro" };
const contactTypeColors: Record<string, string> = { accountant: "bg-accent/20 text-accent", insurance: "bg-secondary/20 text-secondary", bank: "bg-success/20 text-success", other: "bg-text-muted/20 text-text-muted" };
const emptyContact = { type: "other" as CompanyContact["type"], name: "", company: "", phone: "", email: "", notes: "" };

const inputClass = "w-full bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none";
const labelClass = "text-xs text-text-muted mb-1 block";

interface InfoForm {
  legal_name: string; ein: string; duns_number: string;
  phone: string; email: string; website: string;
  address_line1: string; address_line2: string; city: string; state: string; zip: string;
  bank_name: string; account_number: string; routing_ach: string; routing_wire: string; bank_branch: string; zelle: string; tag: string; qr_code_url: string;
  member_name: string; member_role: string; member_percent: string; member_email: string; member_phone: string; member_address: string;
  notes: string;
}

const emptyForm: InfoForm = {
  legal_name: "", ein: "", duns_number: "",
  phone: "", email: "", website: "",
  address_line1: "", address_line2: "", city: "", state: "", zip: "",
  bank_name: "", account_number: "", routing_ach: "", routing_wire: "", bank_branch: "", zelle: "", tag: "", qr_code_url: "",
  member_name: "", member_role: "", member_percent: "", member_email: "", member_phone: "", member_address: "",
  notes: "",
};

export default function CompanyPage() {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [info, setInfo] = useState<any>(null);
  const [contacts, setContacts] = useState<CompanyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingInfo, setSavingInfo] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<InfoForm>(emptyForm);

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
      const d = infoRes.data;
      setForm({
        legal_name: d.legal_name || "", ein: d.ein || "", duns_number: d.duns_number || "",
        phone: d.phone || "", email: d.email || "", website: d.website || "",
        address_line1: d.address_line1 || "", address_line2: d.address_line2 || "", city: d.city || "", state: d.state || "", zip: d.zip || "",
        bank_name: d.bank_name || "", account_number: d.account_number || "", routing_ach: d.routing_ach || "", routing_wire: d.routing_wire || "", bank_branch: d.bank_branch || "", zelle: d.zelle || "", tag: d.tag || "", qr_code_url: d.qr_code_url || "",
        member_name: d.member_name || "", member_role: d.member_role || "", member_percent: d.member_percent || "", member_email: d.member_email || "", member_phone: d.member_phone || "", member_address: d.member_address || "",
        notes: d.notes || "",
      });
    }
    setContacts(contactsRes.data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const update = (field: keyof InfoForm, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    setSaved(false);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("Voce precisa estar logado"); setSavingInfo(false); return; }

    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v.trim() || null])
    );

    if (info) {
      await supabase.from("company_info").delete().eq("id", info.id);
    }
    const { error } = await supabase.from("company_info").insert({ id: info?.id || crypto.randomUUID(), user_id: user.id, ...payload });
    if (error) { alert("Erro: " + error.message); console.error(error); }
    else { setSaved(true); setTimeout(() => setSaved(false), 3000); }

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
    const payload = { type: contactForm.type, name: contactForm.name || null, company: contactForm.company || null, phone: contactForm.phone || null, email: contactForm.email || null, notes: contactForm.notes || null };
    if (editingContact) {
      await supabase.from("company_contacts").delete().eq("id", editingContact.id);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.from("company_contacts").insert({ id: editingContact.id, user_id: user.id, ...payload });
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

      {/* REGISTRO */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-[family-name:var(--font-display)] text-sm font-bold text-secondary tracking-wider mb-6">📋 REGISTRO</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className={labelClass}>Razao Social</label><input value={form.legal_name} onChange={(e) => update("legal_name", e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>EIN (Tax ID)</label><input value={form.ein} onChange={(e) => update("ein", e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>DUNS Number</label><input value={form.duns_number} onChange={(e) => update("duns_number", e.target.value)} className={inputClass} /></div>
        </div>
      </div>

      {/* ENDERECO & CONTATO */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-[family-name:var(--font-display)] text-sm font-bold text-secondary tracking-wider mb-6">📍 ENDERECO & CONTATO</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className={labelClass}>Telefone</label><input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Email</label><input value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Horario de Funcionamento</label><input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="Mon - Sat: 7:00 AM - 6:00 PM" className={inputClass} /></div>
          </div>
          <div><label className={labelClass}>Endereco Comercial</label><input value={form.address_line1} onChange={(e) => update("address_line1", e.target.value)} placeholder="8060 Adair Ln, Apt 4314, Sandy Springs, GA 30350" className={inputClass} /></div>
        </div>
      </div>

      {/* FINANCEIRO */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-[family-name:var(--font-display)] text-sm font-bold text-secondary tracking-wider mb-6">🏦 FINANCEIRO</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Banco</label><input value={form.bank_name} onChange={(e) => update("bank_name", e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Account Number</label><input value={form.account_number} onChange={(e) => update("account_number", e.target.value)} className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Routing ACH</label><input value={form.routing_ach} onChange={(e) => update("routing_ach", e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Routing Wire</label><input value={form.routing_wire} onChange={(e) => update("routing_wire", e.target.value)} className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className={labelClass}>Branch</label><input value={form.bank_branch} onChange={(e) => update("bank_branch", e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Zelle</label><input value={form.zelle} onChange={(e) => update("zelle", e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Tag (CashApp, Venmo, etc.)</label><input value={form.tag} onChange={(e) => update("tag", e.target.value)} placeholder="$araujocompany" className={inputClass} /></div>
          </div>
          {/* QR Code Upload */}
          <div>
            <label className={labelClass}>QR Code para Pagamento</label>
            {form.qr_code_url ? (
              <div className="mt-2 flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.qr_code_url} alt="QR Code" className="w-36 h-36 rounded-xl border border-border bg-white p-2 object-contain" />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      const msg = `*${form.legal_name || "Araujo Company LLC"}*\n💰 Zelle: ${form.zelle || ""}\n🏷️ Tag: ${form.tag || ""}\n\nQR Code: ${form.qr_code_url}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
                    }}
                    className="flex items-center gap-1 text-xs bg-[#25D366] text-white px-3 py-2 rounded-lg hover:bg-[#1da851] transition"
                  >
                    <Share2 size={12} /> Enviar QR via WhatsApp
                  </button>
                  <button
                    onClick={() => window.open(form.qr_code_url, "_blank")}
                    className="text-xs text-secondary hover:underline text-left"
                  >Ver imagem completa</button>
                  <label className="text-xs text-text-muted hover:text-error cursor-pointer">
                    Trocar imagem
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const ext = file.name.split(".").pop() || "png";
                        const path = `company/qr-code-${Date.now()}.${ext}`;
                        const { error } = await supabase.storage.from("documents").upload(path, file, { contentType: file.type, upsert: true });
                        if (error) { alert("Erro no upload: " + error.message); return; }
                        const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
                        update("qr_code_url", urlData.publicUrl);
                      }}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="mt-2 inline-flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 cursor-pointer hover:border-primary/50 transition">
                <span className="text-text-muted text-sm">📷 Enviar QR Code</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const ext = file.name.split(".").pop() || "png";
                    const path = `company/qr-code-${Date.now()}.${ext}`;
                    const { error } = await supabase.storage.from("documents").upload(path, file, { contentType: file.type, upsert: true });
                    if (error) { alert("Erro no upload: " + error.message); return; }
                    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
                    update("qr_code_url", urlData.publicUrl);
                  }}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* SOCIOS & MEMBROS */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-[family-name:var(--font-display)] text-sm font-bold text-secondary tracking-wider mb-6">🤝 SOCIOS & MEMBROS</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className={labelClass}>Nome Completo</label><input value={form.member_name} onChange={(e) => update("member_name", e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Cargo</label><input value={form.member_role} onChange={(e) => update("member_role", e.target.value)} placeholder="Member" className={inputClass} /></div>
            <div><label className={labelClass}>Participacao (%)</label><input value={form.member_percent} onChange={(e) => update("member_percent", e.target.value)} placeholder="100%" className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Email do Membro</label><input value={form.member_email} onChange={(e) => update("member_email", e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Telefone do Membro</label><input value={form.member_phone} onChange={(e) => update("member_phone", e.target.value)} className={inputClass} /></div>
          </div>
          <div><label className={labelClass}>Endereco do Membro</label><input value={form.member_address} onChange={(e) => update("member_address", e.target.value)} className={inputClass} /></div>
        </div>
      </div>

      {/* NOTAS */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-[family-name:var(--font-display)] text-sm font-bold text-secondary tracking-wider mb-6">📝 NOTAS</h2>
        <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} className={`${inputClass} resize-none`} />
      </div>

      {/* Save Button + WhatsApp Share */}
      <div className="flex items-center gap-4 mb-10 flex-wrap">
        <button onClick={handleSaveInfo} disabled={savingInfo} className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
          <Save size={18} /> {savingInfo ? "Salvando..." : "Salvar Dados"}
        </button>
        <button
          onClick={() => {
            const lines = [
              `*${form.legal_name || "Araujo Company LLC"}*`,
              form.ein ? `EIN: ${form.ein}` : "",
              form.phone ? `📱 ${form.phone}` : "",
              form.email ? `📧 ${form.email}` : "",
              form.address_line1 ? `📍 ${form.address_line1}` : "",
              form.website ? `🕐 ${form.website}` : "",
              form.bank_name ? `🏦 ${form.bank_name}` : "",
              form.zelle ? `💰 Zelle: ${form.zelle}` : "",
              "",
              "araujocompany.com",
            ].filter(Boolean).join("\n");
            window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, "_blank");
          }}
          className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-bold px-6 py-3 rounded-xl transition"
        >
          <Share2 size={18} /> Enviar via WhatsApp
        </button>
        {saved && <span className="text-success text-sm font-semibold">Salvo com sucesso!</span>}
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
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${contactTypeColors[c.type] || ""}`}>{contactTypeLabels[c.type] || c.type}</span>
                    <span className="font-bold text-text text-sm">{c.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 text-xs text-text-secondary">
                    {c.company && <span>{c.company}</span>}
                    {c.phone && <span className="flex items-center gap-1"><Phone size={11} /> {c.phone}</span>}
                    {c.email && <span className="flex items-center gap-1"><Mail size={11} /> {c.email}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEditContact(c)} className="p-2 rounded-lg hover:bg-surface text-text-secondary hover:text-secondary transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => handleDeleteContact(c.id)} className="p-2 rounded-lg hover:bg-error/10 text-text-secondary hover:text-error transition-colors"><Trash2 size={14} /></button>
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
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-accent">{editingContact ? "Editar Contato" : "Novo Contato"}</h2>
              <button onClick={() => setShowContactModal(false)} className="p-1 hover:bg-card rounded-lg"><X size={20} className="text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div><label className={labelClass}>Tipo</label>
                <select value={contactForm.type} onChange={(e) => setContactForm({ ...contactForm, type: e.target.value as CompanyContact["type"] })} className={inputClass}>
                  <option value="accountant">Contador</option><option value="insurance">Seguro</option><option value="bank">Banco</option><option value="other">Outro</option>
                </select>
              </div>
              <div><label className={labelClass}>Nome</label><input value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} className={inputClass} /></div>
              <div><label className={labelClass}>Empresa</label><input value={contactForm.company} onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })} className={inputClass} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Telefone</label><input value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Email</label><input value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} className={inputClass} /></div>
              </div>
              <div><label className={labelClass}>Notas</label><textarea value={contactForm.notes} onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })} rows={2} className={`${inputClass} resize-none`} /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowContactModal(false)} className="flex-1 border border-border rounded-xl py-3 text-text-secondary hover:bg-card transition-colors">Cancelar</button>
              <button onClick={handleSaveContact} disabled={savingContact} className="flex-1 bg-gradient-to-r from-accent to-legendary text-bg font-bold rounded-xl py-3 hover:opacity-90 transition-opacity disabled:opacity-50">{savingContact ? "Salvando..." : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
