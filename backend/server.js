import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

import songsRoute from "./routes/songs.route.js";
import translateRoute from "./routes/translate.route.js";
import actionsRoute from "./routes/actions.route.js";

import socketHandler from "./config/socket.js";
import playlistRoute from "./routes/playlist.route.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/songs", songsRoute);
app.use("/translate", translateRoute);
app.use("/action", actionsRoute);
app.use("/playlist", playlistRoute);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

socketHandler(io);

const PORT = 3002;
server.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
