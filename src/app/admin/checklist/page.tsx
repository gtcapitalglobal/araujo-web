"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChecklistItem } from "@/lib/types";
import { CheckSquare, Square, Check } from "lucide-react";

const weeklyItems = [
  { key: "invoice_clients", label: "Invoice clients for completed work" },
  { key: "follow_up_leads", label: "Follow up on leads / estimates" },
  { key: "log_mileage", label: "Log mileage for the week" },
  { key: "pay_helpers", label: "Pay helpers if needed" },
  { key: "review_expenses", label: "Review and log expenses" },
  { key: "bank_deposits", label: "Confirm bank deposits" },
  { key: "schedule_jobs", label: "Schedule next week jobs" },
];

const monthlyItems = [
  { key: "reconcile_bank", label: "Reconcile bank statement" },
  { key: "review_profit", label: "Review monthly profit/loss" },
  { key: "tax_reserve", label: "Set aside tax reserve" },
  { key: "send_1099", label: "Check 1099 requirements" },
  { key: "insurance_review", label: "Review insurance coverage" },
  { key: "update_records", label: "Update client records" },
  { key: "backup_files", label: "Backup important files" },
  { key: "review_goals", label: "Review business goals" },
];

export default function ChecklistPage() {
  const supabase = createClient();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"weekly" | "monthly">("weekly");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("checklists")
      .select("*")
      .eq("year", year)
      .eq("month", month);
    setItems(data || []);
    setLoading(false);
  }, [supabase, year, month]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const isChecked = (scope: string, key: string) =>
    items.find((i) => i.scope === scope && i.item_key === key)?.is_done || false;

  const toggle = async (scope: "weekly" | "monthly", key: string, label: string) => {
    const existing = items.find((i) => i.scope === scope && i.item_key === key);
    if (existing) {
      const newDone = !existing.is_done;
      await supabase.from("checklists").update({
        is_done: newDone,
        done_at: newDone ? new Date().toISOString() : null,
      }).eq("id", existing.id);
    } else {
      await supabase.from("checklists").insert({
        id: crypto.randomUUID(),
        scope,
        year,
        month,
        item_key: key,
        label,
        is_done: true,
        done_at: new Date().toISOString(),
      });
    }
    fetchItems();
  };

  const currentItems = tab === "weekly" ? weeklyItems : monthlyItems;
  const doneCount = currentItems.filter((i) => isChecked(tab, i.key)).length;
  const progress = currentItems.length > 0 ? (doneCount / currentItems.length) * 100 : 0;

  const monthNames = ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-black section-title mb-2">CHECKLIST</h1>
      <p className="text-text-muted text-sm mb-8">{monthNames[month - 1]} {year}</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("weekly")}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === "weekly" ? "bg-primary text-white" : "bg-card border border-border text-text-secondary hover:text-text"}`}>
          Semanal
        </button>
        <button onClick={() => setTab("monthly")}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === "monthly" ? "bg-primary text-white" : "bg-card border border-border text-text-secondary hover:text-text"}`}>
          Mensal
        </button>
      </div>

      {/* Progress */}
      <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-text-secondary">{doneCount} / {currentItems.length} completos</span>
          <span className="text-sm font-bold text-accent">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-3 bg-card rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      {loading ? (
        <div className="space-y-4 py-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl divide-y divide-border">
          {currentItems.map((item) => {
            const done = isChecked(tab, item.key);
            return (
              <button key={item.key} onClick={() => toggle(tab, item.key, item.label)}
                className="w-full flex items-center gap-4 p-4 hover:bg-card/50 transition-colors text-left">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${done ? "bg-success border-success" : "border-border"}`}>
                  {done && <Check size={14} className="text-bg" />}
                </div>
                <span className={`text-sm ${done ? "text-text-muted line-through" : "text-text"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
