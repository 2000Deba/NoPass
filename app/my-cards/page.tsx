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
import { motion } from "framer-motion";

interface StoredCard {
  _id: string;
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv?: string;
  createdAt?: string;
}

export default function MyCardsPage() {
  const { data: session } = useSession();
  const [cards, setCards] = useState<StoredCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleNumbers, setVisibleNumbers] = useState<Set<string>>(new Set());
  const [visibleCVVs, setVisibleCVVs] = useState<Set<string>>(new Set());
  const router = useRouter();

  // Helper for sorting
  const getItemTimestamp = (item: StoredCard) => {
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

  const formatCardNumber = (num: string) =>
    num.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();

  const maskCardNumber = (num: string) => {
    const digits = num.replace(/\D/g, "");
    const last4 = digits.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  const maskCVV = (cvv?: string) => (cvv ? "•".repeat(cvv.length) : "•");

  // Fetch Cards
  const fetchCards = async () => {
    if (!session) {
      setCards([
        {
          _id: "demo",
          cardholderName: "John Doe",
          cardNumber: "1234567812345678",
          expiryDate: "12/26",
          cvv: "321",
          createdAt: new Date().toISOString(),
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/card");
      const data = await res.json();

      if (res.ok) {
        const items: StoredCard[] = data.data || [];
        const sorted = items
          .slice()
          .sort((a, b) => getItemTimestamp(b) - getItemTimestamp(a));
        setCards(sorted);
      } else {
        toast.error(data.error || "Failed to fetch cards");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading cards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [session]);

  // Toggle visibility
  const toggleNumberVisibility = (id: string) => {
    const updated = new Set(visibleNumbers);
    updated.has(id) ? updated.delete(id) : updated.add(id);
    setVisibleNumbers(updated);
  };

  const toggleCVVVisibility = (id: string) => {
    const updated = new Set(visibleCVVs);
    updated.has(id) ? updated.delete(id) : updated.add(id);
    setVisibleCVVs(updated);
  };

  // Copy actions
  const handleCopyNumber = (num: string) => {
    if (!session) return toast.error("You must be logged in to copy card number");
    navigator.clipboard.writeText(num);
    toast.success("Card number copied!");
  };

  const handleCopyCVV = (cvv?: string) => {
    if (!session) return toast.error("You must be logged in to copy CVV");
    if (!cvv) return toast.error("No CVV available");
    navigator.clipboard.writeText(cvv);
    toast.success("CVV copied!");
  };

  // Delete card
  const handleDelete = async (id: string) => {
    if (!session) return toast.error("You must be logged in to delete a card");
    const confirmDelete = window.confirm("Are you sure you want to delete this card?");
    if (!confirmDelete) return toast.error("Delete cancelled");

    try {
      const res = await fetch(`/api/card?id=${id}`, { method: "DELETE" });
      const result = await res.json();

      if (res.ok) {
        setCards((prev) => prev.filter((c) => c._id !== id));
        toast.success("Card deleted successfully");
      } else toast.error(result.error || "Failed to delete card");
    } catch (err) {
      toast.error("Error deleting card");
    }
  };

  // Edit card
  const handleEdit = (card: StoredCard) => {
    if (!session) {
      toast.error("You must be logged in to edit a card");
      return;
    }
    sessionStorage.setItem("editCardItem", JSON.stringify(card));
    sessionStorage.setItem("editingCardFromExternal", "true");

    const toastId = "update-card-toast";
    toast.success(`Editing ${card.cardholderName}...`, { id: toastId });

    setTimeout(() => {
      toast.remove(toastId);
      router.push("/");
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
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          <div className="absolute -left-28 top-10 w-72 h-72 rounded-full bg-gradient-to-r from-orange-300/30 to-pink-300/20 blur-3xl animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute -right-20 bottom-10 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-400/20 to-indigo-400/15 blur-3xl animate-[float2_10s_ease-in-out_infinite]" />
        </motion.div>

        {/* Header section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent 
      bg-gradient-to-r from-orange-400 to-pink-500 pb-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
            My Cards
          </h1>
          <p className="pt-2 text-sm md:text-base text-slate-600 dark:text-slate-400">
            View, edit or manage all your saved cards in one secure place.
          </p>
        </motion.div>

        {/* Content section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 w-full max-w-6xl">
          {loading ? (
            <Card className="bg-white/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 backdrop-blur-sm border-dashed">
              <CardContent className="py-6 text-center text-muted-foreground">Loading your cards...</CardContent>
            </Card>
          ) : cards.length === 0 && session ? (
            <Card className="bg-white/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 backdrop-blur-sm border-dashed">
              <CardContent className="py-6 text-center text-muted-foreground">
                No cards saved yet
              </CardContent>
            </Card>
          ) : (
            <div className={` grid gap-6 justify-center ${cards.length === 1 ? "grid-cols-1" : cards.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
              {cards.map((card) => (
                <motion.div
                  key={card._id}
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
                              {card.cardholderName}
                            </CardTitle>
                            <CardDescription className="break-all mt-1 text-slate-600 dark:text-slate-400">
                              Exp: {card.expiryDate}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        {/* Card Number Row */}
                        <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-700/60 rounded-lg font-mono text-sm mb-2">
                          <span>
                            {visibleNumbers.has(card._id)
                              ? formatCardNumber(card.cardNumber)
                              : maskCardNumber(card.cardNumber)}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleNumberVisibility(card._id)}
                              className="h-8 w-8 p-0 text-slate-700 dark:text-slate-200">
                              {visibleNumbers.has(card._id) ? (
                                <EyeOff size={14} />
                              ) : (
                                <Eye size={14} />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyNumber(card.cardNumber)}
                              className="h-8 w-8 p-0 text-slate-700 dark:text-slate-200">
                              <Copy size={14} />
                            </Button>
                          </div>
                        </div>

                        {/* CVV Row */}
                        {card.cvv && (
                          <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-700/60 rounded-lg font-mono text-sm mb-2 w-[60%]">
                            <span>
                              {visibleCVVs.has(card._id)
                                ? card.cvv
                                : maskCVV(card.cvv)}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleCVVVisibility(card._id)}
                                className="h-8 w-8 p-0 text-slate-700 dark:text-slate-200">
                                {visibleCVVs.has(card._id) ? (
                                  <EyeOff size={14} />
                                ) : (
                                  <Eye size={14} />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyCVV(card.cvv)}
                                className="h-8 w-8 p-0 text-slate-700 dark:text-slate-200">
                                <Copy size={14} />
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-end gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(card)}>
                            <Edit className="w-4 h-4 mr-1" /> Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(card._id)}>
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