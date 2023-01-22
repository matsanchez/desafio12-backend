import mongoose from "mongoose";

mongoose.set("strictQuery", false);

export const connection = mongoose.connect("mongodb://localhost:27017/users", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
