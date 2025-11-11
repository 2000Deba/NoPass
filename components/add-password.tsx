"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

const formSchema = z.object({
  website: z
    .string()
    .min(6, { message: "Website name must be at least 6 characters." })
    .max(100, { message: "Website name too long." }),
  username: z
    .string()
    .min(4, { message: "Username or email must be at least 4 characters." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." }),
});

interface EditPasswordData {
  _id: string;
  website: string;
  username: string;
  password: string;
}
interface AddPasswordProps {
  onPasswordAdded?: () => void;
  editData?: EditPasswordData | null;
  onEditCancel?: () => void;
}

export function AddPassword({ onPasswordAdded, editData, onEditCancel }: AddPasswordProps) {
  const { status } = useSession();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      website: "",
      username: "",
      password: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Prefill when editing, reset otherwise
  useEffect(() => {
    if (editData) {
      setIsEditMode(true)
      form.reset({
        website: editData.website ?? "",
        username: editData.username ?? "",
        password: editData.password ?? "",
      });
    } else {
      form.reset({
        website: "",
        username: "",
        password: "",
      });
      setIsEditMode(false);
    }
  }, [editData, form]);

  // Submit Handler (Add or Update)
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (status !== "authenticated") {
      toast.error("You must be logged in to save or edit passwords.");
      return;
    }

    setLoading(true);
    try {
      const method = isEditMode ? "PUT" : "POST";
      // safety: if editing but no editData, abort
      if (isEditMode && (!editData || !editData._id)) {
        toast.error("Edit data missing. Please try again.");
        setLoading(false);
        return;
      }
      const body = isEditMode ? { ...values, id: editData!._id } : values;

      const res = await fetch("/api/password", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save password");

      toast.success(isEditMode ? "Password updated successfully!" : "Password saved successfully!");

      form.reset({
        website: "",
        username: "",
        password: "",
      });
      setIsEditMode(false);
      onPasswordAdded?.();
      onEditCancel?.();
    } catch (err) {
      console.error("❌ Error saving password:", err);
      toast.error("Error saving passwords. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Cancel Handler
  const handleCancel = () => {
    form.reset({
      website: "",
      username: "",
      password: "",
    });
    toast.error("Canceled edit");
    setIsEditMode(false);
    onEditCancel?.();
    onPasswordAdded?.();
  };

  if (status === "loading") {
    return (
      <Card className="bg-white/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 backdrop-blur-sm border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Add New Password</CardTitle>
          <CardDescription>Loading session...</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Please wait...</p>
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
        <Card className="bg-white/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">
              {isEditMode ? "Edit Password" : "Add New Password"}
            </CardTitle>
            <CardDescription>
              {isEditMode
                ? "Update your saved password details below."
                : "Store your passwords securely"}
            </CardDescription>
            {status !== "authenticated" && (
              <p className="text-sm text-orange-500 font-medium mt-2">
                You&apos;re not logged in — demo mode active. Please log in to save your passwords.
              </p>
            )}
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Website */}
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website / Service</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Gmail, GitHub" {...field} />
                      </FormControl>
                      <FormDescription>
                        Website URL or service name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Username */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username / Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Username or Email used for this account.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          variant="ghost"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </Button>
                      </div>
                      <FormDescription>Password for this account.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                  <Button type="submit"
                    className="w-full bg-gradient-to-r from-indigo-500 to-teal-500 text-foreground hover:opacity-90 transition"
                    disabled={loading}>
                    {loading ? "Saving..." : isEditMode ? "Update" : "Add Password"}
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
  );
}
