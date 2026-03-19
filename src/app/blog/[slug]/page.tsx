import Link from "next/link";
import Image from "next/image";
import { blogPosts, getPostBySlug } from "@/lib/blog-data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Araujo Flooring Blog`,
    description: post.metaDescription,
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: "article",
      images: [{ url: post.image }],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  // Convert markdown-like content to HTML
  const contentHtml = post.content
    .split("\n\n")
    .map((block) => {
      if (block.startsWith("## ")) {
        return `<h2 class="font-[family-name:var(--font-display)] text-xl font-bold text-[#2C3E50] mt-10 mb-4">${block.replace("## ", "")}</h2>`;
      }
      if (block.startsWith("**") && block.includes(".**")) {
        return `<p class="text-[#2C3E50]/70 text-base leading-relaxed mb-4">${block.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#2C3E50] font-semibold">$1</strong>')}</p>`;
      }
      return `<p class="text-[#2C3E50]/70 text-base leading-relaxed mb-4">${block.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#2C3E50] font-semibold">$1</strong>').replace(/—/g, "&mdash;")}</p>`;
    })
    .join("");

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
            <Link href="/blog" className="text-[#2C3E50]/70 hover:text-[#2C3E50] text-sm font-medium transition">Blog</Link>
            <Link href="/#contact" className="bg-[#A0714F] hover:bg-[#8B6141] text-white text-sm font-bold py-2.5 px-5 rounded-lg transition">Free Quote</Link>
          </div>
        </div>
      </nav>

      {/* Hero Image */}
      <div className="relative h-[40vh] min-h-[300px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E50]/80 via-[#2C3E50]/30 to-transparent" />
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 -mt-20 relative z-10">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-[#A0714F]/10">
          {/* Meta */}
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-[#A0714F]/10 text-[#A0714F] text-xs font-bold px-3 py-1 rounded-full">{post.category}</span>
            <span className="text-[#2C3E50]/30 text-xs">{post.readTime}</span>
            <span className="text-[#2C3E50]/30 text-xs">{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </div>

          {/* Title */}
          <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-4xl font-black text-[#2C3E50] leading-tight mb-8">{post.title}</h1>

          {/* Author */}
          <div className="flex items-center gap-4 pb-8 mb-8 border-b border-[#A0714F]/10">
            <div className="w-12 h-12 bg-[#2C3E50] rounded-full flex items-center justify-center">
              <Image src="/logo.png" alt="Araujo" width={28} height={28} className="brightness-0 invert" />
            </div>
            <div>
              <p className="font-bold text-[#2C3E50] text-sm">Araujo Flooring Team</p>
              <p className="text-[#2C3E50]/40 text-xs">Professional Flooring Experts in Georgia</p>
            </div>
          </div>

          {/* Content */}
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />

          {/* CTA */}
          <div className="mt-12 bg-[#FAF7F2] rounded-2xl p-8 text-center border border-[#A0714F]/10">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[#2C3E50] mb-2">Need Professional Flooring Help?</h3>
            <p className="text-[#2C3E50]/50 text-sm mb-4">Get a free quote from our expert team.</p>
            <Link href="/#contact" className="inline-flex items-center gap-2 bg-[#2C3E50] hover:bg-[#1a2a38] text-white font-bold py-3 px-8 rounded-xl transition">
              Get a Free Quote
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#2C3E50] mb-8">More Articles</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {related.map((r) => (
            <Link key={r.slug} href={`/blog/${r.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-[#A0714F]/10 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="h-40 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.image} alt={r.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <span className="text-[#A0714F] text-xs font-bold">{r.category}</span>
                <h3 className="font-bold text-[#2C3E50] text-sm mt-1 group-hover:text-[#A0714F] transition-colors leading-snug">{r.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2C3E50] py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-white/30 text-sm">&copy; 2026 Araujo Company LLC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
