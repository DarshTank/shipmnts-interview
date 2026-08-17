const mongoose = require("mongoose");
const userSchema = new mongoose.userSchema(
  {
    name: { type: String, required: true },
    vessel_number: { type: String, required: true },
    capacity: { type: Number, required: true },
  },
  { timestamps: true },
);

modules.exports = mongoose.model("User", userSchema);
