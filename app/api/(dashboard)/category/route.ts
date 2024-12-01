import connect from "@/lib/db";
import userModel from "@/lib/models/users.model";
import { NextResponse } from "next/server";
import categoryModel from "@/lib/models/category.model";
import { Types } from "mongoose";

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse("Invalid user id", { status: 400 });
    }

    await connect();

    const user = await userModel.findById(userId);

    if (!user) {
      return new NextResponse(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    // const categories = await categoryModel.find({
    //   user: new Types.ObjectId(userId),
    // });
    const categories = await categoryModel.aggregate([
        {
            $match: {
                user: new Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user_info"
            }
        },
        {
            $unwind: "$user_info"
        },
        {
            $project: {
                user: 0
            }
        }
    ]);

    if (!categories) {
      return new NextResponse(
        JSON.stringify({ message: "Categories by user does not exist." }),
        { status: 404 }
      );
    } else {
      return new NextResponse(
        JSON.stringify({
          message: "Categories successfully get.",
          data: categories,
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

export const POST = async (request: Request) => {
  try {
    const { user_id, ...restOfBody } = await request.json();

    if (!user_id || !Types.ObjectId.isValid(user_id)) {
      return new NextResponse("Invalid user id", { status: 400 });
    }

    await connect();

    const user = await userModel.findById(user_id);

    if (!user) {
      return new NextResponse(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    const CATEGORY_DATA = new categoryModel({ user: user_id, ...restOfBody });
    await CATEGORY_DATA.save();

    return new NextResponse(
      JSON.stringify({ message: "New category created", data: CATEGORY_DATA }),
      { status: 201 }
    );
  } catch (error: any) {
    return new NextResponse("Error creating category due to " + error.message, {
      status: 500,
    });
  }
};
