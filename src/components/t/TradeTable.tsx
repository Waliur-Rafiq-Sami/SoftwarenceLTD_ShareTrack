// import React from "react";
// import { Trade, useDeleteTrade } from "@/hooks/useTrades";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Trash2, TrendingUp, TrendingDown } from "lucide-react";

// interface TradeTableProps {
//   trades: Trade[];
// }

// export const TradeTable: React.FC<TradeTableProps> = ({ trades }) => {
//   const deleteMutation = useDeleteTrade();

//   return (
//     <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
//       <Table>
//         <TableHeader className="bg-slate-50">
//           <TableRow>
//             <TableHead>Execution Date</TableHead>
//             <TableHead>Instrument</TableHead>
//             <TableHead>Type</TableHead>
//             <TableHead className="text-right">Qty</TableHead>
//             <TableHead className="text-right">Rate</TableHead>
//             <TableHead className="text-right">Gross Amount</TableHead>
//             <TableHead className="text-right">Comm.</TableHead>
//             <TableHead className="text-right">Net Cash Impact</TableHead>
//             <TableHead className="text-center">Purge</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {trades.length === 0 ? (
//             <TableRow>
//               <TableCell
//                 colSpan={9}
//                 className="text-center py-8 text-muted-foreground"
//               >
//                 No ledger transactions found in this current matrix node.
//               </TableCell>
//             </TableRow>
//           ) : (
//             trades.map((trade) => (
//               <TableRow key={trade._id} className="hover:bg-slate-50/50">
//                 <TableCell>
//                   {new Date(trade.transactionDate).toLocaleDateString("en-BD")}
//                 </TableCell>
//                 <TableCell className="font-bold text-slate-900">
//                   {trade.companyName}
//                 </TableCell>
//                 <TableCell>
//                   <span
//                     className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
//                       trade.tradeType === "BUY"
//                         ? "bg-red-50 text-red-700"
//                         : "bg-green-50 text-green-700"
//                     }`}
//                   >
//                     {trade.tradeType === "BUY" ? (
//                       <TrendingDown className="h-3 w-3" />
//                     ) : (
//                       <TrendingUp className="h-3 w-3" />
//                     )}
//                     {trade.tradeType}
//                   </span>
//                 </TableCell>
//                 <TableCell className="text-right font-medium">
//                   {trade.quantity}
//                 </TableCell>
//                 <TableCell className="text-right">
//                   ৳{trade.rate.toFixed(2)}
//                 </TableCell>
//                 <TableCell className="text-right">
//                   ৳{trade.amount.toFixed(2)}
//                 </TableCell>
//                 <TableCell className="text-right text-orange-600">
//                   ৳{trade.commissionAmount}
//                 </TableCell>
//                 <TableCell
//                   className={`text-right font-bold ${trade.netAmount >= 0 ? "text-green-600" : "text-red-600"}`}
//                 >
//                   ৳{trade.netAmount.toFixed(2)}
//                 </TableCell>
//                 <TableCell className="text-center">
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="text-red-500 hover:text-red-700 hover:bg-red-50"
//                     onClick={() => {
//                       if (confirm("Purge node?"))
//                         deleteMutation.mutate(trade._id);
//                     }}
//                     disabled={deleteMutation.isPending}
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))
//           )}
//         </TableBody>
//       </Table>
//     </div>
//   );
// };

"use client";

import React from "react";
import { Trade, useDeleteTrade } from "@/hooks/useTrades";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SellModal } from "./SellModal"; // আপনার তৈরি করা SellModal সাব-কম্পোনেন্ট
import { Trash2, TrendingUp, TrendingDown } from "lucide-react";

interface TradeTableProps {
  trades: Trade[];
}

export const TradeTable: React.FC<TradeTableProps> = ({ trades }) => {
  const deleteMutation = useDeleteTrade();

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Execution Date</TableHead>
            <TableHead>Instrument</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Rate</TableHead>
            <TableHead className="text-right">Gross Amount</TableHead>
            <TableHead className="text-right">Comm.</TableHead>
            <TableHead className="text-right">Net Cash Impact</TableHead>
            <TableHead className="text-center font-semibold text-slate-700">
              Actions Matrix
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center py-8 text-muted-foreground"
              >
                No ledger transactions found in this current matrix node.
              </TableCell>
            </TableRow>
          ) : (
            trades.map((trade) => (
              <TableRow key={trade._id} className="hover:bg-slate-50/50">
                {/* ১. ট্র্যানজেকশন ডেট */}
                <TableCell>
                  {new Date(trade.transactionDate).toLocaleDateString("en-BD")}
                </TableCell>

                {/* ২. কোম্পানির নাম */}
                <TableCell className="font-bold text-slate-900">
                  {trade.companyName}
                </TableCell>

                {/* ৩. টাইপ (BUY / SELL) কালার কোডেড ব্যাজ */}
                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                      trade.tradeType === "BUY"
                        ? "bg-red-50 text-red-700"
                        : "bg-green-50 text-green-700"
                    }`}
                  >
                    {trade.tradeType === "BUY" ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : (
                      <TrendingUp className="h-3 w-3" />
                    )}
                    {trade.tradeType}
                  </span>
                </TableCell>

                {/* ৪. কোয়ান্টিটি */}
                <TableCell className="text-right font-medium">
                  {trade.quantity}
                </TableCell>

                {/* ৫. রেট */}
                <TableCell className="text-right">
                  ৳{trade.rate.toFixed(2)}
                </TableCell>

                {/* ৬. গ্রস বা মূল অ্যামাউন্ট */}
                <TableCell className="text-right">
                  ৳{trade.amount.toFixed(2)}
                </TableCell>

                {/* ৭. কাটা যাওয়া কমিশন */}
                <TableCell className="text-right text-orange-600">
                  ৳{trade.commissionAmount?.toFixed(2)}
                </TableCell>

                {/* ৮. নিট ক্যাশ ইমপ্যাক্ট */}
                <TableCell
                  className={`text-right font-bold ${
                    trade.netAmount >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trade.netAmount >= 0 ? "+" : ""}৳{trade.netAmount.toFixed(2)}
                </TableCell>

                {/* ৯. কম্বাইন্ড অ্যাকশন এরিয়া (SELL পপআপ এবং ডিলিট কন্ট্রোল) */}
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    {/* ক) যদি রেকর্ডটি BUY টাইপের হয় এবং কোয়ান্টিটি থাকে, তবেই শুধু SELL পপআপ বাটন দেখাবে */}
                    {trade.tradeType === "BUY" && trade.quantity > 0 ? (
                      <SellModal trade={trade} />
                    ) : (
                      <span className="text-xs text-muted-foreground italic px-2">
                        N/A
                      </span>
                    )}

                    <div className="h-4 w-[1px] bg-slate-200" />

                    {/* খ) পার্জ বা ডিলিট বাটন */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7"
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to purge this record from the ledger network? This will reverse the cash impact.",
                          )
                        )
                          deleteMutation.mutate(trade._id);
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
