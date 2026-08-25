"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, doc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { ArrowLeft, AlertOctagon, CheckCircle2 } from "lucide-react";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { Dispute } from "../../../types";

export default function AdminDisputesPage() {
  const { currentUser } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "disputes"), (snap) => {
      const list: Dispute[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Dispute);
      });
      setDisputes(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleResolveDispute = async (dispute: Dispute, resolution: "RESOLVED_REFUND_CUSTOMER" | "RESOLVED_PAY_WORKER") => {
    try {
      await updateDoc(doc(db, "disputes", dispute.id), {
        status: resolution,
        resolvedByAdminUid: currentUser?.uid,
        updatedAt: serverTimestamp(),
      });

      // Update associated job status
      await updateDoc(doc(db, "jobs", dispute.jobId), {
        status: resolution === "RESOLVED_REFUND_CUSTOMER" ? "CANCELLED" : "COMPLETED",
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "auditLogs"), {
        adminUid: currentUser?.uid,
        adminEmail: currentUser?.email || "Bhavnoor Admin",
        action: `ADMIN_RESOLVE_DISPUTE_${resolution}`,
        targetId: dispute.id,
        targetType: "JOB",
        details: { jobId: dispute.jobId, reason: dispute.reason },
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-on-background">
          <ArrowLeft className="w-4 h-4" />
          <span>Admin Dashboard</span>
        </Link>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 lg:p-8 shadow-md space-y-6">
          <h1 className="text-2xl font-bold text-on-background flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-error" />
            <span>Dispute Resolution Center</span>
          </h1>

          {loading ? (
            <div className="py-8 text-center text-xs text-on-surface-variant">Loading dispute cases...</div>
          ) : disputes.length === 0 ? (
            <div className="py-8 text-center text-xs text-on-surface-variant">No active disputes reported.</div>
          ) : (
            <div className="space-y-3">
              {disputes.map((d) => (
                <div key={d.id} className="p-4 rounded-xl border border-outline-variant bg-surface-container-low space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-on-background">Job ID: #{d.jobId.slice(0, 8)}</span>
                      <p className="text-on-surface-variant mt-1">Reason: "{d.reason}"</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">Raised by: {d.raisedByRole}</p>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-amber-100 text-amber-800">
                      {d.status}
                    </span>
                  </div>

                  {d.status === "OPEN" && (
                    <div className="flex gap-2 pt-2 border-t border-outline-variant">
                      <button
                        onClick={() => handleResolveDispute(d, "RESOLVED_REFUND_CUSTOMER")}
                        className="px-3 py-1.5 rounded-lg bg-error text-on-error font-bold text-[10px]"
                      >
                        Refund Customer
                      </button>
                      <button
                        onClick={() => handleResolveDispute(d, "RESOLVED_PAY_WORKER")}
                        className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-bold text-[10px]"
                      >
                        Release Payment to Worker
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
