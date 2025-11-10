"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function TermsPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-8 py-6 sm:px-6 sm:py-8 md:px-10 md:py-14 lg:px-16 relative">
            {/* Moving Cinematic Spotlight Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-30"
                    style={{
                        background:
                            "radial-gradient(circle at center, rgba(255,165,0,0.4), rgba(255,20,147,0.2), transparent 70%)",
                    }}
                    animate={{
                        x: [0, 150, -150, 0],
                        y: [0, 100, -80, 0],
                        rotate: [0, 45, 90, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-25"
                    style={{
                        background:
                            "radial-gradient(circle at center, rgba(255,105,180,0.3), rgba(255,165,0,0.25), transparent 70%)",
                    }}
                    animate={{
                        x: [0, -100, 100, 0],
                        y: [0, -80, 120, 0],
                        rotate: [0, -45, -90, 0],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>
            <section className="py-20 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{
                        scale: 1.02,
                        boxShadow:
                            "0 0 60px 6px rgba(255,140,0,0.45), 0 0 90px 12px rgba(255,105,180,0.35)",
                    }}
                    animate={{
                        boxShadow:
                            "0 0 40px 3px rgba(255,165,0,0.4), 0 0 70px 10px rgba(255,105,180,0.3)",
                    }}
                    transition={{
                        boxShadow: {
                            duration: 3.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                        },
                    }}
                    className="max-w-3xl w-full relative bg-muted/40 backdrop-blur-sm border border-border/60 rounded-2xl p-0 md:p-4 shadow-lg transition-all overflow-hidden">

                    <Card className="bg-transparent border-none shadow-none">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                                Terms & Conditions
                            </CardTitle>
                            <CardDescription className="text-neutral-600 dark:text-neutral-300">
                                Welcome to our application. By using our service, you agree to the following conditions.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6 text-neutral-600 dark:text-neutral-300">
                            <section>
                                <h2 className="text-xl font-semibold mt-6 mb-2 text-neutral-800 dark:text-neutral-200">1. Account Responsibility</h2>
                                <p className="text-neutral-600 dark:text-neutral-300">
                                    You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold mt-6 mb-2 text-neutral-800 dark:text-neutral-200">2. Acceptable Use</h2>
                                <p className="text-neutral-600 dark:text-neutral-300">
                                    You agree not to misuse the services, including attempting to access or modify data that does not belong to you.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold mt-6 mb-2 text-neutral-800 dark:text-neutral-200">3. Service Changes</h2>
                                <p className="text-neutral-600 dark:text-neutral-300">
                                    We may modify or discontinue the service at any time, with or without notice.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold mt-6 mb-2 text-neutral-800 dark:text-neutral-200">4. Limitation of Liability</h2>
                                <p className="text-neutral-600 dark:text-neutral-300">
                                    We are not liable for any damages arising from your use of the application.
                                </p>
                            </section>

                            <div className="mt-8 text-sm text-neutral-500 dark:text-neutral-400">
                                Last Updated: November 2025
                            </div>
                            <p className="pt-4">
                                Back to{" "}
                                <Link href="/login" className="text-orange-500 underline">
                                    Login
                                </Link>
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Signature Line with Glowing Underline */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-12 relative text-sm text-muted-foreground tracking-wide"
                >
                    <span className="relative inline-block">
                        Designed & Built with ❤️ by Debasish Seal
                        <motion.span
                            animate={{
                                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute left-0 bottom-0 w-full h-[2px] bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 rounded-full blur-[1px]"
                            style={{ backgroundSize: "200% 200%" }}
                        ></motion.span>
                    </span>
                </motion.div>
            </section>
        </div>
    );
}
