import mongoose from "mongoose";

export const connection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connection success");
    } catch (error) {
        console.log(error);
        throw new Error("The connection has been refused..");
    }
};
