import mongoose from "mongoose";

const DB_URI = process.env.MONGODB_URI;

const connect = async () => {
    const connectionState = mongoose.connection.readyState;

    if (connectionState === 1) {
        console.log("Already connected");
        return;
    }

    if (connectionState === 2) {
        console.log("Connecting...");
        return;
    }

    try {
        mongoose.connect(DB_URI!, {
            dbName: `${process.env.DB_NAME}`,
            bufferCommands: true
        });
        console.log("Database connected");
    } catch (error:any) {
        console.log("DB connect error:", error);
        throw new Error("DB connect error:", error);
    }
}

export default connect