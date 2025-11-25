import { useEffect, useState } from "react";
import io from "socket.io-client";

export default function TimerControl({ roomId, serverUrl }) {
  const [socket, setSocket] = useState(null);
  const [initialMinutes, setInitialMinutes] = useState(5);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const s = io(serverUrl);
    s.emit("joinRoom", { roomId });
    setSocket(s);

    s.on("timeUpdate", (t) => setCurrentTime(t));

    return () => s.disconnect();
  }, [roomId, serverUrl]);

  const setInitialTime = () => {
    const seconds = initialMinutes * 60;
    socket.emit("setInitialTime", { roomId, seconds });
  };

  const reset = () => socket.emit("resetTimer", { roomId });

  const add30s = () =>
    socket.emit("setInitialTime", { roomId, seconds: currentTime + 30 });

  const subtract30s = () =>
    socket.emit("setInitialTime", {
      roomId,
      seconds: Math.max(0, currentTime - 30),
    });

  return (
    <div className="p-4 mx-auto bg-gray-800 text-white rounded-xl shadow-lg space-y-4">
      <h2 className="text-xl font-bold">🎛 Điều khiển thời gian</h2>

      <div className="space-y-2">
        <p className="text-sm opacity-80">⏳ Thời gian hiện tại:</p>
        <p className="text-3xl font-mono">
          {Math.floor(currentTime / 60)}:
          {String(currentTime % 60).padStart(2, "0")}
        </p>
      </div>

      <div className="space-y-2">
        <label className="block">Set thời gian ban đầu (phút):</label>
        <input
          type="number"
          className="w-full py-2 px-3 rounded bg-gray-700 border border-gray-600"
          value={initialMinutes}
          onChange={(e) => setInitialMinutes(Number(e.target.value))}
        />

        <button
          onClick={setInitialTime}
          className="w-full py-2 mt-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Set Initial Time
        </button>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={add30s}
          className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded"
        >
          + 30s
        </button>

        <button
          onClick={subtract30s}
          className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 rounded"
        >
          - 30s
        </button>
      </div>

      <button
        onClick={reset}
        className="w-full py-2 mt-4 bg-red-600 hover:bg-red-700 rounded"
      >
        Reset Timer
      </button>
    </div>
  );
}
