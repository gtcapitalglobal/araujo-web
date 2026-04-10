"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { KnowledgeArticle } from "@/lib/types";
import { BookOpen, ChevronDown, ChevronUp, Search } from "lucide-react";

export default function KnowledgePage() {
  const supabase = createClient();
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("knowledge_articles")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    setArticles(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const categories = ["all", ...Array.from(new Set(articles.map((a) => a.category)))];

  const filtered = articles.filter((a) => {
    if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return a.title.toLowerCase().includes(s) || a.body.toLowerCase().includes(s);
    }
    return true;
  });

  const grouped = filtered.reduce<Record<string, KnowledgeArticle[]>>((acc, a) => {
    if (!acc[a.category]) acc[a.category] = [];
    acc[a.category].push(a);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-black section-title mb-8">KNOWLEDGE BASE</h1>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input type="text" placeholder="Buscar artigos..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-3 text-text focus:border-primary focus:outline-none transition-colors" />
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {categories.map((c) => (
          <button key={c} onClick={() => setCategoryFilter(c)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors capitalize ${categoryFilter === c ? "bg-primary text-white" : "bg-card border border-border text-text-secondary hover:text-text"}`}>
            {c === "all" ? "Todos" : c}
          </button>
        ))}
      </div>

      {/* Articles */}
      {loading ? (
        <div className="space-y-4 py-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted">Nenhum artigo encontrado</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, arts]) => (
            <div key={category}>
              <h2 className="font-[family-name:var(--font-display)] text-sm font-bold text-secondary tracking-wider mb-3 uppercase">{category}</h2>
              <div className="bg-surface border border-border rounded-2xl divide-y divide-border">
                {arts.map((a) => (
                  <div key={a.id}>
                    <button onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-card/50 transition-colors text-left">
                      <span className="text-sm font-semibold text-text">{a.title}</span>
                      {expanded === a.id ? <ChevronUp size={18} className="text-text-muted shrink-0" /> : <ChevronDown size={18} className="text-text-muted shrink-0" />}
                    </button>
                    {expanded === a.id && (
                      <div className="px-4 pb-4">
                        <div className="bg-card rounded-xl p-4 text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                          {a.body}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
