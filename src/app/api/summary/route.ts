// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next";
// import mongoose from "mongoose";

// import { authOptions } from "@/app/api/auth/[...nextauth]/options";
// import dbConnect from "@/lib/dbConnect";

// import { UserLedger, IUserLedger } from "@/model/UserLedger";
// import { CompanyHolding, ICompanyHolding } from "@/model/CompanyHolding";
// import { ShareRecord, IShareRecord } from "@/model/ShareRecord";

// // Helper for consistent rounding
// const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

// // Type definition for the aggregation result to ensure TS is happy
// type FundingAggregation = {
//   _id: "DEPOSIT" | "WITHDRAW";
//   totalAmount: number;
// }[];

// export async function GET() {
//   await dbConnect();

//   try {
//     const authSession = await getServerSession(authOptions);
//     if (!authSession?.user?._id) {
//       return NextResponse.json(
//         { success: false, message: "Unauthorized" },
//         { status: 401 },
//       );
//     }

//     const userId = new mongoose.Types.ObjectId(authSession.user._id as string);

//     // 1. Concurrent Execution with Explicit Type Casting
//     // We explicitly type the result array to prevent "Property does not exist" errors
//     const [ledger, allHoldings, fundingStats, recentTransactions] =
//       (await Promise.all([
//         // A: Use .select() to fetch only required fields (Performance Optimization)
//         UserLedger.findOne({ userId }).lean<IUserLedger>(),

//         // B: Lean holdings
//         CompanyHolding.find({ userId }).lean<ICompanyHolding[]>(),

//         // C: Aggregation remains raw
//         ShareRecord.aggregate<FundingAggregation>([
//           {
//             $match: {
//               userId,
//               actionType: { $in: ["DEPOSIT", "WITHDRAW"] },
//               isReversed: false,
//             },
//           },
//           {
//             $group: {
//               _id: "$actionType",
//               totalAmount: { $sum: "$grossAmount" },
//             },
//           },
//         ]),

//         // D: Recent 10 transactions
//         ShareRecord.find({ userId })
//           .sort({ transactionDate: -1 })
//           .limit(10)
//           .lean<IShareRecord[]>(),
//       ])) as [
//         IUserLedger | null,
//         ICompanyHolding[],
//         FundingAggregation,
//         IShareRecord[],
//       ];

//     // 2. Data Processing (Defensive Programming)
//     const ledgerData = ledger || {
//       cashBalance: 0,
//       totalBuyVolume: 0,
//       totalSellVolume: 0,
//       totalCommissionPaid: 0,
//     };

//     let totalInvestedPortfolioValue = 0;
//     let totalRealizedProfit = 0;
//     const activeHoldings = [];

//     // Process Holdings (Iterate once O(n))
//     for (const holding of allHoldings) {
//       totalRealizedProfit += holding.realizedProfit;
//       if (holding.totalQuantity > 0) {
//         totalInvestedPortfolioValue += holding.totalInvestedAmount;
//         activeHoldings.push(holding);
//       }
//     }

//     // 3. Aggregate Funding
//     const fundingMap = { DEPOSIT: 0, WITHDRAW: 0 };
//     fundingStats.forEach((stat) => {
//       if (stat._id === "DEPOSIT") fundingMap.DEPOSIT = stat.totalAmount;
//       if (stat._id === "WITHDRAW") fundingMap.WITHDRAW = stat.totalAmount;
//     });

