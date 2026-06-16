import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const LedgerAdjuster = () => {
  const queryClient = useQueryClient();
  const [adjustData, setAdjustData] = useState({ type: "RECEIPT", amount: "" });
  const [loading, setLoading] = useState(false);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // আপনি আপনার লেজার রাউটে এটি হিট করবেন
      const res = await fetch("/api/shares/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(adjustData.amount),
          action: adjustData.type, // RECEIPT বা PAYMENT
        }),
      });
      console.log("lad: ", res);
      console.log("lad: ", res.json());

      if (res.ok) {
        setAdjustData({ ...adjustData, amount: "" });
        queryClient.invalidateQueries({ queryKey: ["trades"] });
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleAdjust}
      className="bg-white p-6 rounded-xl border flex flex-col justify-between shadow-sm"
    >
      <div>
        <h3 className="text-lg font-semibold border-b pb-2 text-slate-800">
          Cash Flow (Receipt/Payment)
        </h3>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label>Flow Type</Label>
            <select
              className="w-full border h-10 px-3 rounded-md text-sm bg-white"
              value={adjustData.type}
              onChange={(e) =>
                setAdjustData({ ...adjustData, type: e.target.value })
              }
            >
              <option value="RECEIPT">Deposit (Receipt)</option>
              <option value="PAYMENT">Withdrawal (Payment)</option>
            </select>
          </div>
          <div>
            <Label>Cash Amount (Tk)</Label>
            <Input
              type="number"
              value={adjustData.amount}
              onChange={(e) =>
                setAdjustData({ ...adjustData, amount: e.target.value })
              }
              required
            />
          </div>
        </div>
      </div>
      <Button
        type="submit"
        className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
        disabled={loading}
      >
        {loading ? "Processing Flow..." : "Inject Cash Node"}
      </Button>
    </form>
  );
};
