const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const patternRoutes = require("./routes/patternRoutes");
const stopRoutes = require("./routes/stopRoutes");
const routeRoutes = require("./routes/routeRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const directionRoutes = require("./routes/directionRoutes"); // ✅ Import directionRoutes


const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for frontend access

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("✅ MongoDB Connected Successfully!");
    startServer();
})
.catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Stop the app if DB connection fails
});


// Start Server Function
const startServer = () => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
};

// Register API routes
app.use("/api/patterns", patternRoutes);
app.use("/api/stops", stopRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/directions", directionRoutes);

