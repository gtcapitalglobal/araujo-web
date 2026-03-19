"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, ChevronLeft, ChevronRight, Briefcase } from "lucide-react";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const statusColors: Record<string, string> = {
  lead: "bg-text-muted",
  estimated: "bg-warning",
  scheduled: "bg-secondary",
  in_progress: "bg-primary",
  completed: "bg-success",
  invoiced: "bg-accent",
  paid: "bg-money-in",
  cancelled: "bg-error",
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

interface CalendarJob {
  id: string;
  title: string;
  start_date: string;
  status: string;
  client: { name: string } | null;
}

export default function CalendarPage() {
  const supabase = createClient();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [jobs, setJobs] = useState<CalendarJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const startOfMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
    const endMonth = currentMonth === 11
      ? `${currentYear + 1}-01-01`
      : `${currentYear}-${String(currentMonth + 2).padStart(2, "0")}-01`;

    const { data } = await supabase
      .from("jobs")
      .select("id, title, start_date, status, client:clients(name)")
      .gte("start_date", startOfMonth)
      .lt("start_date", endMonth)
      .order("start_date");
    setJobs((data as unknown as CalendarJob[]) || []);
    setLoading(false);
  }, [supabase, currentYear, currentMonth]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  const goToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(null);
  };

  // Build calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const jobsByDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return jobs.filter((j) => j.start_date === dateStr);
  };

  const selectedJobs = selectedDate
    ? jobs.filter((j) => j.start_date === selectedDate)
    : [];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-black text-accent">CALENDARIO</h1>
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
        <div className="text-center py-20 text-text-muted">Carregando...</div>
      ) : (
        <>
          {/* Calendar Grid */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-center text-xs font-bold text-text-muted py-3">
                  {w}
                </div>
              ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7">
              {cells.map((day, i) => {
                if (day === null) {
                  return <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-border bg-card/30" />;
                }
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayJobs = jobsByDate(day);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;

                return (
                  <button
                    key={`day-${day}`}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`min-h-[80px] border-b border-r border-border p-1.5 text-left hover:bg-card/50 transition-colors ${
                      isSelected ? "bg-primary/10 border-primary/30" : ""
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                        isToday
                          ? "bg-primary text-white"
                          : "text-text-secondary"
                      }`}
                    >
                      {day}
                    </span>
                    {dayJobs.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {dayJobs.slice(0, 3).map((j) => (
                          <span
                            key={j.id}
                            className={`w-2 h-2 rounded-full ${statusColors[j.status] || "bg-text-muted"}`}
                            title={j.title}
                          />
                        ))}
                        {dayJobs.length > 3 && (
                          <span className="text-[10px] text-text-muted">+{dayJobs.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-6">
            {Object.entries(statusLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5 text-xs text-text-muted">
                <span className={`w-2.5 h-2.5 rounded-full ${statusColors[key]}`} />
                {label}
              </div>
            ))}
          </div>

          {/* Selected Day Jobs */}
          {selectedDate && (
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-accent mb-4">
                Jobs em {selectedDate.split("-").reverse().join("/")}
              </h3>
              {selectedJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase size={36} className="mx-auto text-text-muted mb-3" />
                  <p className="text-text-muted text-sm">Nenhum job neste dia</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedJobs.map((j) => (
                    <div key={j.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
                      <span className={`w-3 h-3 rounded-full shrink-0 ${statusColors[j.status] || "bg-text-muted"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text truncate">{j.title}</p>
                        <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                          {j.client?.name && <span>{j.client.name}</span>}
                          <span className="capitalize">{statusLabels[j.status] || j.status}</span>
                        </div>
                      </div>
                    </div>
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
