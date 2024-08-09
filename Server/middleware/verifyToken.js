import jwt from "jsonwebtoken";
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(400).json({ message: "Unautharized - no token" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(400).json({ message: "Unautharized" });
    }
    req.userId = decoded.userId;
    next();
  } catch (error) {
    throw new Error("Server error", error);
  }
};
