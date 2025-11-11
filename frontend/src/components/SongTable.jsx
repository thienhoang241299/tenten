import axios from "axios";
import { useState } from "react";

export default function SongTable({ songs }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (title) => {
    if (!confirm(`Bạn có chắc muốn xóa bài "${title}" không?`)) return;
    setLoading(true);
    try {
      await axios.delete(
        `http://165.154.248.208:3002/songs/${encodeURIComponent(title)}`
      );
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa bài hát!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-xl">
      <h2 className="text-xl font-semibold mb-4">📜 Danh sách bài hát</h2>

      {/* Giới hạn chiều cao + thanh cuộn */}
      <div className="max-h-[500px] overflow-y-auto rounded-lg border border-gray-700">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-gray-900 z-10">
            <tr className="border-b border-gray-700">
              <th className="p-2 w-12">#</th>
              <th className="p-2">Tên bài hát</th>
              <th className="p-2 text-right w-24">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((s, i) => (
              <tr
                key={i}
                className="border-b border-gray-700 hover:bg-gray-700 transition-colors"
              >
                <td className="p-2 text-center">{i + 1}</td>
                <td className="p-2">{s.title}</td>
                <td className="p-2 text-right">
                  <button
                    disabled={loading}
                    onClick={() => handleDelete(s.title)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
