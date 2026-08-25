import React, { useState, useEffect, useRef } from "react";
import DirectTranslator, { SAMPLES } from "./components/DirectTranslator";
import TikTokLiveTranslator from "./components/TikTokLiveTranslator";
import { isChinese } from "./utils/chineseDetect";
import { translateChinese } from "./utils/translateService";
import { pinyin } from "pinyin-pro";
import { Menu, X, Radio, Languages, Trash2, Wifi, WifiOff, RefreshCw, Settings, HelpCircle, LayoutDashboard, ExternalLink } from "lucide-react";
import ControlPanel from "./components/ControlPanel";
import { io } from "socket.io-client";
import { getSocketUrl } from "./utils/socketUrl";

export default function App() {
  const [activeTab, setActiveTab] = useState("panel"); // 'tiktok' | 'direct' | 'panel'
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const localSocketRef = useRef(null);

  // Kiểm tra xem có đang mở ở chế độ popup không
  const isPopup = new URLSearchParams(window.location.search).get("popup") === "true";

  useEffect(() => {
    localSocketRef.current = io(getSocketUrl());
    return () => localSocketRef.current?.disconnect();
  }, []);

  // TikTok Live WebSocket State
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("disconnected"); // 'connecting', 'connected', 'disconnected'
  const [wsUrl, setWsUrl] = useState("ws://localhost:21213");
  const wsRef = useRef(null);

  // WebSocket Connection Management
  const connectWS = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    setStatus("connecting");
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Connected to TikTok WS:", wsUrl);
        setStatus("connected");
      };

      ws.onerror = (err) => {
        console.error("TikTok WS Error:", err);
        setStatus("disconnected");
      };

      ws.onclose = () => {
        console.log("TikTok WS Closed");
        setStatus("disconnected");
      };

      ws.onmessage = async (ev) => {
        try {
          const data = JSON.parse(ev.data);

          if (data.event === "gift") {
            const giftName = data.data.giftName?.toLowerCase() || "";
            const giftCount = parseInt(data.data.repeatCount || 1, 10);

            if (giftName.includes("cogi") || giftName.includes("corgi")) {
              localSocketRef.current?.emit("timer_action", { type: "ADD_TIME", payload: 300 });
            } else if (giftName.includes("cá voi") || giftName.includes("whale")) {
              localSocketRef.current?.emit("timer_action", { type: "ADD_TIME", payload: 1200 });
            } else if (giftName.includes("mèo leon") || giftName.includes("leon")) {
              localSocketRef.current?.emit("timer_action", { type: "ADD_TIME", payload: 3600 });
            }

            if (giftName.includes("súng bắn tiền") || giftName.includes("money gun")) {
              localSocketRef.current?.emit("queue_action", { type: "ADD_COUNT", payload: { id: "1", amount: giftCount } });
            } else if (giftName.includes("thiên hà") || giftName.includes("galaxy")) {
              localSocketRef.current?.emit("queue_action", { type: "ADD_COUNT", payload: { id: "2", amount: giftCount } });
            } else if (giftName.includes("đám cưới") || giftName.includes("wedding")) {
              localSocketRef.current?.emit("queue_action", { type: "ADD_COUNT", payload: { id: "3", amount: giftCount } });
            } else if (data.data.giftId?.toString() === "5586" || data.data.giftId?.toString() === "6671" || giftName.includes("hearts") || giftName.includes("love you")) {
              localSocketRef.current?.emit("queue_action", { type: "ADD_COUNT", payload: { id: "4", amount: giftCount } });
            }
          }

          if (data.event !== "chat") return;

          const user = data.data.nickname || "User";
          const text = data.data.comment || "";

          // Check if text contains Chinese
          if (isChinese(text)) {
            let userPinyin = null;
            if (isChinese(user)) {
              userPinyin = pinyin(user, { toneType: "mark" });
            }

            try {
              const res = await translateChinese(text);
              const newMsg = {
                id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
                user,
                userPinyin,
                original: text,
                pinyin: res.pinyin,
                translated: res.translated,
                tones: res.tones,
                timestamp: new Date().toLocaleTimeString()
              };

              setMessages((prev) => [newMsg, ...prev.slice(0, 99)]);
            } catch (err) {
              console.error("Auto translation error:", err);
            }
          }
        } catch (e) {
          console.warn("Invalid message JSON", e);
        }
      };
    } catch (e) {
      setStatus("disconnected");
    }
  };

  useEffect(() => {
    connectWS();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  if (isPopup) {
    return (
      <div className="app-container" style={{ background: "transparent", minHeight: "100vh" }}>
        <TikTokLiveTranslator
          messages={messages}
          status={status}
          onClearMessages={() => setMessages([])}
          onReconnect={connectWS}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Header Bar */}
      <header className="top-bar">
        <div className="top-bar-title">
          <span>🇨🇳</span>
          <span>ZH Translator AI</span>
          <span>🇻🇳</span>
        </div>

        <div className="top-bar-actions">
          {/* Live WS Status Badge */}
          <div className={`status-pill ${status}`}>
            {status === "connected" ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span>
              {status === "connected"
                ? "Live (WS 21213)"
                : status === "connecting"
                  ? "Đang kết nối..."
                  : "Chưa kết nối"}
            </span>
          </div>

          {/* Nút mở bản Web / Popup */}
          <button
            className="icon-btn"
            onClick={() => window.open(window.location.origin + "?popup=true", "_blank")}
            title="Mở Popup Live Chat"
          >
            <ExternalLink size={18} />
          </button>

          {/* 3-Bar Hamburger Menu Button */}
          <button
            className="icon-btn"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            title="Cài đặt & Tùy chọn"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Main Translation Content */}
      <main>
        {activeTab === "tiktok" && (
          <TikTokLiveTranslator
            messages={messages}
            status={status}
            onClearMessages={() => setMessages([])}
            onReconnect={connectWS}
          />
        )}
        {activeTab === "direct" && <DirectTranslator />}
        {activeTab === "panel" && <ControlPanel />}
      </main>

      {/* Hamburger Menu Drawer Overlay & Panel */}
      {isDrawerOpen && (
        <>
          <div className="drawer-backdrop" onClick={() => setIsDrawerOpen(false)} />
          <aside className="drawer-panel">
            <div className="drawer-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "1rem" }}>
                <Settings size={18} color="#a855f7" /> Cài Đặt & Menu
              </div>
              <button className="icon-btn" onClick={() => setIsDrawerOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Section 1: Navigation Tabs */}
            <div className="drawer-section">
              <div className="drawer-section-title">Chế Độ Dịch</div>
              <div className="drawer-tabs">
                <button
                  className={`drawer-tab-btn ${activeTab === "tiktok" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("tiktok");
                    setIsDrawerOpen(false);
                  }}
                >
                  <Radio size={16} /> Bắt Chat TikTok Live
                </button>
                <button
                  className={`drawer-tab-btn ${activeTab === "direct" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("direct");
                    setIsDrawerOpen(false);
                  }}
                >
                  <Languages size={16} /> Dịch Trực Tiếp
                </button>
                <button
                  className={`drawer-tab-btn ${activeTab === "panel" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("panel");
                    setIsDrawerOpen(false);
                  }}
                >
                  <LayoutDashboard size={16} /> Quản Lý Live
                </button>
              </div>
            </div>

            {/* Section 2: TikTok WS Config */}
            <div className="drawer-section">
              <div className="drawer-section-title">Kết Nối TikTok WebSocket</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <input
                  type="text"
                  className="input-field"
                  value={wsUrl}
                  onChange={(e) => setWsUrl(e.target.value)}
                  placeholder="ws://localhost:21213"
                />
                <button className="primary-btn" onClick={connectWS} style={{ justifyContent: "center" }}>
                  <RefreshCw size={14} /> Reconnect WS
                </button>
              </div>
            </div>

            {/* Section 3: Chat Management */}
            <div className="drawer-section">
              <div className="drawer-section-title">Quản Lý Dữ Liệu</div>
              <button
                className="secondary-btn"
                style={{ width: "100%", justifyContent: "center" }}
                disabled={messages.length === 0}
                onClick={() => setMessages([])}
              >
                <Trash2 size={14} /> Xóa Lịch Sử Chat ({messages.length})
              </button>
            </div>

            {/* Section 4: Samples */}
            <div className="drawer-section">
              <div className="drawer-section-title">Mẫu Thử Tiếng Trung</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {SAMPLES.map((sample, idx) => (
                  <button
                    key={idx}
                    className="secondary-btn"
                    style={{ fontSize: "0.78rem", textAlign: "left", justifyContent: "flex-start" }}
                    onClick={() => {
                      setActiveTab("direct");
                      setIsDrawerOpen(false);
                    }}
                  >
                    💬 {sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer inside Drawer */}
            <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border-color)", fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
              <p>✨ ZH-Translator AI v1.0 (Local)</p>
              <p style={{ marginTop: "0.2rem" }}>Chạy 100% trên máy tính cá nhân</p>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
