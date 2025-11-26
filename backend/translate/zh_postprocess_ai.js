// zh_postprocess_ai.js
// AI-Aware Post-processing for Douyin/TikTok Chinese → Vietnamese

export function zhPostAI(original = "", translated = "") {
  if (!translated) return translated;

  let t = translated.trim();
  const o = original.trim();

  // ------------------------------------------------------
  // 0. Pre-clean
  // ------------------------------------------------------
  t = t.replace(/\s+/g, " ").trim();

  // ------------------------------------------------------
  // 1. Detect tone by original CN text
  // ------------------------------------------------------
  const isCute = /可爱|宝宝|乖|甜|萌|亲|抱抱|啾|啵|寶|親親|撒娇|撒嬌/.test(o);

  const isSarcastic = /表演|又來了|又来了|可以哦|厉害哦|好家伙|牛啊/.test(o);

  const isLaugh = /笑|哈哈|嘿嘿|呵呵|xswl|笑死|笑疯|笑瘋|草|艹/.test(o);

  const isAngry = /气死|生气|干啥|幹嘛|幹嘛啦|吵死|闭嘴|閉嘴/.test(o);

  const isShock = /哇|哇塞|哇噻|卧槽|臥槽|天|妈呀|嚇死|吓死/.test(o);

  const isSad = /难过|難過|哭|淚|泪|委屈|心碎/.test(o);

  const isBeg = /拜托|拜託|求你|拜拜托托/.test(o);

  const isWhiny = /啦|嘛|呀|欸|诶/.test(o);

  // ------------------------------------------------------
  // 2. Core slang fixes
  // ------------------------------------------------------
  t = t.replace(/biểu diễn/g, "diễn trò");

  // 笑死 → cười xỉu
  t = t.replace(/cười chết tôi rồi/g, "cười xỉu");
  t = t.replace(/cười chết mất/g, "cười xỉu");

  // 破防 → tổn thương
  t = t.replace(/phá vỡ phòng thủ/g, "tổn thương");
  t = t.replace(/sụp đổ/g, "tổn thương");

  // 吓死 → sợ muốn xỉu
  t = t.replace(/làm tôi sợ chết khiếp/g, "sợ muốn xỉu");

  // 可爱死了 → dễ thương xỉu
  t = t.replace(/đáng yêu chết đi được/g, "dễ thương xỉu");

  // 甜死了 → ngọt xỉu
  t = t.replace(/rất ngọt/g, "ngọt quá");

  // 真的假的 → thật không đó?
  t = t.replace(/có thật không/g, "thật không đó?");

  // ------------------------------------------------------
  // 3. AI Tone Casting — rewrite according to detected tone
  // ------------------------------------------------------

  // CUTE tone
  if (isCute) {
    t = t
      .replace(/rất/g, "")
      .replace(/thật/g, "")
      .replace(/đáng yêu/g, "dễ thương")
      .replace(/!/g, "!")
      .replace(/\.$/, "");

    if (!/xỉu|quá|ơi/.test(t)) t += " dễ thương quá trời~";
  }

  // LAUGH tone
  if (isLaugh) {
    if (!/cười/.test(t)) t = "mắc cười quá trời 😂";
    t = t.replace(/\.$/, " 😂");
  }

  // SHOCK tone
  if (isShock) {
    t = t.replace(/chao ôi/g, "trời đất ơi");
    if (!/trời|ơi|wow/.test(t)) t = "trời ơi " + t;
  }

  // ANGRY tone
  if (isAngry) {
    t = t.replace(/tức giận/g, "tức muốn xỉu");
    t = t.replace(/đi đi/g, "đi chỗ khác dùm");
  }

  // SAD tone
  if (isSad) {
    t = t.replace(/buồn/g, "buồn ghê");
    if (!/ghê|quá/.test(t)) t += " buồn muốn khóc luôn";
  }

  // BEGGING tone
  if (isBeg) {
    t = t.replace(/xin hãy/g, "làm ơn");
    if (!/đi mà/.test(t)) t += ", đi màaaa 🥺";
  }

  // WHINY tone
  if (isWhiny && !isAngry) {
    t = t.replace(/ mà/g, " mà nè");
    if (!/nè|mà$/.test(t)) t += " mà~";
  }

  // SARCASTIC / IRONIC tone
  if (isSarcastic) {
    t = t.replace(/thật không đó\?/g, "thiệt hông trời?");
    t = t.replace(/tốt thật/g, "được á ha");
    if (!/ha$|há$/.test(t)) t += " ha?";
  }

  // ------------------------------------------------------
  // 4. Final Clean
  // ------------------------------------------------------
  t = t.replace(/\s+/g, " ").trim();
  t = t.replace(/ ,/g, ",");
  t = t.replace(/ \?/g, "?");
  t = t.replace(/ \!/g, "!");

  return t;
}
