import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import fs from "fs";
import { timers, startTimer, addTime, resetTime, getTime } from "./timer.js";
import { zhPostAI } from "./translate/zh_postprocess_ai.js";
import fetch from "node-fetch";
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
////////////////////// Quản lý danh sách bài hát ///////////////////////
const SONGS_FILE = "./songs.json";
let songs = JSON.parse(fs.readFileSync(SONGS_FILE, "utf8"));
let currentSong = null;
let nextSongs = []; // 🔥 đổi từ nextSong -> mảng nextSongs
async function googleTranslate(text, target = "vi", source = "zh-CN") {
  const url =
    "https://translate.googleapis.com/translate_a/single?" +
    `client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;

  const res = await fetch(url);
  const data = await res.json();
  return data[0][0][0];
}
const simplifiedOnly =
  "与丑丛东丝丢两严乐习乡书买云产亩亲听内冈写冲刘则别刚创删剑剂势勋区医华协单卖卢厅厉压双发变叶号后吗听战护报拔拥择损据树横欢来气汉沟没沉沟沟庐济灭灯灵灶炉奖劳胜脏补袭观订训试该详语诚话诚讲记让训许讽贫费责贼赖赞赞赢赃罢罢肃绿线组细终经统绍绣继绩给绝维编缓墙声职脑脚脸脱超级见观规视觉观艳规规视规视歓迎致辺这进连迟适过还达运远迟迹迹选适透选递造迟连选达还还达还进边过过这运达造连递选迹迹";
const traditionalOnly =
  "與醜叢東絲丟兩嚴樂習鄉書買雲產畝親聽內岡寫沖劉則別剛創刪劍劑勢勳區醫華協單賣盧廳厲壓雙發變葉號後嗎聽戰護報拔擁擇損據樹橫歡來氣漢溝沒沉溝溝廬濟滅燈靈灶爐獎勞勝髒補襲觀訂訓試該詳語誠話誠講記讓訓許諷貧費責賊賴贊贊贏贓罷罷肅綠線組細終經統紹繡繼績給絕維編緩牆聲職腦腳臉脫超級見觀規視覺觀豔規規視規視歡迎致邊這進連遲適過還達運遠遲跡跡選適透選遞造遲連選達還還達還進邊過過這運達造連遞選跡跡";
const chineseRegex = /[\u4E00-\u9FFF\u3400-\u4DBF\u3000-\u303F]/;
const chineseSlangRegex = /[啊呀啦嗚喔哦哇欸噁嘿嘿哈哈吶呢]/;

function detectChineseType(text) {
  let trad = 0;
  let simp = 0;

  for (const ch of text) {
    if (traditionalOnly.includes(ch)) trad++;
    if (simplifiedOnly.includes(ch)) simp++;
  }

  // 1. Nếu không có Chinese hoặc Chinese slang → không phải Chinese
  if (!chineseRegex.test(text) && !chineseSlangRegex.test(text)) {
    return null;
  }

  // 2. Nếu có chữ đặc trưng phồn thể → zh-TW
  if (trad > simp) return "zh-TW";

  // 3. Nếu có chữ đặc trưng giản thể → zh-CN
  if (simp > trad) return "zh-CN";

  // 4. Nếu toàn slang (哈哈哈, 嗚嗚嗚) nhưng không có chữ đặc trưng → chọn zh-CN
  return "zh-CN";
}
// 📜 Lấy danh sách bài hát
app.get("/songs", (req, res) => res.json(songs));

// ➕ Thêm bài hát mới
app.post("/songs", (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== "string") {
    return res.status(400).json({ success: false, message: "Invalid title" });
  }

  if (songs.find((s) => s.title === title)) {
    return res.json({ success: true, message: "Song already exists" });
  }

  const newSong = { title };
  songs.push(newSong);
  fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2));
  io.emit("songsUpdate", songs);
  res.json({ success: true });
});
// 🌏 Dịch đa ngôn ngữ (auto detect + NLLB)
app.post("/translate", async (req, res) => {
  try {
    const { text, target } = req.body;
    if (!text) return res.status(400).json({ error: "Missing text" });

    const result = await MultiLangTranslator.translate(text, target || "vi");

    res.json(result);
  } catch (err) {
    console.error("Translate error:", err);
    res.status(500).json({ error: "Translation failed" });
  }
});
// 🎵 Cập nhật bài đang hát / danh sách bài tiếp theo
app.post("/current", (req, res) => {
  const { current, nextList } = req.body;

  // 🧠 Chỉ cập nhật current nếu client thực sự gửi field đó
  if (req.body.hasOwnProperty("current")) {
    currentSong = current || null;
  }

  if (req.body.hasOwnProperty("nextList")) {
    nextSongs = Array.isArray(nextList) ? nextList : [];
  }

  io.emit("songChange", { current: currentSong, nextList: nextSongs });
  res.json({ success: true, current: currentSong, nextList: nextSongs });
});

// ❌ Xóa bài hát
app.delete("/songs/:title", (req, res) => {
  const title = req.params.title;
  songs = songs.filter((s) => s.title !== title);

  if (currentSong?.title === title) currentSong = null;
  nextSongs = nextSongs.filter((s) => s.title !== title);

  fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2));
  io.emit("songsUpdate", songs);
  io.emit("songChange", { current: currentSong, nextList: nextSongs });

  res.json({ success: true });
});

// 🔧 Hành động đặc biệt
app.post("/action", (req, res) => {
  const { type, title } = req.body;

  if (type === "clearCurrent") currentSong = null;
  if (type === "clearNext") nextSongs = [];

  // Nếu truyền "nextToCurrent" mà có title => phát bài cụ thể
  if (type === "nextToCurrent") {
    if (title) {
      const found = nextSongs.find((s) => s.title === title);
      if (found) {
        currentSong = found;
        nextSongs = nextSongs.filter((s) => s.title !== title);
      }
    } else if (nextSongs.length > 0) {
      // Mặc định vẫn lấy bài đầu nếu không truyền title
      currentSong = nextSongs.shift();
    }
  }

  io.emit("songChange", { current: currentSong, nextList: nextSongs });
  res.json({ success: true, current: currentSong, nextList: nextSongs });
});

// ❌ Xóa 1 bài khỏi list chờ
app.delete("/next/:title", (req, res) => {
  const title = req.params.title;
  nextSongs = nextSongs.filter((s) => s.title !== title);
  io.emit("songChange", { current: currentSong, nextList: nextSongs });
  res.json({ success: true, nextList: nextSongs });
});

// ⚡ Socket realtime
// ⚡ Socket realtime
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);

    const t = getTime(roomId);
    socket.emit("timeUpdate", t);

    startTimer(io, roomId);
  });

  socket.on("giftEvent", ({ roomId, giftValue }) => {
    addTime(io, roomId, giftValue);
  });

  socket.on("resetTimer", ({ roomId }) => {
    resetTime(io, roomId);
  });

  socket.on("setInitialTime", ({ roomId, seconds }) => {
    if (!timers[roomId]) return;

    timers[roomId].timeLeft = seconds;
    io.to(roomId).emit("timeUpdate", timers[roomId].timeLeft);
  });

  socket.emit("songChange", { current: currentSong, nextList: nextSongs });
  socket.emit("songsUpdate", songs);

  // ===================================================================
  // ⭐ CHAT AUTO TRANSLATE — Dùng id để FE cập nhật đúng tin nhắn ⭐
  // ===================================================================
  socket.on("chatMessage", async ({ id, roomId, user, text }) => {
    try {
      // 1) Nhận dạng Chinese Simplified/Traditional
      const detected = detectChineseType(text);

      // 2) Nếu không phải tiếng Trung → trả luôn
      if (!detected) {
        return io.to(roomId).emit("chatTranslated", {
          id,
          user,
          original: text,
          translated: null,
          detected: "not-cn",
          target: "vi",
        });
      }

      // 3) Dịch bằng Google API (miễn phí thông qua URL)
      const googleRaw = await googleTranslate(text, "vi", detected);

      // 4) AI-Aware post-processing để tự nhiên như người nói
      const final = zhPostAI(text, googleRaw);

      // 5) Gửi về front-end
      io.to(roomId).emit("chatTranslated", {
        id,
        user,
        original: text,
        translated: final,
        detected,
        target: "vi",
      });
    } catch (err) {
      console.error("Translate socket error:", err);
    }
  });

  socket.on("disconnect", () => console.log("Client disconnected"));
});

const PORT = 3002;
server.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
