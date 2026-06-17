import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isProfit?: boolean;
}

export function StatCard({ title, value, icon, isProfit }: StatCardProps) {
  return (
    <Card className="shadow-sm dark:bg-[#0f172a] dark:border-slate-800 hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          {/* Card Title */}
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          {/* Card Value with Dynamic Color based on Profit/Loss */}
          <h2
            className={`text-2xl font-bold ${
              isProfit === true
                ? "text-emerald-500"
                : isProfit === false
                  ? "text-rose-500"
                  : "text-slate-900 dark:text-white"
            }`}
          >
            {value}
          </h2>
        </div>

        {/* Icon Area */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full flex-shrink-0">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
