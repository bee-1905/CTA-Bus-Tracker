const mongoose = require("mongoose");

const patternSchema = new mongoose.Schema({
  route: { type: String, required: true }, // Route ID (linked to Route Schema)
  pid: { type: String, required: true, unique: true }, // Unique Pattern ID
  points: [{ 
    lat: { type: Number, required: true },
    lon: { type: Number, required: true }
  }],
});

module.exports = mongoose.model("Pattern", patternSchema);
