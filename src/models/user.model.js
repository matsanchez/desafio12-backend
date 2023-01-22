import { Schema, model } from "mongoose";

const schema = new Schema({
  name: { type: String, require: true },
  username: { type: String, require: true },
  password: { type: String, require: true },
});

export const userSchema = new model("usuarios", schema);
