import React, { useState } from "react";
import { translateChinese } from "../utils/translateService";
import { Copy, Sparkles, Volume2, Check, RefreshCw } from "lucide-react";

export const SAMPLES = [
  "笑死我了，你太可爱了！",
  "卧槽，这波操作太牛了！",
  "破防了，真的太难过了。",
  "拜托拜托，帮我一下嘛 🥺",
  "又来了，你这表演可以哦 ha?",
  "宝宝，你今天好乖呀！"
];

export default function DirectTranslator({ externalInput = "", onSelectSample }) {
  const [input, setInput] = useState(externalInput || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async (textToTranslate = input) => {
    if (!textToTranslate || !textToTranslate.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await translateChinese(textToTranslate);
      setResult(res);
    } catch (err) {
      setError(err.message || "Lỗi dịch thuật");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const speakText = (text, lang = "zh-CN") => {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="glass-panel" style={{ padding: "0.8rem" }}>
      {/* Input Box */}
      <textarea
        className="custom-textarea"
        placeholder="Nhập hoặc dán tiếng Trung (Ctrl+Enter để dịch)..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            handleTranslate();
          }
        }}
      />

      {/* Action Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem", flexWrap: "wrap", gap: "0.4rem" }}>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button
            className="primary-btn"
            onClick={() => handleTranslate()}
            disabled={loading || !input.trim()}
          >
            {loading ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {loading ? "Đang dịch..." : "Dịch Ngay"}
          </button>
          {input && (
            <button className="secondary-btn" onClick={() => { setInput(""); setResult(null); }}>
              Xóa
            </button>
          )}
        </div>

        {result?.detected && (
          <span style={{ fontSize: "0.75rem", background: "rgba(99, 102, 241, 0.2)", color: "#818cf8", padding: "0.15rem 0.5rem", borderRadius: "9999px" }}>
            {result.detected}
          </span>
        )}
      </div>

      {error && (
        <div style={{ marginTop: "0.5rem", padding: "0.5rem 0.8rem", borderRadius: "8px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", fontSize: "0.85rem" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="result-card">
          {/* Original Text & Pinyin */}
          <div style={{ marginBottom: "0.5rem" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tiếng Trung & Pinyin</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", marginTop: "0.1rem", display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
              <span>{result.original}</span>
              <button
                onClick={() => speakText(result.original)}
                title="Nghe phát âm"
                style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", padding: "2px" }}
              >
                <Volume2 size={16} />
              </button>
            </div>
            {result.pinyin && <div className="pinyin-text" style={{ marginTop: "0.1rem" }}>🔊 {result.pinyin}</div>}
          </div>

          {/* Vietnamese AI Translation */}
          <div style={{ borderTop: "1px dashed var(--border-color)", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Bản Dịch Tiếng Việt</div>
              <button
                className="secondary-btn"
                style={{ padding: "0.15rem 0.4rem", fontSize: "0.75rem" }}
                onClick={() => handleCopy(result.translated)}
              >
                {copied ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                {copied ? "Đã chép" : "Sao chép"}
              </button>
            </div>
            <div className="vi-text" style={{ marginTop: "0.2rem" }}>↳ {result.translated}</div>
          </div>

          {/* Tone badges */}
          {result.tones && result.tones.length > 0 && (
            <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.2rem" }}>
              {result.tones.map((t, idx) => (
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
      )}
    </div>
  );
}
