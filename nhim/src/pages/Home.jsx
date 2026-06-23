import io from "socket.io-client";

const API_URL = "https://api.catcover.site";
const socket = io(API_URL);

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-8">
      <div>
        <button
          onClick={() =>
            window.open("/chat", "controlPanel", "width=650,height=800")
          }
          className="fixed top-22 right-1/2 bg-blue-600 px-4 py-3 rounded-lg text-white font-semibold shadow-lg"
        >
          🎛️ Mở dịch chat
        </button>
      </div>
    </div>
  );
}
