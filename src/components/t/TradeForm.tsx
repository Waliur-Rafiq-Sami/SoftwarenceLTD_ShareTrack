import React, { useState, useEffect } from "react";
import { useCreateTrade } from "@/hooks/useTrades";
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

export const TradeForm = () => {
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

  const [livePreview, setLivePreview] = useState({ amount: 0, netAmount: 0 });

  // ফর্মে টাইপ করার সাথে সাথে লাইভ ম্যাথ ক্যালকুলেশন (UX বুস্ট)
  useEffect(() => {
    const qty = Number(formData.quantity) || 0;
    const rate = Number(formData.rate) || 0;
    const commVal = Number(formData.commissionValue) || 0;

    const amount = qty * rate;
    let commAmount =
      formData.commissionType === "PERCENTAGE"
        ? amount * (commVal / 100)
        : commVal;

    const netAmount =
      formData.tradeType === "BUY"
        ? -(amount + commAmount)
        : amount - commAmount;

    setLivePreview({ amount, netAmount });
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTradeMutation.mutate(formData, {
      onSuccess: () => {
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
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl border space-y-4 shadow-sm"
    >
      <h3 className="text-lg font-semibold border-b pb-2 text-slate-800">
        Execute Order Transaction
      </h3>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <Label>Company (e.g. GP)</Label>
          <Input
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

        <div>
          <Label>Action Type</Label>
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
              <SelectItem value="BUY">BUY (Debit Cash)</SelectItem>
              <SelectItem value="SELL">SELL (Credit Cash)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Quantity</Label>
          <Input
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label>Rate (BDT)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.rate}
            onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div>
          <Label>Commission Structure</Label>
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
              <SelectItem value="FIXED">Fixed Amount (Tk)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Commission Value</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.commissionValue}
            onChange={(e) =>
              setFormData({ ...formData, commissionValue: e.target.value })
            }
          />
        </div>

        <div className="flex flex-col justify-end bg-slate-50 p-2 rounded border border-dashed">
          <span className="text-xs text-muted-foreground">
            Est. Net Impact:
          </span>
          <span
            className={`text-sm font-bold ${livePreview.netAmount >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {livePreview.netAmount.toFixed(2)} BDT
          </span>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-slate-900 hover:bg-slate-800 text-white"
        disabled={createTradeMutation.isPending}
      >
        {createTradeMutation.isPending
          ? "Syncing Ledger Matrix..."
          : "Post Transaction Node"}
      </Button>
    </form>
  );
};
