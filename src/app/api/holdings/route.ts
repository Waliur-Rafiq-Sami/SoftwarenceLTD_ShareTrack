import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { CompanyHolding } from "@/model/CompanyHolding";
import { UserLedger } from "@/model/UserLedger";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req: NextRequest) {
  try {
    // 1. Establish Database Connection
    await dbConnect();

    // 2. Authentication Guard
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access. Invalid session context.",
        },
        { status: 401 },
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(session.user._id);
    const { searchParams } = new URL(req.url);

    // 3. Extract, Sanitize, and Validate Parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get("limit") || "10", 10)),
    );
    const skip = (page - 1) * limit;

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.toUpperCase() || "ACTIVE";

    const sortBy = searchParams.get("sortBy") || "lastUpdated";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // 4. Construct Secure Dynamic Query Object
    const query: any = { userId: userObjectId };

    // Status Filter Logic
    if (status === "ACTIVE") {
      query.totalQuantity = { $gt: 0 };
    } else if (status === "SOLD" || status === "CLOSED") {
      query.totalQuantity = { $eq: 0 };
    }

    // Search Text Logic
    if (search) {
      // Escape regex to prevent ReDoS (Regular Expression Denial of Service) attacks
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.companyName = { $regex: sanitizedSearch, $options: "i" };
    }

    // Validate Sort Fields to prevent NoSQL injection
    const allowedSortFields = [
      "companyName",
      "totalQuantity",
      "avgBuyPrice",
      "totalInvestedAmount",
      "realizedProfit",
      "lastUpdated",
      "createdAt",
    ];
    const actualSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "lastUpdated";

    // 5. Concurrent Core Database Engine
    // Execute all necessary database calls simultaneously to eliminate waterfall delays.
    // Using .lean() strips heavy Mongoose document methods, making it ~3x faster.
    const [holdings, totalCount, ledger, globalStats] = await Promise.all([
      // A. Fetch paginated holding records
      CompanyHolding.find(query)
        .sort({ [actualSortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),

      // B. Fetch total count for accurate pagination metadata
      CompanyHolding.countDocuments(query),

      // C. Fetch the user's master ledger for cash balances
      UserLedger.findOne({ userId: userObjectId })
        .lean()
        .exec() as Promise<any>,

      // D. Calculate true global portfolio stats regardless of pagination
      CompanyHolding.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: null,
            globalInvestedAmount: { $sum: "$totalInvestedAmount" },
            globalRealizedProfit: { $sum: "$realizedProfit" },
          },
        },
      ]),
    ]);

    // 6. Data Normalization & Net Worth Calculation
    const totalPages = Math.ceil(totalCount / limit);
    const aggregatedData = globalStats[0] || {
      globalInvestedAmount: 0,
      globalRealizedProfit: 0,
    };
    const cashBalance = ledger?.cashBalance || 0;

    // Accurate Net Worth: Available Cash + Total Capital Currently Invested
    const accurateNetWorth = cashBalance + aggregatedData.globalInvestedAmount;

    // 7. Unified Enterprise Payload Delivery
    return NextResponse.json(
      {
        success: true,
        data: {
          holdings,
          overview: {
            netWorth: accurateNetWorth,
            totalInvestedAmount: aggregatedData.globalInvestedAmount,
            totalRealizedProfit: aggregatedData.globalRealizedProfit,
            cashBalance: cashBalance,
            totalBuyVolume: ledger?.totalBuyVolume || 0,
            totalSellVolume: ledger?.totalSellVolume || 0,
            totalCommissionPaid: ledger?.totalCommissionPaid || 0,
          },
        },
        meta: {
          pagination: {
            total: totalCount,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
          filters: {
            status,
            search,
            sortBy: actualSortBy,
            sortOrder: sortOrder === 1 ? "asc" : "desc",
          },
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[API_HOLDINGS_GET_CRITICAL_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "Internal server error occurred while pulling portfolio assets.",
      },
      { status: 500 },
    );
  }
}
