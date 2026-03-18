import { createClient } from "@/lib/supabase/server";
import { DollarSign, Briefcase, Users, Car } from "lucide-react";

async function getStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  const [clients, jobs, income, expenses, mileage] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("jobs").select("id", { count: "exact", head: true }).neq("status", "cancelled"),
    supabase.from("money_entries").select("amount").eq("kind", "income").gte("date", monthStart).lt("date", nextMonth),
    supabase.from("money_entries").select("amount").eq("kind", "expense").gte("date", monthStart).lt("date", nextMonth),
    supabase.from("mileage_logs").select("miles").gte("date", `${year}-01-01`),
  ]);

  const totalIncome = income.data?.reduce((s, e) => s + (e.amount || 0), 0) || 0;
  const totalExpenses = expenses.data?.reduce((s, e) => s + (e.amount || 0), 0) || 0;
  const totalMiles = mileage.data?.reduce((s, e) => s + (e.miles || 0), 0) || 0;

  return {
    clientCount: clients.count || 0,
    jobCount: jobs.count || 0,
    monthIncome: totalIncome,
    monthExpenses: totalExpenses,
    monthProfit: totalIncome - totalExpenses,
    yearMiles: totalMiles,
  };
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const stats = await getStats(supabase);

  const { data: recentJobs } = await supabase
    .from("jobs")
    .select("id, title, status, estimate_amount, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentMoney } = await supabase
    .from("money_entries")
    .select("id, kind, category, amount, date")
    .order("date", { ascending: false })
    .limit(5);

  const cards = [
    { label: "Receita do Mes", value: `$${stats.monthIncome.toFixed(2)}`, icon: DollarSign, color: "text-money-in", bg: "bg-money-in/10", border: "border-money-in/30" },
    { label: "Despesas do Mes", value: `$${stats.monthExpenses.toFixed(2)}`, icon: DollarSign, color: "text-money-out", bg: "bg-money-out/10", border: "border-money-out/30" },
    { label: "Lucro do Mes", value: `$${stats.monthProfit.toFixed(2)}`, icon: DollarSign, color: "text-profit", bg: "bg-profit/10", border: "border-profit/30" },
    { label: "Jobs Ativos", value: stats.jobCount.toString(), icon: Briefcase, color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/30" },
    { label: "Clientes", value: stats.clientCount.toString(), icon: Users, color: "text-primary-light", bg: "bg-primary/10", border: "border-primary/30" },
    { label: "Miles (Ano)", value: stats.yearMiles.toFixed(1), icon: Car, color: "text-accent", bg: "bg-accent/10", border: "border-accent/30" },
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

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-black text-accent mb-8">DASHBOARD</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={`${c.bg} border ${c.border} rounded-2xl p-5`}>
            <div className="flex items-center gap-3 mb-2">
              <c.icon size={20} className={c.color} />
              <span className="text-text-muted text-xs font-medium">{c.label}</span>
            </div>
            <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="font-[family-name:var(--font-display)] text-sm font-bold text-secondary tracking-wider mb-4">JOBS RECENTES</h2>
          {recentJobs && recentJobs.length > 0 ? (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between bg-card rounded-xl p-3">
                  <div>
                    <p className="text-sm font-semibold">{job.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[job.status] || "bg-text-muted/20 text-text-muted"}`}>
                      {job.status}
                    </span>
                  </div>
                  {job.estimate_amount && (
                    <span className="text-accent font-bold text-sm">${job.estimate_amount}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm">Nenhum job ainda</p>
          )}
        </div>

        {/* Recent Money */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="font-[family-name:var(--font-display)] text-sm font-bold text-secondary tracking-wider mb-4">TRANSACOES RECENTES</h2>
          {recentMoney && recentMoney.length > 0 ? (
            <div className="space-y-3">
              {recentMoney.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between bg-card rounded-xl p-3">
                  <div>
                    <p className="text-sm font-semibold">{entry.category || "Sem categoria"}</p>
                    <span className="text-xs text-text-muted">{entry.date}</span>
                  </div>
                  <span className={`font-bold text-sm ${entry.kind === "income" ? "text-money-in" : "text-money-out"}`}>
                    {entry.kind === "income" ? "+" : "-"}${entry.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm">Nenhuma transacao ainda</p>
          )}
        </div>
      </div>
    </div>
  );
}
