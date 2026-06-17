"use client";

import React, { useState } from "react";
import {
  useHoldingsQuery,
  HoldingsQueryFilters,
} from "@/hooks/useHoldingsQuery";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { HoldingsHeaderStatsCompact } from "@/components/holdings/HoldingsHeader";
import { TableFilters } from "@/components/holdings/table/TableFilters";
import { TableHeader } from "@/components/holdings/table/TableHeader";
import { TableRow } from "@/components/holdings/table/TableRow";
import { TableEmpty } from "@/components/holdings/table/TableEmpty";
import PaginationControls from "@/components/holdings/table/PaginationControls";
import { HoldingsTableSkeleton } from "@/components/skeletons/HoldingsTableSkeleton";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

export default function HoldingsPage() {
  // 1. Unified State Management Matrix
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ACTIVE");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "lastUpdated",
    direction: "desc",
  });

  // 2. Combine state into payload
  const activeFilters: HoldingsQueryFilters = {
    page,
    limit,
    search: searchQuery,
    status: statusFilter,
    sortBy: sortConfig.key,
    sortOrder: sortConfig.direction,
  };

  // 3. Initiate Server Synchronized TanStack Fetch Engine
  const { data, isLoading, isError, isFetching, refetch } =
    useHoldingsQuery(activeFilters);

  // 4. Extract Structured Domain Data
  const holdings = data?.data?.holdings || [];
  const overview = data?.data?.overview || {
    netWorth: 0,
    totalInvestedAmount: 0,
    totalRealizedProfit: 0,
    cashBalance: 0,
    totalBuyVolume: 0,
    totalSellVolume: 0,
    totalCommissionPaid: 0,
  };

  // 5. Transform API pagination to match PaginationControls interface
  const rawMeta = data?.meta?.pagination || {};
  // const paginationData = {
  //   currentPage: rawMeta.page || 1,
  //   totalPages: rawMeta.totalPages || 1,
  //   totalRecords: rawMeta.total || 0,
  //   hasNextPage: rawMeta.hasNextPage || false,
  // };
  const paginationData = {
    currentPage: data?.meta?.pagination?.page || 1,
    totalPages: data?.meta?.pagination?.totalPages || 1,
    totalRecords: data?.meta?.pagination?.total || 0,
    hasNextPage: data?.meta?.pagination?.hasNextPage || false,
  };
  // 6. Stateful Event Mutators (Resets page to 1 on filter changes)
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSortChange = (newSortConfig: {
    key: string;
    direction: "asc" | "desc";
  }) => {
    setSortConfig(newSortConfig);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  // 7. Resilient Error Layout Presentation Layer
  if (isError) {
    return (
      <div className="p-8 max-w-md mx-auto my-24 text-center border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 rounded-2xl shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-4 text-rose-600 dark:text-rose-400">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Security Vault Connection Interrupted
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
          Failed to securely pull asset holdings data due to an internal server
          error.
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 rounded-lg transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] transition-colors duration-200">
      <main className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Dynamic Financial Asset Statistics Dashboard Header */}
        <HoldingsHeaderStatsCompact
          ledger={overview}
          formatCurrency={formatCurrency}
        />

        {isLoading ? (
          <>
            <HoldingsTableSkeleton></HoldingsTableSkeleton>
          </>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Server-Linked Ticker Filters, Status Controls, Types, and Sort */}
            <TableFilters
              searchQuery={searchQuery}
              setSearchQuery={handleSearchChange}
              statusFilter={statusFilter}
              setStatusFilter={handleStatusChange}
              sortConfig={sortConfig}
              setSortConfig={handleSortChange}
            />

            {/* Central Master Asset Datagrid Port */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
              {/* Async Server Payload Processing Indicator Bar */}
              {isFetching && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-pulse z-10" />
              )}

              <div
                className="overflow-x-auto 
                  [&::-webkit-scrollbar]:h-2 
                  [&::-webkit-scrollbar-track]:bg-slate-100 
                  dark:[&::-webkit-scrollbar-track]:bg-slate-900/50 
                  [&::-webkit-scrollbar-thumb]:bg-slate-300 
                  dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 
                  [&::-webkit-scrollbar-thumb]:rounded-full 
                  hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 
                  dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600"
              >
                <table className="w-full text-left border-collapse table-auto">
                  <TableHeader />
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-sm">
                    {holdings.length === 0 ? (
                      <TableEmpty />
                    ) : (
                      holdings.map((holding) => (
                        <TableRow
                          key={holding._id || holding.companyName}
                          holding={holding}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {holdings.length > 0 && (
                <PaginationControls
                  limit={limit}
                  setLimit={handleLimitChange}
                  pagination={paginationData}
                  page={page}
                  setPage={setPage}
                  isLoading={isLoading}
                  isPlaceholderData={isFetching}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
