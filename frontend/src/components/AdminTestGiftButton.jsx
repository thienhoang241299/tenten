import React, { useState } from "react";

/**
 * AdminTestGiftButton
 *
 * Props:
 * - apiBase (string) default "http://165.154.248.208:3002"
 * - method ("GET" | "POST") default "GET"
 * - giftId (number) default 11046
 * - repeatEnd (boolean) default true
 *
 * Behavior:
 * - Khi bấm: gọi `${apiBase}/test/gift` theo method đã chọn.
 * - Hiển thị trạng thái (loading, success, error) và response JSON.
 *
 * Usage: import và đặt trên trang điều khiển (admin) của bạn.
 */
export default function AdminTestGiftButton({
  apiBase = "http://165.154.248.208:3002",
  method = "GET",
  giftId = 11046,
  repeatEnd = true,
}) {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);

  const sendTestGift = async () => {
    setLoading(true);
    setError(null);
    setLastResult(null);

    try {
      let res;
      if (method === "GET") {
        res = await fetch(`${apiBase}/test/gift`);
      } else {
        res = await fetch(`${apiBase}/test/gift`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            giftId: Number(giftId),
            repeatEnd: Boolean(repeatEnd),
          }),
        });
      }

      const text = await res.text();
      // Try parse JSON, fallback to plain text
      let payload;
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }

      if (!res.ok) {
        setError({ status: res.status, body: payload });
      } else {
        setLastResult({ status: res.status, body: payload });
      }
    } catch (err) {
      setError({ message: err.message || String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{}}>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={sendTestGift} disabled={loading}>
          {loading ? "Sending..." : `Test Gift`}
        </button>
      </div>
    </div>
  );
}
