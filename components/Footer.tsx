"use client";

import Link from "next/link";
import {
  FaFacebook,
  FaTwitter,
  FaGithub,
  FaLinkedin,
  FaInstagram,
} from "react-icons/fa";

export default function Footer() {
  const socials = [
    { Icon: FaFacebook, url: "https://www.facebook.com/share/19h1bGQxvK/", label: "Facebook" },
    { Icon: FaTwitter, url: "https://x.com/shildebasish", label: "Twitter" },
    { Icon: FaInstagram, url: "https://www.instagram.com/sildebasish02?igsh=MWN4dmdkZDZvNjYxMg==", label: "Instagram" },
    { Icon: FaLinkedin, url: "https://in.linkedin.com/in/debasishseal", label: "LinkedIn" },
    { Icon: FaGithub, url: "https://github.com/2000Deba", label: "GitHub" },
  ];

  return (
    <footer className="w-full pt-10 pb-8 text-foreground bg-gradient-to-r from-[#ff9f5b] to-[#ff4b82] dark:from-[#0b1120] dark:to-[#221b44]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">

          {/* Brand / Description */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-wide bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent dark:from-orange-300 dark:to-pink-300">
              NoPass
            </h2>
            <p className="max-w-xs pt-1 text-foreground text-sm opacity-90">
              Securely store and manage your passwords and cards in one encrypted vault.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col lg:flex-row items-center gap-3 text-center lg:text-right">
            <Link href="/privacy-policy" className="hover:text-yellow-300 hover:underline transition-colors duration-200 font-medium">Privacy Policy</Link>
            <span className="hidden lg:inline">|</span>
            <Link href="/terms-and-conditions" className="hover:text-yellow-300 hover:underline transition-colors duration-200 font-medium">Terms of Service</Link>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-5">
            {socials.map(({ Icon, url, label }, i) => (
              <Link
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-300 rounded-full">
                <Icon className="w-6 h-6 text-foreground hover:text-yellow-300 transition-colors" />
              </Link>
            ))}
          </div>

        </div>

        {/* Divider Line */}
        <div className="h-[1px] bg-white/30 dark:bg-white/15 my-6"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm sm:text-lg text-foreground text-center tracking-wide opacity-90">
          <p>Copyright © {new Date().getFullYear()} <span className="font-semibold">NoPass</span>. All Rights Reserved.</p>
          <p className="pt-2 md:mt-0">Created with ❤️ by Deba</p>
        </div>

      </div>
    </footer>
  );
}
