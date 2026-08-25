"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  runTransaction,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import {
  Briefcase,
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  Phone,
  User,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { getTranslation } from "../../lib/translations";
import { useSpeech } from "../../hooks/useSpeech";
import { hasReservationConflict, getConflictMessage } from "../../lib/schedule";
import { Job } from "../../types";

export default function WorkerDashboardPage() {
  const { currentUser, userProfile, loading: authLoading, logout } = useAuth();
  const { language } = useLanguage();
  const t = getTranslation(language);
  const { speak, isSpeaking, stop } = useSpeech();
  const router = useRouter();

  const [openJobs, setOpenJobs] = useState<Job[]>([]);
  const [myReservations, setMyReservations] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionJobId, setActionJobId] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState<{ jobId: string; msg: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
      return;
    }

    if (currentUser) {
      // 1. Listen to Open Jobs Feed
      const qOpen = query(collection(db, "jobs"), where("status", "==", "RESERVATION_OPEN"));
      const unsubOpen = onSnapshot(qOpen, (snap) => {
        const list: Job[] = [];
        snap.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Job);
        });
        list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setOpenJobs(list);
      });

      // 2. Listen to Worker's Accepted & Active Reservations for conflict checking
      const qMine = query(
        collection(db, "jobs"),
        where("workerId", "==", currentUser.uid),
        where("status", "in", ["ACCEPTED", "IN_PROGRESS"])
      );
      const unsubMine = onSnapshot(qMine, (snap) => {
        const list: Job[] = [];
        snap.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Job);
        });
        setMyReservations(list);
        setLoading(false);
      });

      return () => {
        unsubOpen();
        unsubMine();
      };
    }
  }, [currentUser, authLoading, router]);

  const handleTTSOverview = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(
        `Welcome ${userProfile?.name || "Worker"}. You have ${openJobs.length} open reservations available in your feed.`,
        language
      );
    }
  };

  const handleAcceptReservation = async (targetJob: Job) => {
    if (!currentUser || !userProfile) return;
    setActionJobId(targetJob.id);
    setConflictError(null);

    // Step A: Client-side Double Booking Pre-check
    for (const existing of myReservations) {
      if (
        hasReservationConflict(
          {
            startDate: targetJob.startDate,
            endDate: targetJob.endDate,
            shiftStartTime: targetJob.shiftStartTime,
            shiftEndTime: targetJob.shiftEndTime,
          },
          {
            startDate: existing.startDate,
            endDate: existing.endDate,
            shiftStartTime: existing.shiftStartTime,
            shiftEndTime: existing.shiftEndTime,
          }
        )
      ) {
        const localizedMsg = getConflictMessage(language);
        setConflictError({ jobId: targetJob.id, msg: localizedMsg });
        setActionJobId(null);
        return;
      }
    }

    // Step B: Authoritative Server-side Firestore Transaction (Race Condition & Double Booking Protection)
    try {
      await runTransaction(db, async (transaction) => {
        const jobRef = doc(db, "jobs", targetJob.id);
        const jobSnap = await transaction.get(jobRef);

        if (!jobSnap.exists()) {
          throw new Error("JOB_NOT_FOUND");
        }

        const jobData = jobSnap.data() as Job;

        if (jobData.status !== "RESERVATION_OPEN") {
          throw new Error("JOB_ALREADY_CLAIMED");
        }

        // Fetch worker's active reservations inside transaction for authoritative check
        const workerJobsQuery = query(
          collection(db, "jobs"),
          where("workerId", "==", currentUser.uid),
          where("status", "in", ["ACCEPTED", "IN_PROGRESS"])
        );
        const workerJobsSnap = await getDocs(workerJobsQuery);

        let conflictFound = false;
        workerJobsSnap.forEach((docSnap) => {
          const activeRes = docSnap.data() as Job;
          if (
            hasReservationConflict(
              {
                startDate: jobData.startDate,
                endDate: jobData.endDate,
                shiftStartTime: jobData.shiftStartTime,
                shiftEndTime: jobData.shiftEndTime,
              },
              {
                startDate: activeRes.startDate,
                endDate: activeRes.endDate,
                shiftStartTime: activeRes.shiftStartTime,
                shiftEndTime: activeRes.shiftEndTime,
              }
            )
          ) {
            conflictFound = true;
          }
        });

        if (conflictFound) {
          throw new Error("DOUBLE_BOOKING_CONFLICT");
        }

        // Atomic claim assignment
        transaction.update(jobRef, {
          workerId: currentUser.uid,
          workerName: userProfile.name,
          workerPhone: userProfile.phone || "",
          status: "ACCEPTED",
          updatedAt: serverTimestamp(),
        });
      });

      // Navigate to active reservations
      router.push("/reservations");
    } catch (err: any) {
      console.error("Accept reservation transaction error:", err);
      if (err.message === "DOUBLE_BOOKING_CONFLICT") {
        setConflictError({ jobId: targetJob.id, msg: getConflictMessage(language) });
      } else if (err.message === "JOB_ALREADY_CLAIMED") {
        setConflictError({
          jobId: targetJob.id,
          msg: "This job was just claimed by another worker.",
        });
      } else {
        setConflictError({
          jobId: targetJob.id,
          msg: err.message || "Failed to accept job. Please try again.",
        });
      }
    } finally {
      setActionJobId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-surface-container-low border-b md:border-b-0 md:border-r border-outline-variant p-4 md:p-6 shrink-0 flex md:flex-col justify-between items-center md:items-start">
        <div className="w-full space-y-6">
          <Link href="/dashboard" className="font-bold text-2xl tracking-tight text-primary block">
            {t.brandName} <span className="text-xs text-on-surface-variant font-normal">Worker</span>
          </Link>

          <div className="hidden md:flex items-center gap-3 p-3 bg-surface border border-outline-variant rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
              {userProfile?.name ? userProfile.name[0] : "W"}
            </div>
            <div>
              <p className="font-bold text-sm text-on-background">{userProfile?.name}</p>
              <span className="text-[10px] uppercase font-bold text-primary bg-primary-container px-2 py-0.5 rounded-full inline-block mt-0.5">
                {userProfile?.trade || "SKILLED WORKER"}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 bg-secondary-container text-on-secondary-container rounded-xl font-bold text-xs"
            >
              <Briefcase className="w-4 h-4" />
              <span>Open Job Feed</span>
            </Link>

            <Link
              href="/reservations"
              className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl font-bold text-xs transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>My Reservations ({myReservations.length})</span>
            </Link>

            <Link
              href="/calendar"
              className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl font-bold text-xs transition-colors"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Shift Calendar</span>
            </Link>

            <Link
              href="/earnings"
              className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl font-bold text-xs transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              <span>Earnings</span>
            </Link>

            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl font-bold text-xs transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Profile & KYC</span>
            </Link>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="hidden md:flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-error transition-colors mt-auto pt-4 border-t border-outline-variant w-full"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.logout}</span>
        </button>
      </nav>

      {/* Main Open Reservation Feed */}
      <main className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Live Job Feed</span>
            <h1 className="text-2xl font-bold text-on-background mt-1">Available Labor Reservations</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Review worksite details, hourly rates, daily earnings, and claim shifts instantly.
            </p>
          </div>

          <button
            onClick={handleTTSOverview}
            className={`p-2.5 rounded-full flex items-center gap-1.5 text-xs font-bold shrink-0 ${
              isSpeaking ? "bg-primary text-on-primary animate-pulse" : "bg-primary-container text-on-primary-container"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Listen Feed</span>
          </button>
        </div>

        {/* Open Jobs List */}
        {openJobs.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center space-y-3">
            <Briefcase className="w-10 h-10 text-outline mx-auto" />
            <h3 className="font-bold text-base text-on-background">No open reservations available</h3>
            <p className="text-xs text-on-surface-variant">
              New customer booking requests will appear here automatically via Firestore real-time listeners.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openJobs.map((job) => {
              const dailyEarnings = job.hourlyRate * job.hoursPerDay;
              const hasErr = conflictError?.jobId === job.id;

              return (
                <div
                  key={job.id}
                  className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-secondary-container text-on-secondary-container">
                        {job.category}
                      </span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary">₹{job.workerEarnings}</span>
                        <span className="text-[10px] text-on-surface-variant block">Total Worker Earnings</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-on-background">{job.title}</h3>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1 line-clamp-2">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{job.worksiteAddress}</span>
                      </p>
                    </div>

                    {/* Job Details Pill Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-3 rounded-xl border border-outline-variant text-center text-xs">
                      <div>
                        <span className="text-on-surface-variant block text-[10px]">Hourly Rate</span>
                        <strong className="text-on-background">₹{job.hourlyRate}/hr</strong>
                      </div>
                      <div>
                        <span className="text-on-surface-variant block text-[10px]">Daily Earnings</span>
                        <strong className="text-secondary">₹{dailyEarnings}</strong>
                      </div>
                      <div>
                        <span className="text-on-surface-variant block text-[10px]">Shift Hours</span>
                        <strong className="text-on-background">{job.hoursPerDay}h / day</strong>
                      </div>
                    </div>

                    <div className="text-xs space-y-1 text-on-surface-variant pt-1">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                        <span>
                          Dates: <strong>{job.startDate}</strong> to <strong>{job.endDate}</strong> ({job.totalDays} days)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>Shift Time: {job.shiftStartTime} - {job.shiftEndTime}</span>
                      </div>
                    </div>

                    {/* Double-Booking Conflict Alert Box */}
                    {hasErr && (
                      <div className="p-3 bg-error-container text-on-error-container rounded-xl text-xs font-bold flex items-start gap-2 border border-error/20 animate-in fade-in">
                        <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                        <span>{conflictError.msg}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleAcceptReservation(job)}
                    disabled={actionJobId === job.id}
                    className="w-full py-3.5 px-4 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-on-background transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionJobId === job.id ? (
                      "Verifying Schedule & Claiming..."
                    ) : (
                      <>
                        <span>Accept Reservation</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
