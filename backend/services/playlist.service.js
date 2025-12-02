import fs from "fs";

const DATA_DIR = "./data";

// Tạo thư mục data nếu chưa có
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Lấy đường dẫn file playlist
function getPlaylistFile(list) {
  return `${DATA_DIR}/${list}.json`;
}

// 🔥 Tự động tạo file nếu chưa có
function ensurePlaylistFile(list) {
  const file = getPlaylistFile(list);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "[]");
  }
  return file;
}

// 🔵 Lấy danh sách playlist
export function loadPlaylist(list) {
  const file = ensurePlaylistFile(list);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

// 🟢 Thêm bài hát vào playlist
export function addPlaylistSong(list, title) {
  const file = ensurePlaylistFile(list);
  let songs = JSON.parse(fs.readFileSync(file, "utf8"));

  if (songs.find((s) => s.title === title)) {
    return { success: true, message: "Song already exists" };
  }

  songs.push({ title });
  fs.writeFileSync(file, JSON.stringify(songs, null, 2));
  return { success: true };
}

// 🔴 Xóa bài khỏi playlist
export function deletePlaylistSong(list, title) {
  const file = ensurePlaylistFile(list);
  let songs = JSON.parse(fs.readFileSync(file, "utf8"));

  songs = songs.filter((s) => s.title !== title);
  fs.writeFileSync(file, JSON.stringify(songs, null, 2));

  return { success: true };
}
