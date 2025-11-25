import { useEffect, useState } from "react";
import io from "socket.io-client";
import GiftListener from "../components/GiftListener";

export default function GiftTimer({ roomId = "fideliacovernhactrung" }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const socket = io("http://165.154.248.208:3002");

  useEffect(() => {
    socket.emit("joinRoom", { roomId });

    socket.on("timeUpdate", (t) => setTimeLeft(t));
    socket.on("timeAdded", (data) => {
      console.log("check", data.timeLeft);
      setTimeLeft(data.timeLeft);
    });
    socket.on("timeReset", () => setTimeLeft(0));

    return () => socket.disconnect();
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <div className="hidden">
        <GiftListener roomId="fideliacovernhactrung" />
      </div>
      <div className="bg-gray-500/80 w-72 rounded-2xl text-white">
        <h2 className="text-center text-xl font-semibold p-4">
          Thời gian Tẽn hát còn lại:
          <br />
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </h2>
      </div>
    </div>
  );
}
