import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse duration-700">
      {/* Top Stats Skeleton (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="shadow-sm border-transparent bg-slate-100/50 dark:bg-slate-900/40 dark:border-slate-800/50"
          >
            <CardContent className="p-6 flex flex-row items-center justify-between space-y-0">
              <div className="space-y-3 w-full">
                <Skeleton className="h-4 w-24 rounded-md bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-7 w-32 rounded-md bg-slate-300 dark:bg-slate-700" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid (Lists) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Holdings Skeleton */}
        <Card className="lg:col-span-2 shadow-sm border-transparent bg-slate-100/50 dark:bg-slate-900/40 dark:border-slate-800/50 h-[450px] flex flex-col">
          <CardHeader className="pb-3 border-b dark:border-slate-800/50">
            <Skeleton className="h-6 w-40 rounded-md bg-slate-200 dark:bg-slate-800" />
          </CardHeader>
          <CardContent className="flex-1 p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-4 border rounded-xl border-slate-200/50 dark:border-slate-800/50"
              >
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32 rounded-md bg-slate-300 dark:bg-slate-700" />
                  <Skeleton className="h-3 w-48 rounded-md bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="space-y-2 flex flex-col items-end">
                  <Skeleton className="h-6 w-24 rounded-md bg-slate-300 dark:bg-slate-700" />
                  <Skeleton className="h-3 w-16 rounded-md bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Transactions Skeleton */}
        <Card className="shadow-sm border-transparent bg-slate-100/50 dark:bg-slate-900/40 dark:border-slate-800/50 h-[450px] flex flex-col">
          <CardHeader className="pb-3 border-b dark:border-slate-800/50">
            <Skeleton className="h-6 w-48 rounded-md bg-slate-200 dark:bg-slate-800" />
          </CardHeader>
          <CardContent className="flex-1 p-6 space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {/* Icon Skeleton */}
                  <Skeleton className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28 rounded-md bg-slate-300 dark:bg-slate-700" />
                    <Skeleton className="h-3 w-20 rounded-md bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>
                <div className="space-y-2 flex flex-col items-end">
                  <Skeleton className="h-5 w-20 rounded-md bg-slate-300 dark:bg-slate-700" />
                  {/* Badge Skeleton */}
                  <Skeleton className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
