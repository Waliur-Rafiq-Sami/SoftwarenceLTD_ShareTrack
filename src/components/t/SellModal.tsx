"use client";

import React, { useState, useEffect } from "react";
import { useSellTrade, Trade } from "@/hooks/useTrades";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TrendingUp } from "lucide-react";

interface SellModalProps {
  trade: Trade; // টেবিলের নির্দিষ্ট রো-এর ট্রেড অবজেক্ট
}

export const SellModal: React.FC<SellModalProps> = ({ trade }) => {
  const [open, setOpen] = useState(false);
  const sellTradeMutation = useSellTrade();

  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [commissionType, setCommissionType] = useState("PERCENTAGE");
  const [commissionValue, setCommissionValue] = useState("0.5");
  const [netPreview, setNetPreview] = useState(0);

  // লাইভ নেট রিটার্ন প্রাক-হিসাব
  useEffect(() => {
    const qty = Number(quantity) || 0;
    const r = Number(rate) || 0;
    const cVal = Number(commissionValue) || 0;

    const gross = qty * r;
    const comm = commissionType === "PERCENTAGE" ? gross * (cVal / 100) : cVal;
    setNetPreview(gross - comm); // সেল করার পর হাত দিয়ে কমিশন কেটে বাকি টাকা ক্যাশে ঢুকবে
  }, [quantity, rate, commissionType, commissionValue]);

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sellTradeMutation.mutate(
      {
        parentTradeId: trade._id,
        quantity: Number(quantity),
        rate: Number(rate),
        commissionType,
        commissionValue: Number(commissionValue),
      },
      {
        onSuccess: () => {
          setOpen(false);
          setQuantity("");
          setRate("");
        },
        onError: (err: any) => {
          alert(err.message);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-1 h-7"
        >
          SELL
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" /> Sell Position:{" "}
            {trade.companyName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSellSubmit} className="space-y-4 mt-2">
          <div className="bg-slate-50 p-3 rounded-lg border text-xs text-slate-600 space-y-1">
            <p>
              <strong>Available Inventory:</strong> {trade.quantity} Shares
            </p>
            <p>
              <strong>Original Buy Price:</strong> ৳{trade.rate.toFixed(2)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Sell Quantity</Label>
              <Input
                type="number"
                max={trade.quantity}
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Sell Rate (Tk)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-3">
            <div className="space-y-1">
              <Label>Commission Mode</Label>
              <Select value={commissionType} onValueChange={setCommissionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  <SelectItem value="FIXED">Fixed (Tk)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Comm. Value</Label>
              <Input
                type="number"
                step="0.01"
                value={commissionValue}
                onChange={(e) => setCommissionValue(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200 border-dashed flex justify-between items-center">
            <span className="text-xs text-emerald-800 font-medium">
              Est. Cash Inflow:
            </span>
            <span className="text-base font-black text-emerald-700">
              +৳{netPreview.toFixed(2)} BDT
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-slate-900 text-white hover:bg-slate-800"
              disabled={sellTradeMutation.isPending}
            >
              {sellTradeMutation.isPending
                ? "Executing..."
                : "Liquidate Position"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
