import { useEffect, useRef, useState } from "react";
import { WheelOfFortune } from "@matmachry/react-wheel-of-fortune";
import { io as ioClient } from "socket.io-client";
import { Gift, X } from "lucide-react";

// --- CÁC PHẦN TÙY CHỈNH (Spin Button và Pointer) ---

// Custom Pointer component: Đầu kim chỉ vào ô trúng thưởng
function PointerIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M20.05 17.65a3 3 0 0 0 1.2-2.4v-11a3 3 0 0 0-3-3h-12a3 3 0 0 0-3 3v11a3 3 0 0 0 1.2 2.4l6 4.5a3 3 0 0 0 3.6 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// --- CẤU HÌNH DỮ LIỆU ---

const punishmentsList = [
  "Ngửi chân 30s",
  "thụt xì dầu loăng quăng 15 cái",
  "hát bằng tiếng động vật",
  "nhảy bài 2p hơn",
  "búng mỏ 30 cái",
  "làm theo yêu cầu (yc chấp nhận được)",
  "điện giật 30s",
  "uống 1 ly nước",
  "im lặng 1p",
];

const segmentCount = punishmentsList.length;
const equalProbability = 1 / segmentCount;

const wheelPrizes = punishmentsList.map((punishment, index) => {
  const colors = [
    "#FFCDD2",
    "#B3E5FC",
    "#C8E6C9",
    "#FFECB3",
    "#D1C4E9",
    "#F5F5F5",
    "#FFE0B2",
    "#F8BBD0",
    "#CFD8DC",
  ];
  const color = colors[index % colors.length];

  return {
    key: punishment,
    color: color,
    prize: (
      <div className="flex flex-col items-center justify-center">
        <span className="max-w-[140px] font-bold text-sm text-gray-800 text-center break-words leading-tight">
          {punishment}
        </span>
      </div>
    ),
    probability: equalProbability,
    displayOrientation: "horizontal",
  };
});

// --- COMPONENT CHÍNH ---
export default function WheelGiftListener() {
  const wsRef = useRef(null);
  const fortuneWheelRef = useRef(null); // Ref để gọi hàm spin()
  const timeoutRef = useRef(null); // Ref để giữ ID của timeout
  const socketIoRef = useRef(null); // Ref cho socket.io client (test)

  const [status, setStatus] = useState("Disconnected");
  const [showWheel, setShowWheel] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null); // Kết quả là string key

  // --- Cấu hình test socket.io ---
  // Set true để bật kết nối tới backend socket.io test (ví dụ server trên port 3002)
  // Khi tắt (false) sẽ hoàn toàn giữ nguyên kết nối WebSocket cũ.
  const USE_TEST_SOCKETIO = true;
  // URL server socket.io (thay đổi nếu bạn chạy trên port khác)
  const SOCKETIO_URL = "http://165.154.248.208:3002";

  // Auto connect WebSocket (giữ nguyên logic hiện tại)
  useEffect(() => {
    connectWS();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Socket.IO test (không đụng vào logic hiện có)
  useEffect(() => {
    if (!USE_TEST_SOCKETIO) return;

    // Connect only once
    const socket = ioClient(SOCKETIO_URL, { transports: ["websocket"] });
    socketIoRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket.IO test connected:", socket.id);
    });

    // Lắng nghe sự kiện 'gift' (payload giống cấu trúc bạn broadcast từ backend)
    socket.on("gift", (payload) => {
      try {
        console.log("Socket.IO received gift:", payload);
        const data = payload?.data || payload;
        if (data?.repeatEnd === true) {
          const giftId = data?.giftId;
          if (giftId == 11046) {
            // Gọi startWheel() — giữ nguyên logic
            startWheel();
          }
        }
      } catch (err) {
        console.error("Error handling socket.io gift:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket.IO test disconnected");
    });

    return () => {
      if (socketIoRef.current) {
        socketIoRef.current.disconnect();
        socketIoRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // chạy 1 lần

  // Logic tự động đóng sau 10 giây khi có kết quả
  useEffect(() => {
    if (result) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        closeWheel();
      }, 10000);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [result]);

  const connectWS = () => {
    if (wsRef.current) return;

    const ws = new WebSocket("ws://localhost:21213/");
    wsRef.current = ws;

    ws.onopen = () => setStatus("Connected");
    ws.onclose = () => {
      setStatus("Disconnected");
      wsRef.current = null;
      setTimeout(connectWS, 1000);
    };
    ws.onerror = () => {
      setStatus("Error");
      wsRef.current = null;
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === "gift" && data.data?.repeatEnd === true) {
        console.log(data.data);
        const giftId = data.data?.giftId;
        if (giftId == 11046) {
          startWheel();
        }
      }
    };
  };

  const startWheel = () => {
    if (isSpinning) return;

    setShowWheel(true);
    setResult(null);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setTimeout(() => {
      fortuneWheelRef.current?.spin();
    }, 100);
  };

  const handleSpinStart = () => {
    setIsSpinning(true);
    setResult(null);
  };

  const handleSpinEnd = (prize) => {
    setIsSpinning(false);
    setResult(prize.key);
    console.log("Spin ended! Winner:", prize.key);
  };

  const closeWheel = () => {
    setShowWheel(false);
    setResult(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return (
    <div>
      {/* Status hiển thị nhỏ cho dev */}
      {/* <div className="fixed top-2 left-2 bg-black text-white px-3 py-1 rounded text-sm opacity-70">
        WS: {status}
      </div> */}

      {/* Vòng quay */}
      {showWheel && (
        <div className="fixed inset-0  flex items-center justify-center z-[99999]">
          <div className="rounded-xl p-6  w-[420px] h-[620px] max-w-full text-center relative">
            {/* SỬ DỤNG COMPONENT WheelOfFortune */}
            <div className="relative flex justify-center items-center">
              <WheelOfFortune
                className="w-[400px] h-[400px]"
                ref={fortuneWheelRef}
                prizes={wheelPrizes}
                wheelPointer={<PointerIcon className="text-red-600 size-10 " />}
                // Dùng null vì chúng ta kích hoạt quay bằng logic WebSocket/Socket.IO
                wheelSpinButton={null}
                onSpinStart={handleSpinStart}
                onSpinEnd={handleSpinEnd}
                animationDurationInMs={6000}
                useProbabilitiesToCalculateWinner={true}
              />
            </div>

            {/* Kết quả */}
            {result && !isSpinning && (
              <div className="mt-5">
                <div className="text-xl font-black text-red-600 mt-2 p-3 bg-red-50 rounded-lg border-2 border-red-300">
                  {result}
                </div>
              </div>
            )}

            {/* Nút quay tay (chỉ để kiểm tra logic) */}
            {!isSpinning && !result && (
              <button
                onClick={startWheel}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150"
              >
                Quay Test
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
