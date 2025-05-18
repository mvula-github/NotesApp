const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  createdOn: { type: Date, default: () => new Date().getTime() },
});

module.exports = mongoose.model("User", userSchema);
