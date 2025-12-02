import fs from "fs";

const SONGS_FILE = "./songs.json";

let songs = JSON.parse(fs.readFileSync(SONGS_FILE, "utf8"));
let currentSong = null;
let nextSongs = [];

// 🟦 Load toàn bộ bài hát chính
export function loadSongs() {
  return songs;
}

// 🟦 GET current / next
export function getCurrentSong() {
  return currentSong;
}

export function getNextSongs() {
  return nextSongs;
}

// 🟦 SET current / next
export function setCurrentSong(song) {
  currentSong = song;
}

export function setNextSongs(list) {
  nextSongs = list || [];
}

// 🟧 Thêm song vào songs.json
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

// 🟥 Xóa bài khỏi songs + queue
export function deleteSong(title) {
  songs = songs.filter((s) => s.title !== title);
  nextSongs = nextSongs.filter((s) => s.title !== title);

  if (currentSong?.title === title) currentSong = null;

  fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2));
  return { success: true };
}

// 🟩 Cập nhật state (sử dụng từ API /current)
export function updateSongState(current, nextList) {
  if (current !== undefined) currentSong = current || null;
  if (nextList !== undefined) nextSongs = nextList || [];
  return { success: true, current: currentSong, nextList: nextSongs };
}

// 🟨 Xóa 1 bài khỏi nextSongs
export function removeFromNext(title) {
  nextSongs = nextSongs.filter((s) => s.title !== title);
}

// 🟦 Chuyển bài đầu tiên trong queue -> current
export function shiftNextToCurrent() {
  if (nextSongs.length > 0) {
    currentSong = nextSongs.shift();
  }
}
