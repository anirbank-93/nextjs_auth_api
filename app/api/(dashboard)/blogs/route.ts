import connect from "@/lib/db";
import userModel from "@/lib/models/users.model";
import { NextResponse } from "next/server";
import categoryModel from "@/lib/models/category.model";
import { Types } from "mongoose";
import blogModel from "@/lib/models/blog.model";

interface BlogFilterQuery {
  user?: Types.ObjectId;
  category?: Types.ObjectId;
}

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const categoryId = searchParams.get("category_id");

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse("Invalid user id", { status: 400 });
    }

    if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
      return new NextResponse("Invalid category id", { status: 400 });
    }

    await connect();

    if (userId) {
      const user = await userModel.findById(userId);

      if (!user) {
        return new NextResponse(JSON.stringify({ message: "User not found" }), {
          status: 404,
        });
      }
    }

    if (categoryId) {
      const category = await categoryModel.findById(categoryId);

      if (!category) {
        return new NextResponse(
          JSON.stringify({ message: "Category not found" }),
          {
            status: 404,
          }
        );
      }
    }

    let filter: BlogFilterQuery = {
      user: new Types.ObjectId(userId),
      category: new Types.ObjectId(categoryId),
    };

    // const blogs = await blogModel.find({
    //   user: new Types.ObjectId(userId),
    //   category: new Types.ObjectId(categoryId)
    // });
    const blogs = await blogModel.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user_info",
        },
      },
      {
        $unwind: "$user_info",
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category_info",
        },
      },
      {
        $project: {
          user: 0,
          category: 0,
        },
      },
    ]);

    if (!blogs) {
      return new NextResponse(
        JSON.stringify({
          message: "Blogs by user for the category does not exist.",
        }),
        { status: 404 }
      );
    } else {
      return new NextResponse(
        JSON.stringify({
          message: "Blogs successfully get.",
          data: blogs,
        }),
        { status: 200 }
      );
    }
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({
        message: "Server error. Please try again",
        error: error,
      }),
      { status: 500 }
    );
  }
};
