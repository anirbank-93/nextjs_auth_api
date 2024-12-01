import connect from "@/lib/db";
import userModel from "@/lib/models/users.model";
import categoryModel from "@/lib/models/category.model";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const PATCH = async (
  request: Request,
  route: { params: { id: mongoose.Types.ObjectId } }
) => {
  const { id } = await route.params;

  try {
    const body = await request.json();
    
    if (!id || !body || Object.keys(body).length === 0) {
      return new NextResponse(
        JSON.stringify({ message: "ID or data not found" }),
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse(JSON.stringify({ message: "Invalid ID." }), {
        status: 400,
      });
    }

    await connect();

    const user = await userModel.findOneAndUpdate({ _id: id }, body, {
      new: true,
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ message: "User not found." }), {
        status: 404,
      });
    }

    return new NextResponse(
      JSON.stringify({ message: "User updated", data: user }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse("Failed to update user due to " + error.message, {
      status: 500,
    });
  }
};

export const DELETE = async (
  request: Request,
  route: { params: { id: mongoose.Types.ObjectId } }
) => {
  const { id } = await route.params;

  try {
    if (!id) {
      return new NextResponse(JSON.stringify({ message: "ID not found" }), {
        status: 404,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse(JSON.stringify({ message: "Invalid ID." }), {
        status: 400,
      });
    }

    await connect();

    // Preventing delete of user without deleting the child relations
    const categories = await categoryModel.find({
      user: new mongoose.Types.ObjectId(id),
    });

    if (categories.length > 0) {
      return new NextResponse(
        JSON.stringify({
          message:
            "Please delete the related children before deleting the user",
        }),
        { status: 500 }
      );
    }

    const user = await userModel.findOneAndDelete({ _id: id });

    if (!user) {
      return new NextResponse(JSON.stringify({ message: "User not found." }), {
        status: 404,
      });
    }

    return new NextResponse(
      JSON.stringify({ message: "User deleted.", data: user }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse("Failed to delete user due to " + error.message, {
      status: 500,
    });
  }
};
