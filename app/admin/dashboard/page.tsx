"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  AlertOctagon,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  LogOut,
  RefreshCw,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { Job, User as KaamzoUser } from "../../../types";

export default function AdminDashboardPage() {
  const { currentUser, userProfile, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [usersList, setUsersList] = useState<KaamzoUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [overrideJobId, setOverrideJobId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/admin/login");
      return;
    }

    if (currentUser) {
      // 1. Listen to all jobs for financial analytics & live monitoring
      const unsubJobs = onSnapshot(collection(db, "jobs"), (snap) => {
        const list: Job[] = [];
        snap.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Job);
        });
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setJobs(list);
      });

      // 2. Listen to all users
      const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
        const list: KaamzoUser[] = [];
        snap.forEach((docSnap) => {
          list.push({ uid: docSnap.id, ...docSnap.data() } as KaamzoUser);
        });
        setUsersList(list);
        setLoading(false);
      });

      return () => {
        unsubJobs();
        unsubUsers();
      };
    }
  }, [currentUser, authLoading, router]);

  // Financial Analytics Calculations
  const completedJobs = jobs.filter((j) => j.status === "COMPLETED");
  const gbv = jobs.reduce((acc, curr) => acc + (curr.totalCustomerPayment || 0), 0);
  const platformRevenue = jobs.reduce((acc, curr) => acc + (curr.platformCommission || 0), 0);
  const totalWorkerEarnings = jobs.reduce((acc, curr) => acc + (curr.workerEarnings || 0), 0);
  const activeReservations = jobs.filter((j) => ["ACCEPTED", "IN_PROGRESS", "PENDING_MUTUAL_CONFIRMATION"].includes(j.status));

  // Manual Override: Force Complete Job
  const handleForceComplete = async (job: Job) => {
    if (!confirm(`Are you sure you want to FORCE COMPLETE Job #${job.id.slice(0, 8)}?`)) return;
    setOverrideJobId(job.id);

    try {
      await updateDoc(doc(db, "jobs", job.id), {
        status: "COMPLETED",
        customerCompletionConfirmed: true,
        workerCompletionConfirmed: true,
        updatedAt: serverTimestamp(),
      });

      // Audit Log Creation
      await addDoc(collection(db, "auditLogs"), {
        adminUid: currentUser?.uid,
        adminEmail: currentUser?.email || "Bhavnoor Admin",
        action: "ADMIN_FORCE_COMPLETE_JOB",
        targetId: job.id,
        targetType: "JOB",
        details: { previousStatus: job.status, totalPayment: job.totalCustomerPayment },
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Force complete error:", err);
    } finally {
      setOverrideJobId(null);
    }
  };

  // Manual Override: Clear Schedule Lock / Cancel Reservation
  const handleClearScheduleLock = async (job: Job) => {
    if (!confirm(`Clear schedule lock and CANCEL reservation for Job #${job.id.slice(0, 8)}?`)) return;
    setOverrideJobId(job.id);

    try {
      await updateDoc(doc(db, "jobs", job.id), {
        status: "CANCELLED",
        workerId: null,
        workerName: null,
        updatedAt: serverTimestamp(),
      });

      // Audit Log Creation
      await addDoc(collection(db, "auditLogs"), {
        adminUid: currentUser?.uid,
        adminEmail: currentUser?.email || "Bhavnoor Admin",
        action: "ADMIN_CLEAR_SCHEDULE_LOCK",
        targetId: job.id,
        targetType: "JOB",
        details: { freedWorkerId: job.workerId },
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Clear schedule lock error:", err);
    } finally {
      setOverrideJobId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-surface-container-low border-b md:border-b-0 md:border-r border-outline-variant p-4 md:p-6 shrink-0 flex md:flex-col justify-between items-center md:items-start">
        <div className="w-full space-y-6">
          <Link href="/admin/dashboard" className="font-bold text-2xl tracking-tight text-primary block">
            KAAMZO <span className="text-xs font-normal text-secondary bg-secondary-container px-2 py-0.5 rounded-full">ADMIN</span>
          </Link>

          <div className="hidden md:flex items-center gap-3 p-3 bg-surface border border-outline-variant rounded-xl">
            <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">
              A
            </div>
            <div>
              <p className="font-bold text-sm text-on-background">Bhavnoor Admin</p>
              <p className="text-[10px] text-on-surface-variant">Central Command</p>
            </div>
          </div>

          <div className="hidden md:flex flex-col gap-2">
            <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 bg-secondary-container text-on-secondary-container rounded-xl font-bold text-xs">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl font-bold text-xs transition-colors">
              <Users className="w-4 h-4" />
              <span>User & Worker Verification</span>
            </Link>
            <Link href="/admin/reservations" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl font-bold text-xs transition-colors">
              <Briefcase className="w-4 h-4" />
              <span>Reservation Monitor</span>
            </Link>
            <Link href="/admin/disputes" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl font-bold text-xs transition-colors">
              <AlertOctagon className="w-4 h-4" />
              <span>Disputes & Refunds</span>
            </Link>
            <Link href="/admin/analytics" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl font-bold text-xs transition-colors">
              <TrendingUp className="w-4 h-4" />
              <span>Financial Analytics</span>
            </Link>
            <Link href="/admin/audit" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl font-bold text-xs transition-colors">
              <FileText className="w-4 h-4" />
              <span>Audit Logs</span>
            </Link>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="hidden md:flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-error transition-colors mt-auto pt-4 border-t border-outline-variant w-full"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Admin</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-on-background">Central Command Dashboard</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Live platform metrics, financial analytics, reservation monitoring & authoritative overrides.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>RBAC Protected</span>
          </span>
        </div>

        {/* Financial Analytics Bento Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold text-on-surface-variant block">Gross Booking Volume (GBV)</span>
            <div className="text-2xl font-bold text-on-background">₹{gbv.toLocaleString()}</div>
            <span className="text-[10px] text-on-surface-variant block">Total Customer Payments</span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold text-on-surface-variant block">Platform Revenue (20%)</span>
            <div className="text-2xl font-bold text-primary">₹{platformRevenue.toLocaleString()}</div>
            <span className="text-[10px] text-on-surface-variant block">Commission Earned</span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold text-on-surface-variant block">Worker Payouts</span>
            <div className="text-2xl font-bold text-secondary">₹{totalWorkerEarnings.toLocaleString()}</div>
            <span className="text-[10px] text-on-surface-variant block">Worker Labor Share</span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold text-on-surface-variant block">Active Reservations</span>
            <div className="text-2xl font-bold text-on-background">{activeReservations.length}</div>
            <span className="text-[10px] text-on-surface-variant block">{usersList.length} Total Registered Users</span>
          </div>
        </div>

        {/* Live Reservation Monitor with Manual Overrides */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-on-background flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <span>Live Reservation Stream & Overrides</span>
            </h2>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Job ID & Title</th>
                    <th className="p-4">Trade</th>
                    <th className="p-4">Customer / Worker</th>
                    <th className="p-4">GBV / Comm</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Manual Overrides</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-on-surface-variant">
                        No jobs currently created in Firestore.
                      </td>
                    </tr>
                  ) : (
                    jobs.map((j) => (
                      <tr key={j.id} className="hover:bg-surface-container-low/50">
                        <td className="p-4">
                          <strong className="text-on-background text-sm block">{j.title}</strong>
                          <span className="text-[10px] text-on-surface-variant">#{j.id.slice(0, 8)} • {j.worksiteAddress}</span>
                        </td>
                        <td className="p-4 font-bold text-primary">{j.category}</td>
                        <td className="p-4">
                          <div>Cust: <strong className="text-on-background">{j.customerName || "Customer"}</strong></div>
                          <div>Work: <strong className="text-secondary">{j.workerName || "Unassigned"}</strong></div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-on-background">₹{j.totalCustomerPayment}</div>
                          <div className="text-[10px] text-primary">Comm: ₹{j.platformCommission}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold bg-secondary-container text-on-secondary-container">
                            {j.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {j.status !== "COMPLETED" && (
                            <button
                              onClick={() => handleForceComplete(j)}
                              disabled={overrideJobId === j.id}
                              className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-[10px] hover:bg-emerald-800 disabled:opacity-50"
                            >
                              Force Complete
                            </button>
                          )}
                          {j.status !== "CANCELLED" && (
                            <button
                              onClick={() => handleClearScheduleLock(j)}
                              disabled={overrideJobId === j.id}
                              className="px-3 py-1.5 rounded-lg bg-error text-on-error font-bold text-[10px] hover:bg-error/80 disabled:opacity-50"
                            >
                              Clear Lock
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
