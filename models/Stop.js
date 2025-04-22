const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema({
  stop_id: { type: String, required: true, unique: true, index: true }, // ✅ Prevent duplicate stops
  stop_name: { type: String, required: true }, // Stop Name
  direction: { type: String, required: true }, // ✅ Allow any direction returned by API
  route: { type: String, required: true, index: true } // Associated Route ID
});

module.exports = mongoose.model("Stop", stopSchema);
