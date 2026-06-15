import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: Request) {
  await dbConnect();

  // 1. Authenticate Request
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { oldPassword, newPassword, confirmNewPassword } =
      await request.json();

    // 2. Structural Integrity & Validation Checks
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return Response.json(
        { success: false, message: "All password fields are required" },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return Response.json(
        {
          success: false,
          message: "New password must be at least 6 characters",
        },
        { status: 400 },
      );
    }

    if (newPassword !== confirmNewPassword) {
      return Response.json(
        { success: false, message: "New passwords do not match" },
        { status: 400 },
      );
    }

    if (oldPassword === newPassword) {
      return Response.json(
        {
          success: false,
          message: "New password cannot be the same as your current password",
        },
        { status: 400 },
      );
    }

    // 3. Find User
    const user = await UserModel.findById(session.user._id);
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // 4. Verify Old Password Matrix
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return Response.json(
        { success: false, message: "Incorrect current password" },
        { status: 400 },
      );
    }

    // 5. Secure Cryptographic Hashing & Save
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return Response.json(
      { success: true, message: "Password updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Password update error:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
