import dbConnect from "@/lib/dbConnect"
import UserModel from "@/models/user.model"
import { Message } from "@/models/user.model"

export async function POST(request: Request) {
    dbConnect();

    const { username, content } = await request.json();
    try {
        const user = await UserModel.findOne({ username });
        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 })
        }

        // is user accepting messages
        if (!user.isAcceptingMessage) {
            return Response.json({
                success: false,
                message: "User not accepting messages"
            }, { status: 403 });
        }

        const newMessage = {
            content, createdAt: new Date()
        }

        user.messages.push(newMessage as Message);

        await user.save();

        return Response.json({
            success: true,
            message: "Message sent successfully"
        }, { status: 200 })

    } catch (err) {
        console.log("An unexpected error", err);
        return Response.json({
            success: false,
            message: "An unexpected error"
        }, { status: 500 })
    }
}