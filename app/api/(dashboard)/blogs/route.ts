import connect from "@/lib/db";
import userModel from "@/lib/models/users.model";
import { NextResponse } from "next/server";
import categoryModel from "@/lib/models/category.model";
import { Types } from "mongoose";
import blogModel from "@/lib/models/blog.model";

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const categoryId = searchParams.get("category_id");

    if (userId && !Types.ObjectId.isValid(userId)) {
      return new NextResponse("Invalid user id", { status: 400 });
    }

    if (categoryId && !Types.ObjectId.isValid(categoryId)) {
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

    // let filter: BlogFilterQuery;

    // const blogs = await blogModel.find({
    //   user: new Types.ObjectId(userId),
    //   category: new Types.ObjectId(categoryId)
    // });
    const blogs = await blogModel.aggregate([
      userId
        ? {
            $match: {
              user: new Types.ObjectId(userId),
            },
          }
        : { $project: { __v: 0 } },
      {
        $unwind: "$category",
      },
      categoryId
        ? {
            $match: {
              category: new Types.ObjectId(categoryId),
            },
          }
        : { $project: { __v: 0 } },
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
        $unwind: "$category_info",
      },
      {
        $group: {
          _id: {
            _id: "$_id",
            // title: { $first: "$title" },
            // description: { $first: "$description" },
            // user_info: { $first: "$user_info" },
            // createdAt: { $first: "$createdAt" },
            // updatedAt: { $first: "$updatedAt" },
            title: "$title",
            description: "$description",
            user_info: "$user_info",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
          },
          category_info: { $push: "$category_info" },
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
      // return new NextResponse(
      //   JSON.stringify({
      //     message: "Blogs successfully get.",
      //     data: blogs,
      //   }),
      //   { status: 200 }
      // );
      return Response.json({ message: "Get", data: blogs });
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

export const POST = async (request: Request) => {
  try {
    const { user_id, category_id, ...restOfBody } = await request.json();

    if (!user_id || !Types.ObjectId.isValid(user_id)) {
      return new NextResponse("Invalid user id", { status: 400 });
    }
    if (!category_id || category_id.length === 0) {
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

    await connect();

    const user = await userModel.findById(user_id);

    if (!user) {
      return new NextResponse(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    const category = await categoryModel.findById(category_id);

    if (!category) {
      return new NextResponse(
        JSON.stringify({ message: "Category not found" }),
        {
          status: 404,
        }
      );
    }

    const NEW_BLOG = new blogModel({
      user: user_id,
      category: category_id.map((item: string) => new Types.ObjectId(item)),
      ...restOfBody,
    });
    await NEW_BLOG.save();

    return new NextResponse(
      JSON.stringify({ message: "New category created", data: NEW_BLOG }),
      { status: 201 }
    );
  } catch (error: any) {
    return new NextResponse("Failed to add blog due to " + error.message, {
      status: 500,
    });
  }
};
