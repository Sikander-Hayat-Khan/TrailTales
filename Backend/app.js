import express from "express";
import userRouter from "./routes/userRouter.js";
import friendRouter from "./routes/friendRouter.js";
import messageRouter from "./routes/messageRouter.js";
import cookieParser from "cookie-parser";
import connect from "./db/connect.js";
import cors from "cors";
import "dotenv/config"

const app = express()

// Trust proxy for secure cookies behind load balancer (Render)
app.set('trust proxy', 1);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow any localhost origin
        if (origin.match(/^http:\/\/localhost:\d+$/)) {
            return callback(null, true);
        }
        
        // Allow Vercel deployments
        if (origin === "https://trail-tales-chi.vercel.app" || origin.match(/\.vercel\.app$/)) {
            return callback(null, true);
        }
        
        // Default to blocking
        // callback(new Error('Not allowed by CORS'));
        // For debugging, let's log blocked origins but maybe allow them temporarily if needed?
        // Better to just block if not matched.
        console.log("Blocked by CORS:", origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests explicitly
// In Express 5, use a RegExp to match all routes for OPTIONS
app.options(/.*/, cors());

app.use(express.json())
app.use(cookieParser())
app.use("/uploads", express.static("uploads"));

app.use("/api",userRouter)
app.use("/api/friends", friendRouter);
app.use("/api/messages", messageRouter);

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