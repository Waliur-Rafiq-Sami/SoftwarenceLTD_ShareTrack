/**
 Export Modes
 //* -------------------------
ALL COMPANIES
ONE COMPANY
MULTIPLE COMPANIES

ALL TRADES
FILTERED TRADES

SEARCH
DATE RANGE
AMOUNT RANGE
BUY/SELL

SORTING

EXPORT LIMIT

// !-------------
Request Body
//* -------------------------

{
  company: "all", // all | GP | BEXIMCO

  companies: [], // optional multi-company export

  searchInstrument: "",
  searchAction: "ALL",

  startDate: "",
  endDate: "",

  minAmount: "",
  maxAmount: "",

  sortBy: "transactionDate",
  sortOrder: "desc",

  exportLimit: "all"
}


// !-------------
Request Body
//* -------------------------
Supported Examples

Export everything:

{
  "company": "all"
}

Export only GP:

{
  "company": "GP"
}

Export GP + BEXIMCO:

{
  "companies": ["GP", "BEXIMCO"]
}

Export BUY trades only:

{
  "searchAction": "BUY"
}

Export top 500 records:

{
  "exportLimit": "500"
}

Export GP trades in 2026:

{
  "company": "GP",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31"
}
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import dbConnect from "@/lib/dbConnect";
import { authOptions } from "../../auth/[...nextauth]/options";

import { ShareRecord } from "@/model/shareRecord";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session?.user?._id) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const body = await request.json();

    const {
      company,
      companies,

      searchInstrument,
      searchAction,

      startDate,
      endDate,

      minAmount,
      maxAmount,

      sortBy,
      sortOrder,

      exportLimit,
    } = body;

    const tradeFilters: Record<string, any> = {};

    // -----------------------------
    // Instrument Search
    // -----------------------------

    if (searchInstrument) {
      tradeFilters.instrument = {
        $regex: searchInstrument,
        $options: "i",
      };
    }

    // -----------------------------
    // BUY / SELL
    // -----------------------------

    if (searchAction && searchAction !== "ALL") {
      tradeFilters.tradeType = searchAction.toUpperCase();
    }

    // -----------------------------
    // Date Range
    // -----------------------------

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

    // -----------------------------
    // Amount Range
    // -----------------------------

    if (minAmount || maxAmount) {
      tradeFilters.amount = {};

      if (minAmount) {
        tradeFilters.amount.$gte = Number(minAmount);
      }

      if (maxAmount) {
        tradeFilters.amount.$lte = Number(maxAmount);
      }
    }

    // -----------------------------
    // Company Filter
    // -----------------------------

    const companyMatch: Record<string, any> = {};

    if (company && company !== "all") {
      companyMatch["companies.companyName"] = company;
    }

    if (companies && Array.isArray(companies) && companies.length) {
      companyMatch["companies.companyName"] = {
        $in: companies,
      };
    }

    const pipeline: any[] = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(session.user._id),
        },
      },

      {
        $unwind: "$companies",
      },
    ];

    if (Object.keys(companyMatch).length) {
      pipeline.push({
        $match: companyMatch,
      });
    }

    pipeline.push(
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
    );

    const allowedSortFields = [
      "rate",
      "commission",
      "amount",
      "netAmount",
      "transactionDate",
      "quantity",
    ];

    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : "transactionDate";

    const direction = sortOrder === "asc" ? 1 : -1;

    pipeline.push({
      $sort: {
        [sortField]: direction,
      },
    });

    if (exportLimit && exportLimit !== "all") {
      const parsedLimit = parseInt(exportLimit);

      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        pipeline.push({
          $limit: parsedLimit,
        });
      }
    }

    const trades = await ShareRecord.aggregate(pipeline);

    return NextResponse.json(
      {
        success: true,
        count: trades.length,
        data: trades,
      },
      {
        status: 200,
      },
    );
  } catch (error: any) {
    console.error("Export Error", error);

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
