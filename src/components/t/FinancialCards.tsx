// import React from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ArrowUpRight, ArrowDownRight, Wallet, Percent } from "lucide-react";

// interface FinancialCardsProps {
//   summary?: {
//     currentCashBalance: number;
//     openingBalance: number;
//     totalBuyAmount: number;
//     totalSellAmount: number;
//     totalCommissionPaid: number;
//   };
//   netTrading: number;
// }

// export const FinancialCards: React.FC<FinancialCardsProps> = ({
//   summary,
//   netTrading,
// }) => {
//   const formatBDT = (val: number = 0) =>
//     new Intl.NumberFormat("en-BD", {
//       style: "currency",
//       currency: "BDT",
//     }).format(val);

//   return (
//     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//       <Card className="border-l-4 border-l-blue-500">
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-medium text-muted-foreground">
//             Opening Balance
//           </CardTitle>
//           <Wallet className="h-4 w-4 text-blue-500" />
//         </CardHeader>
//         <CardContent>
//           <div className="text-2xl font-bold">
//             {formatBDT(summary?.openingBalance)}
//           </div>
//         </CardContent>
//       </Card>

//       <Card className="border-l-4 border-l-red-500">
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-medium text-muted-foreground">
//             Net Trading Vol
//           </CardTitle>
//           {netTrading >= 0 ? (
//             <ArrowUpRight className="h-4 w-4 text-green-500" />
//           ) : (
//             <ArrowDownRight className="h-4 w-4 text-red-500" />
//           )}
//         </CardHeader>
//         <CardContent>
//           <div
//             className={`text-2xl font-bold ${netTrading >= 0 ? "text-green-600" : "text-red-600"}`}
//           >
//             {formatBDT(netTrading)}
//           </div>
//         </CardContent>
//       </Card>

//       <Card className="border-l-4 border-l-orange-500">
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-medium text-muted-foreground">
//             Total Commission
//           </CardTitle>
//           <Percent className="h-4 w-4 text-orange-500" />
//         </CardHeader>
//         <CardContent>
//           <div className="text-2xl font-bold text-orange-600">
//             {formatBDT(summary?.totalCommissionPaid)}
//           </div>
//         </CardContent>
//       </Card>

//       <Card className="border-l-4 border-l-green-500 bg-green-50/30">
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-sm font-medium text-emerald-800">
//             Closing Cash Balance
//           </CardTitle>
//           <Wallet className="h-4 w-4 text-green-500" />
//         </CardHeader>
//         <CardContent>
//           <div className="text-2xl font-bold text-green-700">
//             {formatBDT(summary?.currentCashBalance)}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Percent,
  BarChart3,
} from "lucide-react";

interface FinancialCardsProps {
  summary?: {
    currentCashBalance: number;
    openingBalance: number;
    totalBuyAmount: number;
    totalSellAmount: number;
    totalCommissionPaid: number;
  };
}

export const FinancialCards: React.FC<FinancialCardsProps> = ({ summary }) => {
  const formatBDT = (val: number = 0) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
    }).format(val);

  const profitOrLoss = summary?.currentCashBalance || 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Invested (BUY)
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatBDT(summary?.totalBuyAmount)}
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Recovered (SELL)
          </CardTitle>
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatBDT(summary?.totalSellAmount)}
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Friction (Comm.)
          </CardTitle>
          <Percent className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {formatBDT(summary?.totalCommissionPaid)}
          </div>
        </CardContent>
      </Card>

      <Card
        className={`border-l-4 ${profitOrLoss >= 0 ? "border-l-emerald-500 bg-emerald-50/20" : "border-l-rose-500 bg-rose-50/20"}`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle
            className={`text-sm font-medium ${profitOrLoss >= 0 ? "text-emerald-800" : "text-rose-800"}`}
          >
            Net Realized Profit / Loss
          </CardTitle>
          <TrendingUp
            className={`h-4 w-4 ${profitOrLoss >= 0 ? "text-emerald-600" : "text-rose-600"}`}
          />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-black ${profitOrLoss >= 0 ? "text-emerald-700" : "text-rose-700"}`}
          >
            {profitOrLoss >= 0 ? "+" : ""}
            {formatBDT(profitOrLoss)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
