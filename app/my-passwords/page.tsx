"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Copy, Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";

interface StoredPassword {
  _id: string;
  website: string;
  username: string;
  password: string;
  createdAt?: string;
}

export default function MyPasswordsPage() {
  const { data: session } = useSession();
  const [passwords, setPasswords] = useState<StoredPassword[]>([]);
  const [loading, setLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const router = useRouter();

  // Helper for sorting
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
    } catch { }
    return 0;
  };

  // Fetch Passwords
  const fetchPasswords = async () => {
    if (!session) {
      setPasswords([
        {
          _id: "demo",
          website: "Demo Website",
          username: "John Doe",
          password: "Secure&Password!123",
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
        const sorted = items
          .slice()
          .sort((a, b) => getItemTimestamp(b) - getItemTimestamp(a));
        setPasswords(sorted);
      } else {
        toast.error(data.error || "Failed to fetch passwords");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading passwords");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasswords();
  }, [session]);

  // Toggle password visibility
  const togglePasswordVisibility = (id: string) => {
    const updated = new Set(visiblePasswords);
    updated.has(id) ? updated.delete(id) : updated.add(id);
    setVisiblePasswords(updated);
  };

  // Copy password
  const handleCopy = (text: string) => {
    if (!session) return toast.error("You must be logged in to copy a password");
    navigator.clipboard.writeText(text);
    toast.success("Password copied!");
  };

  // Delete password
  const handleDelete = async (id: string) => {
    if (!session) return toast.error("You must be logged in to delete a password");

    const confirmDelete = window.confirm("Are you sure you want to delete this password?");
    if (!confirmDelete) return toast.error("Delete cancelled");

    try {
      const res = await fetch(`/api/password?id=${id}`, { method: "DELETE" });
      const result = await res.json();

      if (res.ok) {
        setPasswords((prev) => prev.filter((p) => p._id !== id));
        toast.success("Password deleted successfully");
      } else toast.error(result.error || "Failed to delete password");
    } catch (err) {
      toast.error("Error deleting password");
    }
  };

  // Edit password (bridge)
  const handleEdit = (pwd: StoredPassword) => {
    if (!session) {
      toast.error("You must be logged in to edit a password");
      return;
    }

    // Save the item temporarily in sessionStorage
    sessionStorage.setItem("editPasswordItem", JSON.stringify(pwd));
    // Mark this edit as coming from another page
    sessionStorage.setItem("editingFromExternal", "true");

    // Use a persistent toast id for control
    const toastId = "update-toast";

    toast.success(`Editing ${pwd.website}...`, { id: "update-toast" });
    setTimeout(() => {
      toast.remove(toastId);
      router.push("/"); // redirect to Home
    }, 1500);
  };

  // -------------------
  // Render
  // -------------------
  return (
    <>
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 py-12 px-4">

        {/* Background floating blobs */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -left-28 top-10 w-72 h-72 rounded-full bg-gradient-to-r from-orange-300/30 to-pink-300/20 blur-3xl animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute -right-20 bottom-10 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-400/20 to-indigo-400/15 blur-3xl animate-[float2_10s_ease-in-out_infinite]" />
        </motion.div>

        {/* Header section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent 
      bg-gradient-to-r from-orange-400 to-pink-500 pb-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
            My Passwords
          </h1>
          <p className="pt-2 text-sm md:text-base text-slate-600 dark:text-slate-400">
            View, edit or manage all your saved passwords in one secure place.
          </p>
        </motion.div>

        {/* Content section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 w-full max-w-6xl"
        >
          {loading ? (
            <Card className="bg-white/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 backdrop-blur-sm border-dashed">
              <CardContent className="py-6 text-center text-muted-foreground">Loading your passwords...</CardContent>
            </Card>
          ) : passwords.length === 0 && session ? (
            <Card className="bg-white/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 backdrop-blur-sm border-dashed">
              <CardContent className="py-6 text-center text-muted-foreground">
                No passwords saved yet
              </CardContent>
            </Card>
          ) : (
            <div className={` grid gap-6 justify-center ${passwords.length === 1 ? "grid-cols-1" : passwords.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
              {passwords.map((pwd) => (
                <motion.div
                  key={pwd._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center">
                  <div className="w-full max-w-md">
                    <Card className="bg-white/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 backdrop-blur-sm">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base break-all">
                              <Link
                                href={
                                  pwd.website.startsWith("http")
                                    ? pwd.website
                                    : `https://${pwd.website}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {pwd.website}
                              </Link>
                            </CardTitle>
                            <CardDescription className="break-all mt-1 text-slate-600 dark:text-slate-400">
                              Username: {pwd.username}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        {/* Password Row */}
                        <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-700/60 rounded-lg font-mono text-sm">
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
                              className="h-8 w-8 p-0 text-slate-700 dark:text-slate-200"
                            >
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
                              className="h-8 w-8 p-0 text-slate-700 dark:text-slate-200"
                            >
                              <Copy size={14} />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(pwd)}
                          >
                            <Edit className="w-4 h-4 mr-1" /> Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(pwd._id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>
    </>

  );
}