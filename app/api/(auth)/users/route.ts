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

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    await connect();
    const NEW_USER = new userModel(body);
    await NEW_USER.save();

    return new NextResponse(
      JSON.stringify({ message: "New user created", data: NEW_USER }),
      { status: 201 }
    );
  } catch (error: any) {
    return new NextResponse("Failed to create user due to " + error.message, {
      status: 500,
    });
  }
};
