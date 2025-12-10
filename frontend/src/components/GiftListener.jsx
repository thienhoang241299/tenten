import { useEffect, useRef, useState } from "react";

export default function WheelGiftListener() {
  const wsRef = useRef(null);
  const wheelRef = useRef(null);

  const [status, setStatus] = useState("Disconnected");
  const [showWheel, setShowWheel] = useState(false);
  const [result, setResult] = useState(null);

  // Danh sách hình phạt
  const punishments = [
    "Nhảy 10 giây",
    "Hát 1 câu",
    "Uống 1 ngụm nước",
    "Lắc đầu 20 cái",
    "Hít đất 5 cái",
    "Quay lại lần nữa",
  ];

  // Auto connect WebSocket
  useEffect(() => {
    connectWS();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

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
        const giftId = data.data?.giftId;
        console.log("Received Gift:", data.data);

        if (giftId === 123) {
          startWheel();
        }
      }
    };
  };

  const startWheel = () => {
    setShowWheel(true);
    setResult(null);

    setTimeout(() => {
      spinWheel();
    }, 300);
  };

  const spinWheel = () => {
    if (!wheelRef.current) return;

    const segmentCount = punishments.length;
    const index = Math.floor(Math.random() * segmentCount);

    const degree = 360 * 5 + (360 / segmentCount) * index;

    wheelRef.current.style.transition = "transform 4s ease-out";
    wheelRef.current.style.transform = `rotate(${degree}deg)`;

    setTimeout(() => {
      setResult(punishments[index]);
    }, 4000);
  };

  const closeWheel = () => {
    setShowWheel(false);
    setResult(null);
  };

  return (
    <div>
      {/* Status hiển thị nhỏ cho dev */}
      <div className="fixed top-2 left-2 bg-black text-white px-3 py-1 rounded text-sm opacity-70">
        WS: {status}
      </div>

      {/* Vòng quay */}
      {showWheel && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-xl p-6 shadow-2xl w-[380px] text-center">
            <h2 className="text-xl font-bold mb-4">Vòng quay hình phạt</h2>

            {/* Wheel container */}
            <div className="relative flex justify-center items-center">
              {/* Pointer */}
              <div className="absolute top-[-10px] w-0 h-0 border-l-[15px] border-r-[15px] border-b-[25px] border-l-transparent border-r-transparent border-b-red-600 z-20"></div>

              {/* Wheel */}
              <div
                ref={wheelRef}
                className="relative w-64 h-64 rounded-full border-4 border-gray-300 overflow-hidden"
              >
                {punishments.map((p, i) => {
                  const rotateDeg = (360 / punishments.length) * i;

                  return (
                    <div
                      key={i}
                      className="absolute inset-0 flex items-center justify-center origin-center"
                      style={{
                        transform: `rotate(${rotateDeg}deg)`,
                      }}
                    >
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-300 opacity-40"
                        style={{
                          clipPath: "polygon(50% 50%, 100% 0, 100% 100%)",
                        }}
                      ></div>

                      <span
                        className="absolute text-sm font-semibold"
                        style={{
                          transform: "rotate(90deg) translateY(-110px)",
                        }}
                      >
                        {p}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kết quả */}
            {result && (
              <div className="mt-5">
                <h3 className="text-lg font-semibold">Kết quả:</h3>
                <div className="text-xl font-bold text-red-600 mt-2">
                  {result}
                </div>

                <button
                  onClick={closeWheel}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Đóng
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
