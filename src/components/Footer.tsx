"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "../../public/logo.png";
import { toast } from "@/lib/toast-service";

export function Footer() {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: feedback }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit feedback");
      }

      // Success state
      toast.success({ title: "Thank you! Your feedback has been received." });
      setFeedback("");
    } catch (error: any) {
      console.error({ title: "Feedback error:", error });
      toast.error({
        title: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-white dark:bg-[#0a0f1c] border-t border-slate-200 dark:border-slate-800 transition-colors duration-200 mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="flex flex-col space-y-5">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src={logo}
                  alt="ShareTrack Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                ShareTrack
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pr-4">
              An enterprise-grade comprehensive financial audit trail of your
              account operations, assets, and liquidity streams. Empowering your
              financial decisions with real-time data accuracy.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-5">
              Navigation
            </h3>
            <ul className="flex flex-col gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/holdings"
                  className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                >
                  holdings
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/transactions"
                  className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                >
                  transactions
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-in"
                  className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                >
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-5">
              Powered By Softwarence
            </h3>
            <ul className="flex flex-col gap-4 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="leading-relaxed">
                  Unit 4, Storm 12 Plaza Shopping Centre, 54 St Mary&apos;s Rd,
                  Southampton, UK, SO14 0BH
                </span>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-indigo-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>+44 7438 596882</span>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-indigo-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a
                  href="mailto:info@softwarence.com"
                  className="hover:text-indigo-400 transition-colors"
                >
                  info@softwarence.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Feedback Form */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-5">
              Send Feedback
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Help us improve your enterprise experience.
            </p>
            <form
              onSubmit={handleFeedbackSubmit}
              className="flex flex-col gap-3"
            >
              <input
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="How can we improve?"
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-[#0f172a] border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white transition-all disabled:opacity-50"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} A proud product of{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              Softwarence LTD
            </span>
            .
          </div>

          <a
            href="https://www.softwarence.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            <span>www.softwarence.com</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
