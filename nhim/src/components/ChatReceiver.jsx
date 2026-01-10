import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { pinyin } from "pinyin-pro"; // <-- THÊM Pinyin

const isChinese = (t) => /[\p{Script=Han}]/u.test(t);

export default function ChatReceiver({
  roomId = "fideliacovernhactrung",
  target = "vi",
}) {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("Connecting...");

  const socketRef = useRef(null);
  const tiktokWS = useRef(null);
  function uuid() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    // fallback nếu trình duyệt không hỗ trợ
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
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

    // Nhận comment dịch trả về từ server
    socketRef.current.on("chatTranslated", (msg) => {
      let pinText = null;

      if (isChinese(msg.original)) {
        pinText = pinyin(msg.original, { toneType: "mark" }); // 🔥 Convert sang PINYIN
      }

      console.log("📩 NEW CHAT:", msg);

      setMessages((prev) => [
        {
          ...msg,
          pinyin: pinText, // 👉 Thêm Pinyin vào object tin nhắn
        },
        ...prev,
      ]);
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

      const user = data.data.nickname;
      const text = data.data.comment;

      if (isChinese(text)) {
        console.log("⚡ SEND for translation");
        const id = crypto.randomUUID();

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

  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <h2 className="text-center">🔥 TikTok Chat Translate + Pinyin</h2>

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
            {/* 🔥 HIỂN THỊ PINYIN (nếu có tiếng Trung) */}
            {m.pinyin && (
              <div style={{ color: "#0ea5e9", marginLeft: 10 }}>
                🔊 {m.pinyin}
              </div>
            )}
            {/* 🔥 HIỂN THỊ BẢN DỊCH */}
            {m.translated && (
              <div style={{ color: "green", marginLeft: 10 }}>
                ↳ {m.translated}
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
