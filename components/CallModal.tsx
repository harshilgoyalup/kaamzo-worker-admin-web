"use client";

import React from "react";
import { Phone, X, ShieldCheck } from "lucide-react";
import { Language } from "../types";
import { getTranslation } from "../lib/translations";

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetPhone?: string;
  targetRole: string;
  jobTitle?: string;
  lang?: Language;
}

export const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  targetName,
  targetPhone = "+919876543210",
  targetRole,
  jobTitle,
  lang = "en",
}) => {
  if (!isOpen) return null;
  const t = getTranslation(lang);

  const cleanPhone = targetPhone.replace(/[^0-9+]/g, "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-headline-lg-mobile text-lg text-on-background font-bold">
              {t.callRedirectModalTitle}
            </h3>
            <p className="text-xs text-on-surface-variant">{t.callRedirectModalDesc}</p>
          </div>
        </div>

        {jobTitle && (
          <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant mb-4 text-sm">
            <span className="text-on-surface-variant font-medium">Job Reference: </span>
            <span className="font-bold text-on-background">{jobTitle}</span>
          </div>
        )}

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-outline-variant text-sm">
            <span className="text-on-surface-variant">{targetRole}:</span>
            <span className="font-bold text-on-background">{targetName}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-outline-variant text-sm">
            <span className="text-on-surface-variant">Direct Phone:</span>
            <span className="font-bold text-primary">{targetPhone}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-6 bg-secondary-container/40 p-3 rounded-lg border border-outline-variant">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <span>Calls are securely redirected via Kaamzo Telephony masking for your safety & privacy.</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-outline-variant text-on-surface-variant font-bold text-sm hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <a
            href={`tel:${cleanPhone}`}
            className="flex-1 py-3 px-4 rounded-xl bg-primary text-on-primary font-bold text-sm text-center flex items-center justify-center gap-2 hover:bg-on-background transition-colors shadow-md"
          >
            <Phone className="w-4 h-4" />
            <span>Call {targetPhone}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
