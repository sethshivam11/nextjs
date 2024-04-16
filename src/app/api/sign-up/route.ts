import dbConnect from "@/lib/dbConnect"
import UserModel from "@/models/user.model"
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail"
import { NextRequest } from "next/server"


export async function POST(request: NextRequest) {
    await dbConnect();

    try {
        const { username, email, password } = await request.json();
        const existingUserVerifiedByUsername = await UserModel.findOne({ username, isVerified: true })

        if (existingUserVerifiedByUsername) {
            return Response.json({
                success: false,
                message: "Username is already taken"
            }, { status: 400 })
        }

        const existingUserVerifiedByEmail = await UserModel.findOne({ email })
        const verifyCode = Math.floor(100_000 + Math.random() * 900_000).toString()
        if (existingUserVerifiedByEmail) {
            if (existingUserVerifiedByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "User already exists with this email"
                }, { status: 400 })
            }
            else {
                const hashedPassword = await bcrypt.hash(password, 10)
                existingUserVerifiedByEmail.password = hashedPassword;
                existingUserVerifiedByEmail.verifyCode = verifyCode;
                existingUserVerifiedByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                await existingUserVerifiedByEmail.save();
            }
        }

        const hashedPassword = bcrypt.hash(password, 10)
        const expiryDate = new Date()
        expiryDate.setHours(expiryDate.getHours() + 1)

        const newUser = new UserModel({
            username,
            email,
            password: hashedPassword,
            verifyCode,
            verifyCodeExpiry: expiryDate,
            isAcceptingMessage: true,
            messages: []
        })
        await newUser.save()

        // send verification email
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )

        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            }, { status: 400 })
        }

        return Response.json({
            success: true,
            message: "User registered successfull, Please verify your email"
        }, { status: 201 })

    } catch (error) {
        console.error("Error registering the user", error)
        return Response.json({
            success: false,
            message: "Error registering the user"
        }, {
            status: 500
        })
    }
}