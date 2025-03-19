const express = require("express");
const ytsr = require("ytsr");

const router = express.Router();

router.post("/", async (req, res) => {
  const query = req.body.q; // ✅ FIXED: Read from req.body instead of req.query
  if (!query) {
    console.log("❌ Missing search query in request body!", req.body);
    return res.status(400).json({ error: "Missing search query" });
  }

  try {
    console.log(`🔍 Searching for: ${query}`);
    const filters = await ytsr.getFilters(query);
    const filter = filters.get("Type").get("Video");
    const searchResults = await ytsr(filter.url, { limit: 5 });

    const results = searchResults.items.map((video) => ({
      id: video.id,
      title: video.title,
      url: video.url,
      thumbnail: video.thumbnails?.[0]?.url || "",
    }));

    console.log(`✅ Found ${results.length} results`);
    res.json(results);
  } catch (error) {
    console.error("❌ Search failed:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;
