"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", service: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.from("quote_requests").insert({
      name: form.name,
      phone: form.phone || null,
      email: form.email || null,
      service: form.service || null,
      message: form.message || null,
    });

    if (error) {
      setStatus("error");
      return;
    }

    setStatus("sent");
    setForm({ name: "", phone: "", email: "", service: "", message: "" });
    setTimeout(() => setStatus("idle"), 5000);
  };

  if (status === "sent") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-lg font-bold text-green-800 mb-2">Message Sent!</h3>
        <p className="text-green-600 text-sm">Thank you! We&apos;ll get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Your Name *"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-[#FAF7F2] border border-[#A0714F]/15 rounded-xl px-5 py-3.5 text-[#2C3E50] placeholder:text-[#2C3E50]/30 focus:border-[#A0714F] focus:outline-none focus:ring-2 focus:ring-[#A0714F]/10 transition"
        />
        <input
          type="tel"
          placeholder="Your Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full bg-[#FAF7F2] border border-[#A0714F]/15 rounded-xl px-5 py-3.5 text-[#2C3E50] placeholder:text-[#2C3E50]/30 focus:border-[#A0714F] focus:outline-none focus:ring-2 focus:ring-[#A0714F]/10 transition"
        />
      </div>
      <input
        type="email"
        placeholder="Your Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full bg-[#FAF7F2] border border-[#A0714F]/15 rounded-xl px-5 py-3.5 text-[#2C3E50] placeholder:text-[#2C3E50]/30 focus:border-[#A0714F] focus:outline-none focus:ring-2 focus:ring-[#A0714F]/10 transition"
      />
      <select
        value={form.service}
        onChange={(e) => setForm({ ...form, service: e.target.value })}
        className="w-full bg-[#FAF7F2] border border-[#A0714F]/15 rounded-xl px-5 py-3.5 text-[#2C3E50]/50 focus:border-[#A0714F] focus:outline-none focus:ring-2 focus:ring-[#A0714F]/10 transition"
      >
        <option value="">Select a Service</option>
        <option>Hardwood Floors</option>
        <option>Tile & Stone</option>
        <option>Laminate & Vinyl</option>
        <option>Floor Refinishing</option>
        <option>Repairs</option>
        <option>Custom Projects</option>
      </select>
      <textarea
        placeholder="Tell us about your project..."
        rows={4}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="w-full bg-[#FAF7F2] border border-[#A0714F]/15 rounded-xl px-5 py-3.5 text-[#2C3E50] placeholder:text-[#2C3E50]/30 focus:border-[#A0714F] focus:outline-none focus:ring-2 focus:ring-[#A0714F]/10 transition resize-y"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-[#2C3E50] hover:bg-[#1a2a38] text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-[#2C3E50]/20 disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : status === "error" ? "Error - Try Again" : "Send Message"}
      </button>
    </form>
  );
}
