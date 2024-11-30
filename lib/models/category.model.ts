import { Schema, model, models } from "mongoose";

const CATEGORY_SCHEMA = new Schema({
    title: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

const categoryModel = models.Category || model("Category", CATEGORY_SCHEMA);

export default categoryModel;