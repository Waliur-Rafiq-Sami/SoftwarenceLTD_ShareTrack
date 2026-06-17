import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value,
  );

export function ActiveHoldingsCard({ holdings }: { holdings: any[] }) {
  return (
    <Card className="lg:col-span-2 shadow-sm dark:bg-[#0f172a] dark:border-slate-800 flex flex-col h-[450px]">
      <CardHeader className="pb-3 border-b dark:border-slate-800">
        <CardTitle className="text-lg text-slate-900 dark:text-white">
          Active Holdings
        </CardTitle>
      </CardHeader>

      {/* Scrollable Content Area */}
      <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-0">
        {holdings.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-slate-500">No active holdings found.</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {holdings.map((holding: any) => (
              <div
                key={holding._id}
                className="flex justify-between items-center p-4 border rounded-xl dark:border-slate-800 bg-slate-50/50 dark:bg-[#1e293b] transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80"
              >
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                    {holding.companyName}
                  </h4>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {holding.totalQuantity} Shares @{" "}
                    {formatCurrency(holding.avgBuyPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-slate-900 dark:text-white">
                    {formatCurrency(holding.totalInvestedAmount)}
                  </p>
                  <span
                    className={`text-sm font-semibold ${holding.realizedProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    {holding.realizedProfit >= 0 ? "+" : ""}
                    {formatCurrency(holding.realizedProfit)} Profit
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Fixed Footer with Navigation */}
      <CardFooter className="pt-4 pb-4 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 rounded-b-xl">
        <Button
          asChild
          variant="ghost"
          className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <Link
            href="/holdings"
            className="flex items-center justify-center gap-2"
          >
            View All Holdings <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
