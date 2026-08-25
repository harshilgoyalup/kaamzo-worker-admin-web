"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, KeyRound, UserCheck } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";

export default function AdminLoginPage() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { currentUser, login, signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. First authenticate or sign up admin user in Firebase Auth
      let uid = currentUser?.uid;

      if (!uid) {
        // Try sign in with email fallback
        const adminEmail = `${adminId.toLowerCase()}@kaamzo.admin`;
        try {
          await login(adminEmail, password);
          uid = (await import("../../../lib/firebase")).auth.currentUser?.uid;
        } catch {
          // If user doesn't exist yet, sign up
          await signup("Bhavnoor (Admin)", adminEmail, password, "ADMIN", "en", "+919876543210");
          uid = (await import("../../../lib/firebase")).auth.currentUser?.uid;
        }
      }

      // 2. Call server-side bootstrap endpoint to grant ADMIN role safely
      const res = await fetch("/api/admin/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId,
          password,
          userUid: uid,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Admin authentication failed.");
      }

      // Successful admin login
      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error("Admin login error:", err);
      setError(err.message || "Invalid administrative credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 max-w-md w-full shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/40 rounded-bl-full pointer-events-none" />

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-on-background">Admin Central Command</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Restricted access. Protected by Firebase RBAC & Custom Claims.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container text-xs rounded-xl border border-error/20 font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Admin Identifier (ID)
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low text-on-background focus:outline-none focus:ring-2 focus:ring-secondary text-sm font-bold"
                placeholder="Bhavnoor"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Admin Access Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low text-on-background focus:outline-none focus:ring-2 focus:ring-secondary text-sm font-bold"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-secondary text-on-secondary font-bold text-sm hover:bg-on-background transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? "Verifying Credentials..." : "Authenticate Admin Access"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-on-surface-variant">
          Not an administrator?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Go to Worker Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
