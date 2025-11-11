import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const SONGS_FILE = "./songs.json";
let currentSong = null;
let nextSong = null;
let songs = JSON.parse(fs.readFileSync(SONGS_FILE, "utf8"));

// 📜 Lấy danh sách bài hát
app.get("/songs", (req, res) => res.json(songs));

// ➕ Thêm bài hát mới
app.post("/songs", (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== "string") {
    return res.status(400).json({ success: false, message: "Invalid title" });
  }

  if (songs.find((s) => s.title === title)) {
    return res.json({ success: true, message: "Song already exists" });
  }

  const newSong = { title };
  songs.push(newSong);
  fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2));
  io.emit("songsUpdate", songs);
  res.json({ success: true });
});

// 🎵 Cập nhật bài đang hát / bài tiếp theo
app.post("/current", (req, res) => {
  const { current, next } = req.body;
  currentSong = current || null;
  nextSong = next || null;

  io.emit("songChange", { current: currentSong, next: nextSong });
  res.json({ success: true, current: currentSong, next: nextSong });
});

// ❌ Xóa bài hát
app.delete("/songs/:title", (req, res) => {
  const title = req.params.title;
  songs = songs.filter((s) => s.title !== title);

  if (currentSong?.title === title) currentSong = null;
  if (nextSong?.title === title) nextSong = null;

  fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2));
  io.emit("songsUpdate", songs);
  io.emit("songChange", { current: currentSong, next: nextSong });

  res.json({ success: true });
});

// 🔧 Hành động đặc biệt (clear, chuyển bài)
app.post("/action", (req, res) => {
  const { type } = req.body;
  if (type === "clearCurrent") currentSong = null;
  if (type === "clearNext") nextSong = null;
  if (type === "nextToCurrent") {
    currentSong = nextSong;
    nextSong = null;
  }

  io.emit("songChange", { current: currentSong, next: nextSong });
  res.json({ success: true, current: currentSong, next: nextSong });
});

// ⚡ Socket realtime
io.on("connection", (socket) => {
  console.log("Client connected");
  socket.emit("songChange", { current: currentSong, next: nextSong });
  socket.emit("songsUpdate", songs);
  socket.on("disconnect", () => console.log("Client disconnected"));
});

const PORT = 3002;
server.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
