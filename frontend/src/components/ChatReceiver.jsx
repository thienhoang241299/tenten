import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
const isChinese = (t) => /[\p{Script=Han}]/u.test(t);
export default function ChatReceiver({
  roomId = "fideliacovernhactrung",
  target = "vi",
}) {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("Connecting...");

  const socketRef = useRef(null);
  const tiktokWS = useRef(null);

  // ================= SOCKET BACKEND =================
  useEffect(() => {
    socketRef.current = io("http://165.154.248.208:3002/");

    socketRef.current.on("connect", () => {
      setStatus("🟢 Connected");
      socketRef.current.emit("joinRoom", { roomId });
    });

    socketRef.current.on("disconnect", () => {
      setStatus("🔴 Disconnected");
    });

    // Nhận comment dịch từ server
    socketRef.current.on("chatTranslated", (msg) => {
      console.log(msg);
      setMessages((prev) => [msg, ...prev]);
    });

    return () => socketRef.current.disconnect();
  }, [roomId]);

  // ================= TIKTOK LIVE SOCKET =================
  useEffect(() => {
    connectTiktokWS();
    return () => tiktokWS.current?.close();
  }, []);

  const connectTiktokWS = () => {
    tiktokWS.current = new WebSocket("ws://localhost:21213");
    tiktokWS.current.onopen = () => console.log("TikTok WS connected");
    tiktokWS.current.onerror = () => console.log("TikTok WS error");

    tiktokWS.current.onclose = () => {
      console.log("TikTok WS closed → reconnect...");
      setTimeout(connectTiktokWS, 1000);
    };

    tiktokWS.current.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.event !== "chat") return;
      console.log(data.data.comment);
      const user = data.data.nickname;
      const text = data.data.comment;
      if (isChinese(text)) {
        console.log("check");
        const id = crypto.randomUUID();
        // Gửi comment sang backend để dịch
        socketRef.current.emit("chatMessage", {
          id,
          roomId,
          user,
          text,
          target,
        });
      }
    };
  };

  // ================= UI =================
  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <h2 className="text-center">🔥 Dịch hên xui </h2>
      {/* <h2>🔥 TikTok Live → Auto Translation (Backend Powered)</h2>
      <p>
        Backend Socket: <b>{status}</b>
      </p>
      <p>
        Room: {roomId} → Target: {target}
      </p> */}

      {/* CHAT LIST */}
      <div
        style={{
          height: "90vh",
          overflowY: "auto",
          marginTop: 20,
          border: "1px solid #aaa",
          padding: 10,
          background: "#fafafa",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            💬 <b>@{m.user}</b>: {m.original}
            {m.translated && (
              <div style={{ color: "green", marginLeft: 10 }}>
                ↳ {m.translated}
                <span style={{ fontSize: 11, color: "#555" }}>
                  {" "}
                  ({m.detected} → {m.target})
                </span>
              </div>
            )}
            {m.error && (
              <div style={{ color: "red", marginLeft: 10 }}>❌ lỗi dịch</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
