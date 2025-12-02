import express from "express";
import {
  googleTranslate,
  postProcessTranslate,
} from "../services/translate.service.js";
import { detectChineseType } from "../services/chineseDetect.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { text, target = "vi" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }

    // Nhận dạng zh-CN / zh-TW
    const detected = detectChineseType(text);

    // Không phải tiếng Trung → dịch bình thường
    if (!detected) {
      const raw = await googleTranslate(text, target);
      return res.json({
        original: text,
        translated: raw,
        detected: "not-cn",
      });
    }

    // Nếu là tiếng Trung → dịch đúng source language
    const googleRaw = await googleTranslate(text, target, detected);

    const final = postProcessTranslate(text, googleRaw);

    res.json({
      original: text,
      translated: final,
      detected,
    });
  } catch (err) {
    console.error("Translate API error:", err);
    res.status(500).json({ error: "Translation failed" });
  }
});

export default router;
