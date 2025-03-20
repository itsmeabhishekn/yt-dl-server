const express = require("express");
const path = require("path");
const fs = require("fs").promises; // Using async/await-friendly fs
const { execCommand } = require("../utils/execCommand");

const router = express.Router();
const DOWNLOADS_DIR = path.join(__dirname, "../downloads");

// Optional: Set cookies file for authenticated downloads
const COOKIES_FILE = path.join(__dirname, "../cookies.txt"); // Change if needed
const USE_COOKIES = false; // Set to true if using authentication

router.get("/", async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing video ID" });

  const url = `https://www.youtube.com/watch?v=${id}`;
  console.log(`📥 FLAC Download requested: ${url}`);

  try {
    // Construct yt-dlp command
    const downloadCommand = [
      "yt-dlp",
      "-f bestaudio",
      "--extract-audio",
      "--audio-format flac",
      `-o "${DOWNLOADS_DIR}/%(title)s.%(ext)s"`,
    ];

    // Use cookies if enabled
    if (USE_COOKIES) {
      downloadCommand.push(`--cookies "${COOKIES_FILE}"`);
    }

    await execCommand(downloadCommand.join(" "));
    console.log("✅ yt-dlp download completed");

    // Wait a bit to ensure the file is written
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get the most recent FLAC file
    const files = await fs.readdir(DOWNLOADS_DIR);
    const flacFiles = files.filter((file) => file.endsWith(".flac"));

    if (flacFiles.length === 0) {
      throw new Error("No FLAC file found after download.");
    }

    // Find the most recently modified file
    const fileStats = await Promise.all(
      flacFiles.map(async (file) => ({
        file,
        mtime: (await fs.stat(path.join(DOWNLOADS_DIR, file))).mtimeMs,
      }))
    );
    const latestFile = fileStats.sort((a, b) => b.mtime - a.mtime)[0].file;
    const filePath = path.join(DOWNLOADS_DIR, latestFile);

    console.log(`📂 Identified FLAC file: ${filePath}`);

    // Send the file to the client
    res.download(filePath, latestFile, async (err) => {
      if (err) {
        console.error("❌ Error sending file:", err);
        return res.status(500).json({ error: "Error sending file" });
      }

      // Delete file after 1 minute
      setTimeout(async () => {
        try {
          await fs.unlink(filePath);
          console.log(`🗑️ Deleted file: ${filePath}`);
        } catch (err) {
          console.error("❌ Error deleting file:", err);
        }
      }, 60000);
    });
  } catch (error) {
    console.error("❌ FLAC Download failed:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
