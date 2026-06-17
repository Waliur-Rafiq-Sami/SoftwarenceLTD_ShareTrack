"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Landmark, Menu, X } from "lucide-react";

import NavActions from "../Header/NavActions"; // আপনার আগের NavActions
import { Skeleton } from "@/components/ui/skeleton";

// নেভিগেশন লিংকগুলোর লিস্ট (সহজে মেনটেইন করার জন্য)
const navLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Holdings", href: "/holdings" },
  { name: "Transactions", href: "/transactions" },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Left Section: Logo & Desktop Links */}
        <div className="flex items-center gap-8 flex-1">
          {/* Logo Area */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="p-2 bg-slate-900 dark:bg-slate-800 rounded-lg">
              <Landmark className="h-5 w-5 text-white dark:text-blue-400" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Share
              <span className="text-blue-600 dark:text-blue-500">Track</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-6 flex-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-500"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right Section: User Info, Actions & Mobile Toggle */}
        <div className="flex items-center gap-4">
          {/* User Info (Loading Skeleton vs Actual Data) */}
          <div className="hidden md:flex flex-col items-end mr-2">
            {status === "loading" ? (
              // Skeleton Loader
              <div className="space-y-1.5 flex flex-col items-end">
                <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-3 w-32 bg-slate-200 dark:bg-slate-800" />
              </div>
            ) : (
              // Actual User Info
              <>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {session?.user?.username || "John Doe"}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {session?.user?.email || "john@enterprise.com"}
                </span>
              </>
            )}
          </div>

          {/* Avatar / Dropdown / Theme Toggle (Your Component) */}
          <NavActions />

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t dark:border-slate-800 bg-white dark:bg-slate-950 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)} // লিংকে ক্লিক করলে মেনু বন্ধ হয়ে যাবে
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Mobile User Info Fallback (If you want mobile users to see their email) */}
            {status === "authenticated" && (
              <div className="mt-4 pt-4 border-t dark:border-slate-800 px-3">
                <span className="block text-sm font-bold text-slate-900 dark:text-white">
                  {session?.user?.username || "John Doe"}
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {session?.user?.email || "john@enterprise.com"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
