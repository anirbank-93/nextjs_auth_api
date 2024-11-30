import { Schema, model, models } from "mongoose";

const USER_SCHEMA = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

const userModel = models.User || model("user", USER_SCHEMA);

export default userModel;