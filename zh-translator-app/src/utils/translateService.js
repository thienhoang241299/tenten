import { pinyin } from "pinyin-pro";
import { detectChineseType } from "./chineseDetect.js";
import { zhPostAI, detectTone } from "./zhPostAI.js";

/**
 * Dịch văn bản từ tiếng Trung sang tiếng Việt (hoặc ngôn ngữ mục tiêu) trực tiếp từ client.
 */
export async function translateChinese(text, target = "vi") {
  if (!text || !text.trim()) {
    return { original: text, translated: "", pinyin: "", detected: null, tones: [] };
  }

  const trimmedText = text.trim();

  // 1. Phát hiện loại tiếng Trung
  const detected = detectChineseType(trimmedText);
  const sourceLang = detected || "zh-CN";

  // 2. Chuyển đổi Pinyin
  let pinyinText = "";
  try {
    pinyinText = pinyin(trimmedText, { toneType: "mark" });
  } catch (err) {
    console.warn("Pinyin error:", err);
  }

  // 3. Phân tích sắc thái (tones)
  const tones = detectTone(trimmedText);

  // 4. Gọi API Google Translate trực tiếp (sử dụng client=dict-chrome-ex không bị chặn)
  let rawTranslation = "";
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=${sourceLang}&tl=${target}&dt=t&q=${encodeURIComponent(trimmedText)}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    
    // Kết hợp các câu nếu văn bản dài có nhiều dòng/câu
    if (data && data[0]) {
      rawTranslation = data[0].map(item => item[0]).join("");
    } else {
      console.error("Invalid translation response:", data);
      rawTranslation = trimmedText; // Fallback
    }
  } catch (err) {
    console.error("Translation Fetch Error:", err);
    throw new Error("Không thể kết nối đến dịch vụ dịch thuật. Vui lòng thử lại.");
  }

  // 5. Hậu xử lý mượt mà câu dịch tiếng Việt
  const finalTranslation = zhPostAI(trimmedText, rawTranslation);

  return {
    original: trimmedText,
    translatedRaw: rawTranslation,
    translated: finalTranslation,
    pinyin: pinyinText,
    detected: detected || "autodetect",
    tones: tones
  };
}
