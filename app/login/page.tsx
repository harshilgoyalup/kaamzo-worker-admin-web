"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../lib/translations";

export default function WorkerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { language } = useLanguage();
  const t = getTranslation(language);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid worker credentials.");
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
          <h2 className="text-xl font-bold text-on-background mt-3">Worker Portal Login</h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Access open reservations and accept daily work
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
              Password
            </label>
            <input
              type="password"
              required
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
            {loading ? "Logging in..." : "Worker Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-on-surface-variant space-y-2">
          <div>
            New Skilled Worker?{" "}
            <Link href="/signup" className="font-bold text-primary hover:underline">
              Register Worker Account
            </Link>
          </div>
          <div>
            Admin Staff?{" "}
            <Link href="/admin/login" className="font-bold text-secondary hover:underline">
              Go to Admin Login (/admin)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
