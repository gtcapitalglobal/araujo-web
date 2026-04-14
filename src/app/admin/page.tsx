"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  DollarSign, Briefcase, Users, Car, MessageSquare, Bell,
  ArrowRight, Clock, CheckCircle, AlertTriangle, StickyNote, Building2,
  TrendingUp, TrendingDown, MessageCircle, RefreshCw, Loader2
} from "lucide-react";
import { getNextDueDate } from "@/lib/recurring";

type Period = "month" | "lastMonth" | "year";

interface DashboardData {
  periodIncome: number;
  periodExpenses: number;
  periodProfit: number;
  prevIncome: number;
  prevExpenses: number;
  prevProfit: number;
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

// Calculate the start/end of a given period and the comparable previous period
function getPeriodRange(period: Period): { start: string; end: string; prevStart: string; prevEnd: string; label: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  if (period === "month") {
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 1);
    const prevStart = new Date(y, m - 1, 1);
    const prevEnd = new Date(y, m, 1);
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
      prevStart: prevStart.toISOString().split("T")[0],
      prevEnd: prevEnd.toISOString().split("T")[0],
      label: "Este Mes",
    };
  }
  if (period === "lastMonth") {
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);
    const prevStart = new Date(y, m - 2, 1);
    const prevEnd = new Date(y, m - 1, 1);
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
      prevStart: prevStart.toISOString().split("T")[0],
      prevEnd: prevEnd.toISOString().split("T")[0],
      label: "Mes Passado",
    };
  }
  // year
  const start = new Date(y, 0, 1);
  const end = new Date(y + 1, 0, 1);
  const prevStart = new Date(y - 1, 0, 1);
  const prevEnd = new Date(y, 0, 1);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
    prevStart: prevStart.toISOString().split("T")[0],
    prevEnd: prevEnd.toISOString().split("T")[0],
    label: "Este Ano",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CompanyData { legal_name?: string; phone?: string; email?: string; address_line1?: string; website?: string; naics_code?: string; sic_code?: string; tax_classification?: string; license_number?: string; license_expiration?: string; license_city?: string; ein?: string; duns_number?: string; bank_name?: string; account_number?: string; routing_ach?: string; routing_wire?: string; zelle?: string; }

