import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "../config/db";
import authRoutes from "../routes/auth";
import transactionRoutes from "../routes/TransactionRoute";
dotenv.config();

connectDB();

const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use('/api', transactionRoutes);

app.listen(process.env.PORT, () => console.log(process.env.PORT));
