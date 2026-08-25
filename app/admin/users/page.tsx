"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, doc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { ArrowLeft, Users, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { User as KaamzoUser } from "../../../types";

export default function AdminUsersPage() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<KaamzoUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snap) => {
      const list: KaamzoUser[] = [];
      snap.forEach((docSnap) => {
        list.push({ uid: docSnap.id, ...docSnap.data() } as KaamzoUser);
      });
      setUsers(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleVerification = async (user: KaamzoUser, newStatus: "VERIFIED" | "REJECTED") => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        verificationStatus: newStatus,
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, "auditLogs"), {
        adminUid: currentUser?.uid,
        adminEmail: currentUser?.email || "Bhavnoor Admin",
        action: `ADMIN_${newStatus}_WORKER`,
        targetId: user.uid,
        targetType: "USER",
        details: { targetEmail: user.email, role: user.role },
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Verification update error:", err);
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
              <Users className="w-6 h-6 text-primary" />
              <span>User & Worker Verification Management</span>
            </h1>
            <span className="text-xs font-bold text-primary bg-primary-container px-3 py-1 rounded-full">
              {users.length} Total Users
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-on-surface-variant">Loading user directory...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant uppercase text-[10px]">
                  <tr>
                    <th className="p-3">User Profile</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Trade / Rate</th>
                    <th className="p-3">Verification Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {users.map((u) => (
                    <tr key={u.uid} className="hover:bg-surface-container-low/50">
                      <td className="p-3">
                        <strong className="text-on-background font-bold block">{u.name}</strong>
                        <span className="text-[10px] text-on-surface-variant">{u.email} • {u.phone || "No phone"}</span>
                      </td>
                      <td className="p-3 font-bold text-primary">{u.role}</td>
                      <td className="p-3 font-bold text-on-background">
                        {u.trade ? `${u.trade} (₹${u.hourlyRate}/hr)` : "N/A"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                            u.verificationStatus === "VERIFIED"
                              ? "bg-emerald-100 text-emerald-800"
                              : u.verificationStatus === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {u.verificationStatus || "VERIFIED"}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {u.verificationStatus !== "VERIFIED" && (
                          <button
                            onClick={() => handleToggleVerification(u, "VERIFIED")}
                            className="px-3 py-1 rounded-lg bg-emerald-700 text-white font-bold text-[10px] hover:bg-emerald-800"
                          >
                            Approve
                          </button>
                        )}
                        {u.verificationStatus !== "REJECTED" && (
                          <button
                            onClick={() => handleToggleVerification(u, "REJECTED")}
                            className="px-3 py-1 rounded-lg bg-error text-on-error font-bold text-[10px] hover:bg-error/80"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
