const express = require("express");
const axios = require("axios");
const Direction = require("../models/Direction");

const router = express.Router();
const CTA_API_KEY = process.env.CTA_API_KEY || "mMyphiiTdRckeGxemRLzJUFCZ";

// ✅ Fetch and Store Directions in MongoDB
router.get("/fetch", async (req, res) => {
    try {
        const routesResponse = await axios.get(`https://ctabustracker.com/bustime/api/v3/getroutes?key=${CTA_API_KEY}&format=json`);
        const routes = routesResponse.data["bustime-response"].routes;

        let allDirections = [];

        for (const route of routes) {
            const routeId = route.rt;
            const response = await axios.get(`https://ctabustracker.com/bustime/api/v3/getdirections?key=${CTA_API_KEY}&rt=${routeId}&format=json`);
            const directions = response.data["bustime-response"].directions;

            if (!directions) continue;

            const directionData = directions.map(dir => ({
                routeId: routeId,
                direction: {
                    id: dir.id,
                    name: dir.name
                }
            }));

            allDirections = allDirections.concat(directionData);
        }

        await Direction.insertMany(allDirections, { ordered: false }).catch(err => console.error("⚠ MongoDB Insert Error:", err));
        res.json({ message: "Directions stored successfully!", data: allDirections });

    } catch (error) {
        res.status(500).json({ error: "Error fetching directions" });
    }
});

// ✅ Get All Directions
router.get("/", async (req, res) => {
    try {
        const directions = await Direction.find();
        res.json(directions);
    } catch (error) {
        res.status(500).json({ error: "Error fetching stored directions" });
    }
});

// ✅ Get Direction by ID
router.get("/:id", async (req, res) => {
    try {
        const direction = await Direction.findById(req.params.id);
        if (!direction) return res.status(404).json({ message: "Direction not found" });
        res.json(direction);
    } catch (error) {
        res.status(500).json({ error: "Error fetching direction" });
    }
});

// ✅ Create a New Direction
router.post("/", async (req, res) => {
    try {
        const { routeId, direction } = req.body;
        const newDirection = new Direction({ routeId, direction });
        await newDirection.save();
        res.status(201).json({ message: "Direction created successfully", data: newDirection });
    } catch (error) {
        res.status(500).json({ error: "Error creating direction" });
    }
});

// ✅ Update a Direction
router.put("/:id", async (req, res) => {
    try {
        const updatedDirection = await Direction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedDirection) return res.status(404).json({ message: "Direction not found" });
        res.json({ message: "Direction updated successfully", data: updatedDirection });
    } catch (error) {
        res.status(500).json({ error: "Error updating direction" });
    }
});

// ✅ Delete a Direction
router.delete("/:id", async (req, res) => {
    try {
        const deletedDirection = await Direction.findByIdAndDelete(req.params.id);
        if (!deletedDirection) return res.status(404).json({ message: "Direction not found" });
        res.json({ message: "Direction deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting direction" });
    }
});

module.exports = router;
