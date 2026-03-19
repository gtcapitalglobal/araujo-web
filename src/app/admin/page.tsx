"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  DollarSign, Briefcase, Users, Car, MessageSquare, Bell,
  Plus, ArrowRight, Clock, CheckCircle, AlertTriangle, StickyNote
} from "lucide-react";
import { getNextDueDate } from "@/lib/recurring";

interface DashboardData {
  monthIncome: number;
  monthExpenses: number;
  monthProfit: number;
  jobCount: number;
  clientCount: number;
  yearMiles: number;
  newQuotes: number;
  pendingReminders: number;
  todayJobs: { id: string; title: string; status: string }[];
  recentQuotes: { id: string; name: string; service: string | null; created_at: string }[];
  upcomingReminders: { id: string; title: string; due_date: string; is_done: boolean }[];
  recentMoney: { id: string; kind: string; category: string | null; amount: number; date: string }[];
  pinnedNotes: { id: string; title: string | null; content: string | null }[];
  upcomingExpenses: { id: string; category: string; description: string | null; amount: number; next_due: string; frequency: string; source: "recurring" | "money" }[];
}

export default function AdminDashboard() {
  const supabase = createClient();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [paidId, setPaidId] = useState<string | null>(null);

  const handlePayExpense = async (exp: DashboardData["upcomingExpenses"][0]) => {
    if (exp.source === "recurring") {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("money_entries").insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        kind: "expense",
        category: exp.category,
        subcategory: exp.description,
        amount: exp.amount,
        date: new Date().toISOString().split("T")[0],
        notes: `Despesa recorrente: ${exp.category}${exp.description ? " - " + exp.description : ""}`,
      });
      const nextDue = getNextDueDate(exp.next_due, exp.frequency);
      await supabase.from("recurring_expenses").update({ next_due: nextDue }).eq("id", exp.id);
    }
    // For money entries, just mark as paid visually
    setPaidId(exp.id);
    setTimeout(() => setPaidId(null), 2000);
    fetchData();
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Bom dia");
    else if (hour < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");
  }, []);

  const fetchData = useCallback(async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
    const nextMonth = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const today = now.toISOString().split("T")[0];

    const [
      clientsRes, jobsRes, incomeRes, expensesRes, mileageRes,
      quotesCountRes, remindersCountRes, todayJobsRes, recentQuotesRes,
      upcomingRemindersRes, recentMoneyRes, pinnedNotesRes, upcomingExpensesRes, upcomingMoneyRes
    ] = await Promise.all([
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase.from("jobs").select("id", { count: "exact", head: true }).neq("status", "cancelled"),
      supabase.from("money_entries").select("amount").eq("kind", "income").gte("date", monthStart).lt("date", nextMonth),
      supabase.from("money_entries").select("amount").eq("kind", "expense").gte("date", monthStart).lt("date", nextMonth),
      supabase.from("mileage_logs").select("miles").gte("date", `${year}-01-01`),
      supabase.from("quote_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("reminders").select("id", { count: "exact", head: true }).eq("is_done", false).lte("due_date", now.toISOString()),
      supabase.from("jobs").select("id, title, status").gte("start_date", today).lte("start_date", today).limit(5),
      supabase.from("quote_requests").select("id, name, service, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("reminders").select("id, title, due_date, is_done").eq("is_done", false).order("due_date").limit(5),
      supabase.from("money_entries").select("id, kind, category, amount, date").order("date", { ascending: false }).limit(5),
      supabase.from("notes").select("id, title, content").eq("pinned", true).limit(3),
      supabase.from("recurring_expenses").select("id, category, description, amount, next_due, frequency").eq("is_active", true).not("next_due", "is", null).lte("next_due", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]).order("next_due"),
      supabase.from("money_entries").select("id, category, notes, amount, date").eq("kind", "expense").gte("date", today).lte("date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]).order("date"),
    ]);

    const totalIncome = incomeRes.data?.reduce((s, e) => s + (e.amount || 0), 0) || 0;
    const totalExpenses = expensesRes.data?.reduce((s, e) => s + (e.amount || 0), 0) || 0;
    const totalMiles = mileageRes.data?.reduce((s, e) => s + (e.miles || 0), 0) || 0;

    setData({
      monthIncome: totalIncome,
      monthExpenses: totalExpenses,
      monthProfit: totalIncome - totalExpenses,
      jobCount: jobsRes.count || 0,
      clientCount: clientsRes.count || 0,
      yearMiles: totalMiles,
      newQuotes: quotesCountRes.count || 0,
      pendingReminders: remindersCountRes.count || 0,
      todayJobs: todayJobsRes.data || [],
      recentQuotes: recentQuotesRes.data || [],
      upcomingReminders: upcomingRemindersRes.data || [],
      recentMoney: recentMoneyRes.data || [],
      pinnedNotes: pinnedNotesRes.data || [],
      upcomingExpenses: [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(upcomingExpensesRes.data || []).map((e: any) => ({ id: e.id, category: e.category, description: e.description, amount: e.amount, next_due: e.next_due, frequency: e.frequency, source: "recurring" as const })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(upcomingMoneyRes.data || []).map((e: any) => ({ id: e.id, category: e.category || "Outro", description: e.notes || null, amount: e.amount, next_due: e.date, frequency: "unica", source: "money" as const })),
      ].sort((a, b) => a.next_due.localeCompare(b.next_due)),
    });
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="text-center py-20 text-text-muted">Carregando...</div>;
  if (!data) return null;

  const statusColors: Record<string, string> = {
    lead: "bg-text-muted/20 text-text-muted", estimated: "bg-warning/20 text-warning",
    scheduled: "bg-secondary/20 text-secondary", in_progress: "bg-primary/20 text-primary-light",
    completed: "bg-success/20 text-success", invoiced: "bg-accent/20 text-accent",
    paid: "bg-money-in/20 text-money-in", cancelled: "bg-error/20 text-error",
  };

  const quickActions = [
    { label: "Novo Cliente", href: "/admin/clients", icon: Users, color: "from-primary to-secondary" },
    { label: "Novo Job", href: "/admin/jobs", icon: Briefcase, color: "from-secondary to-primary" },
    { label: "Registrar Receita", href: "/admin/money", icon: DollarSign, color: "from-success to-success" },
    { label: "Registrar Despesa", href: "/admin/money", icon: DollarSign, color: "from-error to-error" },
    { label: "Registrar Milhas", href: "/admin/mileage", icon: Car, color: "from-accent to-legendary" },
    { label: "Nova Nota", href: "/admin/notes", icon: StickyNote, color: "from-epic to-primary" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-black text-accent">{greeting.toUpperCase()}, GUSTAVO!</h1>
        <p className="text-text-muted text-sm mt-1">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Alerts */}
      {(data.newQuotes > 0 || data.pendingReminders > 0) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {data.newQuotes > 0 && (
            <Link href="/admin/quotes" className="flex items-center gap-2 bg-secondary/10 border border-secondary/30 text-secondary px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-secondary/20 transition">
              <MessageSquare size={16} />
              {data.newQuotes} orcamento{data.newQuotes > 1 ? "s" : ""} novo{data.newQuotes > 1 ? "s" : ""}
              <ArrowRight size={14} />
            </Link>
          )}
          {data.pendingReminders > 0 && (
            <Link href="/admin/reminders" className="flex items-center gap-2 bg-warning/10 border border-warning/30 text-warning px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-warning/20 transition">
              <AlertTriangle size={16} />
              {data.pendingReminders} lembrete{data.pendingReminders > 1 ? "s" : ""} pendente{data.pendingReminders > 1 ? "s" : ""}
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      )}

      {/* Share Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => {
            const msg = `*Araujo Company LLC*\nPayment info:\n👉 https://www.araujocompany.com/pay`;
            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
          }}
          className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-bold py-3 px-4 rounded-2xl transition hover:scale-[1.01] active:scale-[0.99] text-sm"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          💰 Payment
        </button>
        <button
          onClick={() => {
            const msg = `Araujo Company LLC\nPayment info:\nhttps://www.araujocompany.com/pay`;
            window.open(`sms:?body=${encodeURIComponent(msg)}`, "_self");
          }}
          className="flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-3 px-4 rounded-2xl transition hover:scale-[1.01] active:scale-[0.99] text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          💰 SMS Pay
        </button>
        <button
          onClick={() => {
            const msg = `*Araujo Company LLC*\nCompany info:\n👉 https://www.araujocompany.com/info`;
            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
          }}
          className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-bold py-3 px-4 rounded-2xl transition hover:scale-[1.01] active:scale-[0.99] text-sm"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          🏢 Company
        </button>
        <button
          onClick={() => {
            const msg = `Araujo Company LLC\nCompany info:\nhttps://www.araujocompany.com/info`;
            window.open(`sms:?body=${encodeURIComponent(msg)}`, "_self");
          }}
          className="flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-3 px-4 rounded-2xl transition hover:scale-[1.01] active:scale-[0.99] text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          🏢 SMS Info
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
        {quickActions.map((a) => (
          <Link key={a.label} href={a.href} className="flex flex-col items-center gap-2 bg-surface border border-border rounded-2xl p-4 hover:border-primary/30 hover:-translate-y-0.5 transition-all group">
            <div className={`w-10 h-10 bg-gradient-to-br ${a.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <a.icon size={18} className="text-white" />
            </div>
            <span className="text-text-muted text-[10px] font-semibold text-center leading-tight">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Receita do Mes", value: `$${data.monthIncome.toFixed(2)}`, icon: DollarSign, color: "text-money-in", bg: "bg-money-in/10", border: "border-money-in/30" },
          { label: "Despesas do Mes", value: `$${data.monthExpenses.toFixed(2)}`, icon: DollarSign, color: "text-money-out", bg: "bg-money-out/10", border: "border-money-out/30" },
          { label: "Lucro do Mes", value: `$${data.monthProfit.toFixed(2)}`, icon: DollarSign, color: "text-profit", bg: "bg-profit/10", border: "border-profit/30" },
          { label: "Jobs Ativos", value: data.jobCount.toString(), icon: Briefcase, color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/30" },
          { label: "Clientes", value: data.clientCount.toString(), icon: Users, color: "text-primary-light", bg: "bg-primary/10", border: "border-primary/30" },
          { label: "Milhas (Ano)", value: data.yearMiles.toFixed(0), icon: Car, color: "text-accent", bg: "bg-accent/10", border: "border-accent/30" },
        ].map((c) => (
          <div key={c.label} className={`${c.bg} border ${c.border} rounded-2xl p-5`}>
            <div className="flex items-center gap-3 mb-2">
              <c.icon size={18} className={c.color} />
              <span className="text-text-muted text-xs font-medium">{c.label}</span>
            </div>
            <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Today's Jobs */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-display)] text-sm font-bold text-secondary tracking-wider">JOBS DE HOJE</h2>
            <Link href="/admin/jobs" className="text-text-muted text-xs hover:text-secondary transition">Ver todos →</Link>
          </div>
          {data.todayJobs.length > 0 ? (
            <div className="space-y-3">
              {data.todayJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between bg-card rounded-xl p-3">
                  <div>
                    <p className="text-sm font-semibold text-text">{job.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[job.status] || ""}`}>{job.status}</span>
                  </div>
                  <Clock size={14} className="text-text-muted" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm py-4 text-center">Nenhum job agendado para hoje</p>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-display)] text-sm font-bold text-secondary tracking-wider">LEMBRETES</h2>
            <Link href="/admin/reminders" className="text-text-muted text-xs hover:text-secondary transition">Ver todos →</Link>
          </div>
          {data.upcomingReminders.length > 0 ? (
            <div className="space-y-3">
              {data.upcomingReminders.map((r) => {
                const isOverdue = new Date(r.due_date) < new Date();
                return (
                  <div key={r.id} className={`flex items-center justify-between bg-card rounded-xl p-3 ${isOverdue ? "border border-warning/30" : ""}`}>
                    <div className="flex items-center gap-3">
                      {isOverdue ? <AlertTriangle size={14} className="text-warning" /> : <Bell size={14} className="text-text-muted" />}
                      <div>
                        <p className="text-sm font-semibold text-text">{r.title}</p>
                        <p className={`text-xs ${isOverdue ? "text-warning" : "text-text-muted"}`}>
                          {new Date(r.due_date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <CheckCircle size={24} className="text-success mx-auto mb-2" />
              <p className="text-text-muted text-sm">Tudo em dia!</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Expenses */}
      {data.upcomingExpenses.length > 0 && (
        <div className="bg-error/5 border border-error/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-display)] text-sm font-bold text-error tracking-wider flex items-center gap-2">
              <AlertTriangle size={16} />
              DESPESAS PROXIMAS (7 DIAS)
            </h2>
            <Link href="/admin/recurring" className="text-text-muted text-xs hover:text-error transition">Ver todas →</Link>
          </div>
          <div className="space-y-3">
            {data.upcomingExpenses.map((exp) => {
              const dueDate = new Date(exp.next_due);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const isOverdue = diffDays < 0;
              const isToday = diffDays === 0;
              return (
                <div key={exp.id} className={`flex items-center justify-between bg-card rounded-xl p-3 ${isOverdue ? "border border-error/40" : isToday ? "border border-warning/40" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isOverdue ? "bg-error/20 text-error" : isToday ? "bg-warning/20 text-warning" : "bg-accent/20 text-accent"}`}>
                      {isOverdue ? "!" : isToday ? "⚡" : `${diffDays}d`}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">{exp.category}{exp.description ? ` - ${exp.description}` : ""}</p>
                      <p className={`text-xs ${isOverdue ? "text-error" : "text-text-muted"}`}>
                        {isOverdue ? `Atrasada ${Math.abs(diffDays)} dia${Math.abs(diffDays) > 1 ? "s" : ""}` : isToday ? "Vence hoje!" : `Vence em ${diffDays} dia${diffDays > 1 ? "s" : ""}`}
                        {" · "}{exp.frequency}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-error font-bold text-sm">${exp.amount.toFixed(2)}</span>
                    <button
                      onClick={() => handlePayExpense(exp)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${paidId === exp.id ? "bg-success/20 text-success" : "bg-accent/20 text-accent hover:bg-accent/30"}`}
                    >
                      {paidId === exp.id ? "✓" : "Pagar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Quotes */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-display)] text-sm font-bold text-secondary tracking-wider">ORCAMENTOS RECENTES</h2>
            <Link href="/admin/quotes" className="text-text-muted text-xs hover:text-secondary transition">Ver todos →</Link>
          </div>
          {data.recentQuotes.length > 0 ? (
            <div className="space-y-3">
              {data.recentQuotes.map((q) => (
                <div key={q.id} className="flex items-center justify-between bg-card rounded-xl p-3">
                  <div>
                    <p className="text-sm font-semibold text-text">{q.name}</p>
                    <p className="text-xs text-text-muted">{q.service || "Sem servico"}</p>
                  </div>
                  <span className="text-xs text-text-muted">{new Date(q.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm py-4 text-center">Nenhum orcamento ainda</p>
          )}
        </div>

        {/* Recent Money */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-display)] text-sm font-bold text-secondary tracking-wider">TRANSACOES RECENTES</h2>
            <Link href="/admin/money" className="text-text-muted text-xs hover:text-secondary transition">Ver todos →</Link>
          </div>
          {data.recentMoney.length > 0 ? (
            <div className="space-y-3">
              {data.recentMoney.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between bg-card rounded-xl p-3">
                  <div>
                    <p className="text-sm font-semibold text-text">{entry.category || "Sem categoria"}</p>
                    <span className="text-xs text-text-muted">{entry.date}</span>
                  </div>
                  <span className={`font-bold text-sm ${entry.kind === "income" ? "text-money-in" : "text-money-out"}`}>
                    {entry.kind === "income" ? "+" : "-"}${entry.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm py-4 text-center">Nenhuma transacao ainda</p>
          )}
        </div>
      </div>

      {/* Pinned Notes */}
      {data.pinnedNotes.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-display)] text-sm font-bold text-secondary tracking-wider">NOTAS FIXADAS</h2>
            <Link href="/admin/notes" className="text-text-muted text-xs hover:text-secondary transition">Ver todas →</Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {data.pinnedNotes.map((note) => (
              <div key={note.id} className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                {note.title && <p className="text-sm font-bold text-accent mb-1">{note.title}</p>}
                <p className="text-text-secondary text-xs line-clamp-3">{note.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
