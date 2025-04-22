const express = require("express");
const axios = require("axios");
const Route = require("../models/Route");

const router = express.Router();
const CTA_API_KEY = process.env.CTA_API_KEY || "mMyphiiTdRckeGxemRLzJUFCZ";

// ✅ Fetch and Store Routes from CTA API
router.get("/fetch", async (req, res) => {
    try {
        const response = await axios.get(`https://ctabustracker.com/bustime/api/v3/getroutes?key=${CTA_API_KEY}&format=json`);
        console.log("🔹 API Response Data:", JSON.stringify(response.data, null, 2));

        const routes = response.data["bustime-response"].routes;
        if (!routes || routes.length === 0) {
            return res.status(404).json({ message: "No routes found" });
        }

        await Route.insertMany(routes, { ordered: false }).catch(err => console.error("⚠ MongoDB Insert Error:", err));

        res.json({ message: "Routes stored successfully!", data: routes });
    } catch (error) {
        console.error("❌ Error fetching routes:", error.message);
        res.status(500).json({ error: "Error fetching routes" });
    }
});

// ✅ CRUD Operations for Routes
router.get("/", async (req, res) => {
    try {
        const routes = await Route.find();
        res.json(routes);
    } catch (error) {
        res.status(500).json({ error: "Error fetching stored routes" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const route = await Route.findById(req.params.id);
        if (!route) return res.status(404).json({ message: "Route not found" });
        res.json(route);
    } catch (error) {
        res.status(500).json({ error: "Error fetching route" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const updatedRoute = await Route.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedRoute) return res.status(404).json({ message: "Route not found" });
        res.json({ message: "Route updated successfully", data: updatedRoute });
    } catch (error) {
        res.status(500).json({ error: "Error updating route" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const deletedRoute = await Route.findByIdAndDelete(req.params.id);
        if (!deletedRoute) return res.status(404).json({ message: "Route not found" });
        res.json({ message: "Route deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting route" });
    }
});

module.exports = router;
