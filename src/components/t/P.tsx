// "use client";

// import React, { useState } from "react";
// import { useTrades } from "@/hooks/useTrades";
// import { FinancialCards } from "./FinancialCards";
// import { TradeForm } from "./TradeForm";
// import { TradeTable } from "./TradeTable";
// import { LedgerAdjuster } from "./LedgerAdjuster";
// import { Input } from "../ui/input";

// export default function SharesDashboard() {
//   const [companyFilter, setCompanyFilter] = useState("");
//   const {
//     data: serverResponse,
//     isLoading,
//     error,
//   } = useTrades({ company: companyFilter });
//   console.log("server response inside P :", serverResponse);

//   if (isLoading)
//     return (
//       <div className="p-8 text-center font-medium animate-pulse">
//         Synchronizing Portfolio Nodes...
//       </div>
//     );
//   if (error)
//     return (
//       <div className="p-8 text-center text-red-500">
//         Node Sync Error: {error.message}
//       </div>
//     );

//   // টোটাল নিট ট্রেডিং ভলিউম হিসাব (সব লাইনের নেট সামেশন)
//   const netTradingVolume =
//     serverResponse?.data.reduce((acc, t) => acc + t.netAmount, 0) || 0;

//   return (
//     <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50/50 min-h-screen">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
//             DSE Ledger & Confirmation Engine
//           </h1>
//           <p className="text-sm text-muted-foreground">
//             Professional Share Calculation Protocol
//           </p>
//         </div>
//       </div>

//       {/* ফাইনান্সিয়াল ওভারভিউ টপবার কার্ডস */}
//       <FinancialCards
//         summary={serverResponse?.financialSummary}
//         netTrading={netTradingVolume}
//       />

//       {/* অপারেশনাল গ্রিড (ফর্ম এবং ক্যাশ ফ্লো অ্যাডজাস্টার) */}
//       <div className="grid gap-6 md:grid-cols-3">
//         <div className="md:col-span-2">
//           <TradeForm />
//         </div>
//         <div>
//           <LedgerAdjuster />
//         </div>
//       </div>

//       {/* ফিল্টারিং প্যানেল */}
//       <div className="flex gap-4 items-center bg-white p-4 rounded-xl border shadow-sm">
//         <div className="w-72">
//           <Input
//             placeholder="Live Filter by Instrument (e.g., BEXIMCO)..."
//             value={companyFilter}
//             onChange={(e) => setCompanyFilter(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* মেইন ডাটা টেবিল */}
//       <TradeTable trades={serverResponse?.data || []} />
//     </div>
//   );
// }

"use client";

import React, { useState } from "react";
import { useTrades } from "@/hooks/useTrades";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { TradeModal } from "./TradeModal";
import { FinancialCards } from "./FinancialCards";
import { TradeTable } from "./TradeTable";

export default function SharesDashboard() {
  const [companyFilter, setCompanyFilter] = useState("");
  const {
    data: serverResponse,
    isLoading,
    error,
  } = useTrades({ company: companyFilter });

  if (isLoading)
    return (
      <div className="p-8 text-center font-medium animate-pulse text-slate-600">
        Synchronizing Financial Ledger Matrices...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Matrix Sync Failed: {error.message}
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50/30 min-h-screen">
      {/* হেডার সেকশন */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Realized Gain Matrix Engine
          </h1>
          <p className="text-xs text-muted-foreground">
            Automated delta calculation for stock trade positions
          </p>
        </div>
        {/* পপআপ বাটন এখানে ইনজেক্ট করা হয়েছে */}
        <TradeModal />
      </div>

      {/* ৪টি ফাইনান্সিয়াল সামারি কার্ড */}
      <FinancialCards summary={serverResponse?.financialSummary} />

      {/* ফিল্টার বার এবং টেবিল */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border max-w-sm shadow-sm">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            className="w-full text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400"
            placeholder="Search by Company ticker (e.g., GP)..."
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
          />
        </div>

        {/* ডাটা টেবিল কম্পোনেন্ট */}
        <TradeTable trades={serverResponse?.data || []} />
      </div>
    </div>
  );
}
