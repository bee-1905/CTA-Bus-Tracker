const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema({
  rt: { type: String, required: true, unique: true, index: true }, // Unique Route ID
  rtnm: { type: String, required: true }, // Route Name
});

module.exports = mongoose.model("Route", routeSchema);
