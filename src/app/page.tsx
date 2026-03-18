import Image from "next/image";
import Link from "next/link";

const services = [
  { icon: "🏠", title: "Hardwood Floors", desc: "Expert installation and refinishing of hardwood floors. Solid and engineered options." },
  { icon: "🪨", title: "Tile & Stone", desc: "Ceramic, porcelain, marble and natural stone for floors, walls and backsplashes." },
  { icon: "🔧", title: "Laminate & Vinyl", desc: "Affordable and durable laminate and luxury vinyl plank installation." },
  { icon: "✨", title: "Floor Refinishing", desc: "Sand, stain and refinish existing floors to restore their original beauty." },
  { icon: "🛠️", title: "Repairs", desc: "Fix damaged floors, replace broken tiles, repair squeaky boards and more." },
  { icon: "📐", title: "Custom Projects", desc: "Custom patterns, borders, inlays and specialty flooring designs." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg fort-grid relative overflow-hidden">
      {/* Glow orbs */}
      <div className="fixed top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-primary opacity-20 blur-[120px] pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-50px] left-[-100px] w-[400px] h-[400px] rounded-full bg-secondary opacity-15 blur-[120px] pointer-events-none animate-pulse" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-accent opacity-10 blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/85 backdrop-blur-xl border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Araujo Company" width={44} height={44} className="rounded-xl" />
            <span className="font-[family-name:var(--font-display)] font-bold text-lg text-accent tracking-widest hidden sm:block">
              ARAUJO COMPANY
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#services" className="text-text-secondary hover:text-secondary text-sm font-medium transition hidden md:block">Services</a>
            <a href="#about" className="text-text-secondary hover:text-secondary text-sm font-medium transition hidden md:block">About</a>
            <a href="#contact" className="text-text-secondary hover:text-secondary text-sm font-medium transition hidden md:block">Contact</a>
            <Link href="/login" className="text-text-muted hover:text-accent text-sm transition">Admin</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center pt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center w-full">
          <div>
            <h1 className="font-[family-name:var(--font-display)] font-black text-4xl md:text-6xl leading-tight">
              <span className="text-accent">PREMIUM</span><br />
              <span className="text-primary-light">FLOORING</span><br />
              <span className="text-secondary">SERVICES</span>
            </h1>
            <p className="text-text-secondary text-lg mt-6 leading-relaxed max-w-lg">
              Professional flooring installation, repair and maintenance in Georgia.
              Quality craftsmanship with attention to every detail.
            </p>
            <div className="flex gap-4 mt-8 flex-wrap">
              <a href="#contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-accent to-legendary text-bg font-bold py-3.5 px-8 rounded-xl hover:scale-105 transition-transform glow-gold">
                Get a Free Quote
              </a>
              <a href="#services" className="inline-flex items-center gap-2 border-2 border-secondary text-secondary font-bold py-3.5 px-8 rounded-xl hover:bg-secondary/10 transition">
                Our Services
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative w-[280px] h-[280px] md:w-[350px] md:h-[350px] flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin" style={{ animationDuration: "20s" }}>
                <div className="absolute top-[-4px] left-1/2 w-2 h-2 bg-accent rounded-full shadow-[0_0_15px_#FFD700]" />
              </div>
              <div className="absolute inset-[15%] rounded-full border border-secondary/20 animate-spin" style={{ animationDuration: "15s", animationDirection: "reverse" }} />
              <Image src="/logo.png" alt="Logo" width={180} height={180} className="rounded-3xl relative z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="font-[family-name:var(--font-display)] text-xs font-bold text-secondary tracking-[4px] uppercase mb-3">What We Do</p>
            <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-black text-accent">OUR SERVICES</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="bg-surface/60 border border-primary/20 rounded-2xl p-8 text-center hover:border-primary/50 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(123,47,190,0.15)] transition-all">
                <div className="text-5xl mb-4">{s.icon}</div>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="font-[family-name:var(--font-display)] text-xs font-bold text-secondary tracking-[4px] uppercase mb-3">Who We Are</p>
            <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-black text-accent">ABOUT US</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-text-secondary text-lg leading-relaxed mb-4">
                Araujo Company LLC is a professional flooring service based in Georgia.
                We deliver high-quality flooring solutions with expert craftsmanship and competitive pricing.
              </p>
              <p className="text-text-secondary text-lg leading-relaxed mb-8">
                From residential homes to commercial spaces, we handle every project with care and precision.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { num: "100%", label: "Quality Guaranteed" },
                  { num: "GA", label: "Based in Georgia" },
                  { num: "LLC", label: "Licensed Business" },
                  { num: "5★", label: "Customer Service" },
                ].map((s) => (
                  <div key={s.label} className="bg-surface/60 border border-primary/20 rounded-xl p-4 text-center">
                    <div className="font-[family-name:var(--font-display)] text-2xl font-black text-accent">{s.num}</div>
                    <div className="text-text-muted text-xs mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-md aspect-square bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/30 rounded-3xl flex items-center justify-center text-[120px]">
                🏗️
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="font-[family-name:var(--font-display)] text-xs font-bold text-secondary tracking-[4px] uppercase mb-3">Get In Touch</p>
            <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-black text-accent">CONTACT US</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-4">
              {[
                { icon: "📍", title: "Location", value: "Georgia, United States" },
                { icon: "📧", title: "Email", value: "contact@araujocompany.com" },
                { icon: "📱", title: "Phone", value: "Call for a Free Quote" },
                { icon: "🕐", title: "Hours", value: "Mon - Sat: 7:00 AM - 6:00 PM" },
              ].map((c) => (
                <div key={c.title} className="flex items-center gap-4 bg-surface/60 border border-primary/20 rounded-xl p-5">
                  <span className="text-3xl w-12 text-center">{c.icon}</span>
                  <div>
                    <h4 className="text-secondary text-sm font-semibold">{c.title}</h4>
                    <p className="text-text">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <form className="space-y-4">
              <input type="text" placeholder="Your Name" className="w-full bg-surface/80 border border-primary/30 rounded-xl px-5 py-3.5 text-text placeholder:text-text-muted focus:border-primary focus:outline-none transition" />
              <input type="email" placeholder="Your Email" className="w-full bg-surface/80 border border-primary/30 rounded-xl px-5 py-3.5 text-text placeholder:text-text-muted focus:border-primary focus:outline-none transition" />
              <input type="tel" placeholder="Your Phone" className="w-full bg-surface/80 border border-primary/30 rounded-xl px-5 py-3.5 text-text placeholder:text-text-muted focus:border-primary focus:outline-none transition" />
              <textarea placeholder="Tell us about your project..." rows={4} className="w-full bg-surface/80 border border-primary/30 rounded-xl px-5 py-3.5 text-text placeholder:text-text-muted focus:border-primary focus:outline-none transition resize-y" />
              <button type="submit" className="w-full bg-gradient-to-r from-accent to-legendary text-bg font-bold py-3.5 rounded-xl hover:scale-[1.02] transition-transform glow-gold">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/20 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-text-muted text-sm">
            &copy; 2026 <span className="font-[family-name:var(--font-display)] text-accent font-bold">Araujo Company LLC</span>. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
