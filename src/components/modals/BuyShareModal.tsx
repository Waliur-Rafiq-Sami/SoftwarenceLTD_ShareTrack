"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  TrendingUp,
  Receipt,
  Wallet,
  Info,
  Landmark,
} from "lucide-react";

interface Company {
  companyName: string;
  shareQuantity: number;
}

interface BuyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BuyShareModal({
  isOpen,
  onClose,
  onSuccess,
}: BuyShareModalProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 📝 বিশুদ্ধ ফর্ম স্টেট
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [shareName, setShareName] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [commissionType, setCommissionType] = useState<string>("PERCENTAGE");
  const [commissionValue, setCommissionValue] = useState<string>("0");
  const [status, setStatus] = useState<string>("EXECUTED");
  const [forceBuy, setForceBuy] = useState<boolean>(false);

  // 💰 রিয়েল-টাইম লাইভ ব্যালেন্স প্রিভিউইয়ার ম্যাথ নোড
  const qtyNum = Number(quantity) || 0;
  const rateNum = Number(rate) || 0;
  const commVal = Number(commissionValue) || 0;
  const grossAmount = qtyNum * rateNum;
  const computedCommission =
    commissionType === "PERCENTAGE" ? (grossAmount * commVal) / 100 : commVal;
  const totalCost = grossAmount + computedCommission;

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
      resetForm();
    }
  }, [isOpen]);

  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const res = await fetch("/api/company");
      const data = await res.json();
      if (data.success) setCompanies(data.companies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const resetForm = () => {
    setSelectedCompany("");
    setShareName("");
    setQuantity("");
    setRate("");
    setCommissionValue("0");
    setForceBuy(false);
    setStatus("EXECUTED");
  };

  const handleOrderSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany || !shareName || !quantity || !rate) {
      alert("Rejection Note: All mandatory asset fields must be filled.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/trade/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: selectedCompany,
          shareName: shareName.trim().toUpperCase(),
          quantity: qtyNum,
          rate: rateNum,
          commissionType,
          commissionValue: commVal,
          status,
          forceBuy,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
        onClose();
      } else alert(data.message);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold tracking-tight flex items-center gap-2.5 text-slate-900 dark:text-zinc-50">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-100/50">
              <TrendingUp className="w-4 h-4" />
            </div>
            Deploy Capital Order (BUY)
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Select a pre-registered corporate entity and define settlement
            parameters below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleOrderSubmission} className="space-y-4 mt-2">
          {/* 🏢 ড্রপডাউন: শুধুমাত্র অলরেডি সেভ করা কোম্পানির তালিকা */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-slate-400" /> Target
              Corporate Registry
            </Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="h-10 text-xs border-slate-200">
                <SelectValue
                  placeholder={
                    loadingCompanies
                      ? "Querying database indexes..."
                      : "Choose target corporate node"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem
                    key={c.companyName}
                    value={c.companyName}
                    className="text-xs py-2"
                  >
                    <div className="flex justify-between items-center w-64">
                      <span className="font-semibold">{c.companyName}</span>
                      <Badge
                        variant="secondary"
                        className="text-[9px] scale-90 font-mono"
                      >
                        Qty: {c.shareQuantity}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 📊 গ্রিড: টিকার কোড ও এক্সিকিউশন মোড */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="shareName" className="text-xs font-bold">
                Ticker Symbol Code
              </Label>
              <Input
                id="shareName"
                placeholder="e.g. SQPHARMA"
                value={shareName}
                onChange={(e) => setShareName(e.target.value)}
                className="text-xs font-bold uppercase tracking-widest h-10 border-slate-200"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs font-bold">
                Execution Lifecyle Mode
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger
                  id="status"
                  className="text-xs h-10 border-slate-200"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXECUTED" className="text-xs">
                    MARKET ORDER (Instant)
                  </SelectItem>
                  <SelectItem value="PENDING" className="text-xs">
                    LIMIT ORDER (Pending Queue)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* গ্রিড: কোয়ান্টিটি এবং রেট */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="quantity" className="text-xs font-bold">
                Volume Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="text-xs h-10 border-slate-200"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rate" className="text-xs font-bold">
                Target Price Rate (৳)
              </Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="text-xs h-10 border-slate-200"
                required
              />
            </div>
          </div>

          {/* 🧾 কমিশন সাব-কার্ড */}
          <div className="bg-slate-50/80 dark:bg-zinc-800/30 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800/80 grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5" /> Brokerage Fee
              </Label>
              <Select value={commissionType} onValueChange={setCommissionType}>
                <SelectTrigger className="text-xs bg-white dark:bg-zinc-900 h-8 border-slate-200/70">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE" className="text-xs">
                    Percentage (%)
                  </SelectItem>
                  <SelectItem value="FIXED" className="text-xs">
                    Fixed Absolute (৳)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-500">
                Fee Multiplier Value
              </Label>
              <Input
                type="number"
                step="0.01"
                value={commissionValue}
                onChange={(e) => setCommissionValue(e.target.value)}
                className="text-xs bg-white dark:bg-zinc-900 h-8 border-slate-200/70 font-semibold"
              />
            </div>
          </div>

          {/* ⚡ লাইভ কস্ট ব্রেকডাউন */}
          {grossAmount > 0 && (
            <div className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-xl text-[11px] font-mono space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Gross Principal Cost:</span>
                <span>৳{grossAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 border-b pb-1">
                <span>Commission Drag:</span>
                <span className="text-rose-500">
                  ৳{computedCommission.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-indigo-700 pt-0.5">
                <span className="flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> Estimated Cost:
                </span>
                <span>৳{totalCost.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* 🛡️ ওভারড্রাফট চেক */}
          {status === "EXECUTED" && (
            <div className="flex items-start space-x-2 bg-amber-50/50 border border-amber-200/50 p-2.5 rounded-lg">
              <Checkbox
                id="forceBuy"
                checked={forceBuy}
                onCheckedChange={(checked) => setForceBuy(!!checked)}
                className="mt-0.5 border-amber-400"
              />
              <div className="grid gap-0.5 leading-none">
                <label
                  htmlFor="forceBuy"
                  className="text-[11px] font-semibold text-amber-900 cursor-pointer"
                >
                  Bypass Account Liquidity Cap
                </label>
                <p className="text-[10px] text-amber-600/90 flex items-center gap-0.5">
                  <Info className="w-3 h-3" /> Allows trade execution with
                  negative cash balance.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs h-9 rounded-xl"
            >
              Abort
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedCompany}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold h-9 rounded-xl min-w-[120px]"
            >
              {isSubmitting ? "Transmitting..." : "Deploy Capital"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
