import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import mongoose from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";

import { ShareRecord } from "@/model/shareRecord";

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session?.user?._id) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(
      1,
      Math.min(100, Number(searchParams.get("limit")) || 10),
    );
    const skip = (page - 1) * limit;
    const company = searchParams.get("company");
    const instrument = searchParams.get("instrument");
    const action = searchParams.get("action");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const minAmount = searchParams.get("minAmount");
    const maxAmount = searchParams.get("maxAmount");
    const sortBy = searchParams.get("sortBy") || "transactionDate";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
    const tradeFilters: Record<string, any> = {};

    // Instrument Search
    if (instrument) {
      tradeFilters.instrument = {
        $regex: instrument,
        $options: "i",
      };
    }

    // BUY / SELL
    if (action && action !== "ALL") {
      tradeFilters.tradeType = action.toUpperCase();
    }

    // Date Range
    if (startDate || endDate) {
      tradeFilters.transactionDate = {};

      if (startDate) {
        tradeFilters.transactionDate.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);

        tradeFilters.transactionDate.$lte = end;
      }
    }

    // Amount Range
    if (minAmount || maxAmount) {
      tradeFilters.amount = {};

      if (minAmount) {
        tradeFilters.amount.$gte = Number(minAmount);
      }

      if (maxAmount) {
        tradeFilters.amount.$lte = Number(maxAmount);
      }
    }

    const companyMatch: Record<string, any> = {};

    if (company) {
      companyMatch["companies.companyName"] = {
        $regex: company,
        $options: "i",
      };
    }

    const pipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(session.user._id),
        },
      },

      {
        $unwind: "$companies",
      },

      ...(company
        ? [
            {
              $match: companyMatch,
            },
          ]
        : []),

      {
        $unwind: "$companies.trades",
      },

      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$companies.trades",
              {
                companyName: "$companies.companyName",
              },
            ],
          },
        },
      },

      {
        $match: tradeFilters,
      },
    ];

    const totalResult = await ShareRecord.aggregate([
      ...pipeline,
      {
        $count: "total",
      },
    ]);

    const totalRecords = totalResult[0]?.total || 0;

    const trades = await ShareRecord.aggregate([
      ...pipeline,

      {
        $sort: {
          [sortBy]: sortOrder,
        },
      },

      {
        $skip: skip,
      },

      {
        $limit: limit,
      },
    ]);

    return NextResponse.json(
      {
        success: true,

        data: trades,

        pagination: {
          totalRecords,

          currentPage: page,

          totalPages: Math.ceil(totalRecords / limit),

          hasNextPage: page * limit < totalRecords,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      },
    );
  }
}

/**
  Query Examples

Get company A trades:

/api/share-record?company=A

Search instrument:

/api/share-record?instrument=GP

Only BUY:

/api/share-record?action=BUY

Sort by rate:

/api/share-record?sortBy=rate&sortOrder=desc

Date range:

/api/share-record?startDate=2026-01-01&endDate=2026-12-31

Company + Instrument:

/api/share-record?company=A&instrument=GP


 */
