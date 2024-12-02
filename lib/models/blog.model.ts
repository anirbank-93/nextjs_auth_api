import { Schema, model, models } from "mongoose";

const BLOG_SCHEMA = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    category: {
      type: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    },
  },
  {
    timestamps: true,
  }
);

const blogModel = models.Blog || model("Blog", BLOG_SCHEMA);

export default blogModel;
