import connect from "@/lib/db";
import userModel from "@/lib/models/users.model";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    await connect();
    const users = await userModel.find();
    return new NextResponse(JSON.stringify(users), { status: 200 });
  } catch (error: any) {
    return new NextResponse("Failed to get users due to " + error.message, {
      status: 500,
    });
  }
};
