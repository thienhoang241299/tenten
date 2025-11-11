import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://165.154.248.208:3002");

export default function OverlayPage() {
  const [current, setCurrent] = useState(null);
  const [next, setNext] = useState(null);

  useEffect(() => {
    socket.on("songChange", ({ current, next }) => {
      setCurrent(current);
      setNext(next);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent text-white font-sans space-y-4">
      <div className=" px-6 py-4 rounded-2xl text-center shadow-lg bg-gray-600/60 ">
        <p className="text-3xl font-bold">🎶 Bài đang hát</p>
        <p className="text-2xl font-bold text-white mt-1">
          {current?.title || "Chưa chọn"}
        </p>
      </div>

      <div className=" px-6 py-3 rounded-2xl text-center shadow bg-gray-600/60 ">
        <p className="text-3xl font-bold">⏭️ Bài tiếp theo</p>
        <p className="text-2xl text-white font-bold mt-1">
          {next?.title || "Chưa có"}
        </p>
      </div>
    </div>
  );
}
