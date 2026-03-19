import Image from "next/image";
import Link from "next/link";

const services = [
  { icon: "🪵", title: "Hardwood Floors", desc: "Expert installation and refinishing of hardwood floors. Solid and engineered options available." },
  { icon: "🪨", title: "Tile & Stone", desc: "Ceramic, porcelain, marble and natural stone for floors, walls and backsplashes." },
  { icon: "🔲", title: "Laminate & Vinyl", desc: "Affordable and durable laminate and luxury vinyl plank installation." },
  { icon: "✨", title: "Floor Refinishing", desc: "Sand, stain and refinish existing floors to restore their original beauty." },
  { icon: "🔧", title: "Repairs", desc: "Fix damaged floors, replace broken tiles, repair squeaky boards and more." },
  { icon: "📐", title: "Custom Projects", desc: "Custom patterns, borders, inlays and specialty flooring designs." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Araujo Flooring" width={48} height={48} className="rounded-lg" />
            <div className="hidden sm:block">
              <span className="font-[family-name:var(--font-display)] font-bold text-lg text-[#2C3E50] tracking-wider block leading-tight">
                ARAUJO
              </span>
              <span className="text-[#A0714F] text-xs font-semibold tracking-[3px]">
                FLOORING
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-8">
            <a href="#services" className="text-[#2C3E50]/70 hover:text-[#2C3E50] text-sm font-medium transition hidden md:block">Services</a>
            <a href="#about" className="text-[#2C3E50]/70 hover:text-[#2C3E50] text-sm font-medium transition hidden md:block">About</a>
            <a href="#contact" className="text-[#2C3E50]/70 hover:text-[#2C3E50] text-sm font-medium transition hidden md:block">Contact</a>
            <a href="#contact" className="bg-[#A0714F] hover:bg-[#8B6141] text-white text-sm font-semibold py-2.5 px-6 rounded-lg transition hidden md:block">
              Free Quote
            </a>
            <Link href="/login" className="text-[#2C3E50]/30 hover:text-[#2C3E50]/60 text-xs transition">Admin</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center pt-20 relative overflow-hidden">
        {/* Subtle wood grain bg */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(90deg, #8B6914 0px, transparent 1px, transparent 30px),
                            repeating-linear-gradient(0deg, #8B6914 0px, transparent 1px, transparent 80px)`
        }} />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#A0714F]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#2C3E50]/5 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center w-full relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#A0714F]/10 text-[#A0714F] text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-[#A0714F] rounded-full" />
              Professional Flooring in Georgia
            </div>
            <h1 className="font-[family-name:var(--font-display)] font-black text-4xl md:text-[56px] leading-[1.1] text-[#2C3E50]">
              Quality Floors,<br />
              <span className="text-[#A0714F]">Built to Last</span>
            </h1>
            <p className="text-[#2C3E50]/60 text-lg mt-6 leading-relaxed max-w-lg">
              From hardwood to tile, laminate to stone — we bring expert craftsmanship
              and attention to detail to every flooring project.
            </p>
            <div className="flex gap-4 mt-8 flex-wrap">
              <a href="#contact" className="inline-flex items-center gap-2 bg-[#2C3E50] hover:bg-[#1a2a38] text-white font-bold py-4 px-8 rounded-xl transition-all hover:shadow-lg hover:shadow-[#2C3E50]/20">
                Get a Free Quote
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
              <a href="#services" className="inline-flex items-center gap-2 border-2 border-[#A0714F]/30 text-[#A0714F] font-bold py-4 px-8 rounded-xl hover:bg-[#A0714F]/5 transition">
                Our Services
              </a>
            </div>
            <div className="flex items-center gap-8 mt-12 pt-8 border-t border-[#2C3E50]/10">
              {[
                { num: "500+", label: "Projects Done" },
                { num: "100%", label: "Satisfaction" },
                { num: "5★", label: "Rating" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-[family-name:var(--font-display)] text-2xl font-black text-[#2C3E50]">{s.num}</div>
                  <div className="text-[#2C3E50]/40 text-xs font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-[320px] h-[400px] md:w-[380px] md:h-[480px] rounded-3xl bg-gradient-to-br from-[#A0714F]/20 to-[#2C3E50]/10 border border-[#A0714F]/20 flex items-center justify-center overflow-hidden">
                <Image src="/logo.png" alt="Araujo Flooring" width={260} height={260} className="relative z-10 drop-shadow-2xl" />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#A0714F]/10 rounded-2xl -z-10" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#2C3E50]/5 rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#A0714F] text-sm font-semibold tracking-[3px] uppercase mb-3">What We Do</p>
            <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-black text-[#2C3E50]">Our Services</h2>
            <div className="w-16 h-1 bg-[#A0714F] mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="bg-[#FAF7F2] border border-[#A0714F]/10 rounded-2xl p-8 text-center hover:border-[#A0714F]/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#A0714F]/5 transition-all group">
                <div className="text-5xl mb-5">{s.icon}</div>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[#2C3E50] mb-3">{s.title}</h3>
                <p className="text-[#2C3E50]/55 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#A0714F] text-sm font-semibold tracking-[3px] uppercase mb-3">About Us</p>
              <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-black text-[#2C3E50] mb-6">
                Craftsmanship You<br />Can Trust
              </h2>
              <div className="w-16 h-1 bg-[#A0714F] rounded-full mb-8" />
              <p className="text-[#2C3E50]/60 text-lg leading-relaxed mb-4">
                Araujo Company LLC is a professional flooring service based in Georgia.
                We deliver high-quality flooring solutions with expert craftsmanship and competitive pricing.
              </p>
              <p className="text-[#2C3E50]/60 text-lg leading-relaxed mb-8">
                From residential homes to commercial spaces, we handle every project with care,
                precision, and a commitment to excellence.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "🏆", title: "Quality First", desc: "Premium materials only" },
                  { icon: "📍", title: "Georgia Based", desc: "Local & reliable" },
                  { icon: "📋", title: "Licensed LLC", desc: "Fully registered business" },
                  { icon: "🤝", title: "Satisfaction", desc: "100% guarantee" },
                ].map((item) => (
                  <div key={item.title} className="bg-white rounded-xl p-4 border border-[#A0714F]/10">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <h4 className="font-bold text-[#2C3E50] text-sm">{item.title}</h4>
                    <p className="text-[#2C3E50]/40 text-xs mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-md aspect-[4/5] bg-gradient-to-br from-[#2C3E50] to-[#1a2a38] rounded-3xl flex flex-col items-center justify-center p-12 text-center">
                <Image src="/logo.png" alt="Logo" width={160} height={160} className="mb-6 brightness-0 invert" />
                <p className="text-white/60 text-sm leading-relaxed">
                  Building beautiful floors<br />one project at a time
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-[#2C3E50] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #A0714F 0px, transparent 2px, transparent 20px)`
        }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-black text-white mb-4">
            Ready to Transform Your Floors?
          </h2>
          <p className="text-white/60 text-lg mb-8">
            Get a free, no-obligation quote for your flooring project today.
          </p>
          <a href="#contact" className="inline-flex items-center gap-2 bg-[#A0714F] hover:bg-[#8B6141] text-white font-bold py-4 px-10 rounded-xl transition-all hover:shadow-lg">
            Request a Free Quote
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#A0714F] text-sm font-semibold tracking-[3px] uppercase mb-3">Get In Touch</p>
            <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-black text-[#2C3E50]">Contact Us</h2>
            <div className="w-16 h-1 bg-[#A0714F] mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-5">
              {[
                { icon: "📍", title: "Location", value: "Georgia, United States" },
                { icon: "📧", title: "Email", value: "contact@araujocompany.com" },
                { icon: "📱", title: "Phone", value: "Call for a Free Quote" },
                { icon: "🕐", title: "Hours", value: "Mon - Sat: 7:00 AM - 6:00 PM" },
              ].map((c) => (
                <div key={c.title} className="flex items-center gap-5 bg-[#FAF7F2] rounded-xl p-5 border border-[#A0714F]/10">
                  <div className="w-12 h-12 bg-[#A0714F]/10 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {c.icon}
                  </div>
                  <div>
                    <h4 className="text-[#A0714F] text-xs font-semibold tracking-wider uppercase">{c.title}</h4>
                    <p className="text-[#2C3E50] font-medium mt-0.5">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Your Name" className="w-full bg-[#FAF7F2] border border-[#A0714F]/15 rounded-xl px-5 py-3.5 text-[#2C3E50] placeholder:text-[#2C3E50]/30 focus:border-[#A0714F] focus:outline-none focus:ring-2 focus:ring-[#A0714F]/10 transition" />
                <input type="tel" placeholder="Your Phone" className="w-full bg-[#FAF7F2] border border-[#A0714F]/15 rounded-xl px-5 py-3.5 text-[#2C3E50] placeholder:text-[#2C3E50]/30 focus:border-[#A0714F] focus:outline-none focus:ring-2 focus:ring-[#A0714F]/10 transition" />
              </div>
              <input type="email" placeholder="Your Email" className="w-full bg-[#FAF7F2] border border-[#A0714F]/15 rounded-xl px-5 py-3.5 text-[#2C3E50] placeholder:text-[#2C3E50]/30 focus:border-[#A0714F] focus:outline-none focus:ring-2 focus:ring-[#A0714F]/10 transition" />
              <select className="w-full bg-[#FAF7F2] border border-[#A0714F]/15 rounded-xl px-5 py-3.5 text-[#2C3E50]/50 focus:border-[#A0714F] focus:outline-none focus:ring-2 focus:ring-[#A0714F]/10 transition">
                <option value="">Select a Service</option>
                <option>Hardwood Floors</option>
                <option>Tile & Stone</option>
                <option>Laminate & Vinyl</option>
                <option>Floor Refinishing</option>
                <option>Repairs</option>
                <option>Custom Projects</option>
              </select>
              <textarea placeholder="Tell us about your project..." rows={4} className="w-full bg-[#FAF7F2] border border-[#A0714F]/15 rounded-xl px-5 py-3.5 text-[#2C3E50] placeholder:text-[#2C3E50]/30 focus:border-[#A0714F] focus:outline-none focus:ring-2 focus:ring-[#A0714F]/10 transition resize-y" />
              <button type="submit" className="w-full bg-[#2C3E50] hover:bg-[#1a2a38] text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-[#2C3E50]/20">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2C3E50] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded-lg brightness-0 invert" />
              <div>
                <span className="font-[family-name:var(--font-display)] font-bold text-sm text-white tracking-wider">ARAUJO</span>
                <span className="text-white/40 text-xs tracking-[2px] block">FLOORING</span>
              </div>
            </div>
            <p className="text-white/40 text-sm">
              &copy; 2026 Araujo Company LLC. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#services" className="text-white/40 hover:text-white/80 text-sm transition">Services</a>
              <a href="#about" className="text-white/40 hover:text-white/80 text-sm transition">About</a>
              <a href="#contact" className="text-white/40 hover:text-white/80 text-sm transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
