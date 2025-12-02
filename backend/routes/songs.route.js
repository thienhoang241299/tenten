import express from "express";
import {
  getSongs,
  postSong,
  deleteSongController,
  updateSongController,
} from "../controllers/songs.controller.js";

const router = express.Router();

router.get("/", getSongs);
router.post("/", postSong);
router.post("/current", updateSongController);
router.delete("/:title", deleteSongController);

export default router;
