import mongoose from "mongoose";

const ConnectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected: ", conn.connection.host);
  } catch (error) {
    console.log("Error in connection", error.message);
    process.exit(1);
  }
};
export default ConnectDb;
