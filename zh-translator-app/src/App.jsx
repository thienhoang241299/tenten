import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainApp from "./MainApp";
import OverlayTimer from "./components/OverlayTimer";
import OverlayQueue from "./components/OverlayQueue";
import OverlayGiftTime from "./components/OverlayGiftTime";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/timer" element={<OverlayTimer />} />
        <Route path="/queue" element={<OverlayQueue />} />
        <Route path="/gift-time" element={<OverlayGiftTime />} />
      </Routes>
    </BrowserRouter>
  );
}
