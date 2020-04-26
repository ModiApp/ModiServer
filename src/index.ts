import express from 'express';
import socketio from 'socket.io';
import http from 'http';

import createGameService from './service/GameService';
import { uniqueId } from './util';

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const GameService = createGameService(io);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const zip = (arr1: unknown[], arr2: unknown[]): unknown[] => {
  return arr1.map((el, i) => [el, arr2[i]]);
};

// Lobby Controller MVP
((): void => {
  const lobbyIds = [];
  app.get('/lobbies/new', (req, res) => {
    const lobbyId = uniqueId(lobbyIds, 3);
    const nsp = io.of('/lobbies/' + lobbyId);

    const getConnected = (): { id: PlayerId; username: string }[] =>
      Object.entries(nsp.connected)
        .map(([id, socket]) => ({
          id,
          username: socket.handshake.query.username,
        }))
        .filter(username => !!username);

    const sendStatus = (): void => {
      const connected = getConnected();
      nsp.emit('lobby info', {
        connections: connected,
        lobbyLeader: connected[0],
      });
    };

    const isLobbyEmpty = (): boolean => !Object.values(nsp.connected).length;

    const removeNsp = ((): (() => void) => {
      let isAlreadyScheduledForRemoval = false;

      const remove = (): void => {
        if (isLobbyEmpty()) {
          nsp.removeAllListeners();
          delete io.nsps['/lobbies/' + lobbyId];
          lobbyIds.splice(lobbyIds.findIndex(id => id === lobbyId));
        } else {
          isAlreadyScheduledForRemoval = false;
        }
      };

      return (): void => {
        if (!isAlreadyScheduledForRemoval) {
          setTimeout(remove, 1000 * 60 * 5); // wait five min before removing
          isAlreadyScheduledForRemoval = true;
        }
      };
    })();

    nsp.on('connect', socket => {
      sendStatus();
      socket.on('disconnect', () => {
        isLobbyEmpty() ? removeNsp() : sendStatus();
      });
      socket.on('start', () => {
        const gameId = GameService.createGameServer(getConnected().length);
        const gameServer = GameService.findGameServerById(gameId);
        const authorizedPlayerIds = gameServer.getAuthorizedPlayerIds();

        zip(Object.values(nsp.connected), authorizedPlayerIds).forEach(
          ([socket, authorizedPlayerId]) => {
            socket.emit('event started', {
              eventId: gameId,
              authorizedPlayerId,
            });
          }
        );
      });
    });

    lobbyIds.push(lobbyId);
    res.json({ lobbyId });
  });

  app.get('/lobbies/:id/check-existence', (req, res) => {
    res.json({ exists: lobbyIds.includes(req.params.id) });
  });
})();

// Game service MVP:
app.get('/games/:id/check-existence', (req, res) => {
  const exists = GameService.gameServers.has(req.params.id);
  res.json({ exists });
});

server.listen(process.env.PORT || 5000);
