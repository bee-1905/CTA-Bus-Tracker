const express = require("express");
const axios = require("axios");
const Bus = require("../models/Bus");

const router = express.Router();
const CTA_API_KEY = process.env.CTA_API_KEY || "mMyphiiTdRckeGxemRLzJUFCZ"; // ✅ Ensure v3 API key is used

// ✅ Fetch System Time (Now using v3 API)
router.get("/gettime", async (req, res) => {
    try {
        const response = await axios.get(`https://ctabustracker.com/bustime/api/v3/gettime?key=${CTA_API_KEY}&format=json`);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching system time:", error);
        res.status(500).json({ error: "Error fetching system time" });
    }
});

router.get("/getvehicles", async (req, res) => {
    try {
        // Allow fetching by route instead of vehicle ID
        const route = req.query.rt || "22"; // Default route if none is provided
        const response = await axios.get(`https://ctabustracker.com/bustime/api/v3/getvehicles?key=${CTA_API_KEY}&rt=${route}&format=json`);
        
        // Check if response contains vehicles
        const vehicles = response.data["bustime-response"].vehicle;
        if (!vehicles || vehicles.length === 0) {
            return res.status(404).json({ message: `No active vehicles found for route ${route}` });
        }

        // Map and store data in MongoDB
        const busData = vehicles.map(v => ({
            vehicleId: v.vid,
            lat: parseFloat(v.lat),
            lon: parseFloat(v.lon),
            route: v.rt,
            direction: v.dir,
            timestamp: new Date()
        }));

        await Bus.insertMany(busData);
        res.json({ message: "Bus data saved successfully!", data: busData });

    } catch (error) {
        console.error("Error fetching vehicle data:", error);
        res.status(500).json({ error: "Error fetching vehicle data" });
    }
});


// ✅ Fetch Stored Bus Data from MongoDB
router.get("/stored-buses", async (req, res) => {
    try {
        const buses = await Bus.find();
        res.json(buses);
    } catch (error) {
        res.status(500).json({ error: "Error fetching stored bus data" });
    }
});

module.exports = router;
