"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { ArrowLeft, Phone, CheckCircle2, MapPin, Calendar, Clock, Volume2 } from "lucide-react";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../lib/translations";
import { useSpeech } from "../../hooks/useSpeech";
import { CallModal } from "../../components/CallModal";
import { Job } from "../../types";

export default function WorkerReservationsPage() {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const t = getTranslation(language);
  const { speak, isSpeaking, stop } = useSpeech();

  const [reservations, setReservations] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCallJob, setActiveCallJob] = useState<Job | null>(null);

  useEffect(() => {
    if (currentUser) {
      const q = query(collection(db, "jobs"), where("workerId", "==", currentUser.uid));
      const unsubscribe = onSnapshot(q, (snap) => {
        const list: Job[] = [];
        snap.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Job);
        });
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setReservations(list);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  const handleConfirmCompletion = async (job: Job) => {
    try {
      const jobRef = doc(db, "jobs", job.id);
      const isCustomerAlreadyConfirmed = job.customerCompletionConfirmed;

      const updateData: any = {
        workerCompletionConfirmed: true,
        updatedAt: serverTimestamp(),
      };

      if (isCustomerAlreadyConfirmed) {
        updateData.status = "COMPLETED";
        await addDoc(collection(db, "payments"), {
          jobId: job.id,
          customerPayment: job.totalCustomerPayment,
          workerAmount: job.workerEarnings,
          platformCommission: job.platformCommission,
          status: "RELEASED",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        updateData.status = "PENDING_MUTUAL_CONFIRMATION";
      }

      await updateDoc(jobRef, updateData);
    } catch (err) {
      console.error("Error confirming completion:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-on-background">
            <ArrowLeft className="w-4 h-4" />
            <span>Worker Dashboard</span>
          </Link>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 lg:p-8 shadow-md space-y-6">
          <h1 className="text-2xl font-bold text-on-background">My Worker Reservations</h1>

          {loading ? (
            <div className="py-8 text-center text-xs text-on-surface-variant">Loading your accepted jobs...</div>
          ) : reservations.length === 0 ? (
            <div className="py-8 text-center text-xs text-on-surface-variant">No accepted reservations yet.</div>
          ) : (
            <div className="space-y-4">
              {reservations.map((job) => (
                <div key={job.id} className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-outline-variant pb-3">
                    <div>
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-primary-container text-on-primary-container uppercase">
                        {job.category}
                      </span>
                      <h3 className="font-bold text-lg text-on-background mt-1">{job.title}</h3>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>{job.worksiteAddress}</span>
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xl font-bold text-primary block">₹{job.workerEarnings}</span>
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant">{job.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-on-surface-variant">
                    <div>Dates: <strong>{job.startDate} to {job.endDate}</strong></div>
                    <div>Shift: <strong>{job.shiftStartTime} - {job.shiftEndTime}</strong> ({job.hoursPerDay}h/day)</div>
                    <div>Customer: <strong>{job.customerName || "Customer"}</strong></div>
                    <div>Customer Phone: <strong>{job.customerPhone || "Provided in call"}</strong></div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-outline-variant">
                    <button
                      onClick={() => setActiveCallJob(job)}
                      className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1.5 hover:bg-on-background transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Customer Direct</span>
                    </button>

                    {job.status !== "COMPLETED" && (
                      <button
                        onClick={() => handleConfirmCompletion(job)}
                        disabled={job.workerCompletionConfirmed}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 ${
                          job.workerCompletionConfirmed
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-secondary text-on-secondary hover:bg-on-background"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{job.workerCompletionConfirmed ? "Worker Confirmed ✓" : "Confirm Completion"}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeCallJob && (
        <CallModal
          isOpen={!!activeCallJob}
          onClose={() => setActiveCallJob(null)}
          targetName={activeCallJob.customerName || "Customer"}
          targetPhone={activeCallJob.customerPhone || "+919876543210"}
          targetRole="Job Customer"
          jobTitle={activeCallJob.title}
          lang={language}
        />
      )}
    </div>
  );
}
