"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FileText, Download, DollarSign, TrendingUp, TrendingDown,
  Car, HardHat, Calculator,
} from "lucide-react";

interface MoneyEntry {
  id: string;
  kind: "income" | "expense";
  category: string | null;
  amount: number;
  date: string;
  notes: string | null;
}

interface MileageLog {
  id: string;
  date: string;
  origin: string | null;
  destination: string | null;
  purpose: string | null;
  miles: number;
}

interface HelperPayment {
  id: string;
  helper_id: string;
  date: string;
  amount: number;
  method: string | null;
  notes: string | null;
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const MILEAGE_RATE = 0.70;
const TAX_RESERVE_PERCENT = 0.30;

export default function ReportsPage() {
  const supabase = createClient();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [entries, setEntries] = useState<MoneyEntry[]>([]);
  const [mileage, setMileage] = useState<MileageLog[]>([]);
  const [helperPayments, setHelperPayments] = useState<HelperPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonthStart = month === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [entriesRes, mileageRes, helperRes] = await Promise.all([
      supabase
        .from("money_entries")
        .select("*")
        .gte("date", monthStart)
        .lt("date", nextMonthStart)
        .order("date"),
      supabase
        .from("mileage_logs")
        .select("*")
        .gte("date", monthStart)
        .lt("date", nextMonthStart)
        .order("date"),
      supabase
        .from("helper_payments")
        .select("*")
        .gte("date", monthStart)
        .lt("date", nextMonthStart)
        .order("date"),
    ]);
    setEntries(entriesRes.data || []);
    setMileage(mileageRes.data || []);
    setHelperPayments(helperRes.data || []);
    setLoading(false);
  }, [supabase, monthStart, nextMonthStart]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculations
  const incomeEntries = entries.filter((e) => e.kind === "income");
  const expenseEntries = entries.filter((e) => e.kind === "expense");
  const totalIncome = incomeEntries.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = expenseEntries.reduce((s, e) => s + e.amount, 0);
  const profit = totalIncome - totalExpenses;
  const taxReserve = profit > 0 ? profit * TAX_RESERVE_PERCENT : 0;

  const totalMiles = mileage.reduce((s, m) => s + m.miles, 0);
  const mileageDeduction = totalMiles * MILEAGE_RATE;

  const totalHelperPayments = helperPayments.reduce((s, p) => s + p.amount, 0);

  // Group entries by category
  const incomeByCategory = new Map<string, number>();
  incomeEntries.forEach((e) => {
    const cat = e.category || "Sem categoria";
    incomeByCategory.set(cat, (incomeByCategory.get(cat) || 0) + e.amount);
  });

  const expenseByCategory = new Map<string, number>();
  expenseEntries.forEach((e) => {
    const cat = e.category || "Sem categoria";
    expenseByCategory.set(cat, (expenseByCategory.get(cat) || 0) + e.amount);
  });

