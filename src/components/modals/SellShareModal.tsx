"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SellShareModal({
  isOpen,
  onClose,
  onSuccess,
  share,
}: any) {
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");

  const [commissionType, setCommissionType] = useState<"FIXED" | "PERCENTAGE">(
    "FIXED",
  );

  const [commissionValue, setCommissionValue] = useState("");

  const handleSell = async () => {
    const response = await fetch("/api/trade/sell", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyName: share.companyName,
        shareName: share.shareName,

        quantity: Number(quantity),
        rate: Number(rate),

        commissionType,
        commissionValue: Number(commissionValue),
      }),
    });

    const data = await response.json();

    if (data.success) {
      onSuccess();
      onClose();
    } else {
      alert(data.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sell {share?.companyName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <Input
            type="number"
            placeholder="Sell Rate"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />

          <select
            className="w-full border rounded-md p-2"
            value={commissionType}
            onChange={(e) =>
              setCommissionType(e.target.value as "FIXED" | "PERCENTAGE")
            }
          >
            <option value="FIXED">Fixed Commission</option>

            <option value="PERCENTAGE">Percentage Commission</option>
          </select>

          <Input
            type="number"
            placeholder={
              commissionType === "FIXED"
                ? "Commission Amount"
                : "Commission Percentage"
            }
            value={commissionValue}
            onChange={(e) => setCommissionValue(e.target.value)}
          />

          <Button onClick={handleSell} className="w-full">
            Confirm Sale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
