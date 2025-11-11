"use client";

import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import Image from "next/image";
import NoPass from "@/public/NoPass.png";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const contactSchema = z.object({
  name: z
    .string()
    .min(2, { message: "The name must contain at least 2 letters." })
    .max(50, { message: "The name is too big." })
    .regex(/^[\p{L}](?:[\p{L}\s.'-]*[\p{L}])$/u, {
      message: "The name contains invalid starting or ending characters.",
    }),
  email: z.string().email({ message: "Enter valid email." }),
  subject: z
    .string()
    .min(2, { message: "Subject must be at least 2 characters." })
    .max(80, { message: "Subject cannot exceed 80 characters." }),

  message: z
    .string()
    .min(5, { message: "Message must be at least 5 characters." })
    .max(1200, { message: "Message cannot exceed 1200 characters." }),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactFormData) => {
    if (!session) return toast.error("You must be logged in to send a message.");

    // Email mismatch check
    const loggedInEmail = session?.user?.email;
    if (loggedInEmail !== data.email) {
      return toast.error("You are logged in with a different email address.");
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Message sent! Check your inbox 📩");
        reset();
      } else {
        toast.error("Something went wrong.");
      }
    } catch {
      toast.error("Network error.");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-16 px-4 relative overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">

      {/* animated playful blobs */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -left-28 top-10 w-72 h-72 rounded-full bg-gradient-to-r from-orange-300/40 to-pink-300/30 blur-3xl animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute right-0 -top-16 w-80 h-80 rounded-full bg-gradient-to-r from-pink-300/30 to-purple-400/30 blur-3xl animate-[float2_10s_ease-in-out_infinite]" />
        <div className="absolute -right-24 bottom-10 w-96 h-96 rounded-full bg-gradient-to-t from-purple-400/25 to-pink-400/20 blur-3xl animate-[float_11s_ease-in-out_infinite]" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-2xl mx-auto">
        <Card className="w-full relative overflow-hidden rounded-2xl shadow-2xl backdrop-blur-xl bg-white/90 dark:bg-slate-900/60 border border-white/40 dark:border-white/10">

          {/* Logo + Heading */}
          <CardHeader className="p-6 border-b border-white/20 dark:border-white/5 flex flex-col items-center gap-3">
            <Image src={NoPass} alt="NoPass Logo" className="w-16 h-16 opacity-90" />
            <CardTitle className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400">
              Get in Touch
            </CardTitle>
            <p className="text-sm text-muted-foreground">We would love to hear from you</p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

              <div className="space-y-1">
                <Label>Your Name</Label>
                <Input placeholder="Enter your full name" {...register("name")} />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <Label>Your Email</Label>
                {session ? (
                  <>
                    <Input type="email" defaultValue={session.user.email || ""} disabled {...register("email")} className="opacity-70 cursor-not-allowed" />
                    <p className="text-xs text-muted-foreground">Logged in as <span className="font-medium">{session.user.email}</span></p>
                  </>
                ) : (
                  <Input placeholder="example@mail.com" type="email" {...register("email")} />)}
                {errors.email && (<p className="text-red-500 text-sm">{errors.email.message}</p>)}
              </div>

              <div className="space-y-1">
                <Label>Subject</Label>
                <Input placeholder="What is your message about?" {...register("subject")} />
                {errors.subject && <p className="text-red-500 text-sm">{errors.subject.message}</p>}
              </div>

              <div className="space-y-1">
                <Label>Message</Label>
                <Textarea placeholder="Write your message here..." rows={5} {...register("message")} />
                {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 hover:opacity-90 transition">
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>

        </Card>
      </motion.div>
    </section>
  );
}
