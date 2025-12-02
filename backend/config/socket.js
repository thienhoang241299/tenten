import { timers, startTimer, addTime, resetTime, getTime } from "../timer.js";
import { detectChineseType } from "../services/chineseDetect.js";
import {
  googleTranslate,
  postProcessTranslate,
} from "../services/translate.service.js";

import {
  loadSongs,
  getCurrentSong,
  getNextSongs,
} from "../services/songs.service.js";

export default function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("Client connected");

    socket.emit("songChange", {
      current: getCurrentSong(),
      nextList: getNextSongs(),
    });

    socket.emit("songsUpdate", loadSongs());

    socket.on("joinRoom", ({ roomId }) => {
      socket.join(roomId);
      const t = getTime(roomId);
      socket.emit("timeUpdate", t);
      startTimer(io, roomId);
    });

    socket.on("giftEvent", ({ roomId, giftValue }) => {
      addTime(io, roomId, giftValue);
    });

    socket.on("resetTimer", ({ roomId }) => resetTime(io, roomId));

    socket.on("setInitialTime", ({ roomId, seconds }) => {
      if (!timers[roomId]) return;
      timers[roomId].timeLeft = seconds;
      io.to(roomId).emit("timeUpdate", timers[roomId].timeLeft);
    });

    // ⭐ CHAT TRANSLATE ⭐
    socket.on("chatMessage", async ({ id, roomId, user, text }) => {
      try {
        const detected = detectChineseType(text);

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

        const googleRaw = await googleTranslate(text, "vi", detected);
        const final = postProcessTranslate(text, googleRaw);

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
}