//     // 4. Return Optimized Response
//     return NextResponse.json({
//       success: true,
//       data: {
//         overview: {
//           netWorth: round(ledgerData.cashBalance + totalInvestedPortfolioValue),
//           cashBalance: round(ledgerData.cashBalance),
//           portfolioValueAtCost: round(totalInvestedPortfolioValue),
//           totalRealizedProfit: round(totalRealizedProfit),
//         },
//         analytics: {
//           totalBuyVolume: round(ledgerData.totalBuyVolume),
//           totalSellVolume: round(ledgerData.totalSellVolume),
//           totalCommissionPaid: round(ledgerData.totalCommissionPaid),
//         },
//         funding: {
//           totalDeposited: round(fundingMap.DEPOSIT),
//           totalWithdrawn: round(fundingMap.WITHDRAW),
//         },
//         activeHoldings: activeHoldings.sort(
//           (a, b) => b.totalInvestedAmount - a.totalInvestedAmount,
//         ),
//         recentTransactions,
//       },
//     });
//   } catch (error) {
//     console.error("Dashboard API Error:", error);
//     return NextResponse.json(
//       { success: false, message: "Server error" },
//       { status: 500 },
//     );
//   }
// }

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";

import { UserLedger, IUserLedger } from "@/model/UserLedger";
import { CompanyHolding, ICompanyHolding } from "@/model/CompanyHolding";
import { ShareRecord, IShareRecord } from "@/model/ShareRecord";

const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

// CORRECTED: Define the interface for the OBJECT, not the array
type FundingStat = {
  _id: "DEPOSIT" | "WITHDRAW";
  totalAmount: number;
};

export async function GET() {
  await dbConnect();

  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = new mongoose.Types.ObjectId(authSession.user._id as string);

    // 1. Concurrent Execution with Explicit Type Casting
    const [ledger, allHoldings, fundingStats, recentTransactions] =
      (await Promise.all([
        UserLedger.findOne({ userId }).lean<IUserLedger>(),

        CompanyHolding.find({ userId }).lean<ICompanyHolding[]>(),

        // Aggregate returns an array of the generic type provided (FundingStat[])
        ShareRecord.aggregate<FundingStat>([
          {
            $match: {
              userId,
              actionType: { $in: ["DEPOSIT", "WITHDRAW"] },
              isReversed: false,
            },
          },
          {
            $group: {
              _id: "$actionType",
              totalAmount: { $sum: "$grossAmount" },
            },
          },
        ]),

        ShareRecord.find({ userId })
          .sort({ transactionDate: -1 })
          .limit(10)
          .lean<IShareRecord[]>(),
      ])) as [
        IUserLedger | null,
        ICompanyHolding[],
        FundingStat[], // Array of the interface
        IShareRecord[],
      ];

    // 2. Data Processing
    const ledgerData = ledger || {
      cashBalance: 0,
      totalBuyVolume: 0,
      totalSellVolume: 0,
      totalCommissionPaid: 0,
    };

    let totalInvestedPortfolioValue = 0;
    let totalRealizedProfit = 0;
    const activeHoldings = [];

    for (const holding of allHoldings) {
      totalRealizedProfit += holding.realizedProfit;
      if (holding.totalQuantity > 0) {
        totalInvestedPortfolioValue += holding.totalInvestedAmount;
        activeHoldings.push(holding);
      }
    }

    // 3. Aggregate Funding
    const fundingMap = { DEPOSIT: 0, WITHDRAW: 0 };
    fundingStats.forEach((stat) => {
      if (stat._id === "DEPOSIT") fundingMap.DEPOSIT = stat.totalAmount;
      if (stat._id === "WITHDRAW") fundingMap.WITHDRAW = stat.totalAmount;
    });

    // 4. Return Optimized Response
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          netWorth: round(ledgerData.cashBalance + totalInvestedPortfolioValue),
          cashBalance: round(ledgerData.cashBalance),
          portfolioValueAtCost: round(totalInvestedPortfolioValue),
          totalRealizedProfit: round(totalRealizedProfit),
        },
        analytics: {
          totalBuyVolume: round(ledgerData.totalBuyVolume),
          totalSellVolume: round(ledgerData.totalSellVolume),
          totalCommissionPaid: round(ledgerData.totalCommissionPaid),
        },
        funding: {
          totalDeposited: round(fundingMap.DEPOSIT),
          totalWithdrawn: round(fundingMap.WITHDRAW),
        },
        activeHoldings: activeHoldings.sort(
          (a, b) => b.totalInvestedAmount - a.totalInvestedAmount,
        ),
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
