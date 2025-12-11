import express from "express";

export default function testRoute(io) {
  const router = express.Router();

  // GET /test/gift → broadcast event để FE tự quay
  router.get("/gift", (req, res) => {
    const payload = {
      event: "gift",
      data: {
        giftId: 11046, // ID bạn dùng để kích hoạt spin
        repeatEnd: true, // FE của bạn kiểm tra repeatEnd === true
        user: "TestUser",
        amount: 1,
      },
    };

    io.emit("gift", payload); // Gửi tới tất cả client đang kết nối

    return res.json({
      status: "ok",
      sent: payload,
    });
  });

  return router;
}
