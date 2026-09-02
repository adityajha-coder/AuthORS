import express from "express";
import morgan from "morgan";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";

const app = express();

// Trust reverse proxy 
app.set("trust proxy", 1);

app.use(helmet());

const allowedOrigins = [
    "http://localhost:3000", // react default
    "http://localhost:5173", // vite default
    "http://localhost:3001", // mine default
    process.env.FRONTEND_URL // production frontend url (from .env file)
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // allow req with no origins (mobile apps, postman)
        if(!origin || allowedOrigins.includes(origin)){
            callback(null, true);
        } else {
            callback(new Error("CORS policy: Not allowed by origin"));
        }
    },
    credentials: true, //required for httpOnly cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// routing
app.use("/api/auth", authRouter);

export default app;