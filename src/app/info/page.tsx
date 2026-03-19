import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company Info | Araujo Company LLC",
  description: "Company information for Araujo Company LLC flooring services.",
};

export default async function InfoPage() {
  const supabase = await createClient();
  const { data: company } = await supabase
    .from("company_info")
    .select("*")
    .limit(1)
    .maybeSingle();

  const legalName = company?.legal_name || "Araujo Company LLC";
  const ein = company?.ein || "";
  const ownerName = company?.member_name || "Gustavo Araujo";
  const phone = company?.phone || "(404) 566-0988";
  const email = company?.email || "araujocompanyllc@gmail.com";
  const address = company?.address_line1 || "8060 Adair Ln, Apt 4314";
  const city = company?.city || "Sandy Springs";
  const state = company?.state || "GA";
  const zip = company?.zip || "30350";
  const fullAddress = `${address}, ${city}, ${state} ${zip}`;

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white border border-[#A0714F]/15 rounded-3xl overflow-hidden shadow-2xl shadow-[#2C3E50]/10">

          {/* Header */}
          <div className="bg-[#2C3E50] px-6 py-6 flex items-center gap-4">
            <Image src="/logo.png" alt="Logo" width={56} height={56} className="rounded-xl" />
            <div>
              <h1 className="text-white font-bold text-xl">{legalName}</h1>
              <p className="text-white/50 text-xs mt-0.5">LLC &middot; Flooring installation, replacement, painting &amp; small repairs.</p>
            </div>
          </div>

          <div className="px-6 py-6 space-y-5">

            {/* Owner */}
            <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#A0714F]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2C3E50] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {ownerName.split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-[#2C3E50]/50 text-[10px] uppercase tracking-wider font-semibold">Owner</p>
                  <p className="text-[#2C3E50] font-bold">{ownerName}</p>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🏢</span>
                <h2 className="text-[#2C3E50] font-bold text-sm tracking-wider">COMPANY DETAILS</h2>
              </div>
              <div className="bg-[#FAF7F2] rounded-xl p-4 space-y-3 border border-[#A0714F]/10">
                {ein && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#2C3E50]/50 text-xs">EIN</span>
                    <span className="text-[#2C3E50] font-bold text-sm">{ein}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[#2C3E50]/50 text-xs">State</span>
                  <span className="text-[#2C3E50] font-bold text-sm">Georgia</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#2C3E50]/50 text-xs">Type</span>
                  <span className="text-[#2C3E50] font-bold text-sm">LLC - Single Member</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#2C3E50]/50 text-xs">Status</span>
                  <span className="text-green-600 font-bold text-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📋</span>
                <h2 className="text-[#2C3E50] font-bold text-sm tracking-wider">CONTACT</h2>
              </div>
              <div className="bg-[#FAF7F2] rounded-xl p-4 space-y-3 border border-[#A0714F]/10">
                <div className="flex items-center gap-3">
                  <span className="text-sm">📍</span>
                  <span className="text-[#2C3E50] text-sm font-medium">{fullAddress}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">📱</span>
                  <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="text-[#2C3E50] text-sm font-medium hover:text-[#A0714F] transition">{phone}</a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">📧</span>
                  <a href={`mailto:${email}`} className="text-[#2C3E50] text-sm font-medium hover:text-[#A0714F] transition">{email}</a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">🌐</span>
                  <a href="https://www.araujocompany.com" className="text-[#A0714F] text-sm font-medium hover:underline">araujocompany.com</a>
                </div>
              </div>
            </div>

            {/* Licensed Badge */}
            <div className="bg-[#2C3E50]/5 rounded-xl p-4 border border-[#2C3E50]/10 text-center">
              <p className="text-[#2C3E50] font-bold text-sm">🛡️ Licensed &amp; Insured</p>
              <p className="text-[#2C3E50]/40 text-xs mt-1">State of Georgia</p>
            </div>

            {/* Website Link */}
            <a
              href="https://www.araujocompany.com"
              className="flex items-center justify-center gap-2 w-full bg-[#A0714F] hover:bg-[#8B6141] text-white font-bold py-3.5 rounded-xl transition text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>
              araujocompany.com
            </a>
          </div>

          {/* Footer */}
          <div className="border-t border-[#A0714F]/10 px-6 py-4 text-center">
            <p className="text-[#2C3E50]/30 text-[10px]">
              <a href="https://www.araujocompany.com" className="text-[#A0714F]/60 hover:text-[#A0714F] transition">araujocompany.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
