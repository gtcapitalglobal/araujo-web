import Link from "next/link";
import Image from "next/image";
import { blogPosts, categories } from "@/lib/blog-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flooring Tips & Guides | Araujo Flooring Blog",
  description: "Expert flooring advice from Georgia's trusted professionals. Maintenance tips, cost guides, material comparisons, and more.",
  openGraph: {
    title: "Flooring Tips & Guides | Araujo Flooring Blog",
    description: "Expert flooring advice from Georgia's trusted professionals.",
    type: "website",
  },
};

export default function BlogPage() {
  const featured = blogPosts[0];
  const rest = blogPosts.slice(1);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
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
            <Link href="/#services" className="text-[#2C3E50]/70 hover:text-[#2C3E50] text-sm font-medium transition hidden md:block">Services</Link>
            <Link href="/blog" className="text-[#2C3E50] text-sm font-bold transition">Blog</Link>
            <Link href="/#contact" className="text-[#2C3E50]/70 hover:text-[#2C3E50] text-sm font-medium transition hidden md:block">Contact</Link>
            <Link href="/#contact" className="bg-[#A0714F] hover:bg-[#8B6141] text-white text-sm font-bold py-2.5 px-5 rounded-lg transition">Free Quote</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-16 bg-[#2C3E50]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[#A0714F] text-sm font-semibold tracking-[3px] uppercase mb-3">Expert Advice</p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-5xl font-black text-white">Flooring Tips & Guides</h1>
          <p className="text-white/50 mt-4 max-w-xl mx-auto">Professional flooring advice from Georgia&apos;s trusted installers. Maintenance tips, cost guides, and expert comparisons.</p>
        </div>
      </section>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-3 justify-center">
          <span className="bg-[#2C3E50] text-white text-sm font-semibold px-5 py-2 rounded-full">All</span>
          {categories.map((cat) => (
            <span key={cat} className="bg-white text-[#2C3E50]/60 text-sm font-medium px-5 py-2 rounded-full border border-[#A0714F]/10 hover:border-[#A0714F]/30 transition cursor-pointer">
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Featured Post */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <Link href={`/blog/${featured.slug}`} className="group grid md:grid-cols-2 gap-8 bg-white rounded-3xl overflow-hidden border border-[#A0714F]/10 hover:shadow-xl hover:shadow-[#A0714F]/5 transition-all">
          <div className="h-64 md:h-auto overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="p-8 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-[#A0714F]/10 text-[#A0714F] text-xs font-bold px-3 py-1 rounded-full">{featured.category}</span>
              <span className="text-[#2C3E50]/30 text-xs">{featured.readTime}</span>
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-black text-[#2C3E50] mb-3 group-hover:text-[#A0714F] transition-colors">{featured.title}</h2>
            <p className="text-[#2C3E50]/50 text-sm leading-relaxed mb-4">{featured.metaDescription}</p>
            <span className="text-[#A0714F] font-semibold text-sm flex items-center gap-2">
              Read Article
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </span>
          </div>
        </Link>
      </div>

      {/* Post Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-[#A0714F]/10 hover:shadow-xl hover:shadow-[#A0714F]/5 hover:-translate-y-1 transition-all">
              <div className="h-48 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-[#A0714F]/10 text-[#A0714F] text-xs font-bold px-3 py-1 rounded-full">{post.category}</span>
                  <span className="text-[#2C3E50]/30 text-xs">{post.readTime}</span>
                </div>
                <h3 className="font-bold text-[#2C3E50] text-lg mb-2 group-hover:text-[#A0714F] transition-colors leading-snug">{post.title}</h3>
                <p className="text-[#2C3E50]/45 text-sm leading-relaxed line-clamp-2">{post.metaDescription}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="py-16 bg-[#2C3E50]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-black text-white mb-4">Need Help With Your Floors?</h2>
          <p className="text-white/50 mb-8">Get a free, no-obligation quote from our team of flooring experts.</p>
          <Link href="/#contact" className="inline-flex items-center gap-2 bg-[#A0714F] hover:bg-[#8B6141] text-white font-bold py-4 px-10 rounded-xl transition-all hover:scale-[1.02]">
            Get a Free Quote
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2C3E50] border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-white/30 text-sm">&copy; 2026 Araujo Company LLC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
