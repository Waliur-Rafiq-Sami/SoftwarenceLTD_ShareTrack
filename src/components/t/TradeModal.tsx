"use client";

import React, { useState, useEffect } from "react";
import { useCreateTrade } from "@/hooks/useTrades";
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
import { PlusCircle } from "lucide-react";

export const TradeModal = () => {
  const [open, setOpen] = useState(false);
  const createTradeMutation = useCreateTrade();

  const [formData, setFormData] = useState({
    companyName: "",
    instrument: "",
    tradeType: "BUY",
    quantity: "",
    rate: "",
    commissionType: "PERCENTAGE",
    commissionValue: "0.5",
  });

  const [preview, setPreview] = useState({ amount: 0, netAmount: 0 });

  // রিয়াল-টাইম লাইভ ক্যালকুলেশন
  useEffect(() => {
    const qty = Number(formData.quantity) || 0;
    const rate = Number(formData.rate) || 0;
    const commVal = Number(formData.commissionValue) || 0;

    const amount = qty * rate;
    let commAmount =
      formData.commissionType === "PERCENTAGE"
        ? amount * (commVal / 100)
        : commVal;

    // BUY হলে মাইনাস, SELL হলে প্লাস
    const netAmount =
      formData.tradeType === "BUY"
        ? -(amount + commAmount)
        : amount - commAmount;

    setPreview({ amount, netAmount });
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTradeMutation.mutate(
      {
        ...formData,
        quantity: Number(formData.quantity),
        rate: Number(formData.rate),
        commissionValue: Number(formData.commissionValue),
      },
      {
        onSuccess: () => {
          setOpen(false); // সাবমিট সফল হলে পপআপ বন্ধ হবে
          setFormData({
            companyName: "",
            instrument: "",
            tradeType: "BUY",
            quantity: "",
            rate: "",
            commissionType: "PERCENTAGE",
            commissionValue: "0.5",
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white gap-2 shadow-sm">
          <PlusCircle className="h-4 w-4" /> Post New Order (Popup)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Execute Order Protocol
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Company / Instrument</Label>
              <Input
                placeholder="e.g. GP, BEXIMCO"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    companyName: e.target.value.toUpperCase(),
                    instrument: e.target.value.toUpperCase(),
                  })
                }
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Order Action</Label>
              <Select
                value={formData.tradeType}
                onValueChange={(val) =>
                  setFormData({ ...formData, tradeType: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY">BUY (- Cash)</SelectItem>
                  <SelectItem value="SELL">SELL (+ Cash)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Share Quantity</Label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Rate per Share (Tk)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.rate}
                onChange={(e) =>
                  setFormData({ ...formData, rate: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-3">
            <div className="space-y-1">
              <Label>Commission Mode</Label>
              <Select
                value={formData.commissionType}
                onValueChange={(val) =>
                  setFormData({ ...formData, commissionType: val })
                }
              >
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
              <Label>Broker Fee / Comm.</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.commissionValue}
                onChange={(e) =>
                  setFormData({ ...formData, commissionValue: e.target.value })
                }
              />
            </div>
          </div>

          {/* লাইভ প্রাক-হিসাব প্যানেল */}
          <div className="bg-slate-50 p-4 rounded-lg border border-dashed flex justify-between items-center mt-2">
            <div>
              <p className="text-xs text-muted-foreground">
                Gross Amount: ৳{preview.amount.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                Execution Status:{" "}
                <span
                  className={
                    formData.tradeType === "BUY"
                      ? "text-red-500 font-semibold"
                      : "text-green-500 font-semibold"
                  }
                >
                  {formData.tradeType}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-medium">
                Net Realized Value:
              </p>
              <p
                className={`text-lg font-black ${preview.netAmount >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {preview.netAmount >= 0 ? "+" : ""}
                {preview.netAmount.toFixed(2)} BDT
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6"
              disabled={createTradeMutation.isPending}
            >
              {createTradeMutation.isPending
                ? "Injecting Data..."
                : "Confirm & Save Node"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
