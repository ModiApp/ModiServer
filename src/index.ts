import express from "express";
import socketio from "socket.io";
import http from "http";

// import createLobbyService from "./service/LobbyService";
import createGameService from "./service/GameService";
import { uniqueId } from "./util";

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// const LobbyService = createLobbyService(io);
const GameService = createGameService(io);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const zip = (arr1, arr2) => arr1.map((el, i) => [el, arr2[i]]);

// Lobby Service MVP
(() => {
  const lobbyIds = [];
  app.get("/lobbies/new", (req, res) => {
    const lobbyId = uniqueId(lobbyIds, 6);
    const nsp = io.of("/lobbies/" + lobbyId);

    const getConnected = () =>
      Object.entries(nsp.connected)
        .map(([id, socket]) => ({
          id,
          username: socket.handshake.query.username
        }))
        .filter(username => !!username);

    const sendStatus = () => {
      const connected = getConnected();
      nsp.emit("lobbyInfo", {
        connections: connected,
        lobbyLeader: connected[0]
      });
    };

    const removeNsp = () => {
      nsp.removeAllListeners();
      delete io.nsps["/lobbies/" + lobbyId];
    };

    nsp.on("connect", socket => {
      sendStatus();
      socket.on("disconnect", () => {
        sendStatus();
        !Object.values(nsp.connected).length && removeNsp();
      });
      socket.on("start", () => {
        const gameServer = GameService.createGameServer(getConnected().length);
        const authorizedPlayerIds = gameServer.getAuthorizedPlayerIds();

        zip(Object.entries(nsp.connected), authorizedPlayerIds).forEach(
          (socket, playerId) => {
            socket.send("event started", {
              nsp: gameServer.getNamespaceName(),
              playerId
            });
          }
        );
      });
    });
    res.json({ lobbyId });
  });
})();

// app.get("/lobbies/:id", (req, res) => {
//   const lobby = LobbyService.findById(req.params.id);
//   res.json({ lobby });
// });

server.listen(process.env.PORT || 5000);
