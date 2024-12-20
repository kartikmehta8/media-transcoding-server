const express = require("express");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const NodeMediaServer = require("node-media-server");
const cors = require("cors");

const app = express();
const PORT = 4000;
const VIDEOS_DIR = path.join(__dirname, "videos");
const STREAM_DIR = path.join(__dirname, "streams");

app.use(cors());
app.use(express.json());

if (!fs.existsSync(STREAM_DIR)) {
  fs.mkdirSync(STREAM_DIR);
}

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8000,
    mediaroot: STREAM_DIR,
    allow_origin: "*",
  },
};

const nms = new NodeMediaServer(config);
nms.run();

app.post("/upload", express.json(), (req, res) => {
  const { videoPath } = req.body;
  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: "Video not found" });
  }

  const videoName = path.basename(videoPath);
  const destPath = path.join(VIDEOS_DIR, videoName);

  fs.copyFile(videoPath, destPath, (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to upload video" });
    }
    res.json({ message: "Video uploaded successfully" });
  });
});

app.post("/transcode", (req, res) => {
  const { videoName } = req.body;
  const inputPath = path.join(VIDEOS_DIR, videoName);
  const outputDir = path.join(STREAM_DIR, videoName.replace(/\.[^/.]+$/, ""));

  if (!fs.existsSync(inputPath)) {
    return res.status(404).json({ error: "Video not found" });
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  ffmpeg(inputPath)
    .output(`${outputDir}/360p.mp4`)
    .size("640x360")
    .output(`${outputDir}/480p.mp4`)
    .size("854x480")
    .output(`${outputDir}/720p.mp4`)
    .size("1280x720")
    .on("end", () => res.json({ message: "Transcoding complete" }))
    .on("error", (err) => res.status(500).json({ error: err.message }))
    .run();
});

app.get("/stream/:videoName/:resolution", (req, res) => {
  const { videoName, resolution } = req.params;
  const videoPath = path.join(STREAM_DIR, videoName, `${resolution}.mp4`);

  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: "Stream not found" });
  }

  res.setHeader("Content-Type", "video/mp4");
  fs.createReadStream(videoPath).pipe(res);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
