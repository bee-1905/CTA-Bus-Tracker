const express = require("express");
const axios = require("axios");
const Stop = require("../models/Stop");
const Direction = require("../models/Direction");

const router = express.Router();
const CTA_API_KEY = process.env.CTA_API_KEY || "mMyphiiTdRckeGxemRLzJUFCZ";

// ✅ Fetch and Store Stops in MongoDB
router.get("/fetch", async (req, res) => {
    try {
        console.log("🔹 Fetching all routes...");
        const routesResponse = await axios.get(`https://ctabustracker.com/bustime/api/v3/getroutes?key=${CTA_API_KEY}&format=json`);
        const routes = routesResponse.data["bustime-response"].routes;
        if (!routes || routes.length === 0) {
            return res.status(404).json({ message: "No routes found in CTA API" });
        }

        let allStops = [];

        for (const route of routes) {
            const routeId = route.rt;
            console.log(`🔹 Fetching directions for route: ${routeId}`);

            // ✅ Get stored directions from MongoDB instead of calling API again
            const directions = await Direction.find({ routeId });
            console.log(`🔹 Retrieved Directions for route ${routeId}:`, directions);

            if (!directions || directions.length === 0) {
                console.warn(`⚠ No stored directions found for route ${routeId}`);
                continue; // Skip if no directions are found
            }

            for (const dir of directions) {
                console.log(`🔹 Fetching stops for route ${routeId}, direction: ${dir.direction.id}`);

                const stopsResponse = await axios.get(`https://ctabustracker.com/bustime/api/v3/getstops?key=${CTA_API_KEY}&rt=${routeId}&dir=${encodeURIComponent(dir.direction.id)}&format=json`);
                const stops = stopsResponse.data["bustime-response"].stops;
                if (!stops || stops.length === 0) {
                    console.warn(`⚠ No stops found for route ${routeId}, direction: ${dir.direction.id}`);
                    continue;
                }

                const stopData = stops.map(stop => ({
                    stop_id: stop.stpid,
                    stop_name: stop.stpnm,
                    direction: dir.direction.id,
                    route: routeId
                }));

                allStops = allStops.concat(stopData);
            }
        }

        if (allStops.length === 0) {
            return res.status(404).json({ message: "No stops found for any route" });
        }

        console.log("✅ Processed Stops Data Before Insert:", JSON.stringify(allStops, null, 2));

        // ✅ Try inserting and log errors if it fails
        await Stop.insertMany(allStops, { ordered: false })
            .then(() => console.log("✅ Stops inserted successfully into MongoDB"))
            .catch(err => console.error("⚠ MongoDB Insert Error:", err));

        res.json({ message: "Stops stored successfully!", data: allStops });

    } catch (error) {
        console.error("❌ Error fetching stops:", error.message);
        res.status(500).json({ error: "Error fetching stop data" });
    }
});

// ✅ Get All Stops
router.get("/", async (req, res) => {
    try {
        const stops = await Stop.find();
        res.json(stops);
    } catch (error) {
        res.status(500).json({ error: "Error fetching stops" });
    }
});

// ✅ Get Stop by ID
router.get("/:id", async (req, res) => {
    try {
        const stop = await Stop.findById(req.params.id);
        if (!stop) return res.status(404).json({ message: "Stop not found" });
        res.json(stop);
    } catch (error) {
        res.status(500).json({ error: "Error fetching stop" });
    }
});

// ✅ Create a New Stop (Manually Add a Stop)
router.post("/", async (req, res) => {
    try {
        const { stop_id, stop_name, direction, route } = req.body;
        const newStop = new Stop({ stop_id, stop_name, direction, route });
        await newStop.save();
        res.status(201).json({ message: "Stop created successfully", data: newStop });
    } catch (error) {
        res.status(500).json({ error: "Error creating stop", details: error.message });
    }
});

// ✅ Update an Existing Stop
router.put("/:id", async (req, res) => {
    try {
        const updatedStop = await Stop.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedStop) return res.status(404).json({ message: "Stop not found" });
        res.json({ message: "Stop updated successfully", data: updatedStop });
    } catch (error) {
        res.status(500).json({ error: "Error updating stop", details: error.message });
    }
});

// ✅ Delete a Stop
router.delete("/:id", async (req, res) => {
    try {
        const deletedStop = await Stop.findByIdAndDelete(req.params.id);
        if (!deletedStop) return res.status(404).json({ message: "Stop not found" });
        res.json({ message: "Stop deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting stop", details: error.message });
    }
});

module.exports = router;
