// components/dashboard/trade-modal/types.ts
export interface TradeFormState {
  companyName: string;
  quantity: string;
  rate: string;
  commissionType: "PERCENTAGE" | "FIXED";
  commissionValue: string;
}

export interface TradePreview {
  gross: number;
  commission: number;
  netImpact: number;
}
