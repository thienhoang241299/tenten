const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// --- Backend Server Logic ---
const expressApp = express();
const server = http.createServer(expressApp);

// Phục vụ các file tĩnh của React (để truy cập từ xa)
expressApp.use(express.static(path.join(__dirname, "dist")));

const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

// State
let timerState = {
  remainingSeconds: 7200, // 2 hours
  isRunning: false,
};

let queueState = [
  { id: '1', name: 'Xích linh', expectedGift: 'Súng bắn tiền', image: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/e0589e95a2b41970f0f30f6202f5fce6~tplv-obj.webp', count: 0 },
  { id: '2', name: 'Tay trái chỉ trăng', expectedGift: 'Thiên hà', image: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/resource/79a02148079526539f7599150da9fd28.png~tplv-obj.webp', count: 0 },
  { id: '3', name: 'Hỉ', expectedGift: 'Đám cưới', image: 'https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/0115cb20f6629dc50d39f6b747bddf73~tplv-obj.webp', count: 0 },
  { id: '4', name: 'Ưu tiên order', expectedGift: 'Hearts/Love you', image: 'https://p16-webcast.tiktokcdn.com/img/alisg/webcast-sg/resource/4ae998a21159b60484169864f8968ba9.png~tplv-obj.webp', count: 0 }
];

io.on("connection", (socket) => {
  // Send initial state
  socket.emit("timer_update", timerState);
  socket.emit("queue_update", queueState);

  socket.on("timer_action", (action) => {
    if (action.type === "ADD_TIME") {
      timerState.remainingSeconds += action.payload;
    } else if (action.type === "SUBTRACT_TIME") {
      timerState.remainingSeconds = Math.max(0, timerState.remainingSeconds - action.payload);
    } else if (action.type === "SET_RUNNING") {
      timerState.isRunning = action.payload;
    } else if (action.type === "SET_TIME") {
      timerState.remainingSeconds = action.payload;
    }
    io.emit("timer_update", timerState);
  });

  socket.on("queue_action", (action) => {
    if (action.type === "ADD_COUNT") {
      const item = queueState.find(q => q.id === action.payload.id);
      if (item) item.count += action.payload.amount || 1;
    } else if (action.type === "SUBTRACT_COUNT") {
      const item = queueState.find(q => q.id === action.payload.id);
      if (item) item.count = Math.max(0, item.count - (action.payload.amount || 1));
    }
    io.emit("queue_update", queueState);
  });
});

setInterval(() => {
  if (timerState.isRunning && timerState.remainingSeconds > 0) {
    timerState.remainingSeconds--;
    io.emit("timer_update", timerState);
  }
}, 1000);

expressApp.get("/api/translate", async (req, res) => {
  const { text, sourceLang = "zh-CN", target = "vi" } = req.query;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

expressApp.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

server.listen(4000, () => {
  console.log("Local overlay server running on port 4000");
});
// --- End Backend Server Logic ---

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 750,
    minWidth: 320,
    minHeight: 400,
    title: "Chương trình Dịch Tiếng Trung AI & Pinyin",
    backgroundColor: "#0f172a",
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    mainWindow.loadURL("http://localhost:4000");
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Giả lập User-Agent giống trình duyệt Chrome thường để không bị Google Translate chặn (lỗi 403)
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    }
  );

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('popup=true')) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 400,
          height: 650,
          autoHideMenuBar: true,
          alwaysOnTop: true,
          title: "Live Chat Translator"
        }
      };
    }
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
