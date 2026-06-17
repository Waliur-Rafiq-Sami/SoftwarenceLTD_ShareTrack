// components/dashboard/trade-modal/ExecutionPreview.tsx
"use client";

import React from "react";
import { Receipt } from "lucide-react";
import { TradePreview } from "@/types/trade-modal/types";

interface ExecutionPreviewProps {
  preview: TradePreview;
}

export function ExecutionPreview({ preview }: ExecutionPreviewProps) {
  if (preview.gross <= 0) return null;

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2">
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
        Execution Summary
      </h4>
      <div className="flex justify-between text-sm">
        <span className="text-slate-500 dark:text-slate-400">Gross Value</span>
        <span className="font-medium text-slate-700 dark:text-slate-300">
          ${preview.gross.toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-500 dark:text-slate-400">Commission</span>
        <span className="font-medium text-rose-500 dark:text-rose-400">
          +${preview.commission.toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Total Funds Required
        </span>
        <span className="text-lg font-black text-slate-900 dark:text-white">
          ${preview.netImpact.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
