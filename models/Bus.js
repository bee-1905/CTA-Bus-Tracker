const mongoose = require("mongoose");

const BusSchema = new mongoose.Schema({
    vehicleId: String,
    route: String,
    lat: Number,
    lon: Number,
    direction: String,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Bus", BusSchema);
