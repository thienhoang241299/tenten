import React, { useState, useEffect } from "react";
import { Play, Pause, Plus, Minus, RotateCcw, Check, Music } from "lucide-react";
import { io } from "socket.io-client";
import { getSocketUrl } from "../utils/socketUrl";

export default function ControlPanel() {
  const [timerState, setTimerState] = useState({ remainingSeconds: 7200, isRunning: false });
  const [queueState, setQueueState] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(getSocketUrl());
    setSocket(newSocket);

    newSocket.on("timer_update", (state) => {
      setTimerState(state);
    });

    newSocket.on("queue_update", (state) => {
      setQueueState(state);
    });

    return () => newSocket.disconnect();
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTimerAction = (type, payload = null) => {
    if (socket) {
      socket.emit("timer_action", { type, payload });
    }
  };

  const handleQueueAction = (type, id, amount = 1) => {
    if (socket) {
      socket.emit("queue_action", { type, payload: { id, amount } });
    }
  };

  return (
    <div className="control-panel">
      <div className="cp-section">
        <h2 className="cp-title">Quản Lý Thời Gian Live</h2>
        <div className="cp-timer-display">{formatTime(timerState.remainingSeconds)}</div>
        <div className="cp-timer-controls">
          <button 
            className={`cp-btn ${timerState.isRunning ? 'cp-btn-warning' : 'cp-btn-success'}`}
            onClick={() => handleTimerAction("SET_RUNNING", !timerState.isRunning)}
          >
            {timerState.isRunning ? <><Pause size={16}/> Tạm Dừng</> : <><Play size={16}/> Bắt Đầu</>}
          </button>
          <button className="cp-btn cp-btn-secondary" onClick={() => handleTimerAction("ADD_TIME", 300)}>+5 Phút</button>
          <button className="cp-btn cp-btn-secondary" onClick={() => handleTimerAction("ADD_TIME", 1200)}>+20 Phút</button>
          <button className="cp-btn cp-btn-secondary" onClick={() => handleTimerAction("ADD_TIME", 3600)}>+1 Giờ</button>
          <button className="cp-btn cp-btn-danger" onClick={() => handleTimerAction("SUBTRACT_TIME", 60)}>-1 Phút</button>
          <button className="cp-btn cp-btn-danger" onClick={() => handleTimerAction("SET_TIME", 7200)}><RotateCcw size={16}/> Reset 2h</button>
        </div>
      </div>

      <div className="cp-section">
        <h2 className="cp-title">Danh Sách Bài Hát / Quà Tặng</h2>
        <div className="cp-queue-list">
          {queueState.map(item => (
            <div key={item.id} className="cp-queue-item">
              <div className="cp-queue-info">
                <Music size={16} className="cp-icon" />
                <span className="cp-song-name">{item.name}</span>
                <span className="cp-gift-name">({item.expectedGift})</span>
              </div>
              <div className="cp-queue-actions">
                <button className="cp-btn-icon" onClick={() => handleQueueAction("SUBTRACT_COUNT", item.id)} disabled={item.count === 0}>
                  <Minus size={14} />
                </button>
                <span className="cp-count">{item.count}</span>
                <button className="cp-btn-icon" onClick={() => handleQueueAction("ADD_COUNT", item.id)}>
                  <Plus size={14} />
                </button>
                <button 
                  className="cp-btn cp-btn-success cp-btn-small" 
                  onClick={() => handleQueueAction("SUBTRACT_COUNT", item.id)}
                  disabled={item.count === 0}
                >
                  <Check size={14}/> Đã Hát
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
