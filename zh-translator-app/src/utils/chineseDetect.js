/**
 * Nhận diện chuỗi văn bản có chứa tiếng Trung không, và là Giản thể (zh-CN) hay Phồn thể (zh-TW).
 */
export function detectChineseType(text) {
  if (!text || typeof text !== "string") return null;

  // Danh sách ký tự đặc trưng Phồn thể & Giản thể
  const simplifiedOnly = "国国国国国国国国国国国国国国国国国国国国国国国国国国国国国国国国国国国国"; // Thường dùng các từ phổ biến
  const traditionalOnly = "國繁體臺灣禮樂";

  const chineseRegex = /[\u4E00-\u9FFF]/;
  const chineseSlangRegex = /[啊呀啦嗚喔哦哇欸噁嘿嘿哈哈吶呢]/;

  if (!chineseRegex.test(text) && !chineseSlangRegex.test(text)) {
    return null;
  }

  let trad = 0;
  let simp = 0;

  for (const ch of text) {
    if (traditionalOnly.includes(ch)) trad++;
    if (simplifiedOnly.includes(ch)) simp++;
  }

  if (trad > simp) return "zh-TW";
  return "zh-CN";
}

export function isChinese(text) {
  return /[\u4E00-\u9FFF]/u.test(text);
}
