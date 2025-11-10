"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Github, Linkedin, Lock, Shield, KeyRound } from "lucide-react";

export default function AboutPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative min-h-screen bg-gradient-to-b from-background to-muted/30 text-foreground overflow-hidden">
            {/* Animated background orbs */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{
                    opacity: 0.5,
                    scale: [1, 1.2, 1],
                    x: [0, 50, -50, 0],
                    y: [0, 30, -30, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-orange-400/40 via-pink-500/35 to-purple-500/40 rounded-full blur-3xl dark:opacity-40 opacity-60 pointer-events-none"
            />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{
                    opacity: 0.5,
                    scale: [1, 1.3, 1],
                    x: [0, -40, 40, 0],
                    y: [0, -30, 30, 0],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-gradient-to-r from-blue-500/40 via-cyan-400/35 to-teal-400/40 rounded-full blur-3xl dark:opacity-40 opacity-60 pointer-events-none"
            />

            {/* Hero Section */}
            <section className="py-20 text-center px-6 relative z-10">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                    About NoPass
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.7 }}
                    className="max-w-2xl mx-auto text-lg text-muted-foreground">
                    NoPass is a secure and modern password manager built with Next.js,
                    Express, and MongoDB. Designed for privacy and simplicity, it lets you
                    manage your credentials effortlessly — without worrying about unsafe
                    storage or leaks.
                </motion.p>
            </section>

            {/* Mission + Features Section */}
            <section className="py-12 px-6 bg-muted/40 relative z-10">
                <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <Lock className="w-10 h-10 text-orange-500" />,
                            title: "End-to-End Security",
                            desc: "Your passwords are encrypted before they leave your device, ensuring complete privacy.",
                        },
                        {
                            icon: <Shield className="w-10 h-10 text-orange-500" />,
                            title: "Trusted Protection",
                            desc: "NoPass uses strong cryptography and authentication layers to safeguard your data.",
                        },
                        {
                            icon: <KeyRound className="w-10 h-10 text-orange-500" />,
                            title: "Simple & Intuitive",
                            desc: "Easily add, edit, and manage your passwords in a clean, distraction-free interface.",
                        },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i, duration: 0.6 }}
                            viewport={{ once: true }}>
                            <Card className="h-full shadow-md hover:shadow-xl hover:-translate-y-2 hover:bg-muted/50 transition-all duration-300 border border-border/60 backdrop-blur-sm text-center">
                                <CardHeader className="flex flex-col items-center gap-3">
                                    {item.icon}
                                    <h3 className="text-lg font-semibold">{item.title}</h3>
                                </CardHeader>
                                <CardContent className="text-muted-foreground">
                                    {item.desc}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Developer Section */}
            <section className="py-20 px-6 text-center relative z-10">
                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-3xl font-bold mb-10">
                    Meet the Developer
                </motion.h2>

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

                {/* Developer Card with breathing glow + image pulse */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
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
                    className="relative max-w-md mx-auto bg-muted/40 backdrop-blur-sm border border-border/60 rounded-2xl p-8 shadow-lg transition-all overflow-hidden">
                    {/* Cinematic Rotating Aura Behind Image */}
                    <motion.div
                        className="absolute top-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-50 pointer-events-none z-0"
                        style={{
                            background:
                                "conic-gradient(from 0deg, rgba(255,165,0,0.45), rgba(255,20,147,0.45), rgba(255,165,0,0.45))",
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />
                    {/* Pulsing Glow Ring around Image */}
                    <motion.div
                        className="relative w-fit mx-auto mb-6 rounded-full p-[3px]"
                        animate={{
                            scale: [1, 1.04, 1],
                            boxShadow: [
                                "0 0 25px rgba(255,165,0,0.5), 0 0 35px rgba(255,105,180,0.5)",
                                "0 0 45px rgba(255,165,0,0.6), 0 0 65px rgba(255,105,180,0.6)",
                                "0 0 25px rgba(255,165,0,0.5), 0 0 35px rgba(255,105,180,0.5)",
                            ],
                        }}
                        transition={{
                            duration: 3.5,
                            repeat: Infinity,
                            repeatType: "mirror",
                            ease: "easeInOut",
                        }}
                        style={{
                            background:
                                "linear-gradient(135deg, rgba(255,165,0,0.6), rgba(255,105,180,0.6))",
                            borderRadius: "9999px",
                        }}>
                        <div className="rounded-full overflow-hidden">
                            <Image
                                src="/developer.jpg"
                                alt="Debasish Seal"
                                width={130}
                                height={130}
                                className="rounded-full border border-border shadow-md object-cover"
                            />
                        </div>
                    </motion.div>

                    <h3 className="text-xl font-semibold mb-2">Debasish Seal</h3>
                    <p className="text-muted-foreground mb-6">
                        I&apos;m a passionate full-stack web developer from India, building secure and efficient
                        digital solutions using modern web technologies like Next.js, React, and Express.
                    </p>

                    <div className="flex justify-center gap-4">
                        <Link href="https://github.com/2000Deba" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="icon" className="hover:bg-primary/10">
                                <Github className="w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href="https://in.linkedin.com/in/debasishseal" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="icon" className="hover:bg-primary/10">
                                <Linkedin className="w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </motion.div>
                {/* Signature Line with Glowing Underline */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-12 relative text-sm text-muted-foreground tracking-wide">
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
                            style={{ backgroundSize: "200% 200%" }}>
                        </motion.span>
                    </span>
                </motion.div>
            </section>
        </motion.div>
    );
}