import type { Metadata } from "next";
import "./globals.css";
import Analytics from "@/components/public/Analytics";

export const metadata: Metadata = {
  title: "Araujo Company LLC - Professional Flooring Services in Georgia",
  description: "Professional flooring installation, repair and maintenance services in Georgia. Hardwood, tile, LVP, laminate. Licensed & insured. Free estimates.",
  keywords: "flooring, hardwood floors, tile installation, LVP, laminate, floor refinishing, Georgia, Atlanta, flooring contractor",
  openGraph: {
    title: "Araujo Company LLC - Professional Flooring Services",
    description: "Expert flooring installation, repair and refinishing in Georgia. Free estimates.",
    type: "website",
    url: "https://www.araujocompany.com",
    siteName: "Araujo Flooring",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
