import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";

import { CompanyHolding } from "@/model/CompanyHolding";
import { UserLedger } from "@/model/UserLedger";
import { ShareRecord } from "@/model/ShareRecord";

// Utility to ensure perfect financial precision
const roundToTwo = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100;

export async function POST(req: Request) {
  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Authentication Check
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 },
      );
    }

    const userId = authSession.user._id;
    const body = await req.json();

    const {
      actionType, // "BUY" | "SELL"
      companyName,
      quantity,
      rate,
      commissionType, // "PERCENTAGE" | "FIXED"
      commissionValue,
      forceBuy = false, // Only applicable for BUY
    } = body;

    // 2. Input Validation
    if (!actionType || !["BUY", "SELL"].includes(actionType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or missing actionType. Must be BUY or SELL.",
        },
        { status: 400 },
      );
    }
    console.log(companyName, quantity, rate, commissionValue);
    if (!companyName || !quantity || !rate || commissionValue === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required trading fields." },
        { status: 400 },
      );
    }

    const qty = Number(quantity);
    const tradeRate = Number(rate);
    const commValue = Number(commissionValue);

    if (qty <= 0 || tradeRate <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Quantity and rate must be greater than zero.",
        },
        { status: 400 },
      );
    }

    const upperCompanyName = companyName.trim().toUpperCase();

    // 3. Financial Calculations (Gross and Commission)
    const grossAmount = roundToTwo(qty * tradeRate);
    let commissionAmount = 0;

    if (commissionType === "PERCENTAGE") {
      commissionAmount = roundToTwo(grossAmount * (commValue / 100));
    } else if (commissionType === "FIXED") {
      commissionAmount = roundToTwo(commValue);
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid commissionType. Must be PERCENTAGE or FIXED.",
        },
        { status: 400 },
      );
    }

    // Initialize variables that will be calculated based on actionType
    let netCashImpact = 0;
    let realizedProfitForThisTrade = 0;

    // Fetch the user's ledger
    let ledger = await UserLedger.findOne({ userId }).session(session);
    if (!ledger) {
      ledger = new UserLedger({
        userId,
        cashBalance: 0,
        totalBuyVolume: 0,
        totalSellVolume: 0,
        totalCommissionPaid: 0,
      });
    }

    // Fetch the user's holding for this company
    let holding = await CompanyHolding.findOne({
      userId,
      companyName: upperCompanyName,
    }).session(session);

    // ==========================================
    // 🟢 BUY LOGIC
    // ==========================================
    if (actionType === "BUY") {
      const requiredFunds = roundToTwo(grossAmount + commissionAmount);
      netCashImpact = -requiredFunds; // Cash leaves the account

      // Check balance
      if (ledger.cashBalance < requiredFunds && !forceBuy) {
        throw new Error(
          `Insufficient balance. Required: ৳${requiredFunds}, Available: ৳${ledger.cashBalance}`,
        );
      }

      // Update Ledger
      ledger.cashBalance = roundToTwo(ledger.cashBalance + netCashImpact);
      ledger.totalBuyVolume = roundToTwo(ledger.totalBuyVolume + grossAmount);
      ledger.totalCommissionPaid = roundToTwo(
        ledger.totalCommissionPaid + commissionAmount,
      );

      // Update or Create Holding
      if (holding) {
        holding.totalQuantity += qty;
        holding.totalInvestedAmount = roundToTwo(
          holding.totalInvestedAmount + requiredFunds,
        );
        holding.avgBuyPrice = roundToTwo(
          holding.totalInvestedAmount / holding.totalQuantity,
        );
      } else {
        holding = new CompanyHolding({
          userId,
          companyName: upperCompanyName,
          totalQuantity: qty,
          totalInvestedAmount: requiredFunds,
          avgBuyPrice: roundToTwo(requiredFunds / qty),
          realizedProfit: 0,
        });
      }
    }

    // ==========================================
    // 🔴 SELL LOGIC
    // ==========================================
    else if (actionType === "SELL") {
      if (!holding || holding.totalQuantity < qty) {
        throw new Error("Insufficient shares to execute this sell order.");
      }

      netCashImpact = roundToTwo(grossAmount - commissionAmount); // Cash enters the account

      // Calculate Realized Profit
      // Proportionate cost of the shares being sold based on the average buy price
      const costBasisForSoldShares = roundToTwo(qty * holding.avgBuyPrice);
      realizedProfitForThisTrade = roundToTwo(
        netCashImpact - costBasisForSoldShares,
      );

      // Update Ledger
      ledger.cashBalance = roundToTwo(ledger.cashBalance + netCashImpact);
      ledger.totalSellVolume = roundToTwo(ledger.totalSellVolume + grossAmount);
      ledger.totalCommissionPaid = roundToTwo(
        ledger.totalCommissionPaid + commissionAmount,
      );

      // Update Holding
      holding.totalQuantity -= qty;
      holding.totalInvestedAmount = roundToTwo(
        holding.totalInvestedAmount - costBasisForSoldShares,
      );
      holding.realizedProfit = roundToTwo(
        holding.realizedProfit + realizedProfitForThisTrade,
      );
    }

    // 4. Save Ledger and Holdings
    await ledger.save({ session });

    // If holding quantity hits exactly 0 after a sell, we can delete the record to keep the DB clean,
    // OR keep it to preserve the `realizedProfit` history. For an enterprise app, KEEPING it is better for tax/audit history.
    if (holding.totalQuantity === 0) {
      holding.avgBuyPrice = 0;
      holding.totalInvestedAmount = 0;
    }
    await holding.save({ session });

    // 5. Create Immutable Audit Trail (ShareRecord)
    await ShareRecord.create(
      [
        {
          userId,
          actionType,
          companyName: upperCompanyName,
          quantity: qty,
          rate: tradeRate,
          grossAmount,
          commissionAmount,
          netCashImpact,
          status: "COMPLETED",
          isReversed: false,
          transactionDate: new Date(),
        },
      ],
      { session },
    );

    // 6. Commit the Transaction
    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      message: `${actionType} order for ${qty} shares of ${upperCompanyName} executed successfully.`,
      netCashImpact,
      currentBalance: ledger.cashBalance,
    });
  } catch (error: any) {
    // Abort transaction on any failure to guarantee ACID compliance
    await session.abortTransaction();
    console.error("Trade Execution Error:", error);

    // Return 400 for expected business logic errors (like insufficient balance), 500 for others
    const isBusinessError =
      error.message.includes("Insufficient") ||
      error.message.includes("Invalid");
    return NextResponse.json(
      {
        success: false,
        message:
          error.message || "Internal server error during trade execution.",
      },
      { status: isBusinessError ? 400 : 500 },
    );
  } finally {
    session.endSession();
  }
}
