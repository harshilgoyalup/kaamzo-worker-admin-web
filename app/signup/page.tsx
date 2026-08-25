"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../lib/translations";
import { TradeType, Language } from "../../types";

export default function WorkerSignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [trade, setTrade] = useState<TradeType>("CARPENTER");
  const [prefLang, setPrefLang] = useState<Language>("en");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const { language } = useLanguage();
  const t = getTranslation(language);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup(name, email, password, "WORKER", prefLang, phone, trade);
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create worker account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-md w-full shadow-lg">
        <div className="text-center mb-6">
          <Link href="/" className="font-bold text-3xl text-primary tracking-tight">
            {t.brandName}
          </Link>
          <h2 className="text-xl font-bold text-on-background mt-3">Worker Registration</h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Register your skilled trade & receive daily reservation feeds
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container text-xs rounded-xl border border-error/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low text-on-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="Ram Singh"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low text-on-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="worker@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low text-on-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="+91 9876543210"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Skilled Trade & Governed Hourly Rate
            </label>
            <select
              value={trade}
              onChange={(e) => setTrade(e.target.value as TradeType)}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low text-on-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="CARPENTER">Carpenter (₹225/hr)</option>
              <option value="PLUMBER">Plumber (₹299/hr)</option>
              <option value="MASON">Mason (₹150/hr)</option>
              <option value="PAINTER">Painter (₹125/hr)</option>
              <option value="UNSKILLED_LABOUR">Unskilled Labour (₹100/hr)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Preferred Language
            </label>
            <select
              value={prefLang}
              onChange={(e) => setPrefLang(e.target.value as Language)}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low text-on-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low text-on-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-on-background transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register Worker Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-on-surface-variant">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Worker Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
