// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next";
// import mongoose from "mongoose";

// import { authOptions } from "@/app/api/auth/[...nextauth]/options";
// import dbConnect from "@/lib/dbConnect";

// import { UserLedger, IUserLedger } from "@/model/UserLedger";
// import { CompanyHolding, ICompanyHolding } from "@/model/CompanyHolding";
// import { ShareRecord, IShareRecord } from "@/model/ShareRecord";

// const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

// // CORRECTED: Define the interface for the OBJECT, not the array
// type FundingStat = {
//   _id: "DEPOSIT" | "WITHDRAW";
//   totalAmount: number;
// };

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
//     const [ledger, allHoldings, fundingStats, recentTransactions] =
//       (await Promise.all([
//         UserLedger.findOne({ userId }).lean<IUserLedger>(),

//         CompanyHolding.find({ userId }).lean<ICompanyHolding[]>(),

//         // Aggregate returns an array of the generic type provided (FundingStat[])
//         ShareRecord.aggregate<FundingStat>([
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

//         ShareRecord.find({ userId })
//           .sort({ transactionDate: -1 })
//           .limit(10)
//           .lean<IShareRecord[]>(),
//       ])) as [
//         IUserLedger | null,
//         ICompanyHolding[],
//         FundingStat[], // Array of the interface
//         IShareRecord[],
//       ];

//     // 2. Data Processing
//     const ledgerData = ledger || {
//       cashBalance: 0,
//       totalBuyVolume: 0,
//       totalSellVolume: 0,
//       totalCommissionPaid: 0,
//     };

//     let totalInvestedPortfolioValue = 0;
//     let totalRealizedProfit = 0;
//     const activeHoldings = [];

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
import { CompanyHolding } from "@/model/CompanyHolding";
import { ShareRecord, IShareRecord } from "@/model/ShareRecord";

const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

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

    // 1. Concurrent Execution - Database Level Processing
    const [
      ledger,
      activeHoldings,
      realizedProfitResult,
      fundingStats,
      recentTransactions,
    ] = await Promise.all([
      // কোয়েরি ১: লেজার ব্যালেন্স নেওয়া
      UserLedger.findOne({ userId }).lean<IUserLedger>(),

      // কোয়েরি ২: শুধুমাত্র Active Holdings ডেটাবেস থেকে ফিল্টার ও সর্ট করে আনা (Memory Optimized)
      CompanyHolding.find({ userId, totalQuantity: { $gt: 0 } })
        .sort({ totalInvestedAmount: -1 })
        .lean(),

      // কোয়েরি ৩: সমস্ত হোল্ডিংয়ের মোট Realized Profit ডাটাবেস লেভেলে যোগ করা (Event Loop যেন ব্লক না হয়)
      CompanyHolding.aggregate([
        { $match: { userId } },
        { $group: { _id: null, totalProfit: { $sum: "$realizedProfit" } } },
      ]),

      // কোয়েরি ৪: ফান্ডিং স্ট্যাটস (আগের মতোই ফাস্ট ইনডেক্স স্ক্যান)
      ShareRecord.aggregate<FundingStat>([
        {
          $match: {
            userId,
            actionType: { $in: ["DEPOSIT", "WITHDRAW"] },
            isReversed: false,
            status: "COMPLETED", // নিশ্চিত করা যে শুধু সফল ট্রানজ্যাকশন কাউন্ট হচ্ছে
          },
        },
        {
          $group: {
            _id: "$actionType",
            totalAmount: { $sum: "$grossAmount" },
          },
        },
      ]),

      // কোয়েরি ৫: প্রজেকশন সহ সর্বশেষ ১০টি ট্রানজ্যাকশন আনা (Network payload কমানোর জন্য)
      ShareRecord.find({ userId })
        .sort({ transactionDate: -1 })
        .limit(10)
        .select("-__v -updatedAt") // অপ্রয়োজনীয় ফিল্ড এক্সক্লুড করা
        .lean<IShareRecord[]>(),
    ]);

    // ২. ডেটা স্ট্রাকচারিং ও রাউন্ডিং ফলব্যাক্স
    const ledgerData = ledger || {
      cashBalance: 0,
      totalBuyVolume: 0,
      totalSellVolume: 0,
      totalCommissionPaid: 0,
    };

    // অ্যাক্টিভ পোর্টফোলিওর ইনভেস্টেড ভ্যালু ক্যালকুলেট করা
    const totalInvestedPortfolioValue = activeHoldings.reduce(
      (sum, holding) => sum + (holding.totalInvestedAmount || 0),
      0,
    );

    const totalRealizedProfit = realizedProfitResult[0]?.totalProfit || 0;

    // ফান্ডিং ম্যাপ প্রসেসিং
    const fundingMap = { DEPOSIT: 0, WITHDRAW: 0 };
    fundingStats.forEach((stat) => {
      if (stat._id === "DEPOSIT" || stat._id === "WITHDRAW") {
        fundingMap[stat._id] = stat.totalAmount;
      }
    });

    // ৩. এক্সট্রা সিকিউরড অপ্টিমাইজড রেসপন্স রিটার্ন
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
        activeHoldings, // অলরেডি ডাটাবেস থেকে সর্ট ও ফিল্টার হয়ে এসেছে
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("Dashboard API Critical Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
