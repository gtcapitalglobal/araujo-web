import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Araujo Company LLC - Professional Flooring Services",
  description: "Professional flooring installation, repair and maintenance services in Georgia. Quality craftsmanship, competitive prices.",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
