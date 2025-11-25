const timers = {}; // { roomId: { timeLeft, interval }}
const GIFT_RULES = {
  199: 5 * 60, // quà 199 xu → +300s
  299: 8 * 60,
  499: 12 * 60,
};

function startTimer(io, roomId) {
  if (timers[roomId]?.interval) return;

  timers[roomId] = {
    timeLeft: 0,
    interval: setInterval(() => {
      if (timers[roomId].timeLeft > 0) {
        timers[roomId].timeLeft--;
        io.to(roomId).emit("timeUpdate", timers[roomId].timeLeft);
      }
    }, 1000),
  };
}

function addTime(io, roomId, giftValue) {
  const add = giftValue || 0;

  if (!timers[roomId]) startTimer(io, roomId);

  timers[roomId].timeLeft += add;
  console.log();
  console.log(timers[roomId].timeLeft);
  io.to(roomId).emit("timeAdded", {
    added: add,
    timeLeft: timers[roomId].timeLeft,
  });
}

function resetTime(io, roomId) {
  if (!timers[roomId]) return;
  timers[roomId].timeLeft = 0;
  io.to(roomId).emit("timeReset");
}

function getTime(roomId) {
  return timers[roomId]?.timeLeft || 0;
}

module.exports = {
  startTimer,
  addTime,
  resetTime,
  getTime,
};
