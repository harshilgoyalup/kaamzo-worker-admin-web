"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, doc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { ArrowLeft, Briefcase } from "lucide-react";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { Job } from "../../../types";

export default function AdminReservationsPage() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snap) => {
      const list: Job[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Job);
      });
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setJobs(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleForceStatus = async (job: Job, status: string) => {
    try {
      await updateDoc(doc(db, "jobs", job.id), {
        status,
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "auditLogs"), {
        adminUid: currentUser?.uid,
        adminEmail: currentUser?.email || "Bhavnoor Admin",
        action: `ADMIN_FORCE_STATUS_${status}`,
        targetId: job.id,
        targetType: "JOB",
        details: { previousStatus: job.status },
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 flex flex-col items-center">
      <div className="max-w-5xl w-full space-y-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-on-background">
          <ArrowLeft className="w-4 h-4" />
          <span>Admin Dashboard</span>
        </Link>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 lg:p-8 shadow-md space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-on-background flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-primary" />
              <span>Live Reservation Monitor</span>
            </h1>
            <span className="text-xs font-bold text-primary bg-primary-container px-3 py-1 rounded-full">
              {jobs.length} Total Jobs
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-on-surface-variant">Loading live reservations...</div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="p-4 rounded-xl border border-outline-variant bg-surface-container-low flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div>
                    <span className="font-bold text-sm text-on-background">{job.title}</span>
                    <span className="text-on-surface-variant ml-2">({job.category})</span>
                    <p className="text-on-surface-variant mt-0.5">{job.worksiteAddress}</p>
                    <p className="text-on-surface-variant">
                      Customer: <strong>{job.customerName}</strong> • Worker: <strong>{job.workerName || "None"}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold bg-secondary-container text-on-secondary-container">
                      {job.status}
                    </span>
                    <button
                      onClick={() => handleForceStatus(job, "COMPLETED")}
                      className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold text-[10px]"
                    >
                      Force Complete
                    </button>
                    <button
                      onClick={() => handleForceStatus(job, "CANCELLED")}
                      className="px-2.5 py-1 rounded-lg bg-error text-on-error font-bold text-[10px]"
                    >
                      Cancel Lock
                    </button>
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
