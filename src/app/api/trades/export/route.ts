// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";

// import dbConnect from "@/lib/dbConnect";
// import { authOptions } from "../../auth/[...nextauth]/options";
// import { TradeRecord } from "@/model/TradeRecord";

// export async function POST(request: Request) {
//   await dbConnect();
//   const session = await getServerSession(authOptions);

//   if (!session?.user?._id) {
//     return NextResponse.json({ success: false, message: "Unauthorized access detected." }, { status: 401 });
//   }

//   try {
//     const { searchParams } = new URL(request.url);

//     // 1. Query Construction (Identical to your standard route for feature parity)
//     const query: Record<string, any> = { userId: session.user._id };

//     // Text Search
//     const instrument = searchParams.get("instrument");
//     if (instrument) {
//       query.instrument = { $regex: instrument, $options: "i" };
//     }

//     // Action Search
//     const action = searchParams.get("action");
//     if (action && action !== "ALL") {
//       query.tradeType = action.toUpperCase();
//     }

//     // Date Range
//     const startDate = searchParams.get("startDate");
//     const endDate = searchParams.get("endDate");
//     if (startDate || endDate) {
//       query.transactionDate = {};
//       if (startDate) query.transactionDate.$gte = new Date(startDate);
//       if (endDate) query.transactionDate.$lte = new Date(endDate);
//     }

//     // Amount Range
//     const minAmount = searchParams.get("minAmount");
//     const maxAmount = searchParams.get("maxAmount");
//     if (minAmount || maxAmount) {
//       query.amount = {};
//       if (minAmount) query.amount.$gte = parseFloat(minAmount);
//       if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
//     }

//     // 2. Dynamic Sorting
//     const sortBy = searchParams.get("sortBy");
//     const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

//     const allowedSortFields = ["rate", "commission", "transactionDate", "amount"];
//     const sortConfig: Record<string, number> = {};

//     if (sortBy && allowedSortFields.includes(sortBy)) {
//       sortConfig[sortBy] = sortOrder;
//     } else {
//       sortConfig.transactionDate = -1; // Default fallback
//     }

//     // 3. Customize Export Limit Logic
//     // Look for a specific export amount. If not present, default to "all"
//     const exportLimit = searchParams.get("exportLimit");

//     // Initialize the MongoDB query chain
//     let dbQuery = TradeRecord.find(query).sort(sortConfig);

//     // If the user requested a specific limit (e.g., first 100, first 200000), apply it.
//     if (exportLimit && exportLimit !== "all") {
//       const parsedLimit = parseInt(exportLimit, 10);
//       if (!isNaN(parsedLimit) && parsedLimit > 0) {
//         dbQuery = dbQuery.limit(parsedLimit);
//       }
//     }

//     // 4. Execution
//     // We use .lean() for faster execution since we only need raw JSON for exports
//     const trades = await dbQuery.lean();

//     return NextResponse.json(
//       {
//         success: true,
//         count: trades.length,
//         data: trades,
//       },
//       { status: 200 },
//     );
//   } catch (error: any) {
//     console.error("Export API Error:", error);
//     return NextResponse.json({ success: false, message: "Internal server error during data export" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import dbConnect from "@/lib/dbConnect";
import { authOptions } from "../../auth/[...nextauth]/options";
import { TradeRecord } from "@/model/TradeRecord";

export async function POST(request: Request) {
  await dbConnect();

  // 1. Auth Check
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized access detected." },
      { status: 401 },
    );
  }

  try {
    // 2. Parse the body instead of searchParams
    const body = await request.json();

    // Destructure filters from body (these match the keys you pass from ExportModal)
    const {
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

    // 3. Query Construction
    const query: Record<string, any> = { userId: session.user._id };

    // Text Search
    if (searchInstrument) {
      query.instrument = { $regex: searchInstrument, $options: "i" };
    }

    // Action Search
    if (searchAction && searchAction !== "ALL") {
      query.tradeType = searchAction.toUpperCase();
    }

    // Date Range
    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) query.transactionDate.$gte = new Date(startDate);
      if (endDate) query.transactionDate.$lte = new Date(endDate);
    }

    // Amount Range
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    // 4. Dynamic Sorting
    const sortConfig: Record<string, number> = {};
    const allowedSortFields = [
      "rate",
      "commission",
      "transactionDate",
      "amount",
    ];

    const direction = sortOrder === "asc" ? 1 : -1;

    if (sortBy && allowedSortFields.includes(sortBy)) {
      sortConfig[sortBy] = direction;
    } else {
      sortConfig.transactionDate = -1; // Default fallback
    }

    // 5. Build and Execute Query
    let dbQuery = TradeRecord.find(query).sort(sortConfig);

    // Apply Limit
    if (exportLimit && exportLimit !== "all") {
      const parsedLimit = parseInt(exportLimit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        dbQuery = dbQuery.limit(parsedLimit);
      }
    }

    const trades = await dbQuery.lean();

    return NextResponse.json(
      {
        success: true,
        count: trades.length,
        data: trades,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Export API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during data export" },
      { status: 500 },
    );
  }
}
