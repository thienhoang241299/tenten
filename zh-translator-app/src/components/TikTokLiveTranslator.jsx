import React from "react";
import { Radio, Trash2, WifiOff } from "lucide-react";

export default function TikTokLiveTranslator({ messages, status, onClearMessages, onReconnect }) {
  return (
    <div className="chat-stream-box">
      {messages.length === 0 ? (
        <div style={{ padding: "2.5rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
          <Radio size={36} style={{ opacity: 0.3, marginBottom: "0.75rem" }} />
          <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>Đang chờ bình luận tiếng Trung mới từ TikTok Live...</p>
          <p style={{ fontSize: "0.8rem", marginTop: "0.4rem", color: "var(--text-secondary)" }}>
            Bấm dấu 3 gạch <code>☰</code> ở góc trên để mở Cài đặt cổng WebSocket hoặc thử kết nối lại.
          </p>
          {status !== "connected" && (
            <button className="secondary-btn" style={{ marginTop: "1rem" }} onClick={onReconnect}>
              <WifiOff size={14} /> Kết nối lại WS
            </button>
          )}
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.2rem 0.5rem 0.4rem", borderBottom: "1px solid var(--border-color)", marginBottom: "0.4rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            <span>Đang phát trực tiếp ({messages.length} bình luận)</span>
            <button className="secondary-btn" style={{ padding: "0.15rem 0.5rem", fontSize: "0.72rem" }} onClick={onClearMessages} title="Xóa lịch sử chat">
              <Trash2 size={12} /> Xóa chat
            </button>
          </div>

          {messages.map((m) => (
            <div key={m.id} className="compact-chat-item">
              {/* User info line */}
              <div className="chat-user-row">
                <span className="chat-user-name">
                  👤 @{m.user}{" "}
                  {m.userPinyin && <span style={{ color: "#38bdf8", fontWeight: 400 }}>({m.userPinyin})</span>}
                </span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{m.timestamp}</span>
              </div>

              {/* Chinese text + Pinyin line */}
              <div className="chat-zh-row">
                <span>💬 {m.original}</span>
                {m.pinyin && <span className="pinyin-text">🔊 {m.pinyin}</span>}
              </div>

              {/* Vietnamese AI Translation line */}
              {m.translated && (
                <div className="chat-vi-row">
                  ↳ {m.translated}
                </div>
              )}

              {/* Tone badges line if available */}
              {m.tones && m.tones.length > 0 && (
                <div style={{ marginTop: "0.25rem", display: "flex", flexWrap: "wrap", gap: "0.2rem" }}>
                  {m.tones.map((t, idx) => (
                    <span
                      key={idx}
                      className="tone-badge"
                      style={{ background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40` }}
                    >
                      {t.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
