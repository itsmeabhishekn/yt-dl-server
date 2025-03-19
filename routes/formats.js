const express = require("express");
const { execCommand } = require("../utils/execCommand");

const router = express.Router();

router.post("/", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  const command = `yt-dlp -F "${url}"`;
  try {
    const stdout = await execCommand(command);
    const formats = stdout
      .split("\n")
      .slice(4)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(/\s+/);
        return { id: parts[0], details: parts.slice(1).join(" ") };
      });

    res.json({ formats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
