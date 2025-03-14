import express from "express";
import { register, login, refreshToken, logout } from "../controller/authController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

export default router;
