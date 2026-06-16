import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { UserLedger } from "@/model/UserLedger";
import { ShareRecord } from "@/model/ShareRecord";
import mongoose from "mongoose";

// Utility function to avoid floating point precision issues
const roundToTwo = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100;

export async function POST(req: Request) {
  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Authentication Check
    const sessionAuth = await getServerSession(authOptions);
    if (!sessionAuth?.user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access. Please log in." },
        { status: 401 },
      );
    }

    const userId = sessionAuth.user._id;
    const body = await req.json();

    // Expecting actionType to be either "DEPOSIT" or "WITHDRAW"
    const { actionType, amount } = body;

    // 2. Input Validation
    if (!["DEPOSIT", "WITHDRAW"].includes(actionType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid action type. Must be DEPOSIT or WITHDRAW.",
        },
        { status: 400 },
      );
    }

    const transactionAmount = roundToTwo(Number(amount || 0));
    if (transactionAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction amount must be strictly greater than zero.",
        },
        { status: 400 },
      );
    }

    let updatedLedger;
    let netCashImpact = 0;

    // 3. Process Transaction Based on Action Type
    if (actionType === "DEPOSIT") {
      netCashImpact = transactionAmount;

      // Upsert: Create ledger if it doesn't exist, otherwise increment
      updatedLedger = await UserLedger.findOneAndUpdate(
        { userId },
        {
          $inc: { cashBalance: transactionAmount },
          $setOnInsert: {
            totalBuyVolume: 0,
            totalSellVolume: 0,
            totalCommissionPaid: 0,
          },
        },
        { upsert: true, new: true, session },
      );
    } else if (actionType === "WITHDRAW") {
      netCashImpact = -transactionAmount;

      // Ensure user has enough balance using query condition (Atomic operation to prevent race conditions)
      updatedLedger = await UserLedger.findOneAndUpdate(
        { userId, cashBalance: { $gte: transactionAmount } },
        {
          $inc: { cashBalance: -transactionAmount },
        },
        { new: true, session },
      );

      if (!updatedLedger) {
        await session.abortTransaction();
        return NextResponse.json(
          {
            success: false,
            message:
              "Withdrawal rejected! Insufficient liquid cash or ledger not found.",
          },
          { status: 422 },
        );
      }
    }

    // 4. Create the Immutable Audit Trail (ShareRecord)
    await ShareRecord.create(
      [
        {
          userId,
          actionType,
          grossAmount: transactionAmount,
          commissionAmount: 0, // No commission for deposit/withdraw by default
          netCashImpact,
          status: "COMPLETED",
          isReversed: false,
          transactionDate: new Date(),
        },
      ],
      { session },
    );

    // 5. Commit the Transaction
    await session.commitTransaction();

    const actionText =
      actionType === "DEPOSIT" ? "credited to" : "debited from";

    return NextResponse.json({
      success: true,
      message: `Successfully ${actionText} ৳${transactionAmount.toFixed(2)} your asset ledger.`,
      currentBalance: updatedLedger.cashBalance,
    });
  } catch (error: any) {
    // If anything fails, rollback everything
    await session.abortTransaction();
    console.error("Wallet Transaction Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An internal error occurred during the transaction.",
      },
      { status: 500 },
    );
  } finally {
    // Always end the session to free up resources
    session.endSession();
  }
}
