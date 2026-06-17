"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TradeFormState } from "@/types/trade-modal/types";
import { CompanySearch } from "../trade-modal/CompanySearch";
import { ExecutionPreview } from "../trade-modal/ExecutionPreview";
import { ConfirmationStep } from "../trade-modal/ConfirmationStep";
import { toast } from "@/lib/toast-service";

// Import your sub-components and types

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TradeModal({ isOpen, onClose, onSuccess }: TradeModalProps) {
  const [step, setStep] = useState<"INPUT" | "CONFIRM">("INPUT");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API State
  const [activeCompanies, setActiveCompanies] = useState<string[]>([]);
  const [isFetchingCompanies, setIsFetchingCompanies] = useState(false);

  const [formData, setFormData] = useState<TradeFormState>({
    companyName: "",
    quantity: "",
    rate: "",
    commissionType: "PERCENTAGE",
    commissionValue: "0.5",
  });

  // Fetch symbols on open
  useEffect(() => {
    if (isOpen) {
      const fetchSymbols = async () => {
        setIsFetchingCompanies(true);
        try {
          const res = await fetch("/api/holdings/symbols");
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setActiveCompanies(json.data);
          }
        } catch (error) {
          console.error("Failed to fetch symbols:", error);
        } finally {
          setIsFetchingCompanies(false);
        }
      };
      fetchSymbols();
    }
  }, [isOpen]);

  // Calculations
  const preview = useMemo(() => {
    const qty = Number(formData.quantity) || 0;
    const rate = Number(formData.rate) || 0;
    const commVal = Number(formData.commissionValue) || 0;

    const gross = qty * rate;
    const commission =
      formData.commissionType === "PERCENTAGE"
        ? gross * (commVal / 100)
        : commVal;

    const netImpact = gross + commission;

    return { gross, commission, netImpact };
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName) {
      setError("Please select or enter a company name.");
      return;
    }
    setError(null);
    setStep("CONFIRM");
  };

  const handleExecuteTrade = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/trade/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          actionType: "BUY",
          quantity: Number(formData.quantity),
          rate: Number(formData.rate),
          commissionValue: Number(formData.commissionValue),
        }),
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to execute purchase.");

      toast.success({
        title: "Purchase Successful",
        description: `Successfully bought shares of ${formData.companyName}.`,
      });

      handleReset();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
      toast.error({
        title: "Execution Failed",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      companyName: "",
      quantity: "",
      rate: "",
      commissionType: "PERCENTAGE",
      commissionValue: "0",
    });
    setStep("INPUT");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleReset()}>
      <DialogContent className="w-[95vw] max-w-[500px] sm:w-full rounded-2xl dark:bg-slate-950/95 dark:border-slate-800 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        {step === "INPUT" ? (
          <>
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl font-bold">
                Buy Asset
              </DialogTitle>
              <DialogDescription>
                Enter the details of the asset you wish to purchase.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleReview} className="space-y-5 mt-4">
              <CompanySearch
                value={formData.companyName}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, companyName: val }))
                }
                activeCompanies={activeCompanies}
                isFetching={isFetchingCompanies}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>

                  <div className="relative">
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="0.01"
                      step="any"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="0"
                      required
                      className="h-12 pl-10 text-base font-medium"
                    />

                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                      Qty
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Number of shares
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate">Share Price</Label>

                  <div className="relative">
                    <Input
                      id="rate"
                      name="rate"
                      type="number"
                      min="0.01"
                      step="any"
                      value={formData.rate}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                      className="h-12 pl-10 text-base font-medium"
                    />

                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      ৳
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Price per share
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Broker Commission</Label>

                <div
                  className="
                  h-12
      flex overflow-hidden
      rounded-xl
      border border-slate-200
      bg-white
      dark:bg-slate-950
      dark:border-slate-800

      focus-within:border-emerald-500
      focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.15)]

      transition-all duration-300
    "
                >
                  <Select
                    value={formData.commissionType}
                    onValueChange={(val: "PERCENTAGE" | "FIXED") =>
                      setFormData((prev) => ({
                        ...prev,
                        commissionType: val,
                      }))
                    }
                  >
                    <SelectTrigger
                      className="
          w-[170px]
          h-12
          border-0
          rounded-none
          bg-slate-50
          dark:bg-slate-900
          shadow-none
          focus:ring-0
        "
                    >
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent className="bg-background">
                      <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>

                      <SelectItem value="FIXED">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="relative flex-1">
                    <span
                      className="
          absolute left-4 top-1/2
          -translate-y-1/2
          text-slate-400
          font-bold
        "
                    >
                      {formData.commissionType === "PERCENTAGE" ? "%" : "৳"}
                    </span>

                    <Input
                      name="commissionValue"
                      type="number"
                      min="0"
                      step="any"
                      value={formData.commissionValue}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="
          h-12
          border-0
          rounded-none
          pl-10

          text-lg
          font-semibold

          focus-visible:ring-0
          shadow-none
        "
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Broker fee applied to this transaction
                </p>
              </div>

              <ExecutionPreview preview={preview} />

              {error && (
                <div className="text-sm text-rose-500 font-medium">{error}</div>
              )}

              <Button
                type="submit"
                disabled={preview.gross === 0 || !formData.companyName}
                className="w-full h-12 text-base font-bold text-white"
              >
                Review Purchase Details
              </Button>
            </form>
          </>
        ) : (
          <ConfirmationStep
            formData={formData}
            preview={preview}
            isLoading={isLoading}
            error={error}
            onBack={() => setStep("INPUT")}
            onConfirm={handleExecuteTrade}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
