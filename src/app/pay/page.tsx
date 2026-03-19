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
  const tag = company?.tag || "";
  const qrCodeUrl = company?.qr_code_url || "";
  const phone = company?.phone || "(404) 566-0988";

  return (
    <div className="min-h-screen bg-[#0D0B1A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-gradient-to-b from-[#1A1535] to-[#12102A] border border-[#2D2555] rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/20">

          {/* Header */}
          <div className="bg-gradient-to-r from-[#2D2555] to-[#1A1535] px-6 py-5 flex items-center gap-4">
            <Image src="/logo.png" alt="Logo" width={52} height={52} className="rounded-xl" />
            <div>
              <h1 className="text-white font-bold text-xl">{legalName}</h1>
              <p className="text-[#9B8EC4] text-xs mt-0.5">LLC · Instala e substitui pisos. Também faz pintura e pequenos reparos.</p>
            </div>
          </div>

          <div className="px-6 py-6 space-y-6">

            {/* Bank Info */}
            {bankName && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🏦</span>
                  <h2 className="text-white font-bold text-sm tracking-wider">{bankName.toUpperCase()}</h2>
                </div>
                <div className="bg-[#0D0B1A]/60 rounded-xl p-4 space-y-2.5">
                  {accountNumber && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#9B8EC4] text-xs">Account #</span>
                      <span className="text-white font-bold text-sm">{accountNumber}</span>
                    </div>
                  )}
                  {routingAch && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#9B8EC4] text-xs">Routing ACH</span>
                      <span className="text-white font-bold text-sm">{routingAch}</span>
                    </div>
                  )}
                  {routingWire && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#9B8EC4] text-xs">Routing Wire</span>
                      <span className="text-white font-bold text-sm">{routingWire}</span>
                    </div>
                  )}
                  {bankBranch && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#9B8EC4] text-xs">Branch</span>
                      <span className="text-white font-bold text-sm text-right">{bankBranch}</span>
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
                  <h2 className="text-white font-bold text-sm tracking-wider">ZELLE</h2>
                </div>
                <div className="bg-[#0D0B1A]/60 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9B8EC4] text-xs">Phone / Email</span>
                    <span className="text-white font-bold text-sm">{zelle}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tag */}
            {tag && (
              <div className="bg-[#0D0B1A]/60 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#9B8EC4] text-xs">Tag</span>
                  <span className="text-white font-bold text-sm">{tag}</span>
                </div>
              </div>
            )}

            {/* QR Code */}
            {qrCodeUrl && (
              <div className="flex flex-col items-center pt-2">
                <div className="bg-[#0D0B1A]/60 rounded-2xl p-4 inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodeUrl} alt="QR Code Zelle" className="w-40 h-40 object-contain" />
                </div>
                <p className="text-[#7B6BA5] text-xs mt-3">Escaneie para pagar via Zelle</p>
              </div>
            )}

            {/* Call Button */}
            <a
              href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
              className="flex items-center justify-center gap-2 w-full bg-[#7B2FBE] hover:bg-[#6B25A5] text-white font-bold py-3.5 rounded-xl transition text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              Ligar {phone}
            </a>
          </div>

          {/* Footer */}
          <div className="border-t border-[#2D2555] px-6 py-4 text-center">
            <p className="text-[#5D4E80] text-[10px]">
              <a href="https://www.araujocompany.com" className="text-[#7B6BA5] hover:text-white transition">araujocompany.com</a>
              {" · "}Gerado em {new Date().toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
