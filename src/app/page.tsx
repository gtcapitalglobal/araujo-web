import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const services = [
  { img: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop", title: "Hardwood Floors", desc: "Expert installation and refinishing of solid and engineered hardwood floors with premium finishes." },
  { img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=400&fit=crop", title: "Tile & Stone", desc: "Ceramic, porcelain, marble and natural stone for floors, walls, backsplashes and showers." },
  { img: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=600&h=400&fit=crop", title: "Laminate & Vinyl", desc: "Affordable, durable and waterproof laminate and luxury vinyl plank (LVP) installation." },
  { img: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600&h=400&fit=crop", title: "Floor Refinishing", desc: "Sand, stain and refinish existing hardwood floors to restore their original beauty." },
  { img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop", title: "Repairs", desc: "Fix damaged floors, replace broken tiles, repair squeaky boards and water damage." },
  { img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop", title: "Custom Projects", desc: "Custom patterns, borders, herringbone, chevron and specialty flooring designs." },
];

const steps = [
  { num: "01", title: "Free Consultation", desc: "Contact us and describe your project. We'll schedule a free in-home visit." },
  { num: "02", title: "Custom Quote", desc: "We measure your space and provide a detailed, no-obligation estimate." },
  { num: "03", title: "Professional Install", desc: "Our skilled team installs your new floors with precision and care." },
  { num: "04", title: "Final Walkthrough", desc: "We review every detail with you to ensure 100% satisfaction." },
];

const testimonials = [
  { name: "Sarah M.", location: "Atlanta, GA", stars: 5, text: "Araujo Flooring transformed our entire home. The hardwood floors look absolutely stunning. Professional, clean, and finished ahead of schedule!" },
  { name: "James R.", location: "Marietta, GA", stars: 5, text: "Best flooring company we've ever worked with. Fair pricing, excellent communication, and the quality of work is outstanding." },
  { name: "Maria L.", location: "Lawrenceville, GA", stars: 5, text: "From start to finish, the experience was incredible. They helped us choose the perfect tile for our kitchen and bathroom. Highly recommend!" },
  { name: "David K.", location: "Alpharetta, GA", stars: 5, text: "Had our old carpet replaced with luxury vinyl plank. The team was fast, professional, and left our home spotless. Great value!" },
];

const portfolio = [
  { img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop", title: "Modern Living Room", type: "Hardwood" },
  { img: "https://images.unsplash.com/photo-1600566753086-00f18f6b0f30?w=600&h=400&fit=crop", title: "Kitchen Renovation", type: "Tile" },
  { img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop", title: "Master Bedroom", type: "LVP" },
  { img: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600&h=400&fit=crop", title: "Open Floor Plan", type: "Hardwood" },
  { img: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop", title: "Bathroom Remodel", type: "Tile" },
  { img: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600&h=400&fit=crop", title: "Dining Area", type: "Laminate" },
];

const serviceAreas = [
  "Atlanta", "Marietta", "Lawrenceville", "Alpharetta", "Roswell",
  "Johns Creek", "Duluth", "Suwanee", "Kennesaw", "Decatur",
  "Smyrna", "Norcross", "Peachtree City", "Buford", "Cumming",
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: companyInfo } = await supabase
    .from("company_info")
    .select("phone, email, address_line1, city, state, zip, website")
    .limit(1)
    .maybeSingle();

  const location = companyInfo?.city && companyInfo?.state
    ? `${companyInfo.city}, ${companyInfo.state}${companyInfo.zip ? ` ${companyInfo.zip}` : ""}`
    : "Georgia, United States";
  const fullAddress = companyInfo?.address_line1
    ? `${companyInfo.address_line1}, ${location}`
    : location;
  const phone = companyInfo?.phone || "(555) 123-4567";
  const email = companyInfo?.email || "contact@araujocompany.com";
  const hours = companyInfo?.website || "Mon - Sat: 7:00 AM - 6:00 PM";

  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      {/* Top Bar */}
      <div className="bg-[#2C3E50] text-white text-xs py-2">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="flex items-center gap-1.5 hover:text-[#A0714F] transition">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              {phone}
            </a>
            <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-[#A0714F] transition hidden sm:flex">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {email}
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-white/60">{hours}</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 font-semibold">Free Estimates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Araujo Flooring" width={48} height={48} className="rounded-lg" />
            <div className="hidden sm:block">
              <span className="font-[family-name:var(--font-display)] font-bold text-lg text-[#2C3E50] tracking-wider block leading-tight">ARAUJO</span>
              <span className="text-[#A0714F] text-xs font-semibold tracking-[3px]">FLOORING</span>
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#services" className="text-[#2C3E50]/70 hover:text-[#2C3E50] text-sm font-medium transition hidden md:block">Services</a>
            <a href="#portfolio" className="text-[#2C3E50]/70 hover:text-[#2C3E50] text-sm font-medium transition hidden md:block">Portfolio</a>
            <a href="#reviews" className="text-[#2C3E50]/70 hover:text-[#2C3E50] text-sm font-medium transition hidden md:block">Reviews</a>
            <a href="#about" className="text-[#2C3E50]/70 hover:text-[#2C3E50] text-sm font-medium transition hidden md:block">About</a>
            <a href="#contact" className="text-[#2C3E50]/70 hover:text-[#2C3E50] text-sm font-medium transition hidden md:block">Contact</a>
            <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="bg-[#A0714F] hover:bg-[#8B6141] text-white text-sm font-bold py-2.5 px-5 rounded-lg transition flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <span className="hidden lg:inline">Call Now</span>
            </a>
            <Link href="/login" className="text-[#2C3E50]/20 hover:text-[#2C3E50]/40 text-xs transition">Admin</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&h=1080&fit=crop" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2C3E50]/90 via-[#2C3E50]/70 to-[#2C3E50]/30" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-white/20">
              <span className="w-2 h-2 bg-[#A0714F] rounded-full" />
              Georgia&apos;s Trusted Flooring Professionals
            </div>
            <h1 className="font-[family-name:var(--font-display)] font-black text-4xl md:text-[58px] leading-[1.08] text-white">
              Beautiful Floors,<br />
              <span className="text-[#A0714F]">Expert Craftsmanship</span>
            </h1>
            <p className="text-white/70 text-lg mt-6 leading-relaxed max-w-lg">
              Professional flooring installation, refinishing and repair.
              From hardwood to tile, we deliver exceptional results on every project.
            </p>
            <div className="flex gap-4 mt-8 flex-wrap">
              <a href="#contact" className="inline-flex items-center gap-2 bg-[#A0714F] hover:bg-[#8B6141] text-white font-bold py-4 px-8 rounded-xl transition-all hover:shadow-xl hover:shadow-[#A0714F]/30 hover:scale-[1.02]">
                Get a Free Quote
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
              <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-bold py-4 px-8 rounded-xl hover:bg-white/10 transition backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {phone}
              </a>
            </div>
            {/* Trust Badges */}
            <div className="flex items-center gap-6 mt-12 pt-8 border-t border-white/10">
              {[
                { icon: "🛡️", text: "Licensed & Insured" },
                { icon: "✅", text: "Free Estimates" },
                { icon: "⭐", text: "5-Star Rated" },
                { icon: "🤝", text: "Satisfaction Guaranteed" },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-2 text-white/70 text-sm">
                  <span className="text-lg">{b.icon}</span>
                  <span className="hidden sm:inline font-medium">{b.text}</span>
                </div>
              ))}
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
            <p className="text-[#2C3E50]/50 mt-4 max-w-2xl mx-auto">We specialize in all types of flooring installation, repair and refinishing for residential and commercial spaces.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="group bg-[#FAF7F2] border border-[#A0714F]/10 rounded-2xl overflow-hidden hover:border-[#A0714F]/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#A0714F]/5 transition-all">
                <div className="h-48 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[#2C3E50] mb-2">{s.title}</h3>
                  <p className="text-[#2C3E50]/55 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#A0714F] text-sm font-semibold tracking-[3px] uppercase mb-3">Simple Process</p>
            <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-black text-[#2C3E50]">How It Works</h2>
            <div className="w-16 h-1 bg-[#A0714F] mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="relative text-center">
                <div className="w-16 h-16 bg-[#2C3E50] text-white font-[family-name:var(--font-display)] font-black text-xl rounded-2xl flex items-center justify-center mx-auto mb-5">
                  {s.num}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-[2px] bg-[#A0714F]/20" />
                )}
                <h3 className="font-bold text-[#2C3E50] text-lg mb-2">{s.title}</h3>
                <p className="text-[#2C3E50]/50 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolio" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#A0714F] text-sm font-semibold tracking-[3px] uppercase mb-3">Our Work</p>
            <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-black text-[#2C3E50]">Recent Projects</h2>
            <div className="w-16 h-1 bg-[#A0714F] mx-auto mt-4 rounded-full" />
            <p className="text-[#2C3E50]/50 mt-4 max-w-2xl mx-auto">Browse our portfolio of completed flooring projects across Georgia.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.map((p) => (
              <div key={p.title} className="group relative rounded-2xl overflow-hidden aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                  <span className="bg-[#A0714F] text-white text-xs font-bold px-3 py-1 rounded-full">{p.type}</span>
                  <h3 className="text-white font-bold text-lg mt-2">{p.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="py-24 bg-[#2C3E50]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#A0714F] text-sm font-semibold tracking-[3px] uppercase mb-3">Testimonials</p>
            <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-black text-white">What Our Clients Say</h2>
            <div className="w-16 h-1 bg-[#A0714F] mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#A0714F]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="text-white font-bold text-sm">{t.name}</p>
                  <p className="text-white/40 text-xs">{t.location}</p>
                </div>
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
                Your Local Flooring<br />Experts in Georgia
              </h2>
              <div className="w-16 h-1 bg-[#A0714F] rounded-full mb-8" />
              <p className="text-[#2C3E50]/60 text-lg leading-relaxed mb-4">
                Araujo Company LLC is a professional flooring service based in Georgia.
                We deliver high-quality flooring solutions with expert craftsmanship and competitive pricing.
              </p>
              <p className="text-[#2C3E50]/60 text-lg leading-relaxed mb-8">
                From residential homes to commercial spaces, we handle every project with care,
                precision, and a commitment to excellence. Every floor we install is built to last.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { num: "500+", label: "Projects Completed" },
                  { num: "100%", label: "Satisfaction Rate" },
                  { num: "5★", label: "Average Rating" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl p-4 text-center border border-[#A0714F]/10">
                    <div className="font-[family-name:var(--font-display)] text-2xl font-black text-[#2C3E50]">{s.num}</div>
                    <div className="text-[#2C3E50]/40 text-xs font-medium mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                {["Licensed & Insured", "Free Estimates", "Residential & Commercial", "Quality Materials"].map((b) => (
                  <span key={b} className="bg-[#2C3E50]/5 text-[#2C3E50]/70 text-xs font-semibold px-4 py-2 rounded-full border border-[#2C3E50]/10">
                    ✓ {b}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&h=800&fit=crop" alt="Flooring project" className="w-full h-[500px] object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#2C3E50] text-white rounded-2xl p-6 shadow-xl max-w-[200px]">
                <div className="font-[family-name:var(--font-display)] text-3xl font-black text-[#A0714F]">10+</div>
                <div className="text-sm text-white/70 mt-1">Years of Experience in Flooring</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 bg-white border-y border-[#A0714F]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#2C3E50]">Areas We Serve</h2>
            <p className="text-[#2C3E50]/40 text-sm mt-2">Proudly serving the greater Atlanta metro and surrounding areas</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {serviceAreas.map((area) => (
              <span key={area} className="bg-[#FAF7F2] text-[#2C3E50]/70 text-sm font-medium px-5 py-2.5 rounded-full border border-[#A0714F]/10 hover:border-[#A0714F]/30 hover:bg-[#A0714F]/5 transition">
                📍 {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-[#A0714F] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #fff 0px, transparent 2px, transparent 20px)`
        }} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-black text-white mb-4">
            Ready to Transform Your Floors?
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            Get a free, no-obligation quote for your flooring project today.
            We&apos;ll come to you with samples and expert advice.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#contact" className="inline-flex items-center gap-2 bg-white text-[#2C3E50] font-bold py-4 px-10 rounded-xl hover:shadow-xl transition-all hover:scale-[1.02]">
              Request a Free Quote
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="inline-flex items-center gap-2 border-2 border-white text-white font-bold py-4 px-10 rounded-xl hover:bg-white/10 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              Call {phone}
            </a>
          </div>
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
                { icon: "📍", title: "Location", value: fullAddress },
                { icon: "📧", title: "Email", value: email },
                { icon: "📱", title: "Phone", value: phone },
                { icon: "🕐", title: "Hours", value: hours },
              ].map((c) => (
                <div key={c.title} className="flex items-center gap-5 bg-[#FAF7F2] rounded-xl p-5 border border-[#A0714F]/10">
                  <div className="w-12 h-12 bg-[#A0714F]/10 rounded-xl flex items-center justify-center text-2xl shrink-0">{c.icon}</div>
                  <div>
                    <h4 className="text-[#A0714F] text-xs font-semibold tracking-wider uppercase">{c.title}</h4>
                    <p className="text-[#2C3E50] font-medium mt-0.5">{c.value}</p>
                  </div>
                </div>
              ))}
              {/* Social Links */}
              <div className="flex items-center gap-4 pt-4">
                <span className="text-[#2C3E50]/40 text-sm font-medium">Follow us:</span>
                {[
                  { name: "Facebook", svg: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                  { name: "Instagram", svg: "M16 4H8a4 4 0 00-4 4v8a4 4 0 004 4h8a4 4 0 004-4V8a4 4 0 00-4-4zm-4 11a3 3 0 110-6 3 3 0 010 6zm3.5-6.5a1 1 0 110-2 1 1 0 010 2z" },
                ].map((s) => (
                  <a key={s.name} href="#" className="w-10 h-10 bg-[#2C3E50]/5 hover:bg-[#A0714F]/10 border border-[#2C3E50]/10 rounded-xl flex items-center justify-center transition" aria-label={s.name}>
                    <svg className="w-5 h-5 text-[#2C3E50]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.svg} /></svg>
                  </a>
                ))}
              </div>
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
      <footer className="bg-[#2C3E50] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 pb-10 border-b border-white/10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-lg brightness-0 invert" />
                <div>
                  <span className="font-[family-name:var(--font-display)] font-bold text-sm text-white tracking-wider">ARAUJO</span>
                  <span className="text-white/40 text-xs tracking-[2px] block">FLOORING</span>
                </div>
              </div>
              <p className="text-white/40 text-sm leading-relaxed max-w-sm">
                Professional flooring installation, repair and refinishing services in Georgia.
                Quality craftsmanship you can trust.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Quick Links</h4>
              <div className="space-y-2">
                {["Services", "Portfolio", "Reviews", "About", "Contact"].map((l) => (
                  <a key={l} href={`#${l.toLowerCase()}`} className="block text-white/40 hover:text-white/80 text-sm transition">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Contact</h4>
              <div className="space-y-2 text-white/40 text-sm">
                <p>{fullAddress}</p>
                <p>{phone}</p>
                <p>{email}</p>
                <p>{hours}</p>
              </div>
            </div>
          </div>
          <div className="pt-8 text-center">
            <p className="text-white/30 text-sm">
              &copy; 2026 Araujo Company LLC. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
