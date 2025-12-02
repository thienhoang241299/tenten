import fs from "fs";

const SONGS_FILE = "./songs.json";

let songs = JSON.parse(fs.readFileSync(SONGS_FILE, "utf8"));
let currentSong = null;
let nextSongs = [];

export function loadSongs() {
  return songs;
}

export function getCurrentSong() {
  return currentSong;
}

export function getNextSongs() {
  return nextSongs;
}

export function addSong(title) {
  if (!title || typeof title !== "string")
    return { success: false, message: "Invalid title" };

  if (songs.find((s) => s.title === title)) {
    return { success: true, message: "Song already exists" };
  }

  songs.push({ title });
  fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2));
  return { success: true };
}

export function deleteSong(title) {
  songs = songs.filter((s) => s.title !== title);
  nextSongs = nextSongs.filter((s) => s.title !== title);

  if (currentSong?.title === title) currentSong = null;

  fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2));
  return { success: true };
}

export function updateSongState(current, nextList) {
  if (current !== undefined) currentSong = current || null;
  if (nextList !== undefined) nextSongs = nextList || [];

  return { success: true, current: currentSong, nextList: nextSongs };
}
