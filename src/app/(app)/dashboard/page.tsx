"use client";

import React, { useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ActiveHoldingsCard } from "@/components/dashboard/ActiveHoldingsCard";
import { RecentTransactionsCard } from "@/components/dashboard/RecentTransactionsCard";
import {
  Wallet,
  TrendingUp,
  ArrowDownToLine,
  Activity,
  Plus,
  Minus,
} from "lucide-react";
import { Navbar } from "@/components/nav/Navbar";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { TradeModal } from "@/components/dashboard/TradeModal";
import { Card, CardContent } from "@/components/ui/card";
import { WalletModal } from "@/components/dashboard/WalletModal";

// --- Reusable Metric Card Component ---
const MetricCard = ({
  title,
  value,
  description,
  icon,
  onAction,
  actionType,
}: any) => (
  <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-xl">
    <CardContent className="p-6">
      <div className="flex flex-col gap-4">
        {/* Header & Icon */}
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
          {icon}
          {title}
        </div>

        {/* Value & Description */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>

        {/* Conditional Buttons for Main Card */}
        {onAction && (
          <div className="flex items-center gap-3 pt-2">
            <Button
              size="sm"
              onClick={() => onAction("DEPOSIT")}
              className="flex-1 h-10 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
            >
              <Plus className="h-4 w-4 mr-2" /> Deposit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction("WITHDRAW")}
              className="flex-1 h-10 rounded-lg border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-white"
            >
              <Minus className="h-4 w-4 mr-2" /> Withdraw
            </Button>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value,
  );

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardData();
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [walletModal, setWalletModal] = useState({
    isOpen: false,
    type: "DEPOSIT",
  });

  if (isError)
    return (
      <div className="p-6 text-center text-rose-500">Error loading data.</div>
    );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817]">
      <main className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-0.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Overview
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Welcome back! Manage your portfolio here.
            </p>
          </div>
          <Button
            onClick={() => setIsTradeModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Transaction
          </Button>
        </div>

        {/* Loading State */}
        {isLoading || !data?.data ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Main Net Worth Card (Includes Actions) */}
              <MetricCard
                title="Total Net Worth"
                value={formatCurrency(data.data.overview.netWorth)}
                description="Total portfolio value"
                icon={<Wallet className="h-4 w-4" />}
                onAction={(type: string) =>
                  setWalletModal({ isOpen: true, type })
                }
              />

              {/* Smaller Stat Cards (No Actions) */}
              <MetricCard
                title="Cash Balance"
                value={formatCurrency(data.data.overview.cashBalance)}
                description="Available for trading"
                icon={<ArrowDownToLine className="h-4 w-4" />}
              />

              <MetricCard
                title="Realized Profit"
                value={formatCurrency(data.data.overview.totalRealizedProfit)}
                description="Total gains taken"
                icon={<TrendingUp className="h-4 w-4" />}
              />

              <MetricCard
                title="Trading Volume"
                value={formatCurrency(
                  data.data.analytics.totalBuyVolume +
                    data.data.analytics.totalSellVolume,
                )}
                description="Total market activity"
                icon={<Activity className="h-4 w-4" />}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <ActiveHoldingsCard holdings={data.data.activeHoldings} />
              <RecentTransactionsCard
                transactions={data.data.recentTransactions}
              />
            </div>
          </>
        )}
      </main>

      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        onSuccess={() => console.log("Trade success")}
        onSuccess={() => {
          console.log("Trade success");
          refetch(); // Trigger update
        }}
      />

      <WalletModal
        isOpen={walletModal.isOpen}
        type={walletModal.type as "DEPOSIT" | "WITHDRAW"}
        onClose={() => setWalletModal((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
