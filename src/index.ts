import express from "express";
import socketio from "socket.io";
import http from "http";

import createLobbyService from "./service/LobbyService";
import createGameService from "./service/GameService";

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const LobbyService = createLobbyService(io);
const GameService = createGameService(io);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/lobbies/new", (req, res) => {
  const onStartEventTriggered = GameService.createGameServer;
  const lobbyId = LobbyService.createLobby(onStartEventTriggered);
  res.json({ lobbyId });
});

app.get("/lobbies/:id", (req, res) => {
  const lobby = LobbyService.findById(req.params.id);
  res.json({ lobby });
});

server.listen(process.env.PORT || 5000);
