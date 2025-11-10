"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, { message: "The password must be at least 8 characters." })
    .max(128)
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
      message: "The password must contain both letters and numbers.",
    }),
});
type LoginForm = z.infer<typeof loginSchema>;

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

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [pwScore, setPwScore] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const watchedPassword = watch("password", "");
  useEffect(() => {
    setPwScore(getPasswordScore(watchedPassword));
  }, [watchedPassword]);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (res?.error) {
        toast.error("Invalid email or password!");
      } else {
        toast.success("Login successful!");
        setTimeout(() => router.push("/"), 1200);
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    // redirect handled by next-auth; callbackUrl ensures we come back to home
    await signIn(provider, { callbackUrl: "/" });
  };

  return (
    <>
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">

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
          className="relative z-10 w-full max-w-4xl mx-auto">
          <Card className="w-full relative overflow-hidden rounded-2xl shadow-2xl">
            <CardHeader className="p-6 bg-gradient-to-r from-gray-200/60 to-gray-200/40 dark:from-slate-900/60 dark:to-slate-900/40">
              <CardTitle className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
                Welcome back
              </CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">Log in to your NoPass account</p>
            </CardHeader>

            <CardContent className="p-6">
              {/* layout: column on small screens, row on md+ */}
              <div className="flex flex-col md:flex-row gap-6">
                {/* --- LEFT: Credentials (email/password) --- */}
                <div className="flex-1">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <div>
                      <Label htmlFor="email" className="mb-1">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        {...register("email")}
                        disabled={loading}
                        className="pr-10"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                      />
                      {errors.email && (
                        <p id="email-error" role="alert" className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="password" className="mb-1">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          placeholder="Your password"
                          type={showPw ? "text" : "password"}
                          {...register("password")}
                          disabled={loading}
                          className="pr-10"
                          aria-invalid={!!errors.password}
                          aria-describedby={errors.password ? "password-error" : undefined}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((s) => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-100/60 cursor-pointer">
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p id="password-error" className="mt-1 text-xs text-red-400">{errors.password.message}</p>
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

                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm text-foreground">
                        <Link href="/forgot-password" className="underline">Forgot password?</Link>
                      </div>
                    </div>

                    <Button type="submit" className="w-full mt-2" disabled={loading}>
                      {loading ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </div>

                {/* --- MIDDLE: vertical divider + "Or continue with" --- */}
                <div className="hidden md:flex flex-col items-center px-4">
                  <div className="h-20 w-px bg-border/40 rounded" />
                  <div className="mt-4 mb-4 text-sm text-muted-foreground">Or continue with</div>
                  <div className="h-20 w-px bg-border/40 rounded" />
                </div>

                {/* For small screens: horizontal separator with text */}
                <div className="md:hidden flex items-center gap-2">
                  <div className="flex-1 h-px bg-border/30" />
                  <div className="text-sm text-muted-foreground">Or continue with</div>
                  <div className="flex-1 h-px bg-border/30" />
                </div>

                {/* --- RIGHT: Social logins (Google/GitHub) --- */}
                <div className="flex-1 flex flex-col items-stretch justify-center gap-3">
                  <Button
                    disabled={loading}
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuth("google")}
                    className="w-full flex items-center justify-center gap-3 bg-[rgba(255,255,255,0.02)] border-[#30333b] hover:bg-[rgba(255,255,255,0.03)]">
                    <FaGoogle className="w-5 h-5 text-orange-400" />
                    Continue with Google
                  </Button>

                  <Button
                    disabled={loading}
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuth("github")}
                    className="w-full flex items-center justify-center gap-3 bg-[rgba(255,255,255,0.02)] border-[#30333b] hover:bg-[rgba(255,255,255,0.03)]">
                    <FaGithub className="w-5 h-5 text-pink-400" />
                    Continue with GitHub
                  </Button>

                  <div className="mt-2 text-sm text-muted-foreground text-center">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="underline text-orange-400">Sign up here</Link>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-transparent p-4 text-center">
              <small className="text-xs text-muted-foreground">
                By logging in you agree to our <Link href="/terms-and-conditions" className="underline">Terms</Link> and <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
              </small>
            </CardFooter>
          </Card>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center text-sm text-muted-foreground">
            Still not registered?{" "}
            <Link href="/register" className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
              Sign up here
            </Link>
          </motion.p>
        </motion.div>
      </section>
    </>
  );
}