"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { User, UserRole, Language, TradeType } from "../types";

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    pass: string,
    role: UserRole,
    preferredLanguage?: Language,
    phone?: string,
    trade?: TradeType
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateLanguagePreference: (lang: Language) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setUserProfile(snap.data() as User);
          } else {
            setUserProfile({
              uid: user.uid,
              name: user.displayName || user.email?.split("@")[0] || "User",
              email: user.email || "",
              role: "WORKER",
              preferredLanguage: "en",
              verificationStatus: "PENDING",
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (
    name: string,
    email: string,
    pass: string,
    role: UserRole = "WORKER",
    preferredLanguage: Language = "en",
    phone: string = "",
    trade?: TradeType
  ) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = res.user.uid;

    const hourlyRates: Record<string, number> = {
      CARPENTER: 225,
      PLUMBER: 299,
      MASON: 150,
      PAINTER: 125,
      UNSKILLED_LABOUR: 100,
    };

    const newUserDoc: any = {
      uid,
      name,
      email,
      phone,
      role,
      preferredLanguage,
      verificationStatus: role === "WORKER" ? "PENDING" : "VERIFIED",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (role === "WORKER") {
      if (trade) {
        newUserDoc.trade = trade;
        newUserDoc.hourlyRate = hourlyRates[trade] || 100;
      }
      newUserDoc.totalJobsCompleted = 0;
      newUserDoc.totalEarnings = 0;
    }

    await setDoc(doc(db, "users", uid), newUserDoc);
    setUserProfile(newUserDoc as User);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const updateLanguagePreference = async (lang: Language) => {
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { preferredLanguage: lang, updatedAt: serverTimestamp() });
    }
    if (userProfile) {
      setUserProfile({ ...userProfile, preferredLanguage: lang });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        login,
        signup,
        logout,
        updateLanguagePreference,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
