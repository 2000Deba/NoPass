"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { usePasswords } from "@/app/context/PasswordsContext";
import { useCards } from "@/app/context/CardsContext";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isPasswordEditMode, cancelEditPassword } = usePasswords();
  const { isCardEditMode, cancelEditCard } = useCards();

  const handleHomeClick = () => {
    // If edit mode is on, cancel it and return to normal mode.
    if (isPasswordEditMode) cancelEditPassword();
    if (isCardEditMode) cancelEditCard();

    // Then redirect to the home page.
    if (pathname !== "/") router.push("/");
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    closeMenu(); // It will close the first time, and only if the path changes.
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-primary/30 backdrop-blur-md border-b border-primary/20 supports-[backdrop-filter]:bg-primary/20 text-foreground transition-all duration-300">
      <div className="flex justify-between items-center h-16 px-8">
        {/* Logo */}
        <Link
          href="/"
          onClick={handleHomeClick}
          className="font-bold text-xl flex items-center gap-2 select-none">
          <span>NoPass</span>
          <Image
            src="/NoPass.png"
            alt="logo"
            width={38}
            height={38}
            className="object-contain"
          />
        </Link>

        {/* Desktop Menu (visible from md breakpoint and up) */}
        <nav className="hidden md:flex gap-5 items-center">
          <Link href="/"
            onClick={handleHomeClick} className="hover:text-orange-600 transition-colors">
            Home
          </Link>
          <Link href="/about" className="hover:text-orange-600 transition-colors">
            About
          </Link>
          <Link
            href="/services"
            className="hover:text-orange-600 transition-colors">
            Services
          </Link>
          <Link
            href="/contact"
            className="hover:text-orange-600 transition-colors">
            Contact
          </Link>
        </nav>

        {/* Right Section (Desktop Only) */}
        <div className="hidden md:flex gap-2 items-center">
          {/* Theme Toggle */}
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            <Sun className="h-[1.2rem] w-[1.2rem] transition-all rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] transition-all rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Auth Buttons */}
          {!session ? (
            <>
              <Link href="/login">
                <Button className="text-white font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  className="font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5">
                  Sign Up
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-white font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5">
                Logout
              </Button>
            </>
          )}
        </div>

        {/* Right section (Mobile only) */}
        <div className="flex md:hidden items-center gap-2">
          {/* Theme Button */}
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            <Sun className="h-[1.2rem] w-[1.2rem] transition-all rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] transition-all rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Hamburger Button */}
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md hover:bg-primary/40 transition bg-primary/30"
            aria-label="Toggle menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={clsx("md:hidden border-t border-primary/20 bg-primary/30 supports-[backdrop-filter]:bg-primary/20 backdrop-blur-md shadow-sm")}>
            <nav className="flex flex-col gap-4 p-5">
              <Link href="/" onClick={closeMenu}>
                Home
              </Link>
              <Link href="/about" onClick={closeMenu}>
                About
              </Link>
              <Link href="/services" onClick={closeMenu}>
                Services
              </Link>
              <Link href="/contact" onClick={closeMenu}>
                Contact
              </Link>

              <div className="flex flex-col gap-3 mt-3">
                {!session ? (
                  <>
                    <Link href="/login" onClick={closeMenu}>
                      <Button className="text-white w-full">Login</Button>
                    </Link>
                    <Link href="/register" onClick={closeMenu}>
                      <Button variant="outline" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard" onClick={closeMenu}>
                      <Button variant="outline" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      onClick={() => {
                        closeMenu();
                        signOut({ callbackUrl: "/" });
                      }}
                      className="text-white w-full">
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
export default Navbar;