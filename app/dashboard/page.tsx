"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Lock, CreditCard, LogOut, User, Clock } from "lucide-react";

type UserData = {
  name?: string;
  email?: string;
  createdAt?: string | Date | null;
  lastLogin?: string | Date | null;
  [key: string]: unknown;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [passwordCount, setPasswordCount] = useState<number | null>(null);
  const [cardCount, setCardCount] = useState<number | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // This ref will keep track of whether the first loading was shown or not.
  const initialLoadDone = useRef(false);

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch function is separated so that background refresh can be done.
  const fetchAllData = async (email: string, showLoading = true) => {
    const controller = new AbortController();

    try {
      if (showLoading) setLoading(true);

      const pwPromise = fetch(`/api/password?countOnly=true&email=${encodeURIComponent(email)}`, {
        signal: controller.signal,
      });
      const cardPromise = fetch(`/api/card?countOnly=true&email=${encodeURIComponent(email)}`, {
        signal: controller.signal,
      });
      const userPromise = fetch(`/api/user?email=${encodeURIComponent(email)}`, {
        signal: controller.signal,
      });

      const [pwRes, cardRes, userRes] = await Promise.all([pwPromise, cardPromise, userPromise]);

      if (pwRes.ok) {
        const pwJson = await pwRes.json();
        const pwCnt =
          typeof pwJson.count === "number"
            ? pwJson.count
            : Array.isArray(pwJson)
              ? pwJson.length
              : 0;
        setPasswordCount(pwCnt);
      }

      if (cardRes.ok) {
        const cardJson = await cardRes.json();
        const cCnt =
          typeof cardJson.count === "number"
            ? cardJson.count
            : Array.isArray(cardJson)
              ? cardJson.length
              : 0;
        setCardCount(cCnt);
      }

      if (userRes.ok) {
        const userJson = await userRes.json();
        setUserData(userJson);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        console.warn("Dashboard fetch error:", err);
        setPasswordCount(0);
        setCardCount(0);
        setUserData(null);
      }
    } finally {
      if (showLoading) setLoading(false);
    }

    return () => controller.abort();
  };

  // Loading will be shown when opening the dashboard for the first time
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;
    const email = session.user.email;
    if (!initialLoadDone.current) {
      fetchAllData(email, true).then(() => {
        initialLoadDone.current = true; // Shown loading once.
      });
    } else {
      // The background will refresh later, but the loading will not be shown.
      fetchAllData(email, false);
    }
  }, [status, session]);

  // Background refresh once every 2 minutes (without loading)
  useEffect(() => {
    if (!session?.user?.email) return;
    const interval = setInterval(() => {
      if (session.user?.email) {
        fetchAllData(session.user.email, false);
      }
    }, 120000);
    return () => clearInterval(interval);
  }, [session]);

  // If the tab is inactive (minimize / go to another tab), even if you re-fetch, it will not show loading.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && session?.user?.email) {
        // Only if it is in the background and comes back, the background will refresh, without loading.
        fetchAllData(session.user.email, false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [session]);

  // Loading screen will only be shown the first time
  if ((status === "loading" || loading) && !initialLoadDone.current) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg">
        Loading your dashboard...
      </div>
    );
  }

  if (!session) return null;

  const rawLastLogin = userData?.lastLogin ?? userData?.createdAt ?? null;
  const formattedLastLogin = rawLastLogin
    ? new Date(rawLastLogin).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
    : "--";

  return (
    <>
      <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 sm:pt-0 px-6">
        {/* Preserve animated gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-pink-600/20 to-purple-700/20 blur-3xl"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% 200%" }}
        />

        {/* Floating particles */}
        {Array.from({ length: 25 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 8 + 3 + "px",
              height: Math.random() * 8 + 3 + "px",
              background: `radial-gradient(circle, rgba(255,200,100,0.9), rgba(255,100,200,0.6))`,
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              filter: "blur(2px)",
            }}
            animate={{
              y: [0, Math.random() * -60, 0],
              x: [0, Math.random() * 60 - 30, 0],
              opacity: [0.8, 1, 0.8],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
        ))}

        {/* Dashboard Card (original colors/styles preserved) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 bg-background/70 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl p-6 sm:p-10 w-[95%] max-w-4xl mx-auto">
          {/* Top centered greeting */}
          <div className="mx-auto max-w-3xl text-center mb-6">
            <div className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-orange-400/22 via-pink-400/20 to-purple-400/16 backdrop-blur-sm border border-border/40">
              <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
                <span className="block sm:inline">Welcome,</span>{" "}
                <span className="block sm:inline">{session?.user?.name || "User"}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Logged in as <span className="font-medium text-foreground">{session?.user?.email}</span>
              </p>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-stretch gap-6">
            {/* Left Section */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-3 text-center sm:text-start text-foreground">Account Summary</h3>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-foreground">
                  {session.user?.image ? (
                    <img src={session.user.image} alt="avatar" className="w-8 h-8 rounded-full border border-border/40" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User size={16} className="text-blue-400" />
                    </div>
                  )}
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm text-foreground">Hello !&nbsp;</span>
                    <span className="font-medium text-foreground">{session?.user?.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-foreground">
                  <Lock size={18} className="text-orange-400" />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm text-foreground">Stored Passwords :&nbsp;</span>
                    <span className="font-medium text-foreground">{passwordCount ?? "--"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-foreground">
                  <CreditCard size={18} className="text-blue-400" />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm text-foreground">Saved Cards :&nbsp;</span>
                    <span className="font-medium text-foreground">{cardCount ?? "--"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-foreground">
                  <Clock size={18} className="text-yellow-400" />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm text-foreground md:mr-0 mr-1">Last Login :&nbsp;</span>
                    <span className="font-medium text-foreground">{formattedLastLogin || "--"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-[1px] bg-white/10 mx-2" />

            {/* Right Section */}
            <div className="flex-1 flex flex-col items-center md:items-start w-full">
              <h3 className="text-lg font-semibold mb-3 text-foreground text-center sm:text-start">Action Buttons</h3>

              <div className="flex flex-col gap-3 w-full">
                <Button onClick={() => router.push("/my-passwords")} className="bg-gradient-to-r from-orange-400 to-pink-500 hover:opacity-90 py-5 w-full text-foreground font-medium">
                  <Lock className="mr-2 h-4 w-4" /> My Passwords
                </Button>

                <Button onClick={() => router.push("/my-cards")} className="bg-gradient-to-r from-indigo-500 to-teal-500 hover:opacity-90 py-5 w-full text-foreground font-medium">
                  <CreditCard className="mr-2 h-4 w-4" /> My Cards
                </Button>

                <Button onClick={() => signOut({ callbackUrl: "/" })} className="bg-gradient-to-r from-rose-500 to-red-500 hover:opacity-90 py-5 w-full text-foreground font-medium">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Signature with glowing underline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="my-8 text-sm text-muted-foreground relative z-10">
          Designed & Built with ❤️ by{" "}
          <span className="font-medium text-transparent bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text relative">
            Debasish Seal
            <motion.span
              layoutId="underline"
              className="absolute left-0 bottom-0 w-full h-[2px] bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 rounded-full shadow-[0_0_8px_rgba(255,150,150,0.7)]"
              animate={{
                opacity: [0.6, 1, 0.6],
                scaleX: [0.8, 1.1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </span>
        </motion.p>
      </main>
    </>
  );
}