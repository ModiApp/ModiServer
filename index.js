const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const createLobbyService = require('./src/service/LobbyService');
const { PORT } = process.env;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const LobbyService = createLobbyService(io);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/lobbies/new', (req, res) => {
  const lobbyId = LobbyService.createLobby();
  res.json({ lobbyId });
});

app.get('/lobbies/:id', (req, res) => {
  const lobby = LobbyService.findById(req.params.id);
  res.json({ lobby });
});

server.listen(PORT || 5000);