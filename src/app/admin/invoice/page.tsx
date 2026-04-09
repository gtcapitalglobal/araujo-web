"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { USIG_PRICE_SHEET, lookupByCode, searchItems, type PriceItem } from "@/lib/usigPriceSheet";
import { FileText, Plus, Trash2, Save, Download, Search, Tag, ArrowLeft, X } from "lucide-react";

interface InvoiceLine {
  id: string;
  date: string;
  poAuth: string;
  name: string;
  description: string;
  qty: string;
  unitPrice: string;
}

interface SavedInvoice {
  id: string;
  week_of: string;
  bill_to: string;
  total: number;
  created_at: string;
}

const emptyLine = (): InvoiceLine => ({
  id: crypto.randomUUID(),
  date: "",
  poAuth: "",
  name: "",
  description: "",
  qty: "",
  unitPrice: "",
});

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function InvoicePage() {
  const supabase = createClient();
  const [mode, setMode] = useState<"list" | "edit">("list");
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Header
  const [companyName, setCompanyName] = useState("ARAUJO COMPANY LLC");
  const [installerName, setInstallerName] = useState("");
  const [cityStZip, setCityStZip] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [weekOf, setWeekOf] = useState("");
  const [billTo, setBillTo] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Lines
  const [lines, setLines] = useState<InvoiceLine[]>([emptyLine(), emptyLine(), emptyLine()]);

  // Catalog modal
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogLineId, setCatalogLineId] = useState<string | null>(null);

  const calcSub = (l: InvoiceLine) => (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0);
  const total = lines.reduce((s, l) => s + calcSub(l), 0);

  // ===== Load list =====
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("invoices")
      .select("id, week_of, bill_to, total, created_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    setSavedInvoices(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  // ===== Load one =====
  const loadInvoice = async (id: string) => {
    const { data: inv } = await supabase.from("invoices").select("*").eq("id", id).single();
    if (!inv) return;
    setInvoiceId(inv.id);
    setCompanyName(inv.company_name);
    setInstallerName(inv.installer_name);
    setCityStZip(inv.city_st_zip);
    setInvoiceNumber(inv.invoice_number);
    setWeekOf(inv.week_of);
    setBillTo(inv.bill_to);
    setPhone(inv.phone);
    setEmail(inv.email);

    const { data: rows } = await supabase
      .from("invoice_lines")
      .select("*")
      .eq("invoice_id", id)
      .order("line_order");

    setLines(
      rows && rows.length > 0
        ? rows.map((r: any) => ({
            id: r.id,
            date: r.date || "",
            poAuth: r.po_auth || "",
            name: r.name || "",
            description: r.description || "",
            qty: r.qty ? String(r.qty) : "",
            unitPrice: r.unit_price ? String(r.unit_price) : "",
          }))
        : [emptyLine(), emptyLine(), emptyLine()]
    );
    setMode("edit");
  };

  // ===== New =====
  const newInvoice = () => {
    setInvoiceId(null);
    setCompanyName("ARAUJO COMPANY LLC");
    setInstallerName("");
    setCityStZip("");
    setInvoiceNumber("");
    setWeekOf("");
    setBillTo("");
    setPhone("");
    setEmail("");
    setLines([emptyLine(), emptyLine(), emptyLine()]);
    setMode("edit");
  };

  // ===== Save =====
  const saveInvoice = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      company_name: companyName,
      installer_name: installerName,
      city_st_zip: cityStZip,
      invoice_number: invoiceNumber,
      week_of: weekOf,
      bill_to: billTo,
      phone,
      email,
      total,
      updated_at: new Date().toISOString(),
    };

    let id = invoiceId;

    if (id) {
      await supabase.from("invoices").update(payload).eq("id", id);
      await supabase.from("invoice_lines").delete().eq("invoice_id", id);
    } else {
      const { data } = await supabase.from("invoices").insert({ ...payload, id: crypto.randomUUID() }).select("id").single();
      id = data?.id || null;
    }

    if (id) {
      const lineRows = lines.map((l, i) => ({
        id: crypto.randomUUID(),
        invoice_id: id,
        line_order: i,
        date: l.date,
        po_auth: l.poAuth,
        name: l.name,
        description: l.description,
        qty: parseFloat(l.qty) || 0,
        unit_price: parseFloat(l.unitPrice) || 0,
        subtotal: calcSub(l),
      }));
      await supabase.from("invoice_lines").insert(lineRows);
      setInvoiceId(id);
    }

    await fetchInvoices();
    setSaving(false);
    alert("Invoice salva!");
  };

  // ===== Delete =====
  const deleteInvoice = async (id: string) => {
    if (!confirm("Deletar essa invoice?")) return;
    await supabase.from("invoice_lines").delete().eq("invoice_id", id);
    await supabase.from("invoices").delete().eq("id", id);
    await fetchInvoices();
    if (invoiceId === id) setMode("list");
  };

  // ===== Line helpers =====
  const updateLine = (id: string, field: keyof InvoiceLine, value: string) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const handleDescChange = (lineId: string, value: string) => {
    updateLine(lineId, "description", value);
    const m = value.match(/^(\d{4})/);
    if (m) {
      const item = lookupByCode(m[1]);
      if (item) {
        setLines((prev) =>
          prev.map((l) =>
            l.id === lineId ? { ...l, description: `${item.code} ${item.description}`, unitPrice: String(item.price) } : l
          )
        );
      }
    }
  };

  const openCatalog = (lineId: string) => {
    setCatalogLineId(lineId);
    setCatalogSearch("");
    setShowCatalog(true);
  };

  const selectItem = (item: PriceItem) => {
    if (catalogLineId) {
      setLines((prev) =>
        prev.map((l) =>
          l.id === catalogLineId ? { ...l, description: `${item.code} ${item.description}`, unitPrice: String(item.price) } : l
        )
      );
    }
    setShowCatalog(false);
  };

  // ===== Export PDF =====
  const exportPDF = () => {
    const linesHtml = lines
      .filter((l) => l.qty || l.unitPrice || l.description)
      .map((l) => `<tr><td>${l.date}</td><td>${l.poAuth}</td><td>${l.name}</td><td>${l.description}</td><td style="text-align:center">${l.qty}</td><td style="text-align:right">$${l.unitPrice || "0.00"}</td><td style="text-align:right">$${fmt(calcSub(l))}</td></tr>`)
      .join("");

    const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Invoice - ${companyName}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#1a1a1a}h1{text-align:center;font-size:28px;margin-bottom:4px;letter-spacing:2px}.hg{display:flex;justify-content:space-between;margin-bottom:16px;border:1px solid #333;padding:12px}.hl,.hr{width:48%}.row{margin-bottom:4px;font-size:13px}.row b{display:inline-block;width:110px}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#222;color:#fff;padding:8px 6px;font-size:12px;text-align:left}td{border:1px solid #ccc;padding:6px;font-size:12px}tr:nth-child(even){background:#f5f5f5}.tr{background:#222!important;color:#FFD700;font-weight:bold;font-size:16px}.tr td{border:none;padding:10px 6px}</style></head><body><h1>INVOICE</h1><div class="hg"><div class="hl"><div class="row"><b>Company:</b> ${companyName}</div><div class="row"><b>Installer:</b> ${installerName}</div><div class="row"><b>City, ST ZIP:</b> ${cityStZip}</div><div class="row"><b>Invoice #:</b> ${invoiceNumber}</div><div class="row"><b>Week of:</b> ${weekOf}</div></div><div class="hr"><div class="row"><b>Bill To:</b> ${billTo}</div><div class="row"><b>Phone:</b> ${phone}</div><div class="row"><b>Email:</b> ${email}</div></div></div><table><thead><tr><th>Date</th><th>PO/Auth #</th><th>Name</th><th>Description</th><th style="text-align:center">QTY</th><th style="text-align:right">Unit Price</th><th style="text-align:right">SubTotal</th></tr></thead><tbody>${linesHtml}<tr class="tr"><td colspan="6" style="text-align:right;padding-right:12px">Total Invoice:</td><td style="text-align:right;font-size:18px">$${fmt(total)}</td></tr></tbody></table></body></html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "_blank");
    if (printWindow) {
      printWindow.addEventListener("load", () => {
        printWindow.print();
      });
    }
  };

  const filtered = catalogSearch ? searchItems(catalogSearch) : USIG_PRICE_SHEET;

  // ===== LIST MODE =====
  if (mode === "list") {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="text-accent" size={28} />
            <h1 className="text-2xl font-black gradient-text-gold tracking-wider">INVOICES</h1>
          </div>
          <button onClick={newInvoice} className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm">
            <Plus size={18} /> NOVA INVOICE
          </button>
        </div>

        {loading ? (
          <p className="text-text-muted text-center py-12">Carregando...</p>
        ) : savedInvoices.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <FileText className="mx-auto mb-3 text-text-muted" size={48} />
            <p className="text-text-secondary font-bold text-lg">Nenhuma invoice salva</p>
            <p className="text-text-muted mt-1">Crie sua primeira invoice semanal</p>
          </div>
        ) : (
          <div className="space-y-2">
            {savedInvoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => loadInvoice(inv.id)}
                className="glass rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-primary/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-primary" size={22} />
                  <div>
                    <p className="text-text font-bold">{inv.week_of ? `Semana ${inv.week_of}` : "Invoice"}</p>
                    <p className="text-text-muted text-xs">{inv.bill_to || "Sem destinatario"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-accent font-black text-lg">${fmt(inv.total)}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteInvoice(inv.id); }}
                    className="text-text-muted hover:text-error transition p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ===== EDIT MODE =====
  return (
    <div>
      {/* Catalog Modal */}
      {showCatalog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-bg border border-primary/20 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-primary/10">
              <h2 className="text-accent font-black tracking-wider">USIG PRICE SHEET</h2>
              <button onClick={() => setShowCatalog(false)} className="text-text-muted hover:text-text"><X size={22} /></button>
            </div>
            <div className="p-3 border-b border-primary/10">
              <div className="flex items-center gap-2 glass rounded-xl px-3">
                <Search size={16} className="text-text-muted" />
                <input
                  className="bg-transparent text-text w-full py-2.5 text-sm outline-none placeholder:text-text-muted"
                  placeholder="Buscar codigo ou descricao..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-3 space-y-1">
              {filtered.map((item) => (
                <button
                  key={item.code + item.category}
                  onClick={() => selectItem(item)}
                  className="w-full flex items-center justify-between glass rounded-lg p-3 hover:border-primary/40 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-primary font-black text-sm w-10">{item.code}</span>
                    <div>
                      <p className="text-text text-sm font-medium">{item.description}</p>
                      <p className="text-text-muted text-[10px]">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-accent font-black">${item.price.toFixed(2)}</span>
                    <span className="text-text-muted text-[10px] ml-1">/{item.unit}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => { setMode("list"); fetchInvoices(); }} className="text-text-muted hover:text-text transition">
          <ArrowLeft size={22} />
        </button>
        <FileText className="text-accent" size={28} />
        <h1 className="text-2xl font-black gradient-text-gold tracking-wider">INVOICE</h1>
      </div>

      {/* Company Info */}
      <div className="glass rounded-2xl p-5 mb-4">
        <p className="text-secondary text-xs font-bold tracking-widest mb-3">DADOS DA EMPRESA</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Company" value={companyName} onChange={setCompanyName} />
          <Field label="Installer" value={installerName} onChange={setInstallerName} placeholder="Nome do instalador" />
          <Field label="City, ST ZIP" value={cityStZip} onChange={setCityStZip} placeholder="Sandy Springs, GA 30328" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Invoice #" value={invoiceNumber} onChange={setInvoiceNumber} placeholder="#001" />
            <Field label="Week of" value={weekOf} onChange={setWeekOf} placeholder="03/19/2026" />
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="glass rounded-2xl p-5 mb-4">
        <p className="text-secondary text-xs font-bold tracking-widest mb-3">COBRAR DE</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Bill To" value={billTo} onChange={setBillTo} placeholder="Nome / Empresa" />
          <Field label="Phone" value={phone} onChange={setPhone} placeholder="(404) 000-0000" />
          <Field label="Email" value={email} onChange={setEmail} placeholder="email@email.com" />
        </div>
      </div>

      {/* Line Items */}
      <div className="glass rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-secondary text-xs font-bold tracking-widest">ITENS</p>
          <button onClick={() => setLines((p) => [...p, emptyLine()])} className="flex items-center gap-1 text-accent text-sm font-bold hover:text-accent/80 transition">
            <Plus size={18} /> Linha
          </button>
        </div>

        <div className="space-y-3">
          {lines.map((line, i) => (
            <div key={line.id} className="bg-surface/60 border border-primary/10 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-primary text-xs font-black">#{i + 1}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => openCatalog(line.id)} className="flex items-center gap-1 text-accent bg-accent/10 px-2 py-0.5 rounded text-[11px] font-bold hover:bg-accent/20 transition">
                    <Tag size={12} /> USIG
                  </button>
                  {lines.length > 1 && (
                    <button onClick={() => setLines((p) => p.filter((l) => l.id !== line.id))} className="text-text-muted hover:text-error transition">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Mini label="Date" value={line.date} onChange={(v) => updateLine(line.id, "date", v)} placeholder="3/19/26" />
                <Mini label="PO/Auth #" value={line.poAuth} onChange={(v) => updateLine(line.id, "poAuth", v)} placeholder="64148784" />
                <Mini label="Name" value={line.name} onChange={(v) => updateLine(line.id, "name", v)} placeholder="Nome do cliente" />
                <Mini label="Description (codigo USIG)" value={line.description} onChange={(v) => handleDescChange(line.id, v)} placeholder="0238 BSC Vinyl" />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Mini label="QTY" value={line.qty} onChange={(v) => updateLine(line.id, "qty", v)} placeholder="0" type="number" />
                <Mini label="Unit Price $" value={line.unitPrice} onChange={(v) => updateLine(line.id, "unitPrice", v)} placeholder="0.00" type="number" />
                <div>
                  <p className="text-text-muted text-[10px] font-bold uppercase tracking-wide mb-0.5">SubTotal</p>
                  <p className="text-secondary font-bold text-lg">${fmt(calcSub(line))}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="glass rounded-2xl p-5 mb-4 flex items-center justify-between border-2 border-accent/30">
        <span className="text-accent font-black text-lg tracking-widest">TOTAL INVOICE</span>
        <span className="text-accent font-black text-3xl">${fmt(total)}</span>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button onClick={saveInvoice} disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm">
          <Save size={18} /> {saving ? "SALVANDO..." : "SALVAR"}
        </button>
        <button onClick={exportPDF} className="flex-1 btn-gold flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm">
          <Download size={18} /> EXPORTAR PDF
        </button>
      </div>
    </div>
  );
}

// ===== Field Components =====

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-text-muted text-[10px] font-bold uppercase tracking-wide">{label}</label>
      <input
        className="w-full bg-surface/80 border border-primary/10 rounded-lg px-3 py-2 text-text text-sm outline-none focus:border-primary/40 transition"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function Mini({ label, value, onChange, placeholder, type }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="text-text-muted text-[10px] font-bold uppercase tracking-wide">{label}</label>
      <input
        className="w-full bg-bg/60 border border-primary/10 rounded-lg px-2.5 py-1.5 text-text text-sm outline-none focus:border-primary/40 transition"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        step={type === "number" ? "any" : undefined}
      />
    </div>
  );
}
