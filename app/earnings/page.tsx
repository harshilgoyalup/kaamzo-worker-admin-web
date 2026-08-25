"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ArrowLeft, DollarSign, CheckCircle2, Clock } from "lucide-react";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Job } from "../../types";

export default function WorkerEarningsPage() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, "jobs"),
        where("workerId", "==", currentUser.uid)
      );
      const unsubscribe = onSnapshot(q, (snap) => {
        const list: Job[] = [];
        snap.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Job);
        });
        setJobs(list);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  const completedJobs = jobs.filter((j) => j.status === "COMPLETED");
  const totalEarned = completedJobs.reduce((acc, curr) => acc + (curr.workerEarnings || 0), 0);
  const pendingEarnings = jobs
    .filter((j) => ["ACCEPTED", "IN_PROGRESS", "PENDING_MUTUAL_CONFIRMATION"].includes(j.status))
    .reduce((acc, curr) => acc + (curr.workerEarnings || 0), 0);

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-on-background">
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 lg:p-8 shadow-md space-y-6">
          <h1 className="text-2xl font-bold text-on-background">Worker Earnings Overview</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant">
              <span className="text-xs text-on-surface-variant font-bold block mb-1">Total Released Earnings</span>
              <span className="text-3xl font-bold text-primary">₹{totalEarned}</span>
              <span className="text-xs text-secondary font-bold block mt-2">{completedJobs.length} Completed Jobs</span>
            </div>

            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant">
              <span className="text-xs text-on-surface-variant font-bold block mb-1">Pending / In-Escrow</span>
              <span className="text-3xl font-bold text-on-background">₹{pendingEarnings}</span>
              <span className="text-xs text-on-surface-variant block mt-2">Will release upon dual confirmation</span>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <h2 className="font-bold text-base text-on-background">Payout History</h2>

            {loading ? (
              <div className="py-4 text-xs text-on-surface-variant">Loading payouts...</div>
            ) : completedJobs.length === 0 ? (
              <div className="py-4 text-xs text-on-surface-variant">No completed payouts yet.</div>
            ) : (
              completedJobs.map((job) => (
                <div key={job.id} className="p-4 rounded-xl border border-outline-variant bg-surface-container-low flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-on-background text-sm">{job.title}</span>
                    <p className="text-on-surface-variant mt-0.5">{job.category} • {job.totalDays} Days</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-secondary block">₹{job.workerEarnings}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">RELEASED</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
