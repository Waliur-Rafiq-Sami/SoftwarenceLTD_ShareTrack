// components/dashboard/trade-modal/ConfirmationStep.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Calculator,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Info,
} from "lucide-react";
import { TradeFormState, TradePreview } from "@/types/trade-modal/types";

interface ConfirmationStepProps {
  formData: TradeFormState;
  preview: TradePreview;
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
  onConfirm: () => void;
}

export function ConfirmationStep({
  formData,
  preview,
  isLoading,
  error,
  onBack,
  onConfirm,
}: ConfirmationStepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <DialogHeader className="text-left">
        <button
          onClick={onBack}
          className="text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 text-sm font-medium mb-4 w-fit transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to edit
        </button>
        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
          Confirm Purchase
        </DialogTitle>
        <DialogDescription>
          Review the details below. Once confirmed, this transaction will be
          permanently recorded.
        </DialogDescription>
      </DialogHeader>

      <div className="bg-slate-50 border rounded-xl p-5 space-y-4 my-6 dark:bg-[#1e293b] dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center pb-4 border-b dark:border-slate-700">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Purchasing Asset
            </span>
            <span className="text-xl font-black uppercase text-slate-900 dark:text-white">
              {formData.companyName}
            </span>
          </div>
          <div className="px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
            BUY ORDER
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Quantity</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {formData.quantity} Shares
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Rate per share
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              ${Number(formData.rate).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Gross Amount
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              ${preview.gross.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Broker Commission
            </span>
            <span className="font-semibold text-rose-500">
              +${preview.commission.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t dark:border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-base font-bold text-slate-900 dark:text-white">
            <Calculator className="h-4 w-4 text-slate-500" />
            Total Deduction
          </div>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ${preview.netImpact.toFixed(2)}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-rose-100 text-rose-700 text-sm font-medium rounded-lg flex items-start gap-2 dark:bg-rose-950/50 dark:text-rose-400">
          <Info className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <Button
        onClick={onConfirm}
        disabled={isLoading}
        className="w-full h-12 text-base font-bold transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing
            Securely...
          </>
        ) : (
          <>
            <CheckCircle2 className="mr-2 h-5 w-5" /> Execute Buy Order
          </>
        )}
      </Button>
    </div>
  );
}
