"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, ShieldCheck, Phone, Mail, Globe, Clock, Wrench } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { Language } from "../../types";

export default function WorkerProfilePage() {
  const { userProfile, updateLanguagePreference } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [saved, setSaved] = useState(false);

  const handleLang = async (lang: Language) => {
    setLanguage(lang);
    await updateLanguagePreference(lang);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full space-y-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-on-background">
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 lg:p-8 shadow-md space-y-6">
          <div className="flex items-center gap-4 border-b border-outline-variant pb-6">
            <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-2xl">
              {userProfile?.name ? userProfile.name[0] : "W"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-on-background">{userProfile?.name || "Worker"}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-primary text-on-primary uppercase">
                  {userProfile?.trade || "CARPENTER"}
                </span>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase ${
                    userProfile?.verificationStatus === "VERIFIED"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {userProfile?.verificationStatus || "PENDING"} VERIFICATION
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-outline-variant">
              <span className="text-on-surface-variant font-bold flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" /> Email:
              </span>
              <span className="font-bold text-on-background">{userProfile?.email}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-outline-variant">
              <span className="text-on-surface-variant font-bold flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" /> Phone:
              </span>
              <span className="font-bold text-on-background">{userProfile?.phone || "Not set"}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-outline-variant">
              <span className="text-on-surface-variant font-bold">Governed Hourly Rate:</span>
              <span className="font-bold text-primary text-sm">₹{userProfile?.hourlyRate || 225}/hr</span>
            </div>

            <div className="py-2 space-y-2">
              <label className="text-on-surface-variant font-bold flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> App Language:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: "en", label: "English" },
                    { id: "hi", label: "हिंदी" },
                    { id: "pa", label: "ਪੰਜਾਬੀ" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleLang(item.id)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      language === item.id
                        ? "bg-primary text-on-primary border-primary"
                        : "bg-surface-container-low text-on-surface-variant border-outline-variant"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {saved && <p className="text-xs text-primary font-bold">Language preference updated!</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
