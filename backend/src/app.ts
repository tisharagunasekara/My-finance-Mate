import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "../config/db";
import authRoutes from "../routes/auth";
import transactionRoutes from "../routes/TransactionRoute";
import goalRoutes from "../routes/GoalRoute";
import budgetRoutes from "../routes/BudgetRoute"; // Ensure BudgetRoute is imported

dotenv.config();

connectDB();

const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());

// Use routers for specific routes
app.use("/api/auth", authRoutes);
app.use('/api', transactionRoutes);
app.use('/api', goalRoutes);

app.listen(process.env.PORT, () => console.log(process.env.PORT));
