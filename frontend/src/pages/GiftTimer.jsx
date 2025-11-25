import { useEffect, useState } from "react";
import io from "socket.io-client";

export default function GiftTimer({ roomId }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const socket = io("http://165.154.248.208:3002");

  useEffect(() => {
    socket.emit("joinRoom", { roomId });

    socket.on("timeUpdate", (t) => setTimeLeft(t));
    socket.on("timeAdded", (data) => setTimeLeft(data.timeLeft));
    socket.on("timeReset", () => setTimeLeft(0));

    return () => socket.disconnect();
    // eslint-disable-next-line
  }, []);

  return (
    <h2>
      ⏳ Còn lại: {Math.floor(timeLeft / 60)}:
      {String(timeLeft % 60).padStart(2, "0")}
    </h2>
  );
}
