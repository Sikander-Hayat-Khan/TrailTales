import express from "express";
import userRouter from "./routes/userRouter.js";
import friendRouter from "./routes/friendRouter.js";
import cookieParser from "cookie-parser";
import connect from "./db/connect.js";
import cors from "cors";
import "dotenv/config"

const app = express()

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));

app.use(express.json())
app.use(cookieParser())
app.use("/uploads", express.static("uploads"));

app.use("/api",userRouter)
app.use("/api/friends", friendRouter);

async function start(){
    try {
        console.log("Attempting to connect to MongoDB...");
        await connect()
        console.log("Connected to MongoDB successfully");
        const port = process.env.PORT || 5000
        app.listen(port,()=>{
            console.log(`Server is listening on port ${port}...`)
        })
    } catch (error) {
        console.log("ERROR STARTING SERVER:");
        console.log(error)
    }
}

start()