import Sidebar from "@/components/admin/Sidebar";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Admin | Araujo Company",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Araujo Admin",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D0D1A",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 lg:ml-0 p-4 lg:p-8 pt-16 lg:pt-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
