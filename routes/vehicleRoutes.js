const express = require("express");
const axios = require("axios");
const Vehicle = require("../models/Vehicle");

const router = express.Router();
const CTA_API_KEY = process.env.CTA_API_KEY || "mMyphiiTdRckeGxemRLzJUFCZ";

// ✅ Fetch & Store ALL Vehicles from CTA API
router.get("/fetch", async (req, res) => {
    try {
        console.log("🔹 Fetching all routes...");
        const routesResponse = await axios.get(`https://ctabustracker.com/bustime/api/v3/getroutes?key=${CTA_API_KEY}&format=json`);
        const routes = routesResponse.data["bustime-response"].routes;

        if (!routes || routes.length === 0) {
            return res.status(404).json({ message: "No routes found in CTA API" });
        }

        let allVehicles = [];

        for (const route of routes) {
            const routeId = route.rt;
            console.log(`🔹 Fetching vehicles for route: ${routeId}`);

            try {
                const response = await axios.get(`https://ctabustracker.com/bustime/api/v3/getvehicles?key=${CTA_API_KEY}&rt=${routeId}&format=json`);
                const vehicles = response.data["bustime-response"].vehicle;

                if (!vehicles || vehicles.length === 0) {
                    console.warn(`⚠ No vehicles found for route ${routeId}`);
                    continue; // Skip if no vehicles exist
                }

                const vehicleData = vehicles.map(v => ({
                    vid: v.vid,
                    lat: parseFloat(v.lat),
                    lon: parseFloat(v.lon),
                    route: v.rt,
                    timestamp: parseCTATime(v.tmstmp)
                }));

                allVehicles = allVehicles.concat(vehicleData);
            } catch (vehicleError) {
                console.warn(`⚠ Error fetching vehicles for route ${routeId}: ${vehicleError.message}`);
            }
        }

        if (allVehicles.length === 0) {
            return res.status(404).json({ message: "No vehicle data found for any route" });
        }

        console.log("✅ Final Vehicle Data Before Insert:", JSON.stringify(allVehicles, null, 2));

        await Vehicle.insertMany(allVehicles, { ordered: false })
            .then(() => console.log("✅ Vehicles inserted successfully into MongoDB"))
            .catch(err => console.error("⚠ MongoDB Insert Error:", err));

        res.json({ message: "Vehicle data stored successfully!", data: allVehicles });

    } catch (error) {
        console.error("❌ Error fetching vehicles:", error.message);
        res.status(500).json({ error: "Error fetching vehicle data" });
    }
});

// ✅ Function to Convert CTA API Timestamp to JavaScript Date
function parseCTATime(ctaTime) {
    if (!ctaTime) return new Date(); // If missing, use current date

    const match = ctaTime.match(/^(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2})$/);
    if (!match) {
        console.warn("⚠ Invalid timestamp format:", ctaTime);
        return new Date(); // Fallback to current date
    }

    const [_, year, month, day, hours, minutes] = match.map(Number);
    return new Date(year, month - 1, day, hours, minutes);
}

// ✅ Get All Vehicles
router.get("/", async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ error: "Error fetching stored vehicles" });
    }
});

// ✅ Get a Vehicle by ID
router.get("/:id", async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ error: "Error fetching vehicle" });
    }
});

// ✅ Create a New Vehicle Manually
router.post("/", async (req, res) => {
    try {
        const { vid, lat, lon, route, timestamp } = req.body;
        const newVehicle = new Vehicle({ vid, lat, lon, route, timestamp: parseCTATime(timestamp) });
        await newVehicle.save();
        res.status(201).json({ message: "Vehicle created successfully", data: newVehicle });
    } catch (error) {
        res.status(500).json({ error: "Error creating vehicle", details: error.message });
    }
});

// ✅ Update an Existing Vehicle
router.put("/:id", async (req, res) => {
    try {
        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedVehicle) return res.status(404).json({ message: "Vehicle not found" });
        res.json({ message: "Vehicle updated successfully", data: updatedVehicle });
    } catch (error) {
        res.status(500).json({ error: "Error updating vehicle" });
    }
});

// ✅ Delete a Vehicle
router.delete("/:id", async (req, res) => {
    try {
        const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (!deletedVehicle) return res.status(404).json({ message: "Vehicle not found" });
        res.json({ message: "Vehicle deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting vehicle" });
    }
});

module.exports = router;
