export default function SongOverlay({ current, next }) {
  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-xl text-center">
      <h2 className="text-xl font-semibold mb-2">🎶 Bài đang hát</h2>
      <p className="text-2xl font-bold">{current?.title || "Chưa chọn"}</p>

      <hr className="my-4 border-gray-700" />

      <h2 className="text-xl font-semibold mb-2">⏭️ Bài tiếp theo</h2>
      <p className="text-xl">{next?.title || "Chưa có"}</p>
    </div>
  );
}
