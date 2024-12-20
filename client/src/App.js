import React, { useState } from "react";
import axios from "axios";

function App() {
  const [videoPath, setVideoPath] = useState("");
  const [videoName, setVideoName] = useState("");
  const [resolution, setResolution] = useState("360p");
  const [videoSrc, setVideoSrc] = useState("");
  const [message, setMessage] = useState("");

  // Upload Video Function.
  const uploadVideo = async () => {
    if (!videoPath) {
      setMessage("Please provide the video path.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:4000/upload", {
        videoPath,
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Error uploading video: " + error.response?.data?.error || error.message);
    }
  };

  // Transcode Video Function.
  const transcodeVideo = async () => {
    if (!videoName) {
      setMessage("Please provide the video name.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:4000/transcode", {
        videoName,
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Error transcoding video: " + error.response?.data?.error || error.message);
    }
  };

  // Fetch Video Stream Function.
  const fetchStream = async () => {
    if (!videoName) {
      setMessage("Please provide the video name.");
      return;
    }

    try {
      const url = `http://localhost:4000/stream/${videoName}/${resolution}`;
      setVideoSrc(url);
      setMessage("Streaming video...");
    } catch (error) {
      setMessage("Error fetching stream: " + error.response?.data?.error || error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">Video Streaming Platform</h1>
      <div className="flex flex-col items-center space-y-4 w-full max-w-md">
        {/* Upload Video Section */}
        <input
          type="text"
          placeholder="Enter video path"
          value={videoPath}
          onChange={(e) => setVideoPath(e.target.value)}
          className="p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={uploadVideo}
          className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600"
        >
          Upload Video
        </button>

        {/* Transcode Video Section */}
        <input
          type="text"
          placeholder="Enter video name"
          value={videoName}
          onChange={(e) => setVideoName(e.target.value)}
          className="p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={transcodeVideo}
          className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600"
        >
          Transcode Video
        </button>

        {/* Fetch Stream Section */}
        <select
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          className="p-2 border border-gray-300 rounded-md w-full"
        >
          <option value="360p">360p</option>
          <option value="480p">480p</option>
          <option value="720p">720p</option>
        </select>
        <button
          onClick={fetchStream}
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
        >
          Stream Video
        </button>

        {/* Message Display */}
        {message && <p className="text-sm text-gray-700 mt-2">{message}</p>}

        {/* Video Player */}
        {videoSrc && (
          <video
            controls
            src={videoSrc}
            className="mt-6 w-full border border-gray-300 rounded-md shadow-lg"
          />
        )}
      </div>
    </div>
  );
}

export default App;
