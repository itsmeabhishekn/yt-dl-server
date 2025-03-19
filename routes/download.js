const express = require("express");
const path = require("path");
const fs = require("fs");
const { execCommand } = require("../utils/execCommand");

const router = express.Router();
const DOWNLOADS_DIR = path.join(__dirname, "../downloads");

router.get("/", async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing video ID" });

  const url = `https://www.youtube.com/watch?v=${id}`;
  console.log(`📥 FLAC Download requested: ${url}`);

  try {
    // Download the audio file
    const downloadCommand = `yt-dlp -f bestaudio --extract-audio --audio-format flac -o "${DOWNLOADS_DIR}/%(title)s.%(ext)s" "${url}"`;
    await execCommand(downloadCommand);
    console.log("✅ yt-dlp download completed");

    // Wait a bit to ensure the file is written
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Find the most recent .flac file in the downloads directory
    const files = fs.readdirSync(DOWNLOADS_DIR);
    const flacFiles = files.filter((file) => file.endsWith(".flac"));

    if (flacFiles.length === 0) {
      throw new Error("No FLAC file found after download.");
    }

    // Find the latest modified .flac file
    const filePath = path.join(
      DOWNLOADS_DIR,
      flacFiles.sort((a, b) => {
        return (
          fs.statSync(path.join(DOWNLOADS_DIR, b)).mtimeMs -
          fs.statSync(path.join(DOWNLOADS_DIR, a)).mtimeMs
        );
      })[0]
    );

    console.log(`📂 Identified FLAC file: ${filePath}`);

    // Send the file to the client
    res.download(filePath, path.basename(filePath), (err) => {
      if (err) {
        console.error("❌ Error sending file:", err);
        return;
      }

      // Delete file after 1 minute
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) console.error("❌ Error deleting file:", err);
            else console.log(`🗑️ Deleted file: ${filePath}`);
          });
        }
      }, 60000);
    });
  } catch (error) {
    console.error("❌ FLAC Download failed:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
