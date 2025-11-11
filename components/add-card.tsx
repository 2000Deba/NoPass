"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import toast from "react-hot-toast"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  cardNumber: z
    .string()
    .transform((val) => val.replace(/\s/g, "")) // Remove spaces first
    .refine((val) => /^\d+$/.test(val), {
      message: "Card number must contain only digits.",
    })
    .refine((val) => val.length >= 16, {
      message: "Card number must be at least 16 digits.",
    })
    .refine((val) => val.length <= 19, {
      message: "Card number cannot exceed 19 digits.",
    })
    .transform((val) => val.match(/.{1,4}/g)?.join(" ") ?? val), // Format into groups
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: "Expiry date must be in MM/YY format." }),
  cvv: z.string().regex(/^\d{3,4}$/, { message: "CVV must be 3 or 4 digits." }),
  cardholderName: z.string().min(2, { message: "Cardholder name is required." }),
})

interface EditCardData {
  _id: string;
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

interface AddCardProps {
  onCardAdded?: () => void;
  editData?: EditCardData | null;
  onEditCancel?: () => void;
}

export function AddCard({ onCardAdded, editData, onEditCancel }: AddCardProps) {
  const { status } = useSession()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardholderName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  })
  const [showCVV, setShowCVV] = useState(false);
  const [loading, setLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  // Prefill or reset form whenever editData changes
  useEffect(() => {
    if (editData) {
      setIsEditMode(true)
      form.reset({
        cardholderName: editData.cardholderName ?? "",
        cardNumber: editData.cardNumber ?? "",
        expiryDate: editData.expiryDate ?? "",
        cvv: editData.cvv ?? "",
      })
    } else {
      // ensures complete reset
      form.reset({
        cardholderName: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
      })
      setIsEditMode(false)
    }
  }, [editData, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (status !== "authenticated") {
      toast.error("You must be logged in to add or edit a card.")
      return
    }

    setLoading(true)
    try {
      const method = isEditMode ? "PUT" : "POST";
      // safety: if editing but no editData, abort
      if (isEditMode && (!editData || !editData._id)) {
        toast.error("Edit data missing. Please try again.");
        setLoading(false);
        return;
      }
      const body = isEditMode ? { ...values, id: editData!._id } : values;

      const res = await fetch("/api/card", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error("Failed to save card")

      toast.success(isEditMode ? "Card updated successfully!" : "Card saved successfully!")

      // Fully reset form + exit edit mode + refresh parent
      form.reset({
        cardholderName: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
      })
      setIsEditMode(false)
      onCardAdded?.()
      onEditCancel?.()
    } catch (error) {
      console.error("❌ Error saving card:", error)
      toast.error("Error saving card details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Cancel edit — reset & show back the card in list
  const handleCancel = () => {
    form.reset({
      cardholderName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    })
    toast.error("Canceled edit");
    setIsEditMode(false)
    onEditCancel?.()
    onCardAdded?.()
  }

  if (status === "loading") {
    return (
      <Card className="bg-white/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 backdrop-blur-sm border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Add New Card</CardTitle>
          <CardDescription>Loading session...</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Please wait...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 w-full max-w-6xl">
        <Card className="bg-white/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">
              {isEditMode ? "Edit Card" : "Add New Card"}
            </CardTitle>
            <CardDescription>
              {isEditMode
                ? "Update your existing card details below."
                : "Enter your credit/debit card details securely."}
            </CardDescription>
            {status !== "authenticated" && (
              <p className="text-sm text-orange-500 font-medium mt-2">
                You&apos;re not logged in — demo mode active. Please log in to save your card.
              </p>
            )}
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Cardholder Name */}
                <FormField
                  control={form.control}
                  name="cardholderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cardholder Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormDescription>Name printed on the card.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Card Number */}
                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          maxLength={23}
                          {...field}
                          // UI shows grouped format
                          value={field.value
                            ?.replace(/\D/g, "")         // remove non-digits
                            .match(/.{1,4}/g)            // group into 4
                            ?.join(" ") || ""}           // join with space
                          // But we store only raw digits in state
                          onChange={(e) => {
                            const digitsOnly = e.target.value.replace(/\D/g, "");
                            field.onChange(digitsOnly);
                          }}
                        />
                      </FormControl>
                      <FormDescription>16-19 digit card number.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Expiry Date */}
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date (MM/YY)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="09/28" maxLength={5} {...field} onChange={(e) => {
                          let value = e.target.value.replace(/[^\d]/g, ""); // Just keep the numbers

                          if (value.length > 2) {
                            // If it is 2 digits, the slash will be inserted automatically.
                            value = value.slice(0, 2) + "/" + value.slice(2);
                          }

                          field.onChange(value); // react-hook-form state update
                        }} />
                      </FormControl>
                      <FormDescription>Expiry date in MM/YY format.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CVV */}
                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showCVV ? "text" : "password"}
                            placeholder="123"
                            maxLength={4}
                            {...field}
                          />

                          {/* Toggle Button */}
                          <Button
                            variant="ghost"
                            type="button"
                            onClick={() => setShowCVV((prev) => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                            {showCVV ? <EyeOff size={18} /> : <Eye size={18} />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>3 or 4 digit CVV.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-foreground hover:opacity-90 transition" disabled={loading}>
                    {loading ? "Saving..." : isEditMode ? "Update" : "Submit"}
                  </Button>

                  {isEditMode && (
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </>
  )
}