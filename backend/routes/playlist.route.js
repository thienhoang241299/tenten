import express from "express";
import {
  loadSongs,
  addSong,
  deleteSong,
} from "../services/playlist.service.js";

const router = express.Router();

// Lấy danh sách
router.get("/:list", (req, res) => {
  const { list } = req.params;
  try {
    const songs = loadSongs(list);
    res.json(songs);
  } catch (e) {
    res.status(400).json({ error: "Invalid playlist" });
  }
});

// Thêm bài
router.post("/:list", (req, res) => {
  const { list } = req.params;
  const { title } = req.body;
  const result = addSong(list, title);
  res.json(result);
});

// Xóa bài
router.delete("/:list/:title", (req, res) => {
  const { list, title } = req.params;
  const result = deleteSong(list, title);
  res.json(result);
});

export default router;
