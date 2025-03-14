import { Request, Response, NextFunction } from "express"; // Add NextFunction
import bcrypt from "bcryptjs";
import User from "../models/UserModel";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "strict" });

    res.json({ accessToken });
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET as string) as { userId: string };
    const accessToken = generateAccessToken(decoded.userId);
    res.json({ accessToken });
  } catch {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
};
