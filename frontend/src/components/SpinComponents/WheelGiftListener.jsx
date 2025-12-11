import React, { useRef, useState, useEffect } from "react";
import SpinWheelControlled, { SPIN_DURATION_MS } from "./SpinWheelControlled";
import useSocketListeners from "../../hooks/useSocketListeners";
import { data } from "react-router-dom";

/**
 * WheelGiftListener
 * - Không thay đổi logic: raw WS connect + optional Socket.IO test
 * - Exposes USE_TEST_SOCKETIO toggle here
 */
export default function WheelGiftListener() {
  const spinRef = useRef(null);
  const timeoutRef = useRef(null);

  const [showWheel, setShowWheel] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);

  // Toggle Socket.IO test listener (true => listen socket.io://localhost:3002)
  const USE_TEST_SOCKETIO = true;

  // onGift callback used by hook
  const onGift = (payload) => {
    console.log(payload.data?.repeatEnd);
    try {
      const data = payload?.data || payload;
      console.log(data);
      console.log(data.repeatEnd == true);
      data?.repeatEnd == true && data?.giftId == 11046 && startWheel();
      //   if (data.repeatEnd == true) {
      //     console.log(giftId);
      //     const giftId = data?.giftId;
      //     if (giftId == 5655) {
      //       startWheel();
      //     }
      //   }
    } catch (e) {
      console.console.error("Error handling gift payload:", e);
    }
  };

  // Attach listeners (raw WS + optional socket.io)
  useSocketListeners(onGift, {
    rawWsUrl: "ws://localhost:21213/",
    useSocketIo: USE_TEST_SOCKETIO,
    socketIoUrl: "http://165.154.248.208:3002",
  });

  // auto-close behavior
  useEffect(() => {
    if (result) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => closeWheel(), 10000);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [result]);

  const startWheel = () => {
    if (isSpinning) return;
    setShowWheel(true);
    setResult(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setTimeout(() => {
      spinRef.current?.spin();
    }, 100);
  };

  const handleSpinStart = () => {
    setIsSpinning(true);
    setResult(null);
  };

  const handleSpinEnd = (prize) => {
    setIsSpinning(false);
    const key = prize?.key ?? String(prize);
    setResult(key);
    console.log("Spin ended! Winner:", key);
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
      {/* Optional small dev status (comment out if not needed) */}
      {/* <div className="fixed top-2 left-2 bg-black text-white px-3 py-1 rounded text-sm opacity-70">WS: ...</div> */}

      {showWheel && (
        <div className="fixed inset-0 flex items-center justify-center z-[99999]">
          <div className="rounded-xl p-6 w-[420px] h-[620px] max-w-full text-center relative ">
            {/* <button
              onClick={closeWheel}
              aria-label="Close"
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
              style={{ border: "1px solid #eee" }}
            >
              ✕
            </button> */}

            <div className="overflow-y-hidden">
              <SpinWheelControlled
                ref={spinRef}
                onSpinStart={handleSpinStart}
                onSpinEnd={handleSpinEnd}
              />
            </div>

            {/* Result */}
            {result && !isSpinning && (
              <div className="mt-3">
                <div className="text-xl font-black text-red-600 mt-2 p-3 bg-red-50 rounded-lg border-2 border-red-300">
                  {result}
                </div>
              </div>
            )}

            {/* Manual test button inside modal */}
            {/* {!isSpinning && !result && (
              <div className="mt-4">
                <button
                  onClick={startWheel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150"
                >
                  Quay Test
                </button>
              </div>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
}
