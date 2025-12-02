import {
  loadSongs,
  addSong,
  deleteSong,
  updateSongState,
} from "../services/songs.service.js";

export const getSongs = (req, res) => {
  res.json(loadSongs());
};

export const postSong = (req, res) => {
  const { title } = req.body;
  const result = addSong(title);
  res.json(result);
};

export const deleteSongController = (req, res) => {
  const title = req.params.title;
  const result = deleteSong(title);
  res.json(result);
};

export const updateSongController = (req, res) => {
  const { current, nextList } = req.body;
  const result = updateSongState(current, nextList);
  res.json(result);
};
