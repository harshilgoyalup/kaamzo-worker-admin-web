import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Initialize Firebase Admin SDK safely
if (!getApps().length) {
  try {
    const serviceAccount = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT)
      : undefined;

    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      initializeApp();
    }
  } catch (err) {
    console.warn("Firebase Admin SDK init fallback (running without cert env):", err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminId, password, userUid } = body;

    // Secure initial administrative check
    if (adminId === "Bhavnoor" && password === "bhavnoorfood@2012") {
      if (!userUid) {
        return NextResponse.json({ error: "User UID is required" }, { status: 400 });
      }

      // Assign ADMIN Custom Claim via Admin SDK if available, or update Firestore
      try {
        const adminAuth = getAuth();
        await adminAuth.setCustomUserClaims(userUid, { role: "ADMIN" });
      } catch (e) {
        console.warn("Set custom claims warning:", e);
      }

      try {
        const adminDb = getFirestore();
        await adminDb.collection("users").doc(userUid).set(
          {
            role: "ADMIN",
            name: "Bhavnoor (Admin)",
            verificationStatus: "VERIFIED",
            updatedAt: new Date(),
          },
          { merge: true }
        );
      } catch (e) {
        console.warn("Firestore update warning:", e);
      }

      return NextResponse.json({ success: true, message: "Admin role granted successfully." });
    }

    return NextResponse.json({ error: "Invalid administrative credentials." }, { status: 401 });
  } catch (err: any) {
    console.error("Bootstrap API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
