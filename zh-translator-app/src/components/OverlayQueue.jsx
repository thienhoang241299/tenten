import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Music } from "lucide-react";
import { getSocketUrl } from "../utils/socketUrl";

export default function OverlayQueue() {
  const [queueState, setQueueState] = useState([]);

  useEffect(() => {
    // Transparent background for OBS
    document.body.style.backgroundColor = "transparent";
    
    const socket = io(getSocketUrl());
    
    socket.on("queue_update", (state) => {
      setQueueState(state);
    });

    return () => {
      document.body.style.backgroundColor = "";
      socket.disconnect();
    };
  }, []);

  // Always show all songs in queue
  const activeSongs = queueState;

  if (activeSongs.length === 0) return null;

  return (
    <div className="overlay-queue-container">
      <div className="overlay-queue-header">
        🎵 DANH SÁCH BÀI HÁT YÊU CẦU
      </div>
      <div className="overlay-queue-list">
        {activeSongs.map(item => (
          <div key={item.id} className="overlay-queue-item">
            <span className="overlay-queue-name">{item.name}</span>
            
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div className="overlay-queue-count-badge">
                x{item.count}
              </div>

              {item.image && (
                <img src={item.image} alt={item.expectedGift} className="overlay-queue-gift-img" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
