import axios from "axios";

export default function SongTable({ songs }) {
  const handleDelete = async (title) => {
    await axios.delete(
      `http://localhost:3002/songs/${encodeURIComponent(title)}`
    );
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-xl overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">📜 Danh sách bài hát</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="p-2">#</th>
            <th className="p-2">Tên bài hát</th>
            <th className="p-2 text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((s, i) => (
            <tr key={i} className="border-b border-gray-700 hover:bg-gray-700">
              <td className="p-2">{i + 1}</td>
              <td className="p-2">{s.title}</td>
              <td className="p-2 text-right">
                <button
                  onClick={() => handleDelete(s.title)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
