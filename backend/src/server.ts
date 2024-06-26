import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT, () => {
      console.log("Listening on port " + process.env.PORT);
    });
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB.");
    console.log(err);
  });
