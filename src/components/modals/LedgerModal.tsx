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
import { Wallet, ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";

interface LedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "DEPOSIT" | "WITHDRAW";
  onSuccess: () => void;
}

export function LedgerManagementModal({
  isOpen,
  onClose,
  mode,
  onSuccess,
}: LedgerModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);
    const endpoint =
      mode === "DEPOSIT" ? "/api/ledger/deposit" : "/api/ledger/withdraw";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ amount: Number(amount) }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setAmount("");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Transaction failed");
      }
    } catch (error) {
      console.error("Operation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] border-slate-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {mode === "DEPOSIT" ? (
              <ArrowDownCircle className="w-5 h-5 text-emerald-500" />
            ) : (
              <ArrowUpCircle className="w-5 h-5 text-rose-500" />
            )}
            {mode} Funds
          </DialogTitle>
          <DialogDescription>
            Enter the amount you wish to {mode.toLowerCase()} to your trading
            account.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label
              htmlFor="amount"
              className="text-xs font-semibold uppercase text-slate-500"
            >
              Amount (৳)
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-12 text-lg font-mono"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} className="h-10">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className={`h-10 ${mode === "DEPOSIT" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              `Confirm ${mode}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
