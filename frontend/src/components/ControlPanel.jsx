import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import SongAutocomplete from "./SongAutocomplete";

const API_URL = "http://165.154.248.208:3002";
const socket = io(API_URL);

export default function ControlPanel() {
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

  const handleAddSong = async (e) => {
    e.preventDefault();
    if (!newSong.trim()) return;
    await axios.post(`${API_URL}/songs`, { title: newSong });
    setNewSong("");
  };

  const handleSaveSelection = async () => {
    const normalize = (s) =>
      s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

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

      const payload = { nextList: newNextList };
      if (selectedCurrent) payload.current = currentObj;

      await axios.post(`${API_URL}/current`, payload);

      setSelectedNext("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleNextToCurrent = async (title) =>
    await axios.post(`${API_URL}/action`, { type: "nextToCurrent", title });

  const handleRemoveFromQueue = async (title) =>
    await axios.delete(`${API_URL}/next/${encodeURIComponent(title)}`);

  const handleClearQueue = async () =>
    await axios.post(`${API_URL}/action`, { type: "clearNext" });

  const handleClearCurrent = async () =>
    await axios.post(`${API_URL}/action`, { type: "clearCurrent" });

  return (
    <div className="bg-gray-900 text-white p-6 space-y-6 w-[600px] rounded-2xl">
      <h1 className="text-2xl font-bold text-center">🎛️ Điều khiển bài hát</h1>
      <h2 className="text-xl text-center font-semibold mb-2">
        Bài tiếp theo :{" "}
        {Array.isArray(nextList) && nextList.length > 0
          ? nextList[0].title
          : "Chưa có bài tiếp theo"}
      </h2>
      <div className="flex justify-center mb-3">
        <button
          onClick={() =>
            axios.post(`${API_URL}/action`, { type: "nextToCurrent" })
          }
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-semibold"
        >
          ⏭️ Chuyển bài nhanh
        </button>
      </div>
      {/* Bài tiếp theo */}
      <div>
        <h2 className="font-semibold mb-1">📜 Danh sách chờ</h2>
        <SongAutocomplete
          songs={songs}
          value={selectedNext}
          onChange={setSelectedNext}
          placeholder="Nhập bài để thêm vào danh sách..."
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSaveSelection}
            className="flex-1 bg-green-600 px-3 py-1 rounded hover:bg-green-700"
          >
            ➕ Thêm
          </button>
          <button
            onClick={handleClearQueue}
            className="flex-1 bg-orange-500 px-3 py-1 rounded hover:bg-orange-600"
          >
            ❌ Xóa tất cả
          </button>
        </div>

        {nextList.length > 0 && (
          <ul className="mt-3 space-y-2">
            {nextList.map((s, i) => (
              <li
                key={i}
                className="flex justify-between items-center bg-gray-700 px-3 py-2 rounded"
              >
                <span>{s.title}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleNextToCurrent(s.title)}
                    className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
                  >
                    ⏭️
                  </button>
                  <button
                    onClick={() => handleRemoveFromQueue(s.title)}
                    className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                  >
                    ❌
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bài đang hát */}
      <div>
        <h2 className="font-semibold mb-1">🎤 Bài đang hát</h2>
        <SongAutocomplete
          songs={songs}
          value={selectedCurrent}
          onChange={setSelectedCurrent}
          placeholder="Chọn bài hát..."
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleClearCurrent}
            className="flex-1 bg-yellow-500 px-3 py-1 rounded hover:bg-yellow-600"
          >
            🔘 Hủy bài
          </button>
          <button
            onClick={handleSaveSelection}
            className="flex-1 bg-green-500 px-3 py-1 rounded hover:bg-green-600"
          >
            💾 Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
