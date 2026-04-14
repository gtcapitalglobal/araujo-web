"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Calendar, ChevronLeft, ChevronRight, Briefcase,
  Bell, DollarSign, AlertTriangle, Clock, Plus,
} from "lucide-react";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const statusColors: Record<string, string> = {
  lead: "bg-text-muted", estimated: "bg-warning", scheduled: "bg-secondary",
  in_progress: "bg-primary", completed: "bg-success", invoiced: "bg-accent",
  paid: "bg-money-in", cancelled: "bg-error",
};

const statusLabels: Record<string, string> = {
  lead: "Lead", estimated: "Estimado", scheduled: "Agendado",
  in_progress: "Em Andamento", completed: "Concluido", invoiced: "Faturado",
  paid: "Pago", cancelled: "Cancelado",
};

type EventType = "job" | "reminder" | "expense";

interface CalendarEvent {
  id: string;
  type: EventType;
  title: string;
  date: string;
  status?: string;
  clientName?: string;
  amount?: number;
  isDone?: boolean;
  isOverdue?: boolean;
  href: string;
}

interface RawJob {
  id: string;
  title: string;
  start_date: string;
  end_date: string | null;
  status: string;
  client: { name: string } | { name: string }[] | null;
}

interface RawReminder {
  id: string;
  title: string;
  due_date: string;
  is_done: boolean;
}

interface RawExpense {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  next_due: string;
}

