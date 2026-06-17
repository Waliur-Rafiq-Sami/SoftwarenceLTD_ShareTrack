"use client";

import React from "react";
import { LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoggingOut: boolean;
}

export default function LogoutDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoggingOut,
}: LogoutDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[420px] border border-border/80 shadow-2xl rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
            <LogOut className="h-5 w-5 text-rose-500" />
            Secure Logout
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed">
            Are you sure you want to exit? You will need to re-authenticate to
            access the ShareTrack system again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 sm:mt-6">
          <AlertDialogCancel
            className="font-medium tracking-wide transition-colors"
            disabled={isLoggingOut}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoggingOut}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold tracking-wide shadow-md transition-all active:scale-[0.98] border-none"
          >
            {isLoggingOut ? "Processing..." : "Confirm Logout"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
