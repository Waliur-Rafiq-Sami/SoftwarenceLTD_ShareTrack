// // import { NextRequest, NextResponse } from "next/server";
// // import { getServerSession } from "next-auth/next";
// // import mongoose from "mongoose";
// // import dbConnect from "@/lib/dbConnect";
// // import { ShareRecord } from "@/model/ShareRecord";
// // import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// // export async function GET(req: NextRequest) {
// //   try {
// //     // 1. Establish Secure Connection to Database Instance
// //     await dbConnect();

// //     // 2. Comprehensive Security Authentication Guard
// //     const session = await getServerSession(authOptions);
// //     if (!session?.user?._id) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Unauthorized access. Invalid session context.",
// //         },
// //         { status: 401 },
// //       );
// //     }

// //     const userObjectId = new mongoose.Types.ObjectId(session.user._id);
// //     const { searchParams } = new URL(req.url);

// //     // 3. Extract, Standardize, and Sanitize Pagination Parameters
// //     const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
// //     const limit = Math.max(
// //       1,
// //       Math.min(100, parseInt(searchParams.get("limit") || "25", 10)),
// //     );
// //     const skip = (page - 1) * limit;

// //     // 4. Construct Dynamic Core Query Document
// //     const query: Record<string, any> = { userId: userObjectId };

// //     // --- CRITICAL MATRIX FILTERS ---

// //     // A. Master Text Search Parameter (Omni-search over text fields)
// //     const search = searchParams.get("search")?.trim();
// //     if (search) {
// //       query.$or = [
// //         { companyName: { $regex: search, $options: "i" } },
// //         { actionType: { $regex: search, $options: "i" } },
// //       ];
// //     }

// //     // B. Direct Match Textual Filters
// //     const companyName = searchParams.get("companyName")?.trim().toUpperCase();
// //     if (companyName) {
// //       query.companyName = companyName; // Exact lookup match
// //     }

// //     const actionType = searchParams.get("actionType")?.trim().toUpperCase();
// //     if (actionType && actionType !== "ALL") {
// //       const validTypes = ["BUY", "SELL", "DEPOSIT", "WITHDRAW"];
// //       if (validTypes.includes(actionType)) {
// //         query.actionType = actionType;
// //       }
// //     }

// //     const status = searchParams.get("status")?.trim().toUpperCase();
// //     if (status && status !== "ALL") {
// //       const validStatuses = ["COMPLETED", "PENDING", "CANCELLED"];
// //       if (validStatuses.includes(status)) {
// //         query.status = status;
// //       }
// //     }

// //     const isReversed = searchParams.get("isReversed");
// //     if (isReversed !== null && isReversed !== undefined && isReversed !== "") {
// //       query.isReversed = isReversed === "true";
// //     }

// //     // C. Date Boundaries & Ranges
// //     const startDateStr = searchParams.get("startDate");
// //     const endDateStr = searchParams.get("endDate");
// //     if (startDateStr || endDateStr) {
// //       query.transactionDate = {};
// //       if (startDateStr) {
// //         const start = new Date(startDateStr);
// //         if (!isNaN(start.getTime())) query.transactionDate.$gte = start;
// //       }
// //       if (endDateStr) {
// //         const end = new Date(endDateStr);
// //         if (!isNaN(end.getTime())) query.transactionDate.$lte = end;
// //       }
// //     }

// //     // D. Safe Helper Logic for Extracting Numeric Ranges
// //     const applyNumericRange = (
// //       paramMin: string,
// //       paramMax: string,
// //       dbField: string,
// //     ) => {
// //       const minVal = searchParams.get(paramMin);
// //       const maxVal = searchParams.get(paramMax);

// //       if (minVal !== null || maxVal !== null) {
// //         query[dbField] = {};
// //         if (minVal !== null) {
// //           const parsedMin = parseFloat(minVal);
// //           if (!isNaN(parsedMin)) query[dbField].$gte = parsedMin;
// //         }
// //         if (maxVal !== null) {
// //           const parsedMax = parseFloat(maxVal);
// //           if (!isNaN(parsedMax)) query[dbField].$lte = parsedMax;
// //         }
// //       }
// //     };

// //     // Apply strict multi-variable continuous numeric range bounds
// //     applyNumericRange("minRate", "maxRate", "rate");
// //     applyNumericRange("minQuantity", "maxQuantity", "quantity");
// //     applyNumericRange("minGrossAmount", "maxGrossAmount", "grossAmount");
// //     applyNumericRange("minCommission", "maxCommission", "commissionAmount");
// //     applyNumericRange("minNetImpact", "maxNetImpact", "netCashImpact");

// //     // 5. Dynamic Sorting Configuration (Secured from Injection Patterns)
// //     const sortBy = searchParams.get("sortBy") || "transactionDate";
// //     const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

