"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import { db } from "../../../lib/firebase";
import { AuditLog } from "../../../types";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "auditLogs"), (snap) => {
      const list: AuditLog[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as AuditLog);
      });
      list.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setLogs(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
              <FileText className="w-6 h-6 text-primary" />
              <span>Immutable Administrative Audit Logs</span>
            </h1>
            <span className="text-xs font-bold text-primary bg-primary-container px-3 py-1 rounded-full">
              {logs.length} Log Entries
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-on-surface-variant">Loading audit trail...</div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-xs text-on-surface-variant">No administrative actions logged yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Admin Email</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target ID & Type</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-container-low/50">
                      <td className="p-3 font-bold text-on-background">{log.adminEmail}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-secondary-container text-on-secondary-container">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-on-surface-variant font-mono">
                        {log.targetType}: #{log.targetId ? log.targetId.slice(0, 8) : "N/A"}
                      </td>
                      <td className="p-3 text-on-surface-variant text-[10px] font-mono">
                        {JSON.stringify(log.details || {})}
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
