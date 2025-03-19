const express = require("express");
const cors = require("cors");
const path = require("path");

const searchRoutes = require("./routes/search");
const formatRoutes = require("./routes/formats");
const downloadRoutes = require("./routes/download");

const app = express();
const PORT = 8000;
const DOWNLOADS_DIR = path.join(__dirname, "downloads");

app.use(cors());
app.use(express.json());
app.use(express.static(DOWNLOADS_DIR));

// Debugging Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root endpoint to check if the server is working
app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

// Register Routes (Fixed: Added `/` in route paths)
app.use("/api/search", searchRoutes);
app.use("/api/formats", formatRoutes);
app.use("/api/download", downloadRoutes);

// 404 Handler for unknown routes
app.use((req, res) => {
  console.error(`❌ 404 - Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
