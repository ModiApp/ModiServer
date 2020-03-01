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

// Lobby Controller MVP
(() => {
  const lobbyIds = [];
  app.get("/lobbies/new", (req, res) => {
    const lobbyId = uniqueId(lobbyIds, 3);
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
      nsp.emit("lobby info", {
        connections: connected,
        lobbyLeader: connected[0]
      });
    };

    const removeNsp = (() => {
      let isAlreadyScheduledForRemoval = false;

      const remove = () => {
        if (isLobbyEmpty()) {
          nsp.removeAllListeners();
          delete io.nsps["/lobbies/" + lobbyId];
          lobbyIds.splice(lobbyIds.findIndex(id => id === lobbyId));
        } else {
          isAlreadyScheduledForRemoval = false;
        }
      };

      return () => {
        if (!isAlreadyScheduledForRemoval) {
          setTimeout(remove, 1000 * 60 * 5); // wait five min before removing
          isAlreadyScheduledForRemoval = true;
        }
      };
    })();

    const isLobbyEmpty = () => !Object.values(nsp.connected).length;

    nsp.on("connect", socket => {
      sendStatus();
      socket.on("disconnect", () => {
        isLobbyEmpty() ? removeNsp() : sendStatus();
      });
      socket.on("start", () => {
        const gameId = GameService.createGameServer(getConnected().length);
        const gameServer = GameService.findGameServerById(gameId);
        const authorizedPlayerIds = gameServer.getAuthorizedPlayerIds();

        zip(Object.values(nsp.connected), authorizedPlayerIds).forEach(
          ([socket, authorizedPlayerId]) => {
            socket.emit("event started", {
              eventId: gameId,
              authorizedPlayerId
            });
          }
        );
      });
    });

    lobbyIds.push(lobbyId);
    res.json({ lobbyId });
  });

  app.get("/lobbies/:id/check-existence", (req, res) => {
    res.json({ exists: lobbyIds.includes(req.params.id) });
  });
})();

// Game service MVP:
app.get("/games/:id/check-existence", (req, res) => {
  const exists = GameService.gameServers.has(req.params.id);
  res.json({ exists });
});

server.listen(process.env.PORT || 5000);
