const axios = require("axios");
const Vehicle = require("../models/Vehicle");

const fetchVehicles = async (req, res) => {
  try {
    const response = await axios.get(
      `https://ctabustracker.com/bustime/api/v2/getvehicles?key=${process.env.API_KEY}&rt=20&format=json`
    );
    
    const vehicles = response.data["bustime-response"].vehicle;
    
    await Vehicle.insertMany(vehicles);
    res.status(200).json({ message: "Vehicle data saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { fetchVehicles };
