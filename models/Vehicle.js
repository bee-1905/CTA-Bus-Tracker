const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  vid: { type: String, required: true, index: true }, // Vehicle ID
  lat: { 
    type: Number, 
    required: true, 
    min: -90, 
    max: 90 
  }, // Latitude validation
  lon: { 
    type: Number, 
    required: true, 
    min: -180, 
    max: 180 
  }, // Longitude validation
  route: { type: String, required: true, index: true }, // Route ID
  timestamp: { type: Date, required: true, default: Date.now }, // Store as Date
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
