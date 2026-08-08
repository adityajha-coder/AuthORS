import express from "express"
import morgan from "morgan";
import authRouter from "./routes/auth.route.js";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

// routing
app.use("/api/auth", authRouter);

export default app;