// //     const permittedSortFields = [
// //       "transactionDate",
// //       "grossAmount",
// //       "commissionAmount",
// //       "netCashImpact",
// //       "rate",
// //       "quantity",
// //       "companyName",
// //       "createdAt",
// //     ];

// //     const validatedSortBy = permittedSortFields.includes(sortBy)
// //       ? sortBy
// //       : "transactionDate";

// //     // 6. Concurrent Query Thread Execution
// //     const [records, totalCount] = await Promise.all([
// //       ShareRecord.find(query)
// //         .sort({ [validatedSortBy]: sortOrder })
// //         .skip(skip)
// //         .limit(limit)
// //         .lean() // Bypass heavy Mongoose overhead structures for direct memory performance
// //         .exec(),
// //       ShareRecord.countDocuments(query).exec(),
// //     ]);

// //     // 7. Calculate Advanced Pagination Enveloping Meta Properties
// //     const totalPages = Math.ceil(totalCount / limit);

// //     return NextResponse.json(
// //       {
// //         success: true,
// //         data: records,
// //         meta: {
// //           pagination: {
// //             totalItems: totalCount,
// //             currentPage: page,
// //             itemsPerPage: limit,
// //             totalPages,
// //             hasNextPage: page < totalPages,
// //             hasPreviousPage: page > 1,
// //           },
// //           appliedFilters: {
// //             search: search || null,
// //             companyName: companyName || "ALL",
// //             actionType: actionType || "ALL",
// //             status: status || "ALL",
// //             sortBy: validatedSortBy,
// //             sortOrder: sortOrder === 1 ? "asc" : "desc",
// //           },
// //         },
// //       },
// //       { status: 200 },
// //     );
// //   } catch (error: any) {
// //     console.error("[CRITICAL_API_TRANSACTIONS_LEDGER_ERROR]:", error);
// //     return NextResponse.json(
// //       {
// //         success: false,
// //         message:
// //           "An internal core database exception occurred while reading matching ledger profiles.",
// //         error:
// //           process.env.NODE_ENV === "development" ? error.message : undefined,
// //       },
// //       { status: 500 },
// //     );
// //   }
// // }

// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next";
// import mongoose from "mongoose";
// import dbConnect from "@/lib/dbConnect";
// import { ShareRecord } from "@/model/ShareRecord";
// import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// export async function GET(req: NextRequest) {
//   try {
//     // 1. Establish Secure Connection to Database Instance
//     await dbConnect();

//     // 2. Comprehensive Security Authentication Guard
//     const session = await getServerSession(authOptions);
//     if (!session?.user?._id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized access. Invalid session context.",
//         },
//         { status: 401 },
//       );
//     }

//     const userObjectId = new mongoose.Types.ObjectId(session.user._id);
//     const { searchParams } = new URL(req.url);

//     // 3. Extract, Standardize, and Sanitize Pagination Parameters
//     const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
//     const limit = Math.max(
//       1,
//       Math.min(100, parseInt(searchParams.get("limit") || "10", 10)),
//     );
//     const skip = (page - 1) * limit;

//     // 4. Construct Dynamic Core Query Document
//     const query: Record<string, any> = { userId: userObjectId };

//     // --- CRITICAL MATRIX FILTERS ---

//     // A. Master Text Search Parameter (Omni-search over text, actions, and statuses)
//     const search = searchParams.get("search")?.trim();
//     if (search) {
//       query.$or = [
//         { companyName: { $regex: search, $options: "i" } },
//         { actionType: { $regex: search, $options: "i" } },
//         { status: { $regex: search, $options: "i" } },
//       ];
//     }

//     // B. Direct Match Textual Filters with Bulletproof Normalization
//     const companyName = searchParams.get("companyName")?.trim();
//     if (companyName && companyName !== "ALL") {
//       query.companyName = { $regex: `^${companyName}$`, $options: "i" };
//     }

//     let actionType = searchParams.get("actionType")?.trim().toUpperCase();
//     if (actionType && actionType !== "ALL") {
//       // Normalize common variations
//       if (actionType === "BUYING") actionType = "BUY";
//       if (actionType === "SELLING") actionType = "SELL";

//       const validTypes = ["BUY", "SELL", "DEPOSIT", "WITHDRAW"];
//       if (validTypes.includes(actionType)) {
//         query.actionType = { $regex: `^${actionType}$`, $options: "i" };
//       }
//     }

//     let status = searchParams.get("status")?.trim().toUpperCase();
//     if (status && status !== "ALL") {
//       // Normalizing variations like 'COMPLETE' -> 'COMPLETED' or 'CANCEL' -> 'CANCELLED'
//       if (status === "COMPLETE") status = "COMPLETED";
//       if (status === "CANCEL") status = "CANCELLED";

