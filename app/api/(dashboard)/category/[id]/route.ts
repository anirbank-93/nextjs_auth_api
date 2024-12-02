import connect from "@/lib/db";
import { NextResponse } from "next/server";
import categoryModel from "@/lib/models/category.model";
import blogModel from "@/lib/models/blog.model";
import { Types } from "mongoose";

export const PATCH = async (
  request: Request,
  route: { params: { id: Types.ObjectId } }
) => {
  try {
    const { id } = await route.params;
    const body = await request.json();

    if (!id || !body || Object.keys(body).length === 0) {
      return new NextResponse(
        JSON.stringify({ message: "Category id or data not found" }),
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(id)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid category id." }),
        {
          status: 400,
        }
      );
    }

    await connect();

    const updatedCategory = await categoryModel.findOneAndUpdate(
      { _id: id },
      body,
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
      JSON.stringify({ message: "Category updated", data: updatedCategory }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse(
      "Error updating the category due to " + error.message,
      { status: 500 }
    );
  }
};

export const DELETE = async (
  request: Request,
  route: { params: Types.ObjectId }
) => {
  try {
    const { id } = await route.params;

    if (!id) {
      return new NextResponse(
        JSON.stringify({ message: "Category id not found" }),
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(id)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid category id." }),
        {
          status: 400,
        }
      );
    }

    await connect();

    /** ---------- Preventing delete of user without deleting the child relations ---------- */
    const blogs = await blogModel.aggregate([
      {
        $unwind: "$category",
      },
      {
        $match: {
          category: new Types.ObjectId(id),
        },
      },
    ]);

    if (blogs.length > 0) {
      return new NextResponse(
        JSON.stringify({
          message:
            "Please delete the related children before deleting the category",
        }),
        { status: 500 }
      );
    }
    /** ---------------------------------------------------------------------------------- */

    const category = await categoryModel.findOneAndDelete({ _id: id });

    if (!category) {
      return new NextResponse(
        JSON.stringify({ message: "Category not found." }),
        {
          status: 404,
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: "User deleted.", data: category }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse(
      "Error deleting the category due to " + error.message,
      { status: 500 }
    );
  }
};
