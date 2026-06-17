import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";

import { UserLedger, IUserLedger } from "@/model/UserLedger";
import { CompanyHolding } from "@/model/CompanyHolding";
import { IShareRecord, ShareRecord } from "../../../model/ShareRecord";

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

    const [
      ledger,
      activeHoldings,
      realizedProfitResult,
      fundingStats,
      recentTransactions,
    ] = await Promise.all([
      UserLedger.findOne({ userId }).lean<IUserLedger>(),

      CompanyHolding.find({ userId, totalQuantity: { $gt: 0 } })
        .sort({ totalInvestedAmount: -1 })
        .lean(),

      CompanyHolding.aggregate([
        { $match: { userId } },
        { $group: { _id: null, totalProfit: { $sum: "$realizedProfit" } } },
      ]),

      ShareRecord.aggregate<FundingStat>([
        {
          $match: {
            userId,
            actionType: { $in: ["DEPOSIT", "WITHDRAW"] },
            isReversed: false,
            status: "COMPLETED",
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
        .select("-__v -updatedAt")
        .lean<IShareRecord[]>(),
    ]);

    const ledgerData = ledger || {
      cashBalance: 0,
      totalBuyVolume: 0,
      totalSellVolume: 0,
      totalCommissionPaid: 0,
    };

    const totalInvestedPortfolioValue = activeHoldings.reduce(
      (sum, holding) => sum + (holding.totalInvestedAmount || 0),
      0,
    );

    const totalRealizedProfit = realizedProfitResult[0]?.totalProfit || 0;

    const fundingMap = { DEPOSIT: 0, WITHDRAW: 0 };
    fundingStats.forEach((stat) => {
      if (stat._id === "DEPOSIT" || stat._id === "WITHDRAW") {
        fundingMap[stat._id] = stat.totalAmount;
      }
    });

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
        activeHoldings,
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
