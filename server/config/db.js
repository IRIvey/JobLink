import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/joblink";

    await mongoose.connect(uri); // ← NO OPTIONS NEEDED

    console.log("✅ MongoDB connected:", uri);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
