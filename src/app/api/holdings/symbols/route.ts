// app/api/holdings/symbols/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/dbConnect";
import { CompanyHolding } from "@/model/CompanyHolding";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET() {
  try {
    await dbConnect();

    // ১. Authentication Check
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // ২. Efficient Fetching (Only unique company names for this specific user)
    // .distinct() ডাটাবেস লেভেলেই ইউনিক নামগুলো ফিল্টার করে দেয়
    const symbols = await CompanyHolding.distinct("companyName", {
      userId: session.user._id,
      totalQuantity: { $gt: 0 }, // শুধুমাত্র সেই কোম্পানি দেখাবে যেগুলোতে হোল্ডিং আছে
    });

    // ৩. Sorting for better UX (Alphabetical)
    const sortedSymbols = symbols.sort();

    return NextResponse.json({
      success: true,
      data: sortedSymbols,
    });
  } catch (error) {
    console.error("Error fetching symbols:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch company list" },
      { status: 500 },
    );
  }
}
