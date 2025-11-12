import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import OverlayPage from "./pages/OverlayPage";
import "./index.css";
import OverlayList from "./pages/OverlayList";
import Order from "./pages/Order";
import ControlPage from "./pages/ControlPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/overlay" element={<OverlayPage />} />
      <Route path="/overlay-list" element={<OverlayList />} />
      <Route path="/order" element={<Order />} />
      <Route path="/control" element={<ControlPage />} />{" "}
      {/* Popup điều khiển */}
    </Routes>
  </BrowserRouter>
);
