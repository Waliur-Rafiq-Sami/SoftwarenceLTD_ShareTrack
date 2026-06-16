"use client";

import React, { useState, useEffect, useCallback } from "react";
import BuyShareModal from "@/components/modals/BuyShareModal";
import CompanyManagementModal from "@/components/modals/CompanyManagementModal";
import { LedgerManagementModal } from "@/components/modals/LedgerModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  PlusCircle,
  Layers,
  Building2,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Activity,
} from "lucide-react";

export default function TradingDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isBuyModalOpen, setIsBuyModalOpen] = useState<boolean>(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState<boolean>(false);
  const [ledgerMode, setLedgerMode] = useState<"DEPOSIT" | "WITHDRAW" | null>(
    null,
  );

  // ডেটা ফেচ করার ফাংশন
  const refreshPortfolioData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/summary");
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPortfolioData();
  }, [refreshPortfolioData]);

  return (
    <div className="p-6 bg-slate-50 dark:bg-zinc-950 min-h-screen text-slate-800 dark:text-zinc-100">
      {/* ১. টপ অ্যাকশন প্যানেল */}
      <Card className="mb-6 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <CardHeader className="flex flex-row justify-between items-center py-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" /> Trading Dashboard
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCompanyModalOpen(true)}
            >
              <Building2 className="w-4 h-4 mr-2" /> Registry
            </Button>
            <Button
              onClick={() => setIsBuyModalOpen(true)}
              className="bg-indigo-600"
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Buy Share
            </Button>
            <Button
              variant="secondary"
              onClick={() => setLedgerMode("DEPOSIT")}
            >
              <ArrowDownCircle className="w-4 h-4 mr-2" /> Deposit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setLedgerMode("WITHDRAW")}
            >
              <ArrowUpCircle className="w-4 h-4 mr-2" /> Withdraw
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* ২. KPI ও ডেটা ডিসপ্লে */}
      {loading ? (
        <div className="text-center p-12">Loading Enterprise Matrix...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ক্যাশ ব্যালেন্স কার্ড */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Cash Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-mono font-bold">
                ৳{data?.ledger?.currentCashBalance?.toFixed(2) || "0.00"}
              </p>
            </CardContent>
          </Card>

          {/* পোর্টফোলিও লিস্ট */}
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Active Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.portfolio?.length > 0 ? (
                <div className="space-y-2">
                  {data.portfolio.map((item: any) => (
                    <div
                      key={item._id}
                      className="flex justify-between p-3 bg-slate-100 dark:bg-zinc-800 rounded"
                    >
                      <span className="font-semibold">{item.companyName}</span>
                      <span className="font-mono">
                        {item.currentQuantity} Units
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No active positions.</p>
              )}
            </CardContent>
          </Card>

          {/* সাম্প্রতিক ট্রানজেকশন */}
          <Card className="col-span-1 md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-4 h-4" /> Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th>Type</th>
                    <th>Company</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentTransactions?.map((tx: any) => (
                    <tr key={tx._id} className="border-b last:border-0">
                      <td className="py-2">{tx.actionType}</td>
                      <td>{tx.companyName || "-"}</td>
                      <td>৳{tx.grossAmount}</td>
                      <td>{tx.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* মোডালস */}
      <CompanyManagementModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onRegistryChange={refreshPortfolioData}
      />
      <BuyShareModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        onSuccess={refreshPortfolioData}
      />
      {ledgerMode && (
        <LedgerManagementModal
          isOpen={!!ledgerMode}
          mode={ledgerMode}
          onClose={() => setLedgerMode(null)}
          onSuccess={refreshPortfolioData}
        />
      )}
    </div>
  );
}
