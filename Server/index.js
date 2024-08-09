import dotenv from "dotenv";
import express from "express";
import ConnectDb from "./db/Db.js";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json()); // parse incoming req.body
app.use(cookieParser());
dotenv.config();

// port
const PORT = process.env.PORT || 5000;
// app.get("/", (req, res) => {
//   res.send("Home route");
// });
// routes
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  ConnectDb();
  console.log("Server is running on port ", PORT);
});
