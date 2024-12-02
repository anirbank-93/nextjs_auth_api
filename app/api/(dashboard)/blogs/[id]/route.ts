import connect from "@/lib/db";
import { NextResponse } from "next/server";
import categoryModel from "@/lib/models/category.model";
import { Types } from "mongoose";
import blogModel from "@/lib/models/blog.model";

export const PATCH = async (
  request: Request,
  // route: { params: { id: Types.ObjectId } }
  route: { params: any }
) => {
  try {
    const { id } = await route.params;
    const { category_id, ...restOfBody } = await request.json();

    if (!id || Object.keys({ category_id, ...restOfBody }).length === 0) {
      return new NextResponse(
        JSON.stringify({ message: "Blog id or data not found" }),
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(id)) {
      return new NextResponse(JSON.stringify({ message: "Invalid blog id." }), {
        status: 400,
      });
    }
    if (category_id) {
      if (category_id.length === 0) {
        return new NextResponse("Atleast one category is required.", {
          status: 400,
        });
      }

      for (let i: number = 0; i < category_id.length; i++) {
        if (!Types.ObjectId.isValid(category_id[i])) {
          return new NextResponse(
            `Category with id ${category_id[i]} is invalid`,
            {
              status: 400,
            }
          );
        }
      }
    }

    await connect();

    const updatedBlog = await blogModel.findOneAndUpdate(
      { _id: id },
      {
        category: category_id.map((item: string) => new Types.ObjectId(item)),
        ...restOfBody,
      },
      {
        new: true,
      }
    );

    if (!updatedBlog) {
      return new NextResponse(JSON.stringify({ message: "Blog not found." }), {
        status: 404,
      });
    }

    return new NextResponse(
      JSON.stringify({ message: "Blog updated", data: updatedBlog }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse("Error updating the blog due to " + error.message, {
      status: 500,
    });
  }
};

export const DELETE = async (
  request: Request,
  // route: { params: Types.ObjectId }
  route: { params: any }
) => {
  try {
    const { id } = await route.params;

    if (!id) {
      return new NextResponse(
        JSON.stringify({ message: "Blog id not found" }),
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(id)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid blog id." }),
        {
          status: 400,
        }
      );
    }

    await connect();

    const blog = await blogModel.findOneAndDelete({ _id: id });

    if (!blog) {
      return new NextResponse(
        JSON.stringify({ message: "Blog not found." }),
        {
          status: 404,
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: "Blog deleted.", data: blog }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse(
      "Error deleting the blog due to " + error.message,
      { status: 500 }
    );
  }
};
