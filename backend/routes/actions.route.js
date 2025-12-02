import express from "express";
import {
  getCurrentSong,
  getNextSongs,
  setCurrentSong,
  setNextSongs,
  removeFromNext,
  shiftNextToCurrent,
} from "../services/songs.service.js";

const router = express.Router();

// 🔧 Hành động đặc biệt
router.post("/", (req, res) => {
  const { type, title } = req.body;

  let current = getCurrentSong();
  let nextList = getNextSongs();

  switch (type) {
    case "clearCurrent":
      setCurrentSong(null);
      break;

    case "clearNext":
      setNextSongs([]);
      break;

    case "nextToCurrent":
      if (title) {
        // chọn bài cụ thể từ nextList
        const found = nextList.find((s) => s.title === title);
        if (found) {
          setCurrentSong(found);
          setNextSongs(nextList.filter((s) => s.title !== title));
        }
      } else {
        // lấy bài đầu tiên trong nextList
        shiftNextToCurrent();
      }
      break;

    default:
      return res.status(400).json({ error: "Invalid action type" });
  }

  return res.json({
    success: true,
    current: getCurrentSong(),
    nextList: getNextSongs(),
  });
});

export default router;
