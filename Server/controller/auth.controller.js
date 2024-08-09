import { User } from "../model/user.model.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetSuccessMail,
} from "../mailtrap/emails.js";

const signup = async (req, res) => {
  const { email, name, password } = req.body;

  try {
    if (!email || !password || !name) {
      // throw new Error("All fields are required!");
      return res.status(400).json({ message: "all fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = new User({
      email,
      name,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await user.save();

    // jwt
    generateTokenAndSetCookie(res, user._id);

    // send verification email to user
    await sendVerificationEmail(email, verificationToken);

    return res.status(201).json({
      message: "User created",
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  // otp
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Verification code is invalid or expired!" });
    }

    // TODO - ALREADY VERIFIED
    // const alreadyVerfied = user.isVerified;
    // if (alreadyVerfied) {
    //   return res.status(400).json({ message: "email already verified" });
    // }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    // send welcome email to user
    sendWelcomeEmail(user.name, user.email);

    //
    return res.status(200).json({
      message: "Email verified successfully",
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exists" });
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your email" });
    }

    generateTokenAndSetCookie(res, user._id);
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      message: "Logged in success",
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  res.clearCookie("authToken");
  res.status(200).json({ message: "Logout success" });
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  // generate url
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiresAt = resetTokenExpiresAt;

  await user.save();

  // send pass reset email
  sendPasswordResetEmail(
    user.email,
    `${process.env.CLIENT_URL}/reset-password/${resetToken}`
  );

  return res
    .status(200)
    .json({ message: "Password reset email sent successfully" });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ messgae: "Invalid or expired reset token" });
    }

    // hash pass
    const hashedPassword = await bcryptjs.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    sendResetSuccessMail(user.email);

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    throw new Error("Error in reset password", error);
  }
};

const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(200).json({ message: "user not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(400).json({ message: "Error in check auth" });
  }
};

export {
  signup,
  login,
  logout,
  verifyEmail,
  forgetPassword,
  resetPassword,
  checkAuth,
};
