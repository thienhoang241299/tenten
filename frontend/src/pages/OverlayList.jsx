import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3002");

export default function OverlayList() {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    socket.on("songsUpdate", (data) => setSongs(data));
    fetch("http://localhost:3002/songs")
      .then((res) => res.json())
      .then((data) => setSongs(data));
  }, []);

  if (songs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Đang tải danh sách bài hát...
      </div>
    );
  }

  // ⚡ Nhân đôi danh sách để tạo hiệu ứng vòng liên tục
  const repeatedSongs = [...songs, ...songs];

  return (
    <div className="flex flex-col justify-center items-center min-h-screen italic text-white">
      <p className="text-4xl font-bold mb-10 ">Nhạc Tẽn Hát</p>
      <div className="relative overflow-hidden h-[400px] w-[350px] p-3">
        {/* Container cuộn liên tục */}
        <div className="animate-scrollLoop">
          {repeatedSongs.map((song, i) => (
            <div
              key={i}
              className="text-[28px] font-bold text-center rounded py-2 my-1"
            >
              {song.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
