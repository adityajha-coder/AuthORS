import express from "express"
import morgan from "morgan";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// routing
app.use("/api/auth", authRouter);

export default app;