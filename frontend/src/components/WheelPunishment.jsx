import { useEffect, useRef, useState } from "react";
import { WheelOfFortune } from "@matmachry/react-wheel-of-fortune";
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

// Chuyển đổi thành định dạng data của thư viện (WheelOfFortunePrize)
const wheelPrizes = punishmentsList.map((punishment, index) => {
  // Màu sắc luân phiên cho các ô
  const colors = [
    "#FFCDD2", // Red A100 (Hồng nhạt)
    "#B3E5FC", // Light Blue A100 (Xanh da trời nhạt)
    "#C8E6C9", // Green A100 (Xanh lá nhạt)
    "#FFECB3", // Amber A100 (Vàng hổ phách nhạt)
    "#D1C4E9", // Deep Purple A100 (Tím đậm nhạt)
    "#F5F5F5", // Grey A100 (Xám nhạt)

    // Bổ sung 3 màu mới
    "#FFE0B2", // Orange A100 (Cam nhạt)
    "#F8BBD0", // Pink A100 (Hồng)
    "#CFD8DC", // Blue Grey A100 (Xanh xám nhạt)
  ];
  const color = colors[index % colors.length];

  return {
    key: punishment, // Dùng key làm tên hình phạt
    color: color,
    prize: (
      <div className="flex flex-col items-center justify-center">
        <span className="max-w-[140px] font-bold text-sm text-gray-800 text-center break-words leading-tight">
          {punishment}
        </span>
      </div>
    ),
    probability: equalProbability, // Xác suất đều nhau
    displayOrientation: "horizontal",
  };
});

// --- COMPONENT CHÍNH ---
export default function WheelGiftListener() {
  const wsRef = useRef(null);
  const fortuneWheelRef = useRef(null); // Ref để gọi hàm spin()
  const timeoutRef = useRef(null); // Ref để giữ ID của timeout

  const [status, setStatus] = useState("Disconnected");
  const [showWheel, setShowWheel] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null); // Kết quả là string key

  // Auto connect WebSocket
  useEffect(() => {
    connectWS();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Logic tự động đóng sau 10 giây khi có kết quả
  useEffect(() => {
    if (result) {
      // Xóa timeout cũ nếu có
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Đặt timeout mới: 10000ms = 10 giây
      timeoutRef.current = setTimeout(() => {
        closeWheel();
      }, 10000);
    } else {
      // Nếu không có result, xóa timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    // Cleanup function để xóa timeout khi component bị unmount hoặc effect chạy lại
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [result]); // Phụ thuộc vào result

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
        if (giftId != 123) {
          startWheel();
        }
      }
    };
  };

  const startWheel = () => {
    if (isSpinning) return;

    setShowWheel(true);
    setResult(null);

    // Xóa timeout trước khi quay (nếu có)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Kích hoạt quay
    setTimeout(() => {
      // Gọi hàm spin() từ ref
      fortuneWheelRef.current?.spin();
    }, 100);
  };

  const handleSpinStart = () => {
    setIsSpinning(true);
    setResult(null);
  };

  const handleSpinEnd = (prize) => {
    setIsSpinning(false);
    // Kết quả là key của giải thưởng, sẽ kích hoạt useEffect [result]
    setResult(prize.key);
    console.log("Spin ended! Winner:", prize.key);
  };

  const closeWheel = () => {
    setShowWheel(false);
    setResult(null);
    // Xóa timeout khi đóng thủ công
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
            {/* Nút đóng */}

            {/* SỬ DỤNG COMPONENT WheelOfFortune */}
            <div className="relative flex justify-center items-center">
              <WheelOfFortune
                className="w-[400px] h-[400px]"
                ref={fortuneWheelRef}
                prizes={wheelPrizes}
                wheelPointer={<PointerIcon className="text-red-600 size-10 " />}
                // Dùng null vì chúng ta kích hoạt quay bằng logic WebSocket
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
                {/* Đếm ngược hoặc thông báo tự động tắt */}
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
