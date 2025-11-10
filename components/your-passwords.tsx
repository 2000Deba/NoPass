"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, Eye, EyeOff, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { usePasswords } from "@/app/context/PasswordsContext";
import { motion } from "framer-motion";

interface StoredPassword {
  _id: string;
  website: string;
  username: string;
  password: string;
  createdAt?: string;
}

interface YourPasswordsProps {
  refreshTrigger?: number;
}

export function YourPasswords({ refreshTrigger }: YourPasswordsProps) {
  const { data: session } = useSession();
  const [passwords, setPasswords] = useState<StoredPassword[]>([]);
  const [loading, setLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const { hiddenId, startEditPassword } = usePasswords();

  // Helper: extract timestamp
  const getItemTimestamp = (item: StoredPassword) => {
    if (item.createdAt) {
      const t = Date.parse(item.createdAt);
      if (!isNaN(t)) return t;
    }

    try {
      const hex = item._id?.toString().slice(0, 8);
      if (hex && /^[0-9a-fA-F]+$/.test(hex)) {
        return parseInt(hex, 16) * 1000;
      }
    } catch (e) { }
    return 0;
  };

  // Fetch passwords from API
  const fetchPasswords = async () => {
    if (!session) {
      // If there is no session, only show demo data.
      setPasswords([
        {
          _id: "demo",
          website: "Gmail",
          username: "john@gmail.com",
          password: "SecurePassword123!",
          createdAt: new Date().toISOString(),
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/password");
      const data = await res.json();

      if (res.ok) {
        const items: StoredPassword[] = data.data || [];

        const sorted = items.slice().sort((a, b) => {
          const ta = getItemTimestamp(a);
          const tb = getItemTimestamp(b);
          return tb - ta;
        });

        setPasswords(sorted);
      } else {
        toast.error(data.error || "Failed to fetch passwords");
      }
    } catch (err) {
      console.error("Error fetching passwords:", err);
      toast.error("Something went wrong while loading passwords.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount or refreshTrigger change
  useEffect(() => {
    let active = true;
    (async () => {
      await fetchPasswords();
      if (!active) return;
    })();
    return () => { active = false };
  }, [session, refreshTrigger]);

  // Delete password
  const handleDelete = async (id: string) => {
    if (!session) return toast.error("You must be logged in to delete a password");

    // Step 1: Ask for confirmation before deleting
    const confirmed = window.confirm("Are you sure you want to delete this password?");
    if (!confirmed) {
      toast.error("Delete cancelled");
      return;
    }

    try {
      const res = await fetch(`/api/password?id=${id}`, { method: "DELETE" });
      const result = await res.json();

      if (res.ok) {
        setPasswords((prev) => prev.filter((pwd) => pwd._id !== id));
        toast.success("Password deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete password");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting password");
    }
  };

  // Copy password
  const handleCopy = (text: string) => {
    if (!session) {
      toast.error("You must be logged in to copy a password");
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success("Password copied!");
  };

  // Toggle visibility
  const togglePasswordVisibility = (id: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(id)) newVisible.delete(id);
    else newVisible.add(id);
    setVisiblePasswords(newVisible);
  };

  // -------------------
  // Edit Handler
  // -------------------
  const handleEditClick = (pwd: StoredPassword) => {
    if (!session) {
      toast.error("You must be logged in to edit a password");
      return;
    }
    startEditPassword(pwd);
  };

  // -------------------
  // Render
  // -------------------

  if (loading) {
    return (
      <Card className="bg-white/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 backdrop-blur-sm border-dashed">
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">
            Loading your passwords...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 w-full max-w-6xl">
        <div className="space-y-3">
          {passwords.length === 0 ? (
            <Card className="bg-white/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 backdrop-blur-sm border-dashed">
              <CardContent className="py-6">
                <p className="text-center text-muted-foreground">
                  No passwords saved yet
                </p>
              </CardContent>
            </Card>
          ) : (
            passwords.filter((pwd) => pwd._id !== hiddenId).map((pwd) => (
              <Card key={pwd._id} className="overflow-hidden bg-white/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        Website/Service:{" "}
                        <Link
                          href={pwd.website.startsWith("http") ? pwd.website : `https://${pwd.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all">
                          {pwd.website}
                        </Link>
                      </CardTitle>
                      <CardDescription className="break-all py-7.5">
                        Username/Email: {pwd.username}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(pwd)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Edit">
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(pwd._id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center gap-2 p-3 bg-slate-100 dark:bg-slate-700/60 rounded-lg font-mono text-sm mb-2">
                    <span>
                      {visiblePasswords.has(pwd._id)
                        ? pwd.password
                        : "•".repeat(pwd.password.length)}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePasswordVisibility(pwd._id)}
                        className="h-8 w-8 p-0">
                        {visiblePasswords.has(pwd._id) ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(pwd.password)}
                        className="h-8 w-8 p-0">
                        <Copy size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </motion.div>
    </>
  );
}