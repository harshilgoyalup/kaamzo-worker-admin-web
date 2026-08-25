"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Job } from "../../types";

export default function WorkerCalendarPage() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, "jobs"),
        where("workerId", "==", currentUser.uid),
        where("status", "in", ["ACCEPTED", "IN_PROGRESS", "COMPLETED"])
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

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-on-background">
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 lg:p-8 shadow-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-on-background">Worker Shift Calendar</h1>
              <p className="text-xs text-on-surface-variant">Scheduled shift hours & active date locks</p>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-on-surface-variant">Loading calendar...</div>
          ) : jobs.length === 0 ? (
            <div className="py-8 text-center text-xs text-on-surface-variant">No scheduled shifts in your calendar.</div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="p-4 rounded-xl border border-outline-variant bg-surface-container-low flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-sm text-on-background">{job.title}</span>
                    <div className="text-on-surface-variant flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>{job.shiftStartTime} - {job.shiftEndTime} ({job.hoursPerDay} hrs/day)</span>
                    </div>
                    <div className="text-on-surface-variant flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                      <span>Dates: {job.startDate} to {job.endDate}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-primary text-sm block">₹{job.workerEarnings}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-secondary-container text-on-secondary-container">
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
