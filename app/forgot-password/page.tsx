"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

/* ---------- validation schema ---------- */
const ForgotSchema = z.object({
    email: z.string().email({ message: "Enter valid email." }),
});
type ForgotForm = z.infer<typeof ForgotSchema>;

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ForgotForm>({
        resolver: zodResolver(ForgotSchema),
        mode: "onTouched",
    });

    const onSubmit = async (values: ForgotForm) => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await res.json();
            // Status Based Responses
            if (res.status === 404) {
                toast.error("No account found with this email");
            }
            else if (res.status === 200) {
                toast.success("Password reset link sent! Check your email.");
                // Clear input field
                reset();

                // Auto redirect to login after 2 seconds
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            } else {
                toast.error(data?.error || "Failed! Try again.");
            }
        } catch (err) {
            toast.error("Server error. Try later.");
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
                                Forgot Password
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            {/* Left side info */}
                            <div className="px-1">
                                <p className="text-sm text-muted-foreground">
                                    Forgot your password? No problem — we&apos;ll help you get back into your account securely.
                                </p>

                                <ul className="mt-5 space-y-3 text-sm">
                                    <li className="flex items-start gap-3">
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-pink-100 text-pink-600 text-xs font-semibold">✓</span>
                                        <span>Enter your registered email — we&apos;ll send you a secure reset link.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold">✓</span>
                                        <span>The link expires automatically, improving your account security.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold">✓</span>
                                        <span>The link expires automatically after 1 hour or once you have use it.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-purple-600 text-xs font-semibold">✓</span>
                                        <span>Your password is encrypted — we never store it in plain text.</span>
                                    </li>
                                </ul>

                                <p className="mt-6 text-sm text-muted-foreground">
                                    Don&apos;t have an account?{" "}
                                    <Link href="/register" className="underline text-orange-400">Sign up here</Link>
                                </p>
                            </div>

                            {/* Right: form */}
                            <div>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                                    <div>
                                        <Label className="mb-1">Email</Label>
                                        <Input type="email" placeholder="you@example.com" disabled={loading} {...register("email")} />
                                        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
                                    </div>

                                    <Button type="submit" disabled={loading} className="w-full">
                                        {loading ? "Sending..." : "Send Reset Link"}
                                    </Button>

                                    <p className="text-sm text-center text-muted-foreground">
                                        Remember password?{" "}
                                        <Link href="/login" className="font-medium text-foreground underline underline-offset-2">
                                            Login
                                        </Link>
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
                        Remember password?{" "}
                        <Link href="/login" className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
                            Login here
                        </Link>
                    </motion.p>
                </motion.div>
            </div>
        </>
    );
}
