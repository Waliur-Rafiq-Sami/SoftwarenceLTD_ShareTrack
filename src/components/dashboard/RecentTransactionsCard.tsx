// components/dashboard/RecentTransactionsCard.tsx
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowDownToLine, ArrowUpFromLine, ArrowRight } from "lucide-react";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value,
  );

export function RecentTransactionsCard({
  transactions,
}: {
  transactions: any[];
}) {
  return (
    <Card className="shadow-sm dark:bg-[#0f172a] dark:border-slate-800 flex flex-col h-[450px]">
      <CardHeader className="pb-3 border-b dark:border-slate-800">
        <CardTitle className="text-lg text-slate-900 dark:text-white">
          Recent Transactions
        </CardTitle>
      </CardHeader>

      {/* Scrollable Content Area */}
      <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-0">
        <div className="p-6 space-y-5">
          {transactions.map((txn: any) => (
            <div
              key={txn._id}
              className="flex justify-between items-center group"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2.5 rounded-full flex-shrink-0 ${
                    txn.actionType === "BUY" || txn.actionType === "DEPOSIT"
                      ? "bg-emerald-100 dark:bg-emerald-950/50"
                      : "bg-rose-100 dark:bg-rose-950/50"
                  }`}
                >
                  {txn.actionType === "BUY" || txn.actionType === "DEPOSIT" ? (
                    <ArrowDownToLine className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <ArrowUpFromLine className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                    {txn.actionType} {txn.companyName && `- ${txn.companyName}`}
                  </p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {new Date(txn.transactionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <p
                  className={`text-sm font-bold ${
                    txn.netCashImpact > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {txn.netCashImpact > 0 ? "+" : ""}
                  {formatCurrency(txn.netCashImpact)}
                </p>
                <Badge
                  variant={txn.status === "COMPLETED" ? "default" : "secondary"}
                  className={`text-[10px] uppercase font-bold px-2 ${txn.status === "COMPLETED" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                >
                  {txn.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Fixed Footer with Navigation */}
      <CardFooter className="pt-4 pb-4 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 rounded-b-xl">
        <Button
          asChild
          variant="ghost"
          className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <Link
            href="/transactions"
            className="flex items-center justify-center gap-2"
          >
            View All Transactions <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
