import mongoose from "mongoose";

async function connect(){
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined");
    }
    return mongoose.connect(process.env.MONGODB_URI)
}

export default connect