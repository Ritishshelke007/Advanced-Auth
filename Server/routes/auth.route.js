import express from "express";
import {
  signup,
  login,
  logout,
  verifyEmail,
  forgetPassword,
  resetPassword,
  checkAuth,
} from "../controller/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();
// middleware
router.get("/check-auth", verifyToken, checkAuth);
router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);

router.get("/login", login);

router.get("/logout", logout);

export default router;
