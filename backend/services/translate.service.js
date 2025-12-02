import fetch from "node-fetch";
import { zhPostAI } from "../translate/zh_postprocess_ai.js";

export async function googleTranslate(text, target = "vi", source = "zh-CN") {
  const url =
    "https://translate.googleapis.com/translate_a/single?" +
    `client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;

  const res = await fetch(url);
  const data = await res.json();
  return data[0][0][0];
}

export function postProcessTranslate(raw, translated) {
  return zhPostAI(raw, translated);
}
