"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, DollarSign, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { toast } from "sonner"; // অথবা আপনার প্রজেক্টের নোটিফিকেশন লাইব্রেরি

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "DEPOSIT" | "WITHDRAW";
  onSuccess: () => void;
}

export function WalletModal({
  isOpen,
  onClose,
  type,
  onSuccess,
}: WalletModalProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/wallet/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType: type, amount: parseFloat(amount) }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Transaction failed");
      }

      toast.success(data.message);
      onSuccess();
      onClose();
      setAmount("");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-white dark:bg-slate-950">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "DEPOSIT" ? (
              <ArrowDownLeft className="h-5 w-5 text-emerald-500" />
            ) : (
              <ArrowUpRight className="h-5 w-5 text-rose-500" />
            )}
            {type === "DEPOSIT" ? "Deposit Funds" : "Withdraw Funds"}
          </DialogTitle>
          <DialogDescription>
            Enter the amount you wish to {type.toLowerCase()} to your ledger.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Amount (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <Input
                type="number"
                placeholder="0.00"
                className="pl-10 h-11"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full sm:w-auto ${type === "DEPOSIT" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {type === "DEPOSIT" ? "Confirm Deposit" : "Confirm Withdrawal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
