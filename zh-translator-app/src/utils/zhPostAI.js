// zhPostAI.js - AI-Aware Post-processing for Chinese -> Vietnamese Translation

export function detectTone(original = "") {
  const o = original.trim();
  const tones = [];

  if (/可爱|宝宝|乖|甜|萌|亲|抱抱|啾|啵|寶|親親|撒娇|撒嬌/.test(o)) {
    tones.push({ key: "cute", label: "Dễ thương 🥺", color: "#ec4899" });
  }
  if (/表演|又來了|又来了|可以哦|厉害哦|好家伙|牛啊/.test(o)) {
    tones.push({ key: "sarcastic", label: "Châm biếm 😒", color: "#f59e0b" });
  }
  if (/笑|哈哈|嘿嘿|呵呵|xswl|笑死|笑疯|笑瘋|草|艹/.test(o)) {
    tones.push({ key: "laugh", label: "Hài hước 😂", color: "#10b981" });
  }
  if (/气死|生气|干啥|幹嘛|幹嘛啦|吵死|闭嘴|閉嘴/.test(o)) {
    tones.push({ key: "angry", label: "Tức giận 😡", color: "#ef4444" });
  }
  if (/哇|哇塞|哇噻|卧槽|臥槽|天|妈呀|嚇死|吓死/.test(o)) {
    tones.push({ key: "shock", label: "Bất ngờ 😲", color: "#8b5cf6" });
  }
  if (/难过|難過|哭|淚|泪|委屈|心碎/.test(o)) {
    tones.push({ key: "sad", label: "Buồn 😭", color: "#3b82f6" });
  }
  if (/拜托|拜託|求你|拜拜托托/.test(o)) {
    tones.push({ key: "beg", label: "Năn nỉ 🙏", color: "#14b8a6" });
  }
  if (/啦|嘛|呀|欸|诶/.test(o)) {
    tones.push({ key: "whiny", label: "Nũng nịu 🎀", color: "#f43f5e" });
  }

  return tones;
}

export function zhPostAI(original = "", translated = "") {
  if (!translated) return translated;

  let t = translated.trim();
  const o = original.trim();

  // 0. Pre-clean
  t = t.replace(/\s+/g, " ").trim();

  // 1. Detect tone by original CN text
  const isCute = /可爱|宝宝|乖|甜|萌|亲|抱抱|啾|啵|寶|親親|撒娇|撒嬌/.test(o);
  const isSarcastic = /表演|又來了|又来了|可以哦|厉害哦|好家伙|牛啊/.test(o);
  const isLaugh = /笑|哈哈|嘿嘿|呵呵|xswl|笑死|笑疯|笑瘋|草|艹/.test(o);
  const isAngry = /气死|生气|干啥|幹嘛|幹嘛啦|吵死|闭嘴|閉嘴/.test(o);
  const isShock = /哇|哇塞|哇噻|卧槽|臥槽|天|妈呀|嚇死|吓死/.test(o);
  const isSad = /难过|難過|哭|淚|泪|委屈|心碎/.test(o);
  const isBeg = /拜托|拜託|求你|拜拜托托/.test(o);
  const isWhiny = /啦|嘛|呀|欸|诶/.test(o);

  // 2. Core slang fixes
  t = t.replace(/biểu diễn/g, "diễn trò");
  t = t.replace(/cười chết tôi rồi/g, "cười xỉu");
  t = t.replace(/cười chết mất/g, "cười xỉu");
  t = t.replace(/phá vỡ phòng thủ/g, "tổn thương");
  t = t.replace(/sụp đổ/g, "tổn thương");
  t = t.replace(/làm tôi sợ chết khiếp/g, "sợ muốn xỉu");
  t = t.replace(/đáng yêu chết đi được/g, "dễ thương xỉu");
  t = t.replace(/rất ngọt/g, "ngọt quá");
  t = t.replace(/có thật không/g, "thật không đó?");

  // 3. AI Tone Casting — rewrite according to detected tone
  if (isCute) {
    t = t
      .replace(/rất/g, "")
      .replace(/thật/g, "")
      .replace(/đáng yêu/g, "dễ thương")
      .replace(/!/g, "!")
      .replace(/\.$/, "");

    if (!/xỉu|quá|ơi/.test(t)) t += " dễ thương quá trời~";
  }

  if (isLaugh) {
    if (!/cười/.test(t)) t = "mắc cười quá trời 😂";
    t = t.replace(/\.$/, " 😂");
  }

  if (isShock) {
    t = t.replace(/chao ôi/g, "trời đất ơi");
    if (!/trời|ơi|wow/.test(t)) t = "trời ơi " + t;
  }

  if (isAngry) {
    t = t.replace(/tức giận/g, "tức muốn xỉu");
    t = t.replace(/đi đi/g, "đi chỗ khác dùm");
  }

  if (isSad) {
    t = t.replace(/buồn/g, "buồn ghê");
    if (!/ghê|quá/.test(t)) t += " buồn muốn khóc luôn";
  }

  if (isBeg) {
    t = t.replace(/xin hãy/g, "làm ơn");
    if (!/đi mà/.test(t)) t += ", đi màaaa 🥺";
  }

  if (isWhiny && !isAngry) {
    t = t.replace(/ mà/g, " mà nè");
    if (!/nè|mà$/.test(t)) t += " mà~";
  }

  if (isSarcastic) {
    t = t.replace(/thật không đó\?/g, "thiệt hông trời?");
    t = t.replace(/tốt thật/g, "được á ha");
    if (!/ha$|há$/.test(t)) t += " ha?";
  }

  // 4. Final Clean
  t = t.replace(/\s+/g, " ").trim();
  t = t.replace(/ ,/g, ",");
  t = t.replace(/ \?/g, "?");
  t = t.replace(/ \!/g, "!");

  return t;
}
