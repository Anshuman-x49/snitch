import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "../routes/auth.routes.js";

const app = express();

//middlewares
app.use(express.json());
app.use(cookieParser());

//routes
app.use("/api/auth", authRoutes);

export default app;