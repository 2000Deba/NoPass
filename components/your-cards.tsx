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
import { useCards } from "@/app/context/CardsContext";
import { motion } from "framer-motion";

interface StoredCard {
  _id: string;
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv?: string;
  createdAt?: string;
}

interface YourCardsProps {
  refreshTrigger?: number;
}

export function YourCards({ refreshTrigger }: YourCardsProps) {
  const { data: session } = useSession();
  const [cards, setCards] = useState<StoredCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { hiddenId, startEditCard } = useCards();

  // controls for visibility
  const [visibleNumbers, setVisibleNumbers] = useState<Set<string>>(new Set());
  const [visibleCVVs, setVisibleCVVs] = useState<Set<string>>(new Set());

  // -------------------
  // Helpers
  // -------------------

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
    } catch (e) { }
    return 0;
  };

  const formatCardNumberGrouped = (num: string) => {
    const digits = num.replace(/\D/g, "");
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const maskCardNumber = (num: string) => {
    const digits = num.replace(/\D/g, "");
    const last4 = digits.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  const maskCVV = (cvv?: string) => {
    if (!cvv) return "•";
    return "•".repeat(cvv.length);
  };

  // -------------------
  // Fetch
  // -------------------

  const fetchCards = async () => {
    if (!session) {
      setCards([
        {
          _id: "demo",
          cardholderName: "John Doe",
          cardNumber: "1234567890123456",
          expiryDate: "12/25",
          cvv: "123",
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
      console.error("Error fetching cards:", err);
      toast.error("Something went wrong while loading cards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      await fetchCards();
      if (!active) return;
    })();
    return () => { active = false };
  }, [session, refreshTrigger]);

  // -------------------
  // Actions
  // -------------------

  const handleDelete = async (id: string) => {
    if (!session) return toast.error("You must be logged in to delete a card");

    // Step 1: Ask for confirmation before deleting
    const confirmed = window.confirm("Are you sure you want to delete this card?");
    if (!confirmed) {
      toast.error("Delete cancelled");
      return;
    }

    try {
      const res = await fetch(`/api/card?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok) {
        setCards((prev) => prev.filter((card) => card._id !== id));
        toast.success("Card deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete card");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting card");
    }
  };

  const handleCopy = (text: string) => {
    if (!session) {
      toast.error("You must be logged in to copy card details");
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success("Card Number Copied!");
  };

  const handleCopyCVV = (cvv?: string) => {
    if (!session) {
      toast.error("You must be logged in to copy card details");
      return;
    }
    if (!cvv) {
      toast.error("No CVV available");
      return;
    }
    navigator.clipboard.writeText(cvv);
    toast.success("CVV copied!");
  };

  const toggleNumberVisibility = (id: string) => {
    const s = new Set(visibleNumbers);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setVisibleNumbers(s);
  };

  const toggleCVVVisibility = (id: string) => {
    const s = new Set(visibleCVVs);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setVisibleCVVs(s);
  };

  // -------------------
  // Edit Handler
  // -------------------
  const handleEditClick = (card: StoredCard) => {
    if (!session) {
      toast.error("You must be logged in to edit a card");
      return;
    }
    startEditCard(card);
  };

  // -------------------
  // Render
  // -------------------

  if (loading) {
    return (
      <Card className="bg-white/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 backdrop-blur-sm border-dashed">
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">
            Loading your cards...
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
          {cards.length === 0 ? (

            <Card className="bg-white/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 backdrop-blur-sm border-dashed">
              <CardContent className="py-6">
                <p className="text-center text-muted-foreground">
                  No cards saved yet
                </p>
              </CardContent>
            </Card>
          ) : (
            cards.filter((card) => card._id !== hiddenId).map((card) => (
              <Card key={card._id} className="overflow-hidden bg-white/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        Card Holder: {card.cardholderName}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Exp: {card.expiryDate}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(card)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Edit">
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(card._id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 py-2">
                  {/* Card Number */}
                  <div className="flex justify-between items-center gap-2 p-3 bg-slate-100 dark:bg-slate-700/60 rounded-lg font-mono text-sm">
                    <span className="break-keep">
                      {visibleNumbers.has(card._id)
                        ? formatCardNumberGrouped(card.cardNumber)
                        : maskCardNumber(card.cardNumber)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleNumberVisibility(card._id)}
                        className="h-8 w-8 p-0"
                        aria-label="Toggle card number visibility">
                        {visibleNumbers.has(card._id) ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(card.cardNumber)}
                        className="h-8 w-8 p-0"
                        aria-label="Copy card number">
                        <Copy size={14} />
                      </Button>
                    </div>
                  </div>

                  {/* CVV row */}
                  {card.cvv && (
                    <div className="flex justify-between items-center gap-2 px-2 py-2 bg-slate-100 dark:bg-slate-700/60 rounded-lg font-mono text-sm w-[50%]">
                      <span className="ml-1">
                        {visibleCVVs.has(card._id)
                          ? card.cvv
                          : maskCVV(card.cvv)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCVVVisibility(card._id)}
                          className="h-8 w-8 p-0"
                          aria-label="Toggle CVV visibility">
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
                          className="h-8 w-8 p-0"
                          aria-label="Copy CVV">
                          <Copy size={14} />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </motion.div>
    </>
  );
}