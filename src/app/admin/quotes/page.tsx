"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, Phone, Mail, Trash2, ChevronDown, Briefcase } from "lucide-react";

interface QuoteRequest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  service: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  new: "bg-secondary/20 text-secondary",
  contacted: "bg-warning/20 text-warning",
  quoted: "bg-accent/20 text-accent",
  closed: "bg-success/20 text-success",
};

const statusLabels: Record<string, string> = {
  new: "Novo",
  contacted: "Contatado",
  quoted: "Orcamento Enviado",
  closed: "Fechado",
};

export default function QuotesPage() {
  const supabase = createClient();
  const router = useRouter();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [creatingJob, setCreatingJob] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("quote_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setQuotes(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  const updateStatus = async (id: string, newStatus: string) => {
    const quote = quotes.find((q) => q.id === id);
    if (quote?.status === newStatus) return;
    await supabase.from("quote_requests").update({ status: newStatus }).eq("id", id);
    fetchQuotes();
  };

  const deleteQuote = async (id: string) => {
    if (!confirm("Deletar este pedido?")) return;
    await supabase.from("quote_requests").delete().eq("id", id);
    fetchQuotes();
  };

  const handleCreateJob = async (q: QuoteRequest) => {
    setCreatingJob(q.id);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCreatingJob(null); return; }

    // Check if client with same name exists
    let clientId: string;
    const { data: existing } = await supabase
      .from("clients").select("id").eq("name", q.name).limit(1).single();

    if (existing) {
      clientId = existing.id;
    } else {
      clientId = crypto.randomUUID();
      await supabase.from("clients").insert({
        id: clientId, user_id: user.id, name: q.name,
        phone: q.phone || null, email: q.email || null,
      });
    }

    // Create job
    await supabase.from("jobs").insert({
      id: crypto.randomUUID(), user_id: user.id, client_id: clientId,
      title: q.service || `Job - ${q.name}`, service_type: q.service || null,
      status: "lead", notes: q.message || null,
    });

    // Mark quote as closed
    await supabase.from("quote_requests").update({ status: "closed" }).eq("id", q.id);
    setCreatingJob(null);
    router.push("/admin/jobs");
  };

  const newCount = quotes.filter((q) => q.status === "new").length;

  if (loading) return <div className="space-y-4 py-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-black section-title">PEDIDOS DE ORCAMENTO</h1>
          {newCount > 0 && (
            <span className="bg-secondary/20 text-secondary text-xs font-bold px-3 py-1 rounded-full">
              {newCount} novo{newCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {quotes.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center">
          <MessageSquare size={48} className="text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text mb-2">Nenhum pedido ainda</h3>
          <p className="text-text-muted text-sm">Os pedidos do formulario do site aparecerao aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <div key={q.id} className="bg-surface border border-border rounded-2xl overflow-hidden">
              <div
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-card/50 transition"
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${q.status === "new" ? "bg-secondary/20" : "bg-card"}`}>
                    <MessageSquare size={18} className={q.status === "new" ? "text-secondary" : "text-text-muted"} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text text-sm">{q.name}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[q.status] || ""}`}>
                        {statusLabels[q.status] || q.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                      {q.service && <span>{q.service}</span>}
                      <span>{new Date(q.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                </div>
                <ChevronDown size={18} className={`text-text-muted transition-transform ${expandedId === q.id ? "rotate-180" : ""}`} />
              </div>

              {expandedId === q.id && (
                <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-4">
                    {q.phone && (
                      <a href={`tel:${q.phone}`} className="flex items-center gap-2 text-sm text-secondary hover:underline">
                        <Phone size={14} /> {q.phone}
                      </a>
                    )}
                    {q.email && (
                      <a href={`mailto:${q.email}`} className="flex items-center gap-2 text-sm text-secondary hover:underline">
                        <Mail size={14} /> {q.email}
                      </a>
                    )}
                  </div>

                  {/* Message */}
                  {q.message && (
                    <div className="bg-card rounded-xl p-4">
                      <p className="text-xs text-text-muted mb-1">Mensagem:</p>
                      <p className="text-text text-sm whitespace-pre-wrap">{q.message}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {["new", "contacted", "quoted", "closed"].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(q.id, s)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                          q.status === s
                            ? "bg-primary text-white"
                            : "bg-card text-text-muted hover:text-text"
                        }`}
                      >
                        {statusLabels[s]}
                      </button>
                    ))}
                    <button
                      onClick={() => handleCreateJob(q)}
                      disabled={creatingJob === q.id}
                      className="ml-auto flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition disabled:opacity-50"
                    >
                      <Briefcase size={13} /> {creatingJob === q.id ? "Criando..." : "Criar Job"}
                    </button>
                    <button
                      onClick={() => deleteQuote(q.id)}
                      className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
