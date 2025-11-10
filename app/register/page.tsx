"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

/* ---------- validation schema ---------- */
const registerSchema = z.object({
  name: z
    .string()
    .min(2, { message: "The name must contain at least 2 letters." })
    .max(50, { message: "The name is too big." })
    .regex(/^[\p{L}\s.'-]+$/u, {
      message: "The name contains invalid characters.",
    }),
  email: z.string().email({ message: "Enter valid email." }),
  password: z
    .string()
    .min(8, { message: "The password must be at least 8 characters." })
    .max(128)
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
      message: "The password must contain both letters and numbers.",
    }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

/* ---------- password strength ---------- */
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

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [pwScore, setPwScore] = useState(0);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  });

  const watchedPassword = watch("password", "");
  useEffect(() => {
    setPwScore(getPasswordScore(watchedPassword));
  }, [watchedPassword]);

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        toast.success("Registration successful! You can now login.", { duration: 3000 });
        reset();
        setTimeout(() => router.push("/login"), 3000);
      } else if (data && Array.isArray(data.errors)) {
        data.errors.forEach((err: any) => {
          if (err.field) {
            setError(err.field as any, { type: "server", message: err.message || "Invalid" });
          } else {
            toast.error(err.message || "Registration failed! Please try again later.");
          }
        });
      } else {
        toast.error(data?.error || data?.message || "Registration failed");
      }
    } catch (err) {
      console.error("Register Error:", err);
      toast.error("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">

        {/* animated background blobs */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -left-28 top-10 w-72 h-72 rounded-full bg-gradient-to-r from-orange-300/30 to-pink-300/20 blur-3xl animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute -right-20 bottom-10 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-400/20 to-indigo-400/15 blur-3xl animate-[float2_10s_ease-in-out_infinite]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 w-full max-w-3xl">
          <Card className="overflow-hidden">
            <CardHeader className="p-6 bg-gradient-to-r from-gray-200/60 to-gray-200/40 dark:from-slate-900/60 dark:to-slate-900/40">
              <CardTitle className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
                Create your NoPass account
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left side info */}
              <div className="px-1">
                <p className="text-sm text-muted-foreground">
                  Fast, secure, and private. Save passwords and cards safely — access anywhere.
                </p>

                <ul className="mt-5 space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold">✓</span>
                    <span>Encrypted storage — sensitive data never stored in plain text.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-purple-600 text-xs font-semibold">✓</span>
                    <span>Import/export tools coming soon.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-pink-100 text-pink-600 text-xs font-semibold">✓</span>
                    <span>Mobile friendly — built for touch and keyboard.</span>
                  </li>
                </ul>

                <p className="mt-6 text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="font-medium text-foreground underline underline-offset-2">
                    Login
                  </Link>
                </p>
              </div>

              {/* Right: form */}
              <div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  {/* Name */}
                  <div>
                    <Label className="mb-1">Full Name</Label>
                    <Input placeholder="Your full name" {...register("name")} />
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <Label className="mb-1">Email</Label>
                    <Input placeholder="you@example.com" type="email" {...register("email")} />
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <Label className="mb-1">Password</Label>
                    <div className="relative">
                      <Input
                        placeholder="At least 8 characters"
                        type={showPw ? "text" : "password"}
                        {...register("password")}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-100/60 cursor-pointer">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {errors.password ? (
                      <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                    ) : (
                      <>
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
                        <p className="mt-1 text-xs text-muted-foreground">
                          Use at least 8 characters with letters and numbers.
                        </p>
                      </>
                    )}
                  </div>

                  {/* Submit */}
                  <Button type="submit" disabled={loading || isSubmitting} className="w-full">
                    {loading || isSubmitting ? "Registering..." : "Create account"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By creating an account you agree to our{" "}
                    <a className="underline" href="/terms-and-conditions">Terms</a> and{" "}
                    <a className="underline" href="/privacy-policy">Privacy Policy</a>.
                  </p>
                </form>
              </div>
            </CardContent>
          </Card>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center text-sm text-muted-foreground">
            Already signed up?{" "}
            <Link href="/login" className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
              Login here
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}