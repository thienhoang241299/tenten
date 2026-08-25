import React, { useEffect } from "react";
import tiktokGifts from "../utils/tiktokGifts.json";

export default function OverlayGiftTime() {
  useEffect(() => {
    // Transparent background for OBS
    document.body.style.backgroundColor = "transparent";
    
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  const gifts = [
    { name: "Thiên nga", time: "-10 Phút", image: tiktokGifts.find(g => g.id === "5897")?.image },
    { name: "Máy bay phản lực", time: "-60 Phút", image: tiktokGifts.find(g => g.id === "9500")?.image },
    { name: "Cá voi", time: "+20 Phút", image: tiktokGifts.find(g => g.id === "6820")?.image },
    { name: "Mèo Leon", time: "+60 Phút", image: tiktokGifts.find(g => g.id === "6646")?.image }
  ];

  return (
    <div className="overlay-queue-container">
      <div className="overlay-queue-header">
        ⏳ TẶNG QUÀ THÊM GIỜ LIVE
      </div>
      <div className="overlay-queue-list">
        {gifts.map((item, index) => (
          <div key={index} className="overlay-queue-item" style={{ justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {item.image && <img src={item.image} alt={item.name} className="overlay-queue-gift-img" />}
              <span className="overlay-queue-name" style={{ fontSize: "0.95rem" }}>{item.name}</span>
            </div>
            <div className="overlay-queue-count-badge" style={{ backgroundColor: "#8b5cf6", fontSize: "0.85rem", color: "white" }}>
              {item.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
