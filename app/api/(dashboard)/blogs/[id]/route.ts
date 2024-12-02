import connect from "@/lib/db";
import userModel from "@/lib/models/users.model";
import { NextResponse } from "next/server";
import categoryModel from "@/lib/models/category.model";
import { Types } from "mongoose";
import blogModel from "@/lib/models/blog.model";