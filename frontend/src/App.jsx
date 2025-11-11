import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import SongOverlay from "./components/SongOverlay";
import SongTable from "./components/SongTable";
import SongAutocomplete from "./components/SongAutocomplete";

const socket = io("http://localhost:3002");

export default function App() {
  const [songs, setSongs] = useState([]);
  const [current, setCurrent] = useState(null);
  const [next, setNext] = useState(null);
  const [newSong, setNewSong] = useState("");
  const [selectedCurrent, setSelectedCurrent] = useState("");
  const [selectedNext, setSelectedNext] = useState("");

  useEffect(() => {
    axios.get("http://localhost:3002/songs").then((res) => setSongs(res.data));

    socket.on("songChange", ({ current, next }) => {
      setCurrent(current);
      setNext(next);
    });

    socket.on("songsUpdate", (data) => setSongs(data));
  }, []);

  const handleAddSong = async (e) => {
    e.preventDefault();
    if (!newSong.trim()) return;
    await axios.post("http://localhost:3002/songs", { title: newSong });
    setNewSong("");
  };

  const handleSaveSelection = async () => {
    const c = songs.find((s) => s.title === selectedCurrent);
    const n = songs.find((s) => s.title === selectedNext);
    await axios.post("http://localhost:3002/current", { current: c, next: n });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">🎵 Overlay Bài Hát</h1>

      <SongOverlay current={current} next={next} />

      <div className="grid md:grid-cols-2 gap-8">
        <SongTable songs={songs} />

        <div className="bg-gray-800 p-6 rounded-2xl space-y-4">
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

          {/* Chọn bài hát có gợi ý */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">
              🎤 Chọn bài hát hiển thị
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Bài đang hát</label>
                <SongAutocomplete
                  placeholder="Nhập để chọn bài..."
                  songs={songs}
                  value={selectedCurrent}
                  onChange={setSelectedCurrent}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Bài tiếp theo</label>
                <SongAutocomplete
                  placeholder="Nhập để chọn bài..."
                  songs={songs}
                  value={selectedNext}
                  onChange={setSelectedNext}
                />
              </div>

              <button
                onClick={handleSaveSelection}
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded font-semibold w-full"
              >
                Lưu hiển thị
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
