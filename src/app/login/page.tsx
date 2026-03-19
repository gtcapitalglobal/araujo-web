"use client";

import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    });
    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#A0714F]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#2C3E50]/5 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Araujo Flooring" width={100} height={100} className="mx-auto mb-6" />
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-black text-[#2C3E50] tracking-wider">
            ARAUJO FLOORING
          </h1>
          <p className="text-[#A0714F] text-sm font-semibold tracking-[3px] mt-1">
            ADMIN PANEL
          </p>
        </div>

        <div className="bg-white border border-[#A0714F]/15 rounded-2xl p-8 shadow-xl shadow-[#2C3E50]/5">
          <h2 className="text-lg font-bold text-[#2C3E50] text-center mb-6">Sign in to continue</h2>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-[#2C3E50] hover:bg-[#1a2a38] text-white font-bold py-4 px-6 rounded-xl transition-all hover:shadow-lg hover:shadow-[#2C3E50]/20"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          <p className="text-[#2C3E50]/30 text-xs text-center mt-6">
            Restricted access — authorized emails only
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
