import fs from "fs";

const FILES = {
  main: "./data/songs_main.json",
  friend: "./data/songs_friend.json",
};

export function loadSongs(list = "main") {
  const file = FILES[list];
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function saveSongs(list, songs) {
  const file = FILES[list];
  fs.writeFileSync(file, JSON.stringify(songs, null, 2));
}

export function addSong(list, title) {
  let songs = loadSongs(list);

  if (songs.find((s) => s.title === title))
    return { success: true, message: "Song already exists" };

  songs.push({ title });
  saveSongs(list, songs);
  return { success: true };
}

export function deleteSong(list, title) {
  let songs = loadSongs(list);
  songs = songs.filter((s) => s.title !== title);
  saveSongs(list, songs);
  return { success: true };
}
