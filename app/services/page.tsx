"use client"

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Key, Laptop, Zap, Download, QrCode } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function ServicesPage() {
    const [showMobileCTA, setShowMobileCTA] = useState(false)

    useEffect(() => {
        if (typeof navigator !== "undefined") {
            const isAndroid = /Android/i.test(navigator.userAgent)
            setShowMobileCTA(isAndroid)
        }
    }, [])

    const APK_URL = "https://nopass-deba.vercel.app/downloads/NoPassMobile-v1.0.1.apk"
    const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(APK_URL)}`

    const services = [
        {
            icon: <Shield className="w-10 h-10 text-primary" />,
            title: "Secure Password Storage",
            desc: "Keep all your passwords encrypted and safely stored in the NoPass vault.",
        },
        {
            icon: <Key className="w-10 h-10 text-primary" />,
            title: "Password Generator",
            desc: "Generate strong and unique passwords for all your accounts instantly.",
        },
        {
            icon: <Laptop className="w-10 h-10 text-primary" />,
            title: "Device Sync",
            desc: "Access your saved passwords from any of your trusted devices securely.",
        },
        {
            icon: <Zap className="w-10 h-10 text-primary" />,
            title: "Auto Fill & Quick Access",
            desc: "Save time by logging in automatically with our autofill feature.",
        },
    ]

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-background to-muted/30 px-6 py-20 text-center overflow-hidden">
            {/* Animated background glow — improved for both themes */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, -50, 0],
                    y: [0, 30, -30, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute -top-48 -left-48 w-[520px] h-[520px] bg-gradient-to-r from-orange-400/40 via-pink-500/35 to-purple-500/40 rounded-full blur-3xl dark:opacity-40 opacity-60 pointer-events-none"
            />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{
                    opacity: 0.5,
                    scale: [1, 1.2, 1],
                    x: [0, 50, -50, 0],
                    y: [0, 30, -30, 0],
                }}
                transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute bottom-0 right-0 w-[480px] h-[480px] bg-gradient-to-r from-purple-500/40 via-blue-500/35 to-cyan-400/40 rounded-full blur-3xl dark:opacity-40 opacity-60 pointer-events-none"
            />

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="max-w-3xl mx-auto mb-16 relative z-10">
                <h1 className="text-4xl font-bold mb-4">Our Services</h1>
                <p className="text-muted-foreground text-lg">
                    At <span className="font-semibold text-primary">NoPass</span>, your digital security is our priority.
                    Explore the powerful tools that make your online life easier and safer.
                </p>
            </motion.div>

            {/* Service Cards (equal height + glow) */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto relative z-10">
                {services.map((service, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 * index, duration: 0.6, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="transform transition-all duration-300">
                        <Card className="h-full flex flex-col justify-between shadow-md hover:shadow-xl hover:-translate-y-2 hover:bg-muted/40 transition-all duration-300 border border-border/60 backdrop-blur-md hover:border-primary/30">
                            <CardHeader className="flex flex-col items-center text-center">
                                <motion.div
                                    whileHover={{ rotate: 6, scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="mb-4">
                                    {service.icon}
                                </motion.div>
                                <CardTitle className="text-xl font-semibold">{service.title}</CardTitle>
                                <CardDescription className="mt-2 text-muted-foreground">{service.desc}</CardDescription>
                            </CardHeader>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* CTA Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                viewport={{ once: true }}
                className="mt-20 relative z-10">
                <Card className="border-primary/30 backdrop-blur bg-muted/40">
                    <CardHeader className="space-y-4 text-center">
                        <QrCode className="w-10 h-10 mx-auto text-primary" />
                        <CardTitle className="text-2xl">
                            Install NoPass Android App
                        </CardTitle>
                        <CardDescription>
                            Scan the QR code to download the official NoPass Android app.
                            Secured & verified by Google Play Protect.
                        </CardDescription>

                        {/* QR Code */}
                        <div className="flex justify-center">
                            <Image
                                src={QR_URL}
                                alt="Scan to download NoPass Android App"
                                width={160}
                                height={160}
                                unoptimized
                                className="rounded-lg border"
                            />
                        </div>

                        {/* Play Protect Image */}
                        <div className="flex justify-center">
                            <Image
                                src="/play-protect-scan.png"
                                alt="Google Play Protect Scan Result"
                                width={260}
                                height={160}
                                className="rounded-md"
                            />
                        </div>

                        {/* 📱 Mobile only download button */}
                        {showMobileCTA && (
                            <Link href="/downloads/NoPassMobile-v1.0.1.apk">
                                <Button size="lg" className="gap-2 mt-4 md:hidden">
                                    <Download size={18} />
                                    Download APK
                                </Button>
                            </Link>
                        )}

                        {/* Desktop hint */}
                        <p className="text-xs text-muted-foreground hidden md:block">
                            Desktop user? Scan the QR code using your mobile device.
                        </p>
                    </CardHeader>
                </Card>
            </motion.div>

            {/* Final CTA */}
            <div className="mt-24">
                <Link href="/">
                    <Button size="lg" variant="secondary">
                        Continue on Web
                    </Button>
                </Link>
            </div>
        </div>
    )
}