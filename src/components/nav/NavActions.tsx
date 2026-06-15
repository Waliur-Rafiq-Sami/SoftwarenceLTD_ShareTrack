"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { UserCircle, User, LogOut, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast-service";

import LogoutDialog from "./LogoutDialog";
import UnifiedProfileModal from "@/app/components/profile/UnifiedProfileModal";

export default function NavActions() {
  const { data: session, status } = useSession();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);

  // Prevent hydration mismatch between server and client themes
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ redirect: false });
      toast.success({
        title: "Signed out successfully",
        description: "Thank you for using ShareTrack.",
      });
      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      toast.error({
        title: "Unable to sign out",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoggingOut(false);
      setShowLogoutAlert(false);
    }
  };

  const isDarkMode = mounted && (theme === "dark" || resolvedTheme === "dark");

  return (
    <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
      {status === "loading" ? (
        <div className="h-9 w-9 rounded-full bg-muted/60 animate-pulse border border-border/50 flex items-center justify-center">
          <Skeleton className="h-full w-full rounded-full bg-primary/20" />
        </div>
      ) : session ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full p-0 border border-blue-500/20 bg-blue-500/5 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.05)] transition-all duration-300 ease-out hover:scale-105 hover:border-blue-500/50 hover:bg-blue-500/15 hover:text-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 ring-offset-background flex items-center justify-center group"
              >
                <User className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent rounded-full" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 border border-border/80 shadow-xl rounded-xl"
            >
              <DropdownMenuLabel className="font-semibold tracking-wide text-muted-foreground">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* 1. Profile View */}
              <DropdownMenuItem
                className="cursor-pointer font-medium"
                onSelect={(e) => {
                  e.preventDefault();
                  setShowProfileModal(true);
                }}
              >
                <User className="mr-2 h-4 w-4" />
                Profile View
              </DropdownMenuItem>

              <div className="flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors cursor-default select-none">
                <div className="flex items-center gap-2">
                  {isDarkMode ? (
                    <Moon className="h-4 w-4 text-blue-400" />
                  ) : (
                    <Sun className="h-4 w-4 text-amber-500" />
                  )}
                  <span>Dark Mode</span>
                </div>
                <Switch
                  id="theme-mode"
                  disabled={!mounted}
                  checked={isDarkMode}
                  onCheckedChange={(checked) => {
                    setTheme(checked ? "dark" : "light");
                  }}
                />
              </div>

              <DropdownMenuSeparator />

              {/* 3. Logout Option */}
              <DropdownMenuItem
                className="cursor-pointer text-rose-500 focus:text-rose-500 focus:bg-rose-500/10 font-medium transition-colors"
                onSelect={(e) => {
                  e.preventDefault();
                  setShowLogoutAlert(true);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <UnifiedProfileModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
          />

          <LogoutDialog
            open={showLogoutAlert}
            onOpenChange={setShowLogoutAlert}
            onConfirm={handleLogout}
            isLoggingOut={isLoggingOut}
          />
        </>
      ) : (
        <Link href="/sign-in">
          <Button className="font-semibold tracking-wide px-5 shadow-md transition-all active:scale-[0.98] bg-blue-600 hover:bg-blue-700 text-white">
            Login
          </Button>
        </Link>
      )}
    </div>
  );
}
