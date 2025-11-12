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
let songs = JSON.parse(fs.readFileSync(SONGS_FILE, "utf8"));
let currentSong = null;
let nextSongs = []; // 🔥 đổi từ nextSong -> mảng nextSongs

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

// 🎵 Cập nhật bài đang hát / danh sách bài tiếp theo
app.post("/current", (req, res) => {
  const { current, nextList } = req.body;

  // 🧠 Chỉ cập nhật current nếu client thực sự gửi field đó
  if (req.body.hasOwnProperty("current")) {
    currentSong = current || null;
  }

  if (req.body.hasOwnProperty("nextList")) {
    nextSongs = Array.isArray(nextList) ? nextList : [];
  }

  io.emit("songChange", { current: currentSong, nextList: nextSongs });
  res.json({ success: true, current: currentSong, nextList: nextSongs });
});

// ❌ Xóa bài hát
app.delete("/songs/:title", (req, res) => {
  const title = req.params.title;
  songs = songs.filter((s) => s.title !== title);

  if (currentSong?.title === title) currentSong = null;
  nextSongs = nextSongs.filter((s) => s.title !== title);

  fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2));
  io.emit("songsUpdate", songs);
  io.emit("songChange", { current: currentSong, nextList: nextSongs });

  res.json({ success: true });
});

// 🔧 Hành động đặc biệt
app.post("/action", (req, res) => {
  const { type, title } = req.body;

  if (type === "clearCurrent") currentSong = null;
  if (type === "clearNext") nextSongs = [];

  // Nếu truyền "nextToCurrent" mà có title => phát bài cụ thể
  if (type === "nextToCurrent") {
    if (title) {
      const found = nextSongs.find((s) => s.title === title);
      if (found) {
        currentSong = found;
        nextSongs = nextSongs.filter((s) => s.title !== title);
      }
    } else if (nextSongs.length > 0) {
      // Mặc định vẫn lấy bài đầu nếu không truyền title
      currentSong = nextSongs.shift();
    }
  }

  io.emit("songChange", { current: currentSong, nextList: nextSongs });
  res.json({ success: true, current: currentSong, nextList: nextSongs });
});

// ❌ Xóa 1 bài khỏi list chờ
app.delete("/next/:title", (req, res) => {
  const title = req.params.title;
  nextSongs = nextSongs.filter((s) => s.title !== title);
  io.emit("songChange", { current: currentSong, nextList: nextSongs });
  res.json({ success: true, nextList: nextSongs });
});
// ⚡ Socket realtime
io.on("connection", (socket) => {
  console.log("Client connected");
  socket.emit("songChange", { current: currentSong, nextList: nextSongs });
  socket.emit("songsUpdate", songs);
  socket.on("disconnect", () => console.log("Client disconnected"));
});

const PORT = 3002;
server.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
