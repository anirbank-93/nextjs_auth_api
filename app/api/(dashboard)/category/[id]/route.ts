import connect from "@/lib/db";
import userModel from "@/lib/models/users.model";
import { NextResponse } from "next/server";
import categoryModel from "@/lib/models/category.model";
import { Types } from "mongoose";

export const PATCH = async (
  request: Request,
  route: { params: { id: Types.ObjectId } }
) => {
  try {
    const { id } = await route.params;
    const { user_id, ...restOfBody } = await request.json();

    if (!id || !restOfBody || Object.keys({ ...restOfBody }).length === 0) {
      return new NextResponse(
        JSON.stringify({ message: "ID or data not found" }),
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(id)) {
      return new NextResponse(JSON.stringify({ message: "Invalid ID." }), {
        status: 400,
      });
    }

    await connect();

    const user = await userModel.findById(user_id);

    if (!user) {
      return new NextResponse(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    const updatedCategory = await categoryModel.findOneAndUpdate(
      { _id: id },
      { user_id, ...restOfBody },
      {
        new: true,
      }
    );

    if (!updatedCategory) {
      return new NextResponse(
        JSON.stringify({ message: "Category not found." }),
        {
          status: 404,
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: "User updated", data: updatedCategory }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse(
      "Error updating the category due to " + error.message,
      { status: 500 }
    );
  }
};