//       const validStatuses = ["COMPLETED", "PENDING", "CANCELLED"];
//       if (validStatuses.includes(status)) {
//         // Case-insensitive regex anchor to match DB variations safely
//         query.status = { $regex: `^${status}$`, $options: "i" };
//       }
//     }

//     const isReversed = searchParams.get("isReversed");
//     if (isReversed !== null && isReversed !== undefined && isReversed !== "") {
//       query.isReversed = isReversed === "true";
//     }

//     // C. Date Boundaries & Ranges
//     const startDateStr = searchParams.get("startDate");
//     const endDateStr = searchParams.get("endDate");
//     if (startDateStr || endDateStr) {
//       query.transactionDate = {};
//       if (startDateStr) {
//         const start = new Date(startDateStr);
//         if (!isNaN(start.getTime())) query.transactionDate.$gte = start;
//       }
//       if (endDateStr) {
//         const end = new Date(endDateStr);
//         if (!isNaN(end.getTime())) query.transactionDate.$lte = end;
//       }
//     }

//     // D. Safe Helper Logic for Extracting Numeric Ranges
//     const applyNumericRange = (
//       paramMin: string,
//       paramMax: string,
//       dbField: string,
//     ) => {
//       const minVal = searchParams.get(paramMin);
//       const maxVal = searchParams.get(paramMax);

//       if (minVal !== null || maxVal !== null) {
//         query[dbField] = {};
//         if (minVal !== null && minVal !== "") {
//           const parsedMin = parseFloat(minVal);
//           if (!isNaN(parsedMin)) query[dbField].$gte = parsedMin;
//         }
//         if (maxVal !== null && maxVal !== "") {
//           const parsedMax = parseFloat(maxVal);
//           if (!isNaN(parsedMax)) query[dbField].$lte = parsedMax;
//         }
//         // Cleanup if empty objects were assigned
//         if (Object.keys(query[dbField]).length === 0) delete query[dbField];
//       }
//     };

//     applyNumericRange("minRate", "maxRate", "rate");
//     applyNumericRange("minQuantity", "maxQuantity", "quantity");
//     applyNumericRange("minGrossAmount", "maxGrossAmount", "grossAmount");
//     applyNumericRange("minCommission", "maxCommission", "commissionAmount");
//     applyNumericRange("minNetImpact", "maxNetImpact", "netCashImpact");

//     // 5. Dynamic Sorting Configuration (Secured from Injection Patterns)
//     const sortBy = searchParams.get("sortBy") || "transactionDate";
//     const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

//     const permittedSortFields = [
//       "transactionDate",
//       "grossAmount",
//       "commissionAmount",
//       "netCashImpact",
//       "rate",
//       "quantity",
//       "companyName",
//       "createdAt",
//     ];

//     const validatedSortBy = permittedSortFields.includes(sortBy)
//       ? sortBy
//       : "transactionDate";

//     // 6. Concurrent Query Thread Execution
//     const [records, totalCount] = await Promise.all([
//       ShareRecord.find(query)
//         .sort({ [validatedSortBy]: sortOrder })
//         .skip(skip)
//         .limit(limit)
//         .lean()
//         .exec(),
//       ShareRecord.countDocuments(query).exec(),
//     ]);

//     const totalPages = Math.ceil(totalCount / limit);

