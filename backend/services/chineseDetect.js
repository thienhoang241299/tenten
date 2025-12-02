export function detectChineseType(text) {
  const simplifiedOnly = "...";
  const traditionalOnly = "...";

  const chineseRegex = /[\u4E00-\u9FFF]/;
  const chineseSlangRegex = /[啊呀啦嗚喔哦哇欸噁嘿嘿哈哈吶呢]/;

  let trad = 0;
  let simp = 0;

  for (const ch of text) {
    if (traditionalOnly.includes(ch)) trad++;
    if (simplifiedOnly.includes(ch)) simp++;
  }

  if (!chineseRegex.test(text) && !chineseSlangRegex.test(text)) return null;
  if (trad > simp) return "zh-TW";
  if (simp > trad) return "zh-CN";
  return "zh-CN";
}