export default function AdminDashboard() {
  const supabase = createClient();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [paidId, setPaidId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [company, setCompany] = useState<CompanyData>({});
  const [period, setPeriod] = useState<Period>("month");

  const handlePayExpense = async (exp: DashboardData["upcomingExpenses"][0]) => {
    if (exp.source !== "recurring") return;
    setPayingId(exp.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setPayingId(null); return; }
      const { error: insertErr } = await supabase.from("money_entries").insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        kind: "expense",
        category: exp.category,
        subcategory: exp.description,
        amount: exp.amount,
        date: new Date().toISOString().split("T")[0],
        notes: `Despesa recorrente: ${exp.category}${exp.description ? " - " + exp.description : ""}`,
      });
      if (insertErr) { setPayingId(null); return; }
      const nextDue = getNextDueDate(exp.next_due, exp.frequency);
      await supabase.from("recurring_expenses").update({ next_due: nextDue }).eq("id", exp.id);
      setPaidId(exp.id);
      setTimeout(() => setPaidId(null), 2000);
      fetchData();
    } finally {
      setPayingId(null);
    }
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
    const today = now.toISOString().split("T")[0];
    const range = getPeriodRange(period);

    const [
      clientsRes, jobsRes,
      incomeRes, expensesRes,
      prevIncomeRes, prevExpensesRes,
      mileageRes, quotesCountRes, remindersCountRes, todayJobsRes, recentQuotesRes,
      upcomingRemindersRes, recentMoneyRes, pinnedNotesRes, upcomingExpensesRes, upcomingMoneyRes,
      companyRes
    ] = await Promise.all([
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase.from("jobs").select("id", { count: "exact", head: true }).in("status", ["lead", "estimated", "scheduled", "in_progress"]),
      supabase.from("money_entries").select("amount").eq("kind", "income").gte("date", range.start).lt("date", range.end),
      supabase.from("money_entries").select("amount").eq("kind", "expense").gte("date", range.start).lt("date", range.end),
      supabase.from("money_entries").select("amount").eq("kind", "income").gte("date", range.prevStart).lt("date", range.prevEnd),
      supabase.from("money_entries").select("amount").eq("kind", "expense").gte("date", range.prevStart).lt("date", range.prevEnd),
      supabase.from("mileage_logs").select("miles").gte("date", `${year}-01-01`),
      supabase.from("quote_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("reminders").select("id", { count: "exact", head: true }).eq("is_done", false).lte("due_date", now.toISOString()),
      supabase.from("jobs").select("id, title, status").lte("start_date", today).or(`end_date.gte.${today},end_date.is.null`).in("status", ["lead", "estimated", "scheduled", "in_progress"]).limit(5),
      supabase.from("quote_requests").select("id, name, service, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("reminders").select("id, title, due_date, is_done").eq("is_done", false).order("due_date").limit(5),
      supabase.from("money_entries").select("id, kind, category, amount, date").order("date", { ascending: false }).limit(5),
      supabase.from("notes").select("id, title, content").eq("pinned", true).limit(3),
      supabase.from("recurring_expenses").select("id, category, description, amount, next_due, frequency").eq("is_active", true).not("next_due", "is", null).lte("next_due", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]).order("next_due"),
      supabase.from("money_entries").select("id, category, notes, amount, date").eq("kind", "expense").gte("date", today).lte("date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]).order("date"),
      supabase.from("company_info").select("*").limit(1).maybeSingle(),
    ]);

    const totalIncome = incomeRes.data?.reduce((s, e) => s + (e.amount || 0), 0) || 0;
    const totalExpenses = expensesRes.data?.reduce((s, e) => s + (e.amount || 0), 0) || 0;
    const prevIncome = prevIncomeRes.data?.reduce((s, e) => s + (e.amount || 0), 0) || 0;
    const prevExpenses = prevExpensesRes.data?.reduce((s, e) => s + (e.amount || 0), 0) || 0;
    const totalMiles = mileageRes.data?.reduce((s, e) => s + (e.miles || 0), 0) || 0;

    setData({
      periodIncome: totalIncome,
      periodExpenses: totalExpenses,
      periodProfit: totalIncome - totalExpenses,
      prevIncome,
      prevExpenses,
      prevProfit: prevIncome - prevExpenses,
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
    if (companyRes.data) setCompany(companyRes.data);

    setLoading(false);
  }, [supabase, period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Re-fetch when tab becomes visible (fixes stale data after midnight)
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") fetchData(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchData]);

  // Share button handlers
  const sharePaymentWhatsApp = () => {
    const msg = `*Araujo Company LLC*\nPayment info:\n👉 https://www.araujocompany.com/pay`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const sharePaymentSMS = () => {
    const msg = `Araujo Company LLC\nPayment info:\nhttps://www.araujocompany.com/pay`;
    window.open(`sms:?body=${encodeURIComponent(msg)}`, "_self");
  };

  const shareCompanyWhatsApp = () => {
    const c = company;
    const lines = [
      `*${c.legal_name || "Araujo Company LLC"}*`,
      c.phone ? `📱 ${c.phone}` : "",
      c.email ? `📧 ${c.email}` : "",
      c.address_line1 ? `📍 ${c.address_line1}` : "",
      c.website ? `🌐 ${c.website}` : "",
      "",
      c.naics_code ? `📋 NAICS: ${c.naics_code}` : "",
      c.sic_code ? `📋 SIC: ${c.sic_code}` : "",
      c.tax_classification ? `🏛️ ${c.tax_classification}` : "",
      c.license_number ? `📄 License #${c.license_number} — ${c.license_city || ""}${c.license_expiration ? ` (Exp: ${c.license_expiration})` : ""}` : "",
      c.ein ? `🔢 EIN: ${c.ein}` : "",
      c.duns_number ? `🔢 DUNS: ${c.duns_number}` : "",
      "",
      "🌐 araujocompany.com",
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, "_blank");
  };

  const shareCompanySMS = () => {
    const c = company;
    const lines = [
      c.legal_name || "Araujo Company LLC",
      c.phone ? `Phone: ${c.phone}` : "",
      c.email ? `Email: ${c.email}` : "",
      c.address_line1 || "",
      c.naics_code ? `NAICS: ${c.naics_code}` : "",
      c.license_number ? `License #${c.license_number}` : "",
      c.ein ? `EIN: ${c.ein}` : "",
      "araujocompany.com",
    ].filter(Boolean).join("\n");
    window.open(`sms:?body=${encodeURIComponent(lines)}`, "_self");
  };

  if (loading) return (
    <div className="space-y-6 py-4">
      <div className="skeleton h-10 w-72" />
      <div className="skeleton h-4 w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    </div>
  );
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
    { label: "Registrar Receita", href: "/admin/money?new=income", icon: DollarSign, color: "from-success to-success" },
    { label: "Registrar Despesa", href: "/admin/money?new=expense", icon: DollarSign, color: "from-error to-error" },
    { label: "Registrar Milhas", href: "/admin/mileage", icon: Car, color: "from-accent to-legendary" },
    { label: "Nova Nota", href: "/admin/notes", icon: StickyNote, color: "from-epic to-primary" },
  ];

  // Trend indicator helper
  const getTrend = (current: number, prev: number, inverse = false) => {
    if (prev === 0 && current === 0) return null;
    if (prev === 0) return { pct: 100, positive: !inverse };
    const pct = ((current - prev) / Math.abs(prev)) * 100;
    const up = pct > 0;
    // For expenses (inverse), going up is BAD
    return { pct, positive: inverse ? !up : up };
  };

  const periodLabel = getPeriodRange(period).label;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-black gradient-text-gold">{greeting.toUpperCase()}, GUSTAVO!</h1>
          <p className="text-text-muted text-sm mt-1">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <button onClick={() => { setLoading(true); fetchData(); }} className="p-2.5 rounded-xl bg-surface border border-border hover:border-primary/40 text-text-muted hover:text-primary transition-all" title="Atualizar">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
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
          onClick={sharePaymentWhatsApp}
          className="flex items-center justify-center gap-2 bg-success/15 border border-success/40 text-success hover:bg-success/25 font-bold py-3 px-4 rounded-2xl transition hover:scale-[1.01] active:scale-[0.99] text-sm"
        >
          <DollarSign size={16} />
          Payment WhatsApp
        </button>
        <button
          onClick={sharePaymentSMS}
          className="flex items-center justify-center gap-2 bg-primary/15 border border-primary/40 text-primary hover:bg-primary/25 font-bold py-3 px-4 rounded-2xl transition hover:scale-[1.01] active:scale-[0.99] text-sm"
        >
          <MessageCircle size={16} />
          Payment SMS
        </button>
        <button
          onClick={shareCompanyWhatsApp}
          className="flex items-center justify-center gap-2 bg-success/15 border border-success/40 text-success hover:bg-success/25 font-bold py-3 px-4 rounded-2xl transition hover:scale-[1.01] active:scale-[0.99] text-sm"
        >
          <Building2 size={16} />
          Company WhatsApp
        </button>
        <button
          onClick={shareCompanySMS}
          className="flex items-center justify-center gap-2 bg-primary/15 border border-primary/40 text-primary hover:bg-primary/25 font-bold py-3 px-4 rounded-2xl transition hover:scale-[1.01] active:scale-[0.99] text-sm"
        >
          <MessageSquare size={16} />
          Company SMS
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

      {/* Period Selector */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-text-muted text-xs font-semibold mr-1">Periodo:</span>
        {([
          { key: "month" as const, label: "Este Mes" },
          { key: "lastMonth" as const, label: "Mes Passado" },
          { key: "year" as const, label: "Este Ano" },
        ]).map((opt) => (
          <button
            key={opt.key}
            onClick={() => setPeriod(opt.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              period === opt.key
                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                : "bg-card border border-border text-text-muted hover:border-primary/40 hover:text-text"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: `Receita - ${periodLabel}`, value: `$${data.periodIncome.toFixed(2)}`, icon: DollarSign, color: "text-money-in", bg: "bg-money-in/10", border: "border-money-in/30", glow: "rgba(34,197,94,0.3)", href: "/admin/money", trend: getTrend(data.periodIncome, data.prevIncome) },
          { label: `Despesas - ${periodLabel}`, value: `$${data.periodExpenses.toFixed(2)}`, icon: DollarSign, color: "text-money-out", bg: "bg-money-out/10", border: "border-money-out/30", glow: "rgba(255,77,77,0.3)", href: "/admin/money", trend: getTrend(data.periodExpenses, data.prevExpenses, true) },
          { label: `Lucro - ${periodLabel}`, value: `$${data.periodProfit.toFixed(2)}`, icon: DollarSign, color: "text-profit", bg: "bg-profit/10", border: "border-profit/30", glow: "rgba(255,214,0,0.3)", href: "/admin/money", trend: getTrend(data.periodProfit, data.prevProfit) },
          { label: "Jobs Ativos", value: data.jobCount.toString(), icon: Briefcase, color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/30", glow: "rgba(162,89,255,0.3)", href: "/admin/jobs", trend: null },
          { label: "Clientes", value: data.clientCount.toString(), icon: Users, color: "text-primary-light", bg: "bg-primary/10", border: "border-primary/30", glow: "rgba(0,153,255,0.3)", href: "/admin/clients", trend: null },
          { label: "Milhas (Ano)", value: data.yearMiles.toFixed(0), icon: Car, color: "text-accent", bg: "bg-accent/10", border: "border-accent/30", glow: "rgba(255,214,0,0.3)", href: "/admin/mileage", trend: null },
        ].map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`stat-card ${c.bg} border ${c.border} rounded-2xl p-5 block cursor-pointer`}
            style={{ "--stat-glow": c.glow } as React.CSSProperties}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <c.icon size={18} className={c.color} />
                <span className="text-text-muted text-xs font-medium">{c.label}</span>
              </div>
              {c.trend && (
                <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${c.trend.positive ? "text-success bg-success/10" : "text-error bg-error/10"}`}>
                  {c.trend.positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(c.trend.pct).toFixed(0)}%
                </span>
              )}
            </div>
            <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Today's Jobs */}
        <div className="bg-surface border border-border rounded-2xl p-6 card-glow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-display)] text-sm font-bold section-title tracking-wider">JOBS DE HOJE</h2>
            <Link href="/admin/jobs" className="text-text-muted text-xs hover:text-secondary transition">Ver todos →</Link>
          </div>
          {data.todayJobs.length > 0 ? (
            <div className="space-y-3">
              {data.todayJobs.map((job) => (
                <Link key={job.id} href="/admin/jobs" className="flex items-center justify-between bg-card rounded-xl p-3 hover:bg-card/80 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-text">{job.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[job.status] || ""}`}>{job.status}</span>
                  </div>
                  <Clock size={14} className="text-text-muted" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm py-4 text-center">Nenhum job agendado para hoje</p>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-surface border border-border rounded-2xl p-6 card-glow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-display)] text-sm font-bold section-title tracking-wider">LEMBRETES</h2>
            <Link href="/admin/reminders" className="text-text-muted text-xs hover:text-secondary transition">Ver todos →</Link>
          </div>
          {data.upcomingReminders.length > 0 ? (
            <div className="space-y-3">
              {data.upcomingReminders.map((r) => {
                const isOverdue = new Date(r.due_date) < new Date();
                return (
                  <Link key={r.id} href="/admin/reminders" className={`flex items-center justify-between bg-card rounded-xl p-3 hover:bg-card/80 transition-colors ${isOverdue ? "border border-warning/30" : ""}`}>
                    <div className="flex items-center gap-3">
                      {isOverdue ? <AlertTriangle size={14} className="text-warning" /> : <Bell size={14} className="text-text-muted" />}
                      <div>
                        <p className="text-sm font-semibold text-text">{r.title}</p>
                        <p className={`text-xs ${isOverdue ? "text-warning" : "text-text-muted"}`}>
                          {new Date(r.due_date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </Link>
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
              const dueDate = new Date(exp.next_due + "T00:00:00");
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
                    {exp.source === "recurring" && (
                      <button
                        onClick={() => handlePayExpense(exp)}
                        disabled={payingId === exp.id}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${paidId === exp.id ? "bg-success/20 text-success" : payingId === exp.id ? "bg-accent/10 text-accent/50" : "bg-accent/20 text-accent hover:bg-accent/30"}`}
                      >
                        {paidId === exp.id ? "✓" : payingId === exp.id ? <Loader2 size={12} className="animate-spin" /> : "Pagar"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Quotes */}
        <div className="bg-surface border border-border rounded-2xl p-6 card-glow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-display)] text-sm font-bold section-title tracking-wider">ORCAMENTOS RECENTES</h2>
            <Link href="/admin/quotes" className="text-text-muted text-xs hover:text-secondary transition">Ver todos →</Link>
          </div>
          {data.recentQuotes.length > 0 ? (
            <div className="space-y-3">
              {data.recentQuotes.map((q) => (
                <Link key={q.id} href="/admin/quotes" className="flex items-center justify-between bg-card rounded-xl p-3 hover:bg-card/80 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-text">{q.name}</p>
                    <p className="text-xs text-text-muted">{q.service || "Sem servico"}</p>
                  </div>
                  <span className="text-xs text-text-muted">{new Date(q.created_at).toLocaleDateString("pt-BR")}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm py-4 text-center">Nenhum orcamento ainda</p>
          )}
        </div>

        {/* Recent Money */}
        <div className="bg-surface border border-border rounded-2xl p-6 card-glow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-display)] text-sm font-bold section-title tracking-wider">TRANSACOES RECENTES</h2>
            <Link href="/admin/money" className="text-text-muted text-xs hover:text-secondary transition">Ver todos →</Link>
          </div>
          {data.recentMoney.length > 0 ? (
            <div className="space-y-3">
              {data.recentMoney.map((entry) => (
                <Link key={entry.id} href="/admin/money" className="flex items-center justify-between bg-card rounded-xl p-3 hover:bg-card/80 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-text">{entry.category || "Sem categoria"}</p>
                    <span className="text-xs text-text-muted">{new Date(entry.date + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                  </div>
                  <span className={`font-bold text-sm ${entry.kind === "income" ? "text-money-in" : "text-money-out"}`}>
                    {entry.kind === "income" ? "+" : "-"}${entry.amount.toFixed(2)}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm py-4 text-center">Nenhuma transacao ainda</p>
          )}
        </div>
      </div>

      {/* Pinned Notes */}
      {data.pinnedNotes.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-6 card-glow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-display)] text-sm font-bold section-title tracking-wider">NOTAS FIXADAS</h2>
            <Link href="/admin/notes" className="text-text-muted text-xs hover:text-secondary transition">Ver todas →</Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {data.pinnedNotes.map((note) => (
              <Link key={note.id} href="/admin/notes" className="bg-accent/5 border border-accent/20 rounded-xl p-4 hover:bg-accent/10 transition-colors block">
                {note.title && <p className="text-sm font-bold text-accent mb-1">{note.title}</p>}
                <p className="text-text-secondary text-xs line-clamp-3">{note.content}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
