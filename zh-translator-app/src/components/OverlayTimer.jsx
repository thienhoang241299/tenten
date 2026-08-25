import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { getSocketUrl } from "../utils/socketUrl";

export default function OverlayTimer() {
  const [timerState, setTimerState] = useState({ remainingSeconds: 0, isRunning: false });

  useEffect(() => {
    // Transparent background for OBS
    document.body.style.backgroundColor = "transparent";
    
    const socket = io(getSocketUrl());
    
    socket.on("timer_update", (state) => {
      setTimerState(state);
    });

    return () => {
      document.body.style.backgroundColor = "";
      socket.disconnect();
    };
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="overlay-timer-container">
      <div className="overlay-timer-box">
        <span className="overlay-timer-label">LIVE TIME</span>
        <span className={`overlay-timer-value ${timerState.remainingSeconds <= 300 ? 'warning' : ''}`}>
          {formatTime(timerState.remainingSeconds)}
        </span>
      </div>
    </div>
  );
}
