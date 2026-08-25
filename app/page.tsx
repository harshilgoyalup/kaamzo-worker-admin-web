"use client";

import React from "react";
import Link from "next/link";
import { UserCheck, ShieldAlert, ArrowRight, Volume2, Globe } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { getTranslation } from "../lib/translations";
import { useSpeech } from "../hooks/useSpeech";
import { Language } from "../types";

export default function WorkerAdminHome() {
  const { language, setLanguage } = useLanguage();
  const t = getTranslation(language);
  const { speak, isSpeaking, stop } = useSpeech();

  const handleTTS = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak("KAAMZO Worker and Admin Portal. Choose Worker Login to view open jobs, or Admin Login for central command.", language);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="px-4 lg:px-12 py-4 flex items-center justify-between border-b border-outline-variant bg-surface">
        <Link href="/" className="font-bold text-2xl tracking-tight text-primary">
          {t.brandName} <span className="text-xs font-normal text-on-surface-variant">Worker & Admin</span>
        </Link>

        <div className="flex items-center gap-3">
          <a
            href="https://kaamzo-customer-web.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/30 text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
          >
            Customer Web ↗
          </a>

          <button
            onClick={handleTTS}
            className={`p-2 rounded-full flex items-center gap-1.5 text-xs font-bold ${
              isSpeaking ? "bg-primary text-on-primary animate-pulse" : "bg-primary-container text-on-primary-container"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">Listen</span>
          </button>

          <div className="flex items-center gap-1 bg-surface-container-low border border-outline-variant rounded-full p-1 text-xs">
            <Globe className="w-3.5 h-3.5 ml-1 text-outline" />
            {(["en", "hi", "pa"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-1 rounded-full font-bold uppercase transition-colors ${
                  language === lang ? "bg-secondary text-on-secondary shadow-sm" : "text-on-surface-variant"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Selection Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 lg:p-12 flex flex-col justify-center items-center">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-on-background">Kaamzo Operations Portal</h1>
          <p className="text-sm text-on-surface-variant mt-2 max-w-md">
            Select your role to access the labor reservation feed or central administration system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Worker Portal Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-md hover:shadow-lg transition-all flex flex-col justify-between space-y-6">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center mb-4">
                <UserCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-on-background">Skilled Worker Portal</h2>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                Accept open job reservations in real time, view your shift calendar, avoid double-booking, and track earnings.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/login"
                className="w-full py-3.5 px-4 rounded-xl bg-primary text-on-primary font-bold text-sm text-center flex items-center justify-center gap-2 hover:bg-on-background transition-colors shadow-md"
              >
                <span>Worker Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/signup"
                className="w-full py-3 px-4 rounded-xl border border-outline-variant text-center font-bold text-xs text-on-surface-variant hover:bg-surface-container-high transition-colors block"
              >
                Register New Worker
              </Link>
            </div>
          </div>

          {/* Admin Control Center Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-md hover:shadow-lg transition-all flex flex-col justify-between space-y-6">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-on-background">Admin Control Center</h2>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                Central command dashboard for user management, worker KYC verification, reservation monitoring, disputes, and financial GBV analytics.
              </p>
            </div>

            <Link
              href="/admin/login"
              className="w-full py-3.5 px-4 rounded-xl bg-secondary text-on-secondary font-bold text-sm text-center flex items-center justify-center gap-2 hover:bg-on-background transition-colors shadow-md"
            >
              <span>Admin Login (/admin/login)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-surface-container-high border-t border-outline-variant px-4 lg:px-12 py-8 text-center text-xs text-on-surface-variant">
        <p className="font-bold text-on-background mb-2">KAAMZO — Worker & Admin Operations Platform</p>
        <div className="flex flex-wrap items-center justify-center gap-4 mb-3 font-semibold">
          <a href="https://kaamzo-customer-web.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            Customer Web Portal
          </a>
          <span>•</span>
          <a href="https://kaamzo-worker-admin-web-1st-edition.vercel.app/" className="hover:text-primary transition-colors">
            Worker Portal (Home)
          </a>
          <span>•</span>
          <a href="https://kaamzo-worker-admin-web-1st-edition.vercel.app/admin/login" className="hover:text-secondary transition-colors">
            Admin Dashboard (/admin/login)
          </a>
        </div>
        <p>Built with Next.js & Unified Firebase Backend • English | Hindi | Punjabi</p>
      </footer>
    </div>
  );
}
