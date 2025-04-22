const express = require("express");
const axios = require("axios");
const Pattern = require("../models/Pattern");
const router = express.Router();

const CTA_API_KEY = process.env.CTA_API_KEY || "mMyphiiTdRckeGxemRLzJUFCZ";

// ✅ Fetch and Store Patterns for ALL Routes
router.get("/fetch", async (req, res) => {
    try {
        console.log("🔹 Fetching all routes...");
        const routesResponse = await axios.get(`https://ctabustracker.com/bustime/api/v3/getroutes?key=${CTA_API_KEY}&format=json`);
        const routes = routesResponse.data["bustime-response"].routes;

        if (!routes || routes.length === 0) {
            return res.status(404).json({ message: "No routes found in CTA API" });
        }

        let allPatterns = [];

        for (const route of routes) {
            const routeId = route.rt;
            console.log(`🔹 Fetching patterns for route: ${routeId}`);

            try {
                const response = await axios.get(`https://ctabustracker.com/bustime/api/v3/getpatterns?key=${CTA_API_KEY}&rt=${routeId}&format=json`);
                const patterns = response.data["bustime-response"].ptr;

                if (!patterns || patterns.length === 0) {
                    console.warn(`⚠ No patterns found for route ${routeId}`);
                    continue; // Skip if no patterns exist
                }

                const patternData = patterns.map(pattern => ({
                    route: routeId,
                    pid: pattern.pid,
                    points: pattern.pt.map(pt => ({ lat: pt.lat, lon: pt.lon }))
                }));

                allPatterns = allPatterns.concat(patternData);
            } catch (patternError) {
                console.warn(`⚠ Error fetching patterns for route ${routeId}: ${patternError.message}`);
            }
        }

        if (allPatterns.length === 0) {
            return res.status(404).json({ message: "No patterns found for any route" });
        }

        console.log("✅ Final Data Before Insert:", JSON.stringify(allPatterns, null, 2));

        await Pattern.insertMany(allPatterns, { ordered: false })
            .then(() => console.log("✅ Patterns inserted successfully into MongoDB"))
            .catch(err => console.error("⚠ MongoDB Insert Error:", err));

        res.json({ message: "Patterns stored successfully!", data: allPatterns });

    } catch (error) {
        console.error("❌ Error fetching patterns:", error.message);
        res.status(500).json({ error: "Error fetching patterns" });
    }
});

// ✅ Get All Patterns
router.get("/", async (req, res) => {
    try {
        const patterns = await Pattern.find();
        res.json(patterns);
    } catch (error) {
        res.status(500).json({ error: "Error fetching stored patterns" });
    }
});

// ✅ Get a Pattern by ID
router.get("/:id", async (req, res) => {
    try {
        const pattern = await Pattern.findById(req.params.id);
        if (!pattern) return res.status(404).json({ message: "Pattern not found" });
        res.json(pattern);
    } catch (error) {
        res.status(500).json({ error: "Error fetching pattern" });
    }
});

// ✅ Update an Existing Pattern
router.put("/:id", async (req, res) => {
    try {
        const updatedPattern = await Pattern.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedPattern) return res.status(404).json({ message: "Pattern not found" });
        res.json({ message: "Pattern updated successfully", data: updatedPattern });
    } catch (error) {
        res.status(500).json({ error: "Error updating pattern" });
    }
});

// ✅ Delete a Pattern
router.delete("/:id", async (req, res) => {
    try {
        const deletedPattern = await Pattern.findByIdAndDelete(req.params.id);
        if (!deletedPattern) return res.status(404).json({ message: "Pattern not found" });
        res.json({ message: "Pattern deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting pattern" });
    }
});

module.exports = router;
