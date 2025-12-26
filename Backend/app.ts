import express from "express";
import userRouter from "./routes/userRouter.js";
import friendRouter from "./routes/friendRouter.js";
import messageRouter from "./routes/messageRouter.js";
import notificationRouter from "./routes/notificationRouter.js";
import cookieParser from "cookie-parser";
import connect from "./db/connect.js";
import cors from "cors";
import "dotenv/config";

const app = express();

/*
  Trust the first proxy (important for platforms like Render / Vercel)
  This allows secure cookies (https) to work correctly behind a load balancer
*/
app.set("trust proxy", 1);

/*
  CORS Configuration:
  - Allows requests from:
    • Localhost (any port)
    • Vercel deployments (*.vercel.app)
  - Enables cookies & authentication headers
*/
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g., mobile apps, Postman, curl)
      if (!origin) return callback(null, true);

      // Allow any localhost origin
      if (origin.match(/^http:\/\/localhost:\d+$/)) {
        return callback(null, true);
      }

      // Allow Vercel frontend deployments
      if (
        origin === "https://trail-tales-chi.vercel.app" ||
        origin.match(/\.vercel\.app$/)
      ) {
        return callback(null, true);
      }

      // Block all other origins
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // Allow cookies and auth headers
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/*
  Handle CORS preflight (OPTIONS) requests for all routes
  Required for browsers before sending credentialed requests
*/
app.options(/.*/, cors());

/*
  Global Middlewares
*/
app.use(express.json());        // Parse incoming JSON requests
app.use(cookieParser());        // Parse cookies from requests
app.use("/uploads", express.static("uploads")); // Serve uploaded files

/*
  API Routes
*/
app.use("/api", userRouter);
app.use("/api/friends", friendRouter);
app.use("/api/messages", messageRouter);
app.use("/api/notifications", notificationRouter);

/*
  Server Startup Function
  - Connects to MongoDB
  - Starts the Express server
*/
async function start() {
  try {
    console.log("Attempting to connect to MongoDB...");
    await connect();
    console.log("Connected to MongoDB successfully");

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log("ERROR STARTING SERVER:");
    console.log(error);
  }
}

// Initialize server
start();
