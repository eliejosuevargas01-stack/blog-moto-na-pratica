"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { TEKO } from "../data";
import { getTranslation } from "../i18n/translations";

interface NewsletterBoxProps {
  variant?: "compact" | "banner";
  className?: string;
}

export default function NewsletterBox({ variant = "banner", className = "" }: NewsletterBoxProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [currentLang, setCurrentLang] = useState("pt");

  useEffect(() => {
    const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
    if (match && ["pt", "en", "es"].includes(match[1])) {
      setCurrentLang(match[1]);
    }
  }, []);

  const t = getTranslation(currentLang);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus({ type: "error", text: currentLang === "en" ? "Please enter a valid email." : currentLang === "es" ? "Por favor, introduce un email válido." : "Por favor, digite um e-mail válido." });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({ type: "success", text: t.sidebar.subscribed });
        setEmail("");
      } else {
        setStatus({ type: "error", text: data.error || "Error" });
      }
    } catch (err) {
      setStatus({ type: "error", text: "Error" });
    } finally {
      setLoading(false);
    }
  };

  if (variant === "compact") {
    return (
      <div className={`bg-[#C81017] p-6 rounded-none text-white shadow-lg ${className}`}>
        <h3 style={TEKO} className="text-[32px] font-bold uppercase tracking-wide leading-none text-white mb-2">
          {t.sidebar.newsletterTitle}
        </h3>
        <p className="text-[13px] text-white/85 leading-snug mb-5">
          {t.sidebar.newsletterDesc}
        </p>

        {status && (
          <div className={`p-3 rounded-none mb-4 text-[12px] flex items-center gap-1.5 font-medium ${
            status.type === "success" ? "bg-black/40 text-green-300 border border-green-400/40" : "bg-black/40 text-red-200 border border-white/30"
          }`}>
            {status.type === "success" && <CheckCircle2 size={14} className="shrink-0 text-green-300" />}
            <span>{status.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder={t.sidebar.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-white/10 border border-white/30 px-3.5 py-3 text-[14px] text-white placeholder:text-white/50 outline-none focus:border-white transition-colors rounded-none"
          />
          <button
            type="submit"
            disabled={loading}
            style={TEKO}
            className="w-full bg-[#111111] hover:bg-black text-white text-[20px] font-semibold uppercase tracking-wider py-2.5 flex items-center justify-center gap-2 transition-colors disabled:opacity-60 rounded-none shadow-md"
          >
            {loading ? <Loader2 size={18} className="animate-spin text-white" /> : t.sidebar.subscribe.toUpperCase()}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={`bg-[#C81017] py-10 px-6 text-white relative overflow-hidden shadow-inner ${className}`}>
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
        <div>
          <h2 style={TEKO} className="text-[40px] md:text-[50px] font-bold uppercase leading-none text-white tracking-wide">
            {t.sidebar.newsletterTitle}
          </h2>
          <p className="text-[15px] text-white/90 mt-2 max-w-[580px]">
            {t.sidebar.newsletterDesc}
          </p>
        </div>

        <div>
          {status && (
            <div className={`p-3.5 rounded-none mb-3 text-[13px] flex items-center gap-2 font-medium ${
              status.type === "success" ? "bg-black/40 text-green-300 border border-green-400/40" : "bg-black/40 text-red-200 border border-white/30"
            }`}>
              {status.type === "success" && <CheckCircle2 size={16} className="shrink-0 text-green-300" />}
              <span>{status.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder={t.sidebar.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-white/10 border border-white/30 px-4 py-3.5 text-[14px] text-white placeholder:text-white/50 outline-none focus:border-white transition-colors rounded-none"
            />
            <button
              type="submit"
              disabled={loading}
              style={TEKO}
              className="bg-[#111111] hover:bg-black text-white text-[22px] font-semibold uppercase tracking-wider px-8 py-3.5 shrink-0 flex items-center justify-center gap-2 transition-colors disabled:opacity-60 rounded-none shadow-md"
            >
              {loading ? <Loader2 size={20} className="animate-spin text-white" /> : t.sidebar.subscribe.toUpperCase()}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
