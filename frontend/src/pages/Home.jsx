import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import SongOverlay from "../components/SongOverlay";
import SongTable from "../components/SongTable";
import SongAutocomplete from "../components/SongAutocomplete";

const API_URL = "http://165.154.248.208:3002";
const socket = io(API_URL);

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [current, setCurrent] = useState(null);
  const [nextList, setNextList] = useState([]);
  const [newSong, setNewSong] = useState("");
  const [selectedCurrent, setSelectedCurrent] = useState("");
  const [selectedNext, setSelectedNext] = useState("");

  useEffect(() => {
    axios.get(`${API_URL}/songs`).then((res) => setSongs(res.data));

    socket.on("songChange", ({ current, nextList }) => {
      setCurrent(current);
      setNextList(nextList || []);
    });

    socket.on("songsUpdate", (data) => setSongs(data));

    return () => {
      socket.off("songChange");
      socket.off("songsUpdate");
    };
  }, []);

  const normalize = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const handleAddSong = async (e) => {
    e.preventDefault();
    if (!newSong.trim()) return;
    await axios.post(`${API_URL}/songs`, { title: newSong });
    setNewSong("");
  };

  // 💾 Lưu bài đang hát và thêm bài vào list chờ
  const handleSaveSelection = async () => {
    try {
      if (
        selectedCurrent &&
        !songs.find((s) => normalize(s.title) === normalize(selectedCurrent))
      ) {
        await axios.post(`${API_URL}/songs`, { title: selectedCurrent });
      }

      if (
        selectedNext &&
        !songs.find((s) => normalize(s.title) === normalize(selectedNext))
      ) {
        await axios.post(`${API_URL}/songs`, { title: selectedNext });
      }

      const updatedSongs = (await axios.get(`${API_URL}/songs`)).data;
      setSongs(updatedSongs);

      const currentObj =
        updatedSongs.find((s) => s.title === selectedCurrent) || null;
      const nextObj =
        updatedSongs.find((s) => s.title === selectedNext) || null;

      const newNextList = nextObj
        ? [...nextList, nextObj].filter(
            (v, i, arr) => arr.findIndex((a) => a.title === v.title) === i
          )
        : nextList;

      // 🧠 Không ép current = null khi người dùng chỉ thêm bài chờ
      const payload = { nextList: newNextList };
      if (selectedCurrent) payload.current = currentObj;

      await axios.post(`${API_URL}/current`, payload);
    } catch (err) {
      console.error("Lỗi khi lưu bài hát:", err);
    }
  };

  // ⏭️ Phát bài bất kỳ trong danh sách chờ
  const handleNextToCurrent = async (title) => {
    await axios.post(`${API_URL}/action`, {
      type: "nextToCurrent",
      title,
    });
  };

  // ❌ Xóa bài khỏi danh sách chờ
  const handleRemoveFromQueue = async (title) => {
    await axios.delete(`${API_URL}/next/${encodeURIComponent(title)}`);
  };

  // 🔘 Xóa tất cả danh sách chờ
  const handleClearQueue = async () => {
    await axios.post(`${API_URL}/action`, { type: "clearNext" });
  };

  // 🔘 Hủy bài đang hát
  const handleClearCurrent = async () => {
    await axios.post(`${API_URL}/action`, { type: "clearCurrent" });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">🎵 Overlay Bài Hát</h1>

      <SongOverlay current={current} next={nextList} />

      <div className="grid md:grid-cols-2 gap-8">
        <SongTable songs={songs} />

        {/* Form thêm và chọn bài hát */}
        <div className="bg-gray-800 p-6 rounded-2xl space-y-4">
          {/* Bài tiếp theo */}
          <div>
            <h2 className="text-xl font-semibold mb-2">📜 Thêm bài chờ</h2>
            <SongAutocomplete
              placeholder="Nhập để thêm vào list chờ..."
              songs={songs}
              value={selectedNext}
              onChange={setSelectedNext}
            />

            <div className="flex gap-2 mt-2 justify-center">
              <button
                onClick={handleClearQueue}
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded font-semibold w-1/3"
              >
                🔘 Xóa tất cả
              </button>
              <button
                onClick={handleSaveSelection}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold w-1/3"
              >
                ➕ Thêm vào list
              </button>
            </div>
          </div>
          {/* Danh sách chờ */}
          <div>
            <h2 className="text-xl font-semibold mt-6 mb-2">
              🎶 Danh sách chờ
            </h2>

            {nextList.length === 0 ? (
              <p className="text-gray-400 italic">
                Chưa có bài nào trong list.
              </p>
            ) : (
              <>
                {/* Nút chuyển bài đầu tiên */}
                <div className="flex justify-center mb-3">
                  <button
                    onClick={() =>
                      axios.post(`${API_URL}/action`, { type: "nextToCurrent" })
                    }
                    className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-semibold"
                  >
                    ⏭️ Chuyển bài đầu tiên
                  </button>
                </div>

                <ul className="space-y-2">
                  {nextList.map((song, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-gray-700 px-3 py-2 rounded-lg"
                    >
                      <span className="truncate max-w-[65%]">{song.title}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleNextToCurrent(song.title)}
                          className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm"
                        >
                          ⏭️ Phát
                        </button>
                        <button
                          onClick={() => handleRemoveFromQueue(song.title)}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
                        >
                          ❌
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Hiển thị chọn bài */}
          <div className="mt-6 space-y-6">
            {/* Bài đang hát */}
            <div>
              <h2 className="text-xl font-semibold mb-2">🎤 Bài đang hát</h2>
              <SongAutocomplete
                placeholder="Nhập để chọn bài..."
                songs={songs}
                value={selectedCurrent}
                onChange={setSelectedCurrent}
              />

              <div className="flex gap-2 mt-2 justify-center ">
                <button
                  onClick={handleClearCurrent}
                  className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded font-semibold w-1/3"
                >
                  🔘 Hủy bài
                </button>
                <button
                  onClick={handleSaveSelection}
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded font-semibold w-1/3"
                >
                  💾 Lưu
                </button>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">➕ Thêm bài hát</h2>
          <form onSubmit={handleAddSong} className="space-y-2">
            <input
              className="w-full p-2 rounded bg-gray-700 text-white"
              placeholder="Nhập tên bài hát"
              value={newSong}
              onChange={(e) => setNewSong(e.target.value)}
            />
            <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded font-semibold w-full">
              Thêm bài hát
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
