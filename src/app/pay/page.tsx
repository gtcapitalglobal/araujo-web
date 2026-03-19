import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Info | Araujo Company LLC",
  description: "Payment information for Araujo Company LLC flooring services.",
};

export default async function PayPage() {
  const supabase = await createClient();
  const { data: company } = await supabase
    .from("company_info")
    .select("*")
    .limit(1)
    .maybeSingle();

  const legalName = company?.legal_name || "Araujo Company LLC";
  const bankName = company?.bank_name || "";
  const accountNumber = company?.account_number || "";
  const routingAch = company?.routing_ach || "";
  const routingWire = company?.routing_wire || "";
  const bankBranch = company?.bank_branch || "";
  const zelle = company?.zelle || company?.email || "";
  const qrCodeUrl = company?.qr_code_url || "";
  const phone = company?.phone || "(404) 566-0988";

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white border border-[#A0714F]/15 rounded-3xl overflow-hidden shadow-2xl shadow-[#2C3E50]/10">

          {/* Header */}
          <div className="bg-[#2C3E50] px-6 py-5 flex items-center gap-4">
            <Image src="/logo.png" alt="Logo" width={52} height={52} className="rounded-xl" />
            <div>
              <h1 className="text-white font-bold text-xl">{legalName}</h1>
              <p className="text-white/50 text-xs mt-0.5">LLC · Flooring installation, replacement, painting & small repairs.</p>
            </div>
          </div>

          <div className="px-6 py-6 space-y-6">

            {/* Bank Info */}
            {bankName && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🏦</span>
                  <h2 className="text-[#2C3E50] font-bold text-sm tracking-wider">{bankName.toUpperCase()}</h2>
                </div>
                <div className="bg-[#FAF7F2] rounded-xl p-4 space-y-2.5 border border-[#A0714F]/10">
                  {accountNumber && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#2C3E50]/50 text-xs">Account #</span>
                      <span className="text-[#2C3E50] font-bold text-sm">{accountNumber}</span>
                    </div>
                  )}
                  {routingAch && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#2C3E50]/50 text-xs">Routing ACH</span>
                      <span className="text-[#2C3E50] font-bold text-sm">{routingAch}</span>
                    </div>
                  )}
                  {routingWire && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#2C3E50]/50 text-xs">Routing Wire</span>
                      <span className="text-[#2C3E50] font-bold text-sm">{routingWire}</span>
                    </div>
                  )}
                  {bankBranch && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#2C3E50]/50 text-xs">Branch</span>
                      <span className="text-[#2C3E50] font-bold text-sm text-right">{bankBranch}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Zelle */}
            {zelle && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">⚡</span>
                  <h2 className="text-[#2C3E50] font-bold text-sm tracking-wider">ZELLE</h2>
                </div>
                <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#A0714F]/10">
                  <span className="text-[#2C3E50] font-bold text-sm">{zelle}</span>
                </div>
              </div>
            )}

            {/* QR Code */}
            {qrCodeUrl && (
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-2xl p-3 border border-[#A0714F]/10 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodeUrl} alt="QR Code Zelle" className="w-44 h-44 object-contain" />
                </div>
                <p className="text-[#A0714F] text-xs font-medium mt-3">Scan to pay via Zelle</p>
              </div>
            )}

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
