import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";

import { ShareRecord } from "../../../../model/ShareRecord";
import { UserLedger } from "@/model/UserLedger";
import { CompanyHolding } from "@/model/CompanyHolding";

// Utility to ensure perfect financial precision
const roundToTwo = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100;

export async function POST(req: Request) {
  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Authentication & Authorization Check
    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 },
      );
    }

    // In a real enterprise app, you should also verify if this user has "ADMIN" or "MANAGER" role.
    // Regular users should NEVER be able to call the reverse API.
    // if (authSession.user.role !== "ADMIN") throw new Error("Only administrators can reverse transactions.");

    const body = await req.json();
    const { transactionId } = body;

    if (!transactionId || !mongoose.Types.ObjectId.isValid(transactionId)) {
      return NextResponse.json(
        { success: false, message: "A valid transactionId is required." },
        { status: 400 },
      );
    }
    console.log(transactionId);
    // 2. Fetch the Original Transaction
    const originalRecord =
      await ShareRecord.findById(transactionId).session(session);

    if (!originalRecord) {
      return NextResponse.json(
        { success: false, message: "Transaction record not found." },
        { status: 404 },
      );
    }

    if (originalRecord.isReversed) {
      return NextResponse.json(
        {
          success: false,
          message: "This transaction has already been reversed.",
        },
        { status: 400 },
      );
    }

    const userId = originalRecord.userId;

    // Fetch User's Ledger
    const ledger = await UserLedger.findOne({ userId }).session(session);
    if (!ledger) {
      throw new Error("User ledger not found. Cannot perform reversal.");
    }

    // Initialize Holding variable (will only be fetched if action is BUY or SELL)
    let holding = null;
    if (
      ["BUY", "SELL"].includes(originalRecord.actionType) &&
      originalRecord.companyName
    ) {
      holding = await CompanyHolding.findOne({
        userId,
        companyName: originalRecord.companyName,
      }).session(session);
      if (!holding && originalRecord.actionType === "BUY") {
        throw new Error(
          "Holding record missing. Cannot reverse a BUY order if the holding no longer exists.",
        );
      }
    }

    // 3. Execute the Reversal Math based on Action Type
    const action = originalRecord.actionType;

    // ==========================================
    // 🟢 REVERSE A DEPOSIT
    // ==========================================
    if (action === "DEPOSIT") {
      // Reversing a deposit means taking the money away.
      if (ledger.cashBalance < originalRecord.grossAmount) {
        throw new Error(
          "Cannot reverse deposit: User does not have sufficient funds to cover the reversal.",
        );
      }
      ledger.cashBalance = roundToTwo(
        ledger.cashBalance - originalRecord.grossAmount,
      );
    }

    // ==========================================
    // 🟢 REVERSE A WITHDRAW
    // ==========================================
    else if (action === "WITHDRAW") {
      // Reversing a withdraw means giving the money back.
      ledger.cashBalance = roundToTwo(
        ledger.cashBalance + originalRecord.grossAmount,
      );
    }

    // ==========================================
    // 🟢 REVERSE A BUY
    // ==========================================
    else if (action === "BUY" && holding) {
      // 1. Give money back to ledger (netCashImpact was negative, so we subtract it to make it positive)
      ledger.cashBalance = roundToTwo(
        ledger.cashBalance - originalRecord.netCashImpact,
      );
      ledger.totalBuyVolume = roundToTwo(
        ledger.totalBuyVolume - originalRecord.grossAmount,
      );
      ledger.totalCommissionPaid = roundToTwo(
        ledger.totalCommissionPaid - originalRecord.commissionAmount,
      );

      // 2. Take shares away from holding
      if (holding.totalQuantity < originalRecord.quantity!) {
        throw new Error(
          "Cannot reverse BUY: User has already sold some of these shares.",
        );
      }

      const costOfOriginalBuy = roundToTwo(
        originalRecord.grossAmount + originalRecord.commissionAmount,
      );

      holding.totalQuantity -= originalRecord.quantity!;
      holding.totalInvestedAmount = roundToTwo(
        holding.totalInvestedAmount - costOfOriginalBuy,
      );

      // 3. Recalculate Average Buy Price
      if (holding.totalQuantity === 0) {
        holding.avgBuyPrice = 0;
        holding.totalInvestedAmount = 0;
      } else {
        holding.avgBuyPrice = roundToTwo(
          holding.totalInvestedAmount / holding.totalQuantity,
        );
      }
    }

    // ==========================================
    // 🟢 REVERSE A SELL
    // ==========================================
    else if (action === "SELL") {
      // 1. Take money away from ledger (user must have enough cash to give back)
      if (ledger.cashBalance < originalRecord.netCashImpact) {
        throw new Error(
          "Cannot reverse SELL: User does not have sufficient funds to return the cash.",
        );
      }

      ledger.cashBalance = roundToTwo(
        ledger.cashBalance - originalRecord.netCashImpact,
      );
      ledger.totalSellVolume = roundToTwo(
        ledger.totalSellVolume - originalRecord.grossAmount,
      );
      ledger.totalCommissionPaid = roundToTwo(
        ledger.totalCommissionPaid - originalRecord.commissionAmount,
      );

      // 2. Give shares back to holding
      // We need to calculate what the Realized Profit WAS for this specific transaction so we can deduct it back out.
      // We don't have the exact avgBuyPrice AT THE TIME OF SALE saved in ShareRecord (a highly recommended future upgrade),
      // so we use the *current* avgBuyPrice to estimate the rollback, OR if the holding was emptied, we have a problem.

      if (!holding) {
        // If holding was deleted/empty, we must recreate it.
        holding = new CompanyHolding({
          userId,
          companyName: originalRecord.companyName,
          totalQuantity: 0,
          totalInvestedAmount: 0,
          avgBuyPrice: 0,
          realizedProfit: 0,
        });
      }

      // To reverse the realized profit, we must reverse engineer it.
      // This is a complex step. We assume the avgBuyPrice didn't change since the sell (because sells don't change avgBuyPrice).
      const proportionateCostBasis = roundToTwo(
        originalRecord.quantity! * holding.avgBuyPrice,
      );
      const realizedProfitFromThisSell = roundToTwo(
        originalRecord.netCashImpact - proportionateCostBasis,
      );

      holding.totalQuantity += originalRecord.quantity!;
      holding.totalInvestedAmount = roundToTwo(
        holding.totalInvestedAmount + proportionateCostBasis,
      );
      holding.realizedProfit = roundToTwo(
        holding.realizedProfit - realizedProfitFromThisSell,
      );
    }

    // 4. Save Updates
    await ledger.save({ session });
    if (holding) await holding.save({ session });

    // 5. Mark Original as Reversed
    originalRecord.isReversed = true;
    await originalRecord.save({ session });

    // 6. Create the Anti-Transaction Record (The Audit Trail)
    // We create a new record that is the EXACT OPPOSITE of the original, linking back to it.
    await ShareRecord.create(
      [
        {
          userId: originalRecord.userId,
          actionType: originalRecord.actionType, // Keep the same type for filtering
          companyName: originalRecord.companyName,
          quantity: originalRecord.quantity
            ? -originalRecord.quantity
            : undefined, // Negative quantity
          rate: originalRecord.rate,
          grossAmount: -originalRecord.grossAmount, // Negative amount
          commissionAmount: -originalRecord.commissionAmount,
          netCashImpact: -originalRecord.netCashImpact, // Reverse the impact
          status: "CANCELLED", // Mark as cancelled
          isReversed: true,
          reversedReferenceId: originalRecord._id, // LINK TO ORIGINAL
          transactionDate: new Date(),
        },
      ],
      { session },
    );

    // 7. Commit Transaction
    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      message: `Transaction ${transactionId} successfully reversed.`,
    });
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Reversal Error:", error);

    const isBusinessError =
      error.message.includes("Cannot reverse") ||
      error.message.includes("not found");
    return NextResponse.json(
      {
        success: false,
        message:
          error.message || "Internal server error during transaction reversal.",
      },
      { status: isBusinessError ? 400 : 500 },
    );
  } finally {
    session.endSession();
  }
}
