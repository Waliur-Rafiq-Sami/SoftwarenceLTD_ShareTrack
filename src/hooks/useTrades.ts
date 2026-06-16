import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Trade {
  _id: string;
  companyName: string;
  instrument: string;
  tradeType: "BUY" | "SELL";
  quantity: number;
  rate: number;
  amount: number;
  commissionType: "PERCENTAGE" | "FIXED";
  commissionValue: number;
  commissionAmount: number;
  netAmount: number;
  transactionDate: string;
}

interface FinancialSummary {
  currentCashBalance: number;
  openingBalance: number;
  totalBuyAmount: number;
  totalSellAmount: number;
  totalCommissionPaid: number;
}

interface FetchTradesResponse {
  success: boolean;
  data: Trade[];
  financialSummary: FinancialSummary;
}

// ১. ডেটা ফেচিং হুক
export function useTrades(filters: { company?: string; action?: string } = {}) {
  return useQuery<FetchTradesResponse>({
    queryKey: ["trades", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.company) params.append("company", filters.company);
      if (filters.action) params.append("action", filters.action);

      const res = await fetch(`/api/shares?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch trades");
      return res.json();
    },
  });
}

// ২. ট্রেড তৈরি করার মিউটেশন হুক
export function useCreateTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newTrade: any) => {
      const res = await fetch("/api/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTrade),
      });
      if (!res.ok) throw new Error("Failed to create trade");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
  });
}

// ৩. ট্রেড ডিলিট করার মিউটेशन হুক
export function useDeleteTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/shares/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete trade");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
  });
}

// !----------------------------------------------------------
export function useSellTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sellData: {
      parentTradeId: string;
      quantity: number;
      rate: number;
      commissionType: string;
      commissionValue: number;
    }) => {
      const res = await fetch("/api/shares/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sellData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to execute sell");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
  });
}
