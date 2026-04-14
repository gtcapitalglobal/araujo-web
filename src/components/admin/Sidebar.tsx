"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, Users, Briefcase, DollarSign, FolderOpen,
  Car, HardHat, BookOpen, Building2, Settings, CheckSquare, LogOut, Menu, X,
  MessageSquare, Calendar, StickyNote, Bell, BarChart3, RefreshCw, Receipt, Link2, ExternalLink, Mail, FileText
} from "lucide-react";
import { useState } from "react";

const navSections = [
  {
    title: null,
    items: [
      { href: "/admin", icon: LayoutDashboard, label: "Painel" },
    ],
  },
  {
    title: "NEGOCIOS",
    items: [
      { href: "/admin/quotes", icon: MessageSquare, label: "Orcamentos" },
      { href: "/admin/calendar", icon: Calendar, label: "Calendario" },
      { href: "/admin/clients", icon: Users, label: "Clientes" },
      { href: "/admin/jobs", icon: Briefcase, label: "Servicos" },
    ],
  },
  {
    title: "FINANCEIRO",
    items: [
      { href: "/admin/invoice", icon: FileText, label: "Invoice" },
      { href: "/admin/money", icon: DollarSign, label: "Financeiro" },
      { href: "/admin/recurring", icon: RefreshCw, label: "Recorrentes" },
      { href: "/admin/mileage", icon: Car, label: "Quilometragem" },
      { href: "/admin/helpers", icon: HardHat, label: "Ajudantes" },
    ],
  },
  {
    title: "ORGANIZACAO",
    items: [
      { href: "/admin/files", icon: FolderOpen, label: "Arquivos" },
      { href: "/admin/docs", icon: Link2, label: "Documentos" },
      { href: "/admin/import-email", icon: Mail, label: "Importar Email" },
      { href: "/admin/notes", icon: StickyNote, label: "Notas" },
      { href: "/admin/reminders", icon: Bell, label: "Lembretes" },
      { href: "/admin/checklist", icon: CheckSquare, label: "Checklist" },
    ],
  },
  {
    title: "INFORMACOES",
    items: [
      { href: "/admin/reports", icon: BarChart3, label: "Relatorios" },
      { href: "/admin/taxes", icon: Receipt, label: "Impostos" },
      { href: "/admin/knowledge", icon: BookOpen, label: "Conhecimento" },
      { href: "/admin/company", icon: Building2, label: "Empresa" },
      { href: "/admin/settings", icon: Settings, label: "Ajustes" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 glass rounded-xl p-2.5 text-text hover:text-accent transition"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 z-40 h-screen w-[260px] bg-surface/95 backdrop-blur-xl border-r border-border/50 flex flex-col transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-border/50">
          <Link href="/admin" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <div className="relative">
              <Image src="/logo.png" alt="Logo" width={42} height={42} className="rounded-xl" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-surface" />
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-sm font-black gradient-text-gold tracking-wider">
                ARAUJO
              </h1>
              <p className="text-[10px] text-text-muted tracking-[3px] font-medium">COMPANY LLC</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {navSections.map((section, si) => (
            <div key={si} className={si > 0 ? "mt-4" : ""}>
              {section.title && (
                <p className="text-[10px] font-bold text-text-muted/50 tracking-[2px] px-3 mb-2">{section.title}</p>
              )}
              <div className="space-y-0.5">
                {section.items.map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all relative ${
                      isActive(href)
                        ? "bg-gradient-to-r from-primary/15 to-secondary/10 text-primary shadow-[0_0_15px_rgba(0,212,255,0.1)]"
                        : "text-text-secondary hover:bg-card/60 hover:text-text"
                    }`}
                  >
                    {isActive(href) && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-primary to-secondary rounded-r-full" />
                    )}
                    <Icon size={17} className={isActive(href) ? "text-primary" : ""} />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border/50">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-text-muted hover:text-secondary hover:bg-card/60 transition-all mb-1"
          >
            <ExternalLink size={16} />
            Ver Site
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-text-muted hover:text-error hover:bg-error/10 transition-all"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
