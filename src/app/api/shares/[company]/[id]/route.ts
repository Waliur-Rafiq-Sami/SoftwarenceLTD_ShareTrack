import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { z } from "zod";

import dbConnect from "@/lib/dbConnect";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

import { ShareRecord } from "@/model/shareRecord";
import { tradeInputSchema } from "@/schemas/tradeSchema";

const calculateFinancials = (
  tradeType: string,
  quantity: number,
  rate: number,
  commission: number,
) => {
  const amount = quantity * rate;

  const netAmount =
    tradeType === "BUY" ? -(amount + commission) : amount - commission;

  return {
    amount,
    netAmount,
  };
};

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: {
      company: string;
      id: string;
    };
  },
) {
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
    const body = await request.json();

    const parsed = tradeInputSchema.parse(body);

    const { amount, netAmount } = calculateFinancials(
      parsed.tradeType,
      parsed.quantity,
      parsed.rate,
      parsed.commission,
    );

    const updated = await ShareRecord.findOneAndUpdate(
      {
        userId: session.user._id,
      },
      {
        $set: {
          "companies.$[company].trades.$[trade].instrument": parsed.instrument,

          "companies.$[company].trades.$[trade].tradeType": parsed.tradeType,

          "companies.$[company].trades.$[trade].quantity": parsed.quantity,

          "companies.$[company].trades.$[trade].rate": parsed.rate,

          "companies.$[company].trades.$[trade].commission": parsed.commission,

          "companies.$[company].trades.$[trade].amount": amount,

          "companies.$[company].trades.$[trade].netAmount": netAmount,

          "companies.$[company].trades.$[trade].transactionDate":
            parsed.transactionDate
              ? new Date(parsed.transactionDate)
              : new Date(),
        },
      },
      {
        new: true,

        arrayFilters: [
          {
            "company.companyName": params.company,
          },
          {
            "trade._id": new Types.ObjectId(params.id),
          },
        ],
      },
    );

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          message: "Trade not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Trade updated successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          errors: error.errors,
        },
        {
          status: 400,
        },
      );
    }

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
export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: {
      company: string;
      id: string;
    };
  },
) {
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
    const result = await ShareRecord.updateOne(
      {
        userId: session.user._id,
        "companies.companyName": params.company,
      },
      {
        $pull: {
          "companies.$.trades": {
            _id: new Types.ObjectId(params.id),
          },
        },
      },
    );

    if (!result.modifiedCount) {
      return NextResponse.json(
        {
          success: false,
          message: "Trade not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Trade deleted successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error: any) {
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
