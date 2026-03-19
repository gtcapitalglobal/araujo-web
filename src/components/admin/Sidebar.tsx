"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, Users, Briefcase, DollarSign, FolderOpen,
  Car, HardHat, BookOpen, Building2, Settings, CheckSquare, LogOut, Menu, X, MessageSquare
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/quotes", icon: MessageSquare, label: "Orcamentos" },
  { href: "/admin/clients", icon: Users, label: "Clientes" },
  { href: "/admin/jobs", icon: Briefcase, label: "Jobs" },
  { href: "/admin/money", icon: DollarSign, label: "Dinheiro" },
  { href: "/admin/files", icon: FolderOpen, label: "Arquivos" },
  { href: "/admin/mileage", icon: Car, label: "Mileage" },
  { href: "/admin/helpers", icon: HardHat, label: "Helpers" },
  { href: "/admin/checklist", icon: CheckSquare, label: "Checklist" },
  { href: "/admin/knowledge", icon: BookOpen, label: "Knowledge" },
  { href: "/admin/company", icon: Building2, label: "Empresa" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
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
        className="lg:hidden fixed top-4 left-4 z-50 bg-surface border border-border rounded-xl p-2 text-text"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 z-40 h-screen w-64 bg-surface border-r border-border flex flex-col transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="p-4 border-b border-border">
          <Link href="/admin" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-lg" />
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-sm font-bold text-accent tracking-wider">
                ARAUJO
              </h1>
              <p className="text-[10px] text-text-muted tracking-widest">COMPANY LLC</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(href)
                  ? "bg-primary/20 text-accent border border-primary/30"
                  : "text-text-secondary hover:bg-card hover:text-text"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-muted hover:text-secondary hover:bg-card transition-all mb-1"
          >
            <Building2 size={18} />
            Ver Site
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-error hover:bg-error/10 transition-all"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
