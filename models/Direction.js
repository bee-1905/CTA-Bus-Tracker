const mongoose = require("mongoose");

const directionSchema = new mongoose.Schema({
  routeId: { type: String, required: true },
  direction: {
    id: { type: String, required: true },
    name: { type: String, required: true }
  }
});

module.exports = mongoose.model("Direction", directionSchema);
