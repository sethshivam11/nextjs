import dbConnect from "@/lib/dbConnect";
import { z } from "zod";
import UserModel from "@/models/user.model";
import { usernameValidation } from "@/schemas/signUpSchema";
import { verifySchema } from "@/schemas/verifySchema";

const QuerySchema = z.object({
  username: usernameValidation,
  verifyCode: verifySchema,
});

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);

    const queryParam = {
      username: decodedUsername,
      verifyCode: code,
    };

    // validate with zod
    const result = QuerySchema.safeParse(queryParam);
    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 400 }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (!isCodeValid || !isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        {
          success: false,
          message: "User verified successfully",
        },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message:
            "Verification code has expired, please sign up again to get a new code",
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Invalid verification code",
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error("Error checking username", error);
    return Response.json(
      {
        success: false,
        message: "Error sending verification code",
      },
      { status: 500 }
    );
  }
}
