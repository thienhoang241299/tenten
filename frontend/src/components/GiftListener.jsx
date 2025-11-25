import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

export default function GiftListener({ roomId }) {
  const [status, setStatus] = useState("Disconnected");
  const [logs, setLogs] = useState([]);
  const websocketRef = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    // Kết nối socket.io
    socket.current = io("http://165.154.248.208:3002");
    socket.current.emit("joinRoom", { roomId });

    return () => {
      socket.current.disconnect();
    };
  }, [roomId]);

  // Hàm connect WebSocket (giữ nguyên code của bạn)
  const connect = () => {
    if (websocketRef.current) return;

    const ws = new WebSocket("ws://localhost:21213/");
    websocketRef.current = ws;

    ws.onopen = () => setStatus("Connected");

    ws.onclose = () => {
      setStatus("Disconnected");
      websocketRef.current = null;
      setTimeout(connect, 1000);
    };

    ws.onerror = () => {
      setStatus("Connection Failed");
      websocketRef.current = null;
      setTimeout(connect, 1000);
    };

    ws.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);

      // Lưu log vào state
      if (parsedData.event === "gift" && parsedData.data?.repeatEnd === true) {
        setLogs((prev) => [...prev, parsedData]);

        // Lấy số xu
        const giftValue =
          parsedData.data?.diamondCount ||
          parsedData.data?.giftDiamondCount ||
          0;
        console.log(giftValue);
        // Gửi lên server NodeJS
        socket.current.emit("giftEvent", {
          roomId,
          giftValue,
          uniqueId: parsedData.data.uniqueId,
        });
      }
    };
  };

  useEffect(() => {
    connect();
    return () => {
      if (websocketRef.current) websocketRef.current.close();
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>TikTok Gift Listener</h2>
      <p>
        Status: <b>{status}</b>
      </p>

      <h3>Gift Log:</h3>
      <div
        style={{
          maxHeight: 300,
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: 8,
        }}
      >
        {logs.map((item, i) => (
          <details key={i} style={{ marginBottom: 8 }}>
            <summary>
              Gift @ {item.data?.uniqueId} — {item.data?.diamondCount} xu
            </summary>
            <pre>{JSON.stringify(item, null, 2)}</pre>
          </details>
        ))}
      </div>
    </div>
  );
}
