import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import OverlayPage from "./pages/OverlayPage";
import "./index.css";
import OverlayList from "./pages/OverlayList";
import Order from "./pages/Order";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/overlay" element={<OverlayPage />} />
      <Route path="/overlay-list" element={<OverlayList />} />
      <Route path="/order" element={<Order />} />
    </Routes>
  </BrowserRouter>
);