//     // 7. Dynamic Metadata Hydration
//     return NextResponse.json(
//       {
//         success: true,
//         data: records,
//         meta: {
//           pagination: {
//             totalItems: totalCount,
//             page, // Native alignment for UI Client mapping
//             limit, // Native alignment for UI Client mapping
//             currentPage: page,
//             itemsPerPage: limit,
//             totalPages,
//             hasNextPage: page < totalPages,
//             hasPreviousPage: page > 1,
//           },
//           appliedFilters: {
//             search: search || null,
//             companyName: companyName || "ALL",
//             actionType: actionType || "ALL",
//             status: status || "ALL",
//             sortBy: validatedSortBy,
//             sortOrder: sortOrder === 1 ? "asc" : "desc",
//           },
//         },
//       },
//       { status: 200 },
//     );
//   } catch (error: any) {
//     console.error("[CRITICAL_API_TRANSACTIONS_LEDGER_ERROR]:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           "An internal core database exception occurred while reading matching ledger profiles.",
//         error:
//           process.env.NODE_ENV === "development" ? error.message : undefined,
//       },
//       { status: 500 },
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { ShareRecord } from "../../../model/ShareRecord";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

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

    // 1. Check if the frontend is requesting the full unpaginated dataset
    const fetchAll = searchParams.get("fetchAll") === "true";

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get("limit") || "10", 10)),
    );
    const skip = (page - 1) * limit;

    const query: Record<string, any> = { userId: userObjectId };

    // ... [KEEP ALL YOUR EXISTING FILTER LOGIC HERE (search, companyName, actionType, etc.)] ...

    const search = searchParams.get("search")?.trim();
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { actionType: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ];
    }

    const companyName = searchParams.get("companyName")?.trim();
    if (companyName && companyName !== "ALL") {
      query.companyName = { $regex: `^${companyName}$`, $options: "i" };
    }

    let actionType = searchParams.get("actionType")?.trim().toUpperCase();
    if (actionType && actionType !== "ALL") {
      if (actionType === "BUYING") actionType = "BUY";
      if (actionType === "SELLING") actionType = "SELL";
      const validTypes = ["BUY", "SELL", "DEPOSIT", "WITHDRAW"];
      if (validTypes.includes(actionType)) {
        query.actionType = { $regex: `^${actionType}$`, $options: "i" };
      }
    }

    let status = searchParams.get("status")?.trim().toUpperCase();
    if (status && status !== "ALL") {
      if (status === "COMPLETE") status = "COMPLETED";
      if (status === "CANCEL") status = "CANCELLED";
      const validStatuses = ["COMPLETED", "PENDING", "CANCELLED"];
      if (validStatuses.includes(status)) {
        query.status = { $regex: `^${status}$`, $options: "i" };
      }
    }

    const isReversed = searchParams.get("isReversed");
    if (isReversed !== null && isReversed !== undefined && isReversed !== "") {
      query.isReversed = isReversed === "true";
    }

    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    if (startDateStr || endDateStr) {
      query.transactionDate = {};
      if (startDateStr) {
        const start = new Date(startDateStr);
        if (!isNaN(start.getTime())) query.transactionDate.$gte = start;
      }
      if (endDateStr) {
        const end = new Date(endDateStr);
        if (!isNaN(end.getTime())) query.transactionDate.$lte = end;
      }
    }

    const applyNumericRange = (
      paramMin: string,
      paramMax: string,
      dbField: string,
    ) => {
      const minVal = searchParams.get(paramMin);
      const maxVal = searchParams.get(paramMax);

      if (minVal !== null || maxVal !== null) {
        query[dbField] = {};
        if (minVal !== null && minVal !== "") {
          const parsedMin = parseFloat(minVal);
          if (!isNaN(parsedMin)) query[dbField].$gte = parsedMin;
        }
        if (maxVal !== null && maxVal !== "") {
          const parsedMax = parseFloat(maxVal);
          if (!isNaN(parsedMax)) query[dbField].$lte = parsedMax;
        }
        if (Object.keys(query[dbField]).length === 0) delete query[dbField];
      }
    };

    applyNumericRange("minRate", "maxRate", "rate");
    applyNumericRange("minQuantity", "maxQuantity", "quantity");
    applyNumericRange("minGrossAmount", "maxGrossAmount", "grossAmount");
    applyNumericRange("minCommission", "maxCommission", "commissionAmount");
    applyNumericRange("minNetImpact", "maxNetImpact", "netCashImpact");

    const sortBy = searchParams.get("sortBy") || "transactionDate";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const permittedSortFields = [
      "transactionDate",
      "grossAmount",
      "commissionAmount",
      "netCashImpact",
      "rate",
      "quantity",
      "companyName",
      "createdAt",
    ];

    const validatedSortBy = permittedSortFields.includes(sortBy)
      ? sortBy
      : "transactionDate";

    // 2. Build the base Mongoose query WITHOUT pagination first
    let dbQuery = ShareRecord.find(query).sort({
      [validatedSortBy]: sortOrder,
    });

    // 3. Conditionally apply pagination ONLY if fetchAll is false
    if (!fetchAll) {
      dbQuery = dbQuery.skip(skip).limit(limit);
    }

    // 4. Execute the query
    const [records, totalCount] = await Promise.all([
      dbQuery.lean().exec(),
      ShareRecord.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        success: true,
        data: records,
        meta: {
          pagination: {
            totalItems: totalCount,
            page,
            limit,
            currentPage: page,
            itemsPerPage: fetchAll ? totalCount : limit, // Adjust meta if fetchAll is true
            totalPages: fetchAll ? 1 : totalPages, // Adjust meta if fetchAll is true
            hasNextPage: fetchAll ? false : page < totalPages,
            hasPreviousPage: fetchAll ? false : page > 1,
          },
          appliedFilters: {
            search: search || null,
            companyName: companyName || "ALL",
            actionType: actionType || "ALL",
            status: status || "ALL",
            sortBy: validatedSortBy,
            sortOrder: sortOrder === 1 ? "asc" : "desc",
          },
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[CRITICAL_API_TRANSACTIONS_LEDGER_ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "An internal core database exception occurred while reading matching ledger profiles.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
