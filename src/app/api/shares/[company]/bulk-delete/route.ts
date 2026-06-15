import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Types } from "mongoose";
import { z } from "zod";

import dbConnect from "@/lib/dbConnect";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

import { ShareRecord } from "@/model/shareRecord";

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, "No trade IDs provided"),
});

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: {
      company: string;
    };
  },
) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session?.user?._id) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized access",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const body = await request.json();

    const { ids } = bulkDeleteSchema.parse(body);

    const objectIds = ids.map((id) => new Types.ObjectId(id));

    const result = await ShareRecord.updateOne(
      {
        userId: session.user._id,
        "companies.companyName": params.company,
      },
      {
        $pull: {
          "companies.$.trades": {
            _id: {
              $in: objectIds,
            },
          },
        },
      },
    );

    if (!result.modifiedCount) {
      return NextResponse.json(
        {
          success: false,
          message: "No matching trades found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        deletedCount: ids.length,
        message: "Trades deleted successfully",
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
          message: "Validation failed",
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
