"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

/* ---------- validation schema ---------- */
const ResetSchema = z.object({
  password: z
    .string()
    .min(8, { message: "The password must be at least 8 characters." })
    .max(128)
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
      message: "The password must contain both letters and numbers.",
    }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
});

/* ---------- password strength (simple) ---------- */
function getPasswordScore(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score > 4) score = 4;
  return score;
}
function strengthLabel(score: number) {
  return ["Very weak", "Weak", "Fair", "Good", "Strong"][score] || "Very weak";
}
function strengthColor(score: number) {
  return ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-400", "bg-green-600"][score];
}

type ResetForm = z.infer<typeof ResetSchema>;

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // token from URL query
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwScore, setPwScore] = useState(0);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<ResetForm>({
    resolver: zodResolver(ResetSchema),
    mode: "onTouched",
  });

  const onSubmit = async (values: ResetForm) => {
    if (!token) {
      toast.error("Invalid or missing token.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, // use query token
          password: values.password,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Password successfully reset! You can now login.");
        // Clear input fields
        reset();
        // Auto redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(data?.error || "Failed! Link expired or invalid.");
      }
    } catch (err) {
      toast.error("Server error. Try later.");
    } finally {
      setLoading(false);
    }
  };

  const watchedPassword = watch("password", "");
  useEffect(() => {
    setPwScore(getPasswordScore(watchedPassword));
  }, [watchedPassword]);

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">

        {/* animated background blobs */}
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

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 w-full max-w-3xl"
        >
          <Card className="overflow-hidden">
            <CardHeader className="p-6 bg-gradient-to-r from-gray-200/60 to-gray-200/40 dark:from-slate-900/60 dark:to-slate-900/40">
              <CardTitle className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
                Reset Password
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left info */}
              <div className="px-1">
                <p className="text-sm text-muted-foreground">
                  Choose a strong password. Keep your data safe — always.
                </p>

                <ul className="mt-5 space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-pink-100 text-pink-600 text-xs font-semibold">✓</span>
                    <span>Minimum 8 characters recommended.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold">✓</span>
                    <span>Your password is never stored in plain text.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-purple-600 text-xs font-semibold">✓</span>
                    <span>You can login again immediately after reset.</span>
                  </li>
                </ul>
              </div>

              {/* Right form */}
              <div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

                  {/* Password Field */}
                  <div>
                    <Label className="mb-1">Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="New password"
                        disabled={loading}
                        {...register("password")}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-100/60 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                    )}
                    {/* Password strength */}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strengthColor(pwScore)} transition-all duration-300`}
                          style={{ width: `${(pwScore / 4) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-20 text-right">
                        {strengthLabel(pwScore)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Use at least 8 characters with letters and numbers.</p>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <Label className="mb-1">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        disabled={loading}
                        {...register("confirmPassword")}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-100/60 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">Re-enter the password you entered in the password field above.</p>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
