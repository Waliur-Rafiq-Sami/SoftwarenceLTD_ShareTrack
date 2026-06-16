// import dbConnect from "@/lib/dbConnect";
// import UserModel from "@/model/User";

// export async function POST(request: Request) {
//   // Connect to the database
//   await dbConnect();

//   try {
//     const { username, code } = await request.json();
//     const decodedUsername = decodeURIComponent(username);
//     const user = await UserModel.findOne({ username: decodedUsername });

//     if (!user) {
//       return Response.json({ success: false, message: "User not found" }, { status: 404 });
//     }

//     // Check if the code is correct and not expired
//     const isCodeValid = user.verifyCode === code;
//     const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

//     if (isCodeValid && isCodeNotExpired) {
//       // Update the user's verification status
//       user.isVerified = true;
//       await user.save();

//       return Response.json({ success: true, message: "Account verified successfully" }, { status: 200 });
//     } else if (!isCodeNotExpired) {
//       // Code has expired
//       return Response.json(
//         {
//           success: false,
//           message: "Verification code has expired. Please sign up again to get a new code.",
//         },
//         { status: 400 },
//       );
//     } else {
//       // Code is incorrect
//       return Response.json({ success: false, message: "Incorrect verification code" }, { status: 400 });
//     }
//   } catch (error) {
//     console.error("Error verifying user:", error);
//     return Response.json({ success: false, message: "Error verifying user" }, { status: 500 });
//   }
// }
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { username, email, code } = body;
    const decodedUsername = decodeURIComponent(username);

    // Find user by unique username and matching email address
    const user = await UserModel.findOne({
      username: decodedUsername,
      email: email,
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found with matching data parameters.",
        },
        { status: 404 },
      );
    }

    // Validate code metrics against current execution interval
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        { success: true, message: "Account verified successfully" },
        { status: 200 },
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message:
            "Verification code has expired. Please sign up again to get a new code.",
        },
        { status: 400 },
      );
    } else {
      return Response.json(
        { success: false, message: "Incorrect verification code" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    return Response.json(
      { success: false, message: "Error verifying user" },
      { status: 500 },
    );
  }
}