export default function CalendarPage() {
  const supabase = createClient();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const startOfMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
    const endMonth = currentMonth === 11
      ? `${currentYear + 1}-01-01`
      : `${currentYear}-${String(currentMonth + 2).padStart(2, "0")}-01`;
    const todayStr = new Date().toISOString().split("T")[0];

    const [jobsRes, remindersRes, expensesRes] = await Promise.all([
      supabase
        .from("jobs")
        .select("id, title, start_date, end_date, status, client:clients(name)")
        .or(`and(start_date.gte.${startOfMonth},start_date.lt.${endMonth}),and(end_date.gte.${startOfMonth},end_date.lt.${endMonth}),and(start_date.lt.${startOfMonth},end_date.gte.${startOfMonth})`)
        .neq("status", "cancelled")
        .order("start_date"),
      supabase
        .from("reminders")
        .select("id, title, due_date, is_done")
        .gte("due_date", startOfMonth)
        .lt("due_date", endMonth)
        .order("due_date"),
      supabase
        .from("recurring_expenses")
        .select("id, category, description, amount, next_due")
        .eq("is_active", true)
        .gte("next_due", startOfMonth)
        .lt("next_due", endMonth)
        .order("next_due"),
    ]);

    const allEvents: CalendarEvent[] = [];

    // Jobs - expand across date range
    for (const raw of (jobsRes.data || []) as unknown as RawJob[]) {
      const clientObj = Array.isArray(raw.client) ? raw.client[0] : raw.client;
      const start = raw.start_date;
      const end = raw.end_date || raw.start_date;
      const s = new Date(start + "T12:00:00");
      const e = new Date(end + "T12:00:00");
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        if (dateStr >= startOfMonth && dateStr < endMonth) {
          allEvents.push({
            id: raw.id,
            type: "job",
            title: raw.title,
            date: dateStr,
            status: raw.status,
            clientName: clientObj?.name,
            href: "/admin/jobs",
          });
        }
      }
    }

    // Reminders
    for (const r of (remindersRes.data || []) as RawReminder[]) {
      const dueDate = r.due_date.split("T")[0];
      allEvents.push({
        id: r.id,
        type: "reminder",
        title: r.title,
        date: dueDate,
        isDone: r.is_done,
        isOverdue: !r.is_done && dueDate < todayStr,
        href: "/admin/reminders",
      });
    }

    // Recurring Expenses
    for (const ex of (expensesRes.data || []) as RawExpense[]) {
      allEvents.push({
        id: ex.id,
        type: "expense",
        title: ex.category + (ex.description ? ` - ${ex.description}` : ""),
        date: ex.next_due,
        amount: ex.amount,
        href: "/admin/recurring",
      });
    }

    setEvents(allEvents);
    setLoading(false);
  }, [supabase, currentYear, currentMonth]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Re-fetch when tab becomes visible (fixes stale data after midnight)
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") fetchEvents(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchEvents]);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
    setSelectedDate(null);
  };

  const goToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(null);
  };

  // Build calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const nowForGrid = new Date();
  const todayStr = `${nowForGrid.getFullYear()}-${String(nowForGrid.getMonth() + 1).padStart(2, "0")}-${String(nowForGrid.getDate()).padStart(2, "0")}`;

  const eventsByDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  const selectedEvents = selectedDate
    ? events.filter((e) => e.date === selectedDate)
    : [];

  // Deduplicate jobs (multi-day shows same job id)
  const uniqueSelected = selectedEvents.filter(
    (e, i, arr) => e.type !== "job" || arr.findIndex((x) => x.id === e.id && x.type === "job") === i
  );

  const typeIcon = (type: EventType) => {
    if (type === "job") return <Briefcase size={14} />;
    if (type === "reminder") return <Bell size={14} />;
    return <DollarSign size={14} />;
  };

  const typeDot = (e: CalendarEvent) => {
    if (e.type === "job") return statusColors[e.status || ""] || "bg-text-muted";
    if (e.type === "reminder") return e.isDone ? "bg-success" : e.isOverdue ? "bg-error" : "bg-warning";
    return "bg-money-out";
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-black section-title">CALENDARIO</h1>
        <button onClick={goToday} className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
          <Calendar size={18} /> Hoje
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-card text-text-secondary hover:text-text transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-text">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h2>
        <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-card text-text-secondary hover:text-text transition-colors">
          <ChevronRight size={24} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 py-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : (
        <>
          {/* Calendar Grid */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-center text-xs font-bold text-text-muted py-3">{w}</div>
              ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7">
              {cells.map((day, i) => {
                if (day === null) {
                  return <div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[100px] border-b border-r border-border bg-card/30" />;
                }
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayEvents = eventsByDate(day);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const hasJobs = dayEvents.some((e) => e.type === "job");
                const hasReminders = dayEvents.some((e) => e.type === "reminder");
                const hasExpenses = dayEvents.some((e) => e.type === "expense");

                return (
                  <button
                    key={`day-${day}`}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`min-h-[80px] sm:min-h-[100px] border-b border-r border-border p-1.5 text-left hover:bg-card/50 transition-colors ${
                      isSelected ? "bg-primary/10 border-primary/30" : ""
                    }`}
                  >
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                      isToday ? "bg-primary text-white" : "text-text-secondary"
                    }`}>
                      {day}
                    </span>

                    {/* Event dots */}
                    {dayEvents.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {/* Show up to 2 event previews on desktop, dots on mobile */}
                        <div className="hidden sm:block">
                          {dayEvents.slice(0, 2).map((ev, idx) => (
                            <div key={`${ev.id}-${idx}`} className="flex items-center gap-1 truncate">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${typeDot(ev)}`} />
                              <span className="text-[9px] text-text-muted truncate leading-tight">{ev.title}</span>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-[9px] text-text-muted">+{dayEvents.length - 2} mais</span>
                          )}
                        </div>
                        {/* Mobile: just type indicators */}
                        <div className="flex gap-1 sm:hidden">
                          {hasJobs && <span className="w-2 h-2 rounded-full bg-secondary" />}
                          {hasReminders && <span className="w-2 h-2 rounded-full bg-warning" />}
                          {hasExpenses && <span className="w-2 h-2 rounded-full bg-money-out" />}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <Briefcase size={12} className="text-secondary" /> <span className="font-semibold">Jobs</span>
              {Object.entries(statusLabels).filter(([k]) => k !== "cancelled").map(([key, label]) => (
                <span key={key} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${statusColors[key]}`} /> {label}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Bell size={12} className="text-warning" /> <span className="font-semibold">Lembretes</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <DollarSign size={12} className="text-money-out" /> <span className="font-semibold">Despesas</span>
            </div>
          </div>

          {/* Selected Day Detail */}
          {selectedDate && (
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold section-title mb-4">
                {selectedDate.split("-").reverse().join("/")}
              </h3>
              {uniqueSelected.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar size={36} className="mx-auto text-text-muted mb-3" />
                  <p className="text-text-muted text-sm">Nenhum evento neste dia</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {uniqueSelected.map((ev, idx) => (
                    <Link
                      key={`${ev.id}-${idx}`}
                      href={ev.href}
                      className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:-translate-y-0.5 transition-all group"
                    >
                      {/* Type icon */}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        ev.type === "job" ? "bg-secondary/15 text-secondary"
                          : ev.type === "reminder" ? (ev.isOverdue ? "bg-error/15 text-error" : "bg-warning/15 text-warning")
                          : "bg-money-out/15 text-money-out"
                      }`}>
                        {typeIcon(ev.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text text-sm truncate group-hover:text-primary transition-colors">{ev.title}</p>
                        <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                          {ev.type === "job" && (
                            <>
                              {ev.clientName && <span>{ev.clientName}</span>}
                              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${statusColors[ev.status || ""]?.replace("bg-", "bg-") || ""} bg-opacity-20`}>
                                {statusLabels[ev.status || ""] || ev.status}
                              </span>
                            </>
                          )}
                          {ev.type === "reminder" && (
                            <span className={`flex items-center gap-1 ${ev.isDone ? "text-success" : ev.isOverdue ? "text-error" : "text-warning"}`}>
                              {ev.isDone ? "Concluido" : ev.isOverdue ? <><AlertTriangle size={10} /> Atrasado</> : <><Clock size={10} /> Pendente</>}
                            </span>
                          )}
                          {ev.type === "expense" && ev.amount && (
                            <span className="text-money-out font-bold">${ev.amount.toFixed(2)}</span>
                          )}
                        </div>
                      </div>

                      <ChevronRight size={16} className="text-text-muted group-hover:text-primary shrink-0 transition-colors" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
