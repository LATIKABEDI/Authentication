import mongoose from "mongoose";

const connect = async () => {
  try {
    console.log("Attempting to connect to database......");
    await mongoose.connect(process.env.MONGO_URL, {});
    console.log("Connected to the database.......");
  } catch (error) {
    console.log("failed to connect to database......", error.message);
    process.exit(1);
  }
};

export default connect;