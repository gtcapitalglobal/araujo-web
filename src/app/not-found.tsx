import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#A0714F]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#2C3E50]/5 rounded-full blur-[120px]" />

      <div className="text-center relative z-10 px-6">
        <Image src="/logo.png" alt="Araujo Flooring" width={80} height={80} className="mx-auto mb-8" />
        <h1 className="font-[family-name:var(--font-display)] text-[120px] font-black text-[#2C3E50]/10 leading-none">404</h1>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#2C3E50] -mt-6 mb-4">Page Not Found</h2>
        <p className="text-[#2C3E50]/50 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="bg-[#2C3E50] hover:bg-[#1a2a38] text-white font-bold py-3 px-8 rounded-xl transition">
            Go Home
          </Link>
          <Link href="/#contact" className="border-2 border-[#A0714F]/30 text-[#A0714F] font-bold py-3 px-8 rounded-xl hover:bg-[#A0714F]/5 transition">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
