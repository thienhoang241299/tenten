import express from "express";
import {
  loadPlaylist,
  addPlaylistSong,
  deletePlaylistSong,
} from "../services/playlist.service.js";

const router = express.Router();

// Lấy danh sách playlist
router.get("/:list", (req, res) => {
  try {
    const list = req.params.list;
    const data = loadPlaylist(list);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: "Invalid playlist" });
  }
});

// Thêm bài vào playlist
router.post("/:list", (req, res) => {
  const { list } = req.params;
  const { title } = req.body;

  try {
    const result = addPlaylistSong(list, title);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to add song" });
  }
});

// Xóa bài khỏi playlist
router.delete("/:list/:title", (req, res) => {
  const { list, title } = req.params;

  try {
    const result = deletePlaylistSong(list, title);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete song" });
  }
});

export default router;
