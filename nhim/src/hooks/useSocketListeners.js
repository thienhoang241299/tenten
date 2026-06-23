// useSocketListeners.js
import { useEffect, useRef } from "react";
import { io as ioClient } from "socket.io-client";

/**
 * useSocketListeners
 * - onGift(payload): callback when gift received
 * - config: { rawWsUrl, useSocketIo, socketIoUrl }
 */
export default function useSocketListeners(onGift, config = {}) {
  const {
    rawWsUrl = "ws://localhost:21213/",
    useSocketIo = false,
    socketIoUrl = "https://api.catcover.site",
  } = config;
  const wsRef = useRef(null);
  const socketIoRef = useRef(null);

  useEffect(() => {
    // RAW WebSocket
    const connectWS = () => {
      if (wsRef.current) return;
      try {
        const ws = new WebSocket(rawWsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          // console.log("raw ws open");
        };
        ws.onclose = () => {
          wsRef.current = null;
          setTimeout(connectWS, 1000);
        };
        ws.onerror = () => {
          wsRef.current = null;
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data?.event === "gift") {
              onGift && onGift(data);
            }
          } catch (e) {
            // ignore parse errors
          }
        };
      } catch (err) {
        // ignore
      }
    };

    connectWS();

    return () => {
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {}
        wsRef.current = null;
      }
    };
  }, [rawWsUrl, onGift]);

  useEffect(() => {
    if (!useSocketIo) return;
    // Socket.IO client for test (optional)
    const socket = ioClient(socketIoUrl, { transports: ["websocket"] });
    socketIoRef.current = socket;

    socket.on("gift", (payload) => {
      onGift && onGift(payload);
    });

    socket.on("disconnect", () => {
      // console.log("socket.io disconnected");
    });

    return () => {
      if (socketIoRef.current) {
        socketIoRef.current.disconnect();
        socketIoRef.current = null;
      }
    };
  }, [useSocketIo, socketIoUrl, onGift]);
}
