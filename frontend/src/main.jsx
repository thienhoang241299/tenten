// ===============================
// 🔧 FIX crypto.randomUUID() cho môi trường build/WebView cũ
// ===============================
if (!globalThis.crypto?.randomUUID) {
  globalThis.crypto = globalThis.crypto || {};
  globalThis.crypto.randomUUID = function () {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
}
// ===============================

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import OverlayPage from "./pages/OverlayPage";
import "./index.css";
import OverlayList from "./pages/OverlayList";
import Order from "./pages/Order";
import ControlPage from "./pages/ControlPage";
import GiftTimer from "./pages/GiftTimer";
import ChatReceiver from "./components/ChatReceiver";
import OverlaySubList from "./pages/OverlaySubPlaylist";
import WheelPunishmentPage from "./pages/WheelPunishmentPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/overlay" element={<OverlayPage />} />
      <Route path="/overlay-list" element={<OverlayList />} />
      <Route path="/overlay-list/:playlist" element={<OverlaySubList />} />
      <Route path="/order" element={<Order />} />
      <Route path="/control" element={<ControlPage />} />
      <Route path="/timer" element={<GiftTimer />} />
      <Route path="/chat" element={<ChatReceiver />} />
      <Route path="/wheel" element={<WheelPunishmentPage />} />
    </Routes>
  </BrowserRouter>
);
