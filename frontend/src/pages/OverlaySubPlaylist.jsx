import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://165.154.248.208:3002");

export default function OverlaySubList() {
  const { playlist } = useParams();
  const [songs, setSongs] = useState([]);

  // Nếu không có playlist → dùng API cũ
  const apiUrl = playlist
    ? `http://165.154.248.208:3002/playlist/${playlist}`
    : `http://165.154.248.208:3002/songs`;

  const socketEvent = playlist ? null : "songsUpdate";

  useEffect(() => {
    if (socketEvent) {
      socket.on(socketEvent, (data) => setSongs(data));
    }

    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => setSongs(data));
  }, [apiUrl]);

  if (songs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Đang tải danh sách...
      </div>
    );
  }

  const repeatedSongs = [...songs, ...songs];

  return (
    <div className="flex flex-col justify-center items-center min-h-screen italic text-white">
      {/* <p className="rounded-xl text-4xl text-center py-2 w-[330px] font-bold mb-10 bg-gray-600/60">
        {playlist ? `Playlist: ${playlist}` : "Nhạc Tẽn Hát"}
      </p> */}

      <div className="relative overflow-hidden h-[400px] w-[350px] p-3">
        <div className="animate-scrollLoop">
          {repeatedSongs.map((song, i) => (
            <div
              key={i}
              className="text-[28px] bg-gray-600/60 font-bold text-center rounded-xl py-2 my-2"
            >
              {song.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
