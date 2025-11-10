"use client"

import { AddCard } from "@/components/add-card"
import { AddPassword } from "@/components/add-password"
import { YourCards } from "@/components/your-cards"
import { YourPasswords } from "@/components/your-passwords"
import { Lock } from "lucide-react"
import { useState, useEffect } from "react"
import { usePasswords } from "./context/PasswordsContext"
import { useCards } from "./context/CardsContext"
import { motion } from "framer-motion"

export default function Home() {
  const [cardRefresh, setCardRefresh] = useState(0)
  const [passwordRefresh, setPasswordRefresh] = useState(0)

  const { editPassword, isPasswordEditMode, cancelEditPassword, finishEditPassword, startEditPassword } = usePasswords();
  const { editCard, isCardEditMode, cancelEditCard, finishEditCard, startEditCard } = useCards();

  useEffect(() => {
    const fromExternal = sessionStorage.getItem("editingCardFromExternal") === "true";
    if (fromExternal) {
      const item = sessionStorage.getItem("editCardItem");
      if (item) {
        const parsed = JSON.parse(item);
        startEditCard(parsed);
      }
      sessionStorage.removeItem("editingCardFromExternal");
      sessionStorage.removeItem("editCardItem");
    }
  }, [startEditCard]);

  // External edit detect (after redirect from MyPasswords)
  useEffect(() => {
    const fromExternal = sessionStorage.getItem("editingFromExternal") === "true";
    if (fromExternal) {
      const item = sessionStorage.getItem("editPasswordItem");
      if (item) {
        const parsed = JSON.parse(item);
        startEditPassword(parsed);
      }
      sessionStorage.removeItem("editingFromExternal");
      sessionStorage.removeItem("editPasswordItem");
    }
  }, [startEditPassword]);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-500 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 py-12 px-4">

      {/* Floating Background Blobs */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -left-28 top-10 w-72 h-72 rounded-full bg-gradient-to-r from-orange-300/30 to-pink-300/20 blur-3xl animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute -right-20 bottom-10 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-400/20 to-indigo-400/15 blur-3xl animate-[float2_10s_ease-in-out_infinite]" />
      </motion.div>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center mb-10">
        <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500 pb-2">
          Password Manager
        </h1>
        <p className="pt-2 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
          Securely store and manage your passwords and credit cards in one place.
        </p>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 w-full max-w-[1250px]">
        {/* Add / Edit Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Cards */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              {isCardEditMode ? "Edit Card" : "Add A Credit/Debit Card"}
            </h2>
            <AddCard
              editData={editCard}
              onCardAdded={() => {
                finishEditCard();
                setCardRefresh((p) => p + 1);
              }}
              onEditCancel={cancelEditCard}
            />
          </div>

          {/* Passwords */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              {isPasswordEditMode ? "Edit Password" : "Add A Password"}
            </h2>
            <AddPassword
              editData={editPassword}
              onEditCancel={cancelEditPassword}
              onPasswordAdded={() => {
                finishEditPassword();
                setPasswordRefresh((p) => p + 1);
              }}
            />
          </div>
        </div>

        {/* Display Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Cards</h2>
            <YourCards refreshTrigger={cardRefresh} />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Passwords</h2>
            <YourPasswords refreshTrigger={passwordRefresh} />
          </div>
        </div>
      </motion.div>
    </section>
  )
}