  // CSV Export
  const exportCSV = () => {
    const lines: string[] = [];
    lines.push(`Relatorio - ${MONTH_NAMES[month - 1]} ${year}`);
    lines.push("");

    // Summary
    lines.push("RESUMO");
    lines.push(`Receita Total,$${totalIncome.toFixed(2)}`);
    lines.push(`Despesas Total,$${totalExpenses.toFixed(2)}`);
    lines.push(`Lucro,$${profit.toFixed(2)}`);
    lines.push(`Reserva Impostos (30%),$${taxReserve.toFixed(2)}`);
    lines.push(`Milhas Total,${totalMiles.toFixed(1)}`);
    lines.push(`Deducao IRS ($${MILEAGE_RATE}/mi),$${mileageDeduction.toFixed(2)}`);
    lines.push(`Pagamentos Helpers,$${totalHelperPayments.toFixed(2)}`);
    lines.push("");

    // Income by category
    lines.push("RECEITAS POR CATEGORIA");
    lines.push("Categoria,Valor");
    incomeByCategory.forEach((amount, cat) => {
      lines.push(`${cat},$${amount.toFixed(2)}`);
    });
    lines.push("");

    // Expenses by category
    lines.push("DESPESAS POR CATEGORIA");
    lines.push("Categoria,Valor");
    expenseByCategory.forEach((amount, cat) => {
      lines.push(`${cat},$${amount.toFixed(2)}`);
    });
    lines.push("");

    // All entries
    lines.push("TODAS AS ENTRADAS");
    lines.push("Data,Tipo,Categoria,Valor,Notas");
    entries.forEach((e) => {
      const tipo = e.kind === "income" ? "Receita" : "Despesa";
      const notas = (e.notes || "").replace(/,/g, ";");
      lines.push(`${e.date},${tipo},${e.category || ""},${e.amount.toFixed(2)},${notas}`);
    });
    lines.push("");

    // Mileage
    lines.push("MILHAS");
    lines.push("Data,Origem,Destino,Proposito,Milhas");
    mileage.forEach((m) => {
      lines.push(`${m.date},${m.origin || ""},${m.destination || ""},${m.purpose || ""},${m.miles}`);
    });
    lines.push("");

    // Helper payments
    lines.push("PAGAMENTOS HELPERS");
    lines.push("Data,Valor,Metodo,Notas");
    helperPayments.forEach((p) => {
      const notas = (p.notes || "").replace(/,/g, ";");
      lines.push(`${p.date},${p.amount.toFixed(2)},${p.method || ""},${notas}`);
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${year}-${String(month).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const years = [];
  for (let y = now.getFullYear(); y >= now.getFullYear() - 5; y--) {
    years.push(y);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-black text-accent">RELATORIOS</h1>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-gradient-to-r from-accent to-legendary text-bg font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          <Download size={18} /> Exportar CSV
        </button>
      </div>

      {/* Date Selectors */}
      <div className="flex gap-4 mb-8">
        <div>
          <label className="text-xs text-text-muted mb-1 block">Ano</label>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-text-muted mb-1 block">Mes</label>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="bg-card border border-border rounded-xl px-4 py-3 text-text focus:border-primary focus:outline-none"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 py-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-money-in/10 border border-money-in/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-money-in" />
                <span className="text-text-muted text-xs font-medium">Receita</span>
              </div>
              <p className="text-2xl font-black text-money-in">${totalIncome.toFixed(2)}</p>
            </div>
            <div className="bg-money-out/10 border border-money-out/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={18} className="text-money-out" />
                <span className="text-text-muted text-xs font-medium">Despesas</span>
              </div>
              <p className="text-2xl font-black text-money-out">${totalExpenses.toFixed(2)}</p>
            </div>
            <div className="bg-profit/10 border border-profit/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} className="text-profit" />
                <span className="text-text-muted text-xs font-medium">Lucro</span>
              </div>
              <p className={`text-2xl font-black ${profit >= 0 ? "text-profit" : "text-money-out"}`}>${profit.toFixed(2)}</p>
            </div>
            <div className="bg-warning/10 border border-warning/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Calculator size={18} className="text-warning" />
                <span className="text-text-muted text-xs font-medium">Reserva Impostos (30%)</span>
              </div>
              <p className="text-2xl font-black text-warning">${taxReserve.toFixed(2)}</p>
            </div>
          </div>

          {/* Mileage & Helper Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-accent/10 border border-accent/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Car size={18} className="text-accent" />
                <span className="text-text-muted text-xs font-medium">Milhas no Periodo</span>
              </div>
              <p className="text-2xl font-black text-accent">{totalMiles.toFixed(1)} mi</p>
              <p className="text-sm text-text-muted mt-1">
                Deducao IRS: <span className="text-success font-bold">${mileageDeduction.toFixed(2)}</span> (${MILEAGE_RATE}/mi)
              </p>
            </div>
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <HardHat size={18} className="text-primary-light" />
                <span className="text-text-muted text-xs font-medium">Pagamentos Helpers</span>
              </div>
              <p className="text-2xl font-black text-primary-light">${totalHelperPayments.toFixed(2)}</p>
              <p className="text-sm text-text-muted mt-1">{helperPayments.length} pagamento(s)</p>
            </div>
          </div>

          {/* Income by Category */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-money-in mb-4 flex items-center gap-2">
                <TrendingUp size={18} /> Receitas por Categoria
              </h3>
              {incomeByCategory.size === 0 ? (
                <p className="text-text-muted text-sm text-center py-4">Nenhuma receita no periodo</p>
              ) : (
                <div className="space-y-2">
                  {Array.from(incomeByCategory.entries())
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, amount]) => (
                      <div key={cat} className="flex items-center justify-between bg-card border border-border rounded-xl p-3">
                        <span className="text-sm font-medium text-text">{cat}</span>
                        <span className="font-bold text-money-in">${amount.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-money-out mb-4 flex items-center gap-2">
                <TrendingDown size={18} /> Despesas por Categoria
              </h3>
              {expenseByCategory.size === 0 ? (
                <p className="text-text-muted text-sm text-center py-4">Nenhuma despesa no periodo</p>
              ) : (
                <div className="space-y-2">
                  {Array.from(expenseByCategory.entries())
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, amount]) => (
                      <div key={cat} className="flex items-center justify-between bg-card border border-border rounded-xl p-3">
                        <span className="text-sm font-medium text-text">{cat}</span>
                        <span className="font-bold text-money-out">${amount.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* All Entries Table */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-accent mb-4 flex items-center gap-2">
              <FileText size={18} /> Todas as Entradas - {MONTH_NAMES[month - 1]} {year}
            </h3>
            {entries.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">Nenhuma entrada no periodo</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-text-muted border-b border-border">
                      <th className="pb-3 pr-4 font-medium">Data</th>
                      <th className="pb-3 pr-4 font-medium">Tipo</th>
                      <th className="pb-3 pr-4 font-medium">Categoria</th>
                      <th className="pb-3 pr-4 font-medium text-right">Valor</th>
                      <th className="pb-3 font-medium">Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {entries.map((e) => (
                      <tr key={e.id} className="hover:bg-card/50 transition-colors">
                        <td className="py-3 pr-4 whitespace-nowrap">{new Date(e.date).toLocaleDateString("pt-BR")}</td>
                        <td className="py-3 pr-4">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${e.kind === "income" ? "bg-money-in/20 text-money-in" : "bg-money-out/20 text-money-out"}`}>
                            {e.kind === "income" ? "Receita" : "Despesa"}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-text-secondary">{e.category || "—"}</td>
                        <td className={`py-3 pr-4 font-bold text-right ${e.kind === "income" ? "text-money-in" : "text-money-out"}`}>
                          {e.kind === "income" ? "+" : "-"}${e.amount.toFixed(2)}
                        </td>
                        <td className="py-3 text-text-muted truncate max-w-[200px]">{e.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
