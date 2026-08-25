"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { ArrowLeft, TrendingUp, DollarSign, Award, Users } from "lucide-react";
import { db } from "../../../lib/firebase";
import { Job } from "../../../types";

export default function AdminAnalyticsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snap) => {
      const list: Job[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Job);
      });
      setJobs(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const gbv = jobs.reduce((acc, curr) => acc + (curr.totalCustomerPayment || 0), 0);
  const platformRevenue = jobs.reduce((acc, curr) => acc + (curr.platformCommission || 0), 0);
  const workerEarnings = jobs.reduce((acc, curr) => acc + (curr.workerEarnings || 0), 0);

  const tradeStats = jobs.reduce((acc: any, curr) => {
    const t = curr.category || "OTHER";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-on-background">
          <ArrowLeft className="w-4 h-4" />
          <span>Admin Dashboard</span>
        </Link>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 lg:p-8 shadow-md space-y-6">
          <h1 className="text-2xl font-bold text-on-background flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span>Financial Analytics & Business Metrics</span>
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant">
              <span className="text-xs text-on-surface-variant font-bold block mb-1">Gross Booking Volume (GBV)</span>
              <span className="text-2xl font-bold text-on-background">₹{gbv.toLocaleString()}</span>
              <span className="text-[10px] text-on-surface-variant block mt-1">SUM(totalCustomerPayment)</span>
            </div>

            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant">
              <span className="text-xs text-on-surface-variant font-bold block mb-1">Platform Revenue (20%)</span>
              <span className="text-2xl font-bold text-primary">₹{platformRevenue.toLocaleString()}</span>
              <span className="text-[10px] text-on-surface-variant block mt-1">SUM(platformCommission)</span>
            </div>

            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant">
              <span className="text-xs text-on-surface-variant font-bold block mb-1">Total Worker Payouts</span>
              <span className="text-2xl font-bold text-secondary">₹{workerEarnings.toLocaleString()}</span>
              <span className="text-[10px] text-on-surface-variant block mt-1">SUM(workerEarnings)</span>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <h2 className="font-bold text-base text-on-background">Breakdown by Trade Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {Object.entries(tradeStats).map(([tradeName, count]) => (
                <div key={tradeName} className="p-3 bg-surface-container-low rounded-xl border border-outline-variant flex justify-between items-center">
                  <span className="font-bold text-on-background">{tradeName}</span>
                  <span className="font-bold text-primary bg-primary-container px-2 py-0.5 rounded-full">{count as number} Jobs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
