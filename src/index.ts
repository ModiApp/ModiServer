import http from 'http';
import express from 'express';
import socketio from 'socket.io';

import createLobbySocket from './service/LobbySocket';
import createGameSocket from './service/ModiGameSocket';

import { uniqueId, uniqueIds, zipArrays } from './util';

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const activeGameIds: string[] = [];
const activeLobbyIds: string[] = [];

app.head('/', (req, res) => res.status(200).end());

app.get('/lobbies/new', (_, res) => {
  const lobbyId = createLobby();
  res.json({ lobbyId });
});

app.head('/lobbies/:id', (req, res) => {
  res.status(activeLobbyIds.includes(req.params.id) ? 200 : 404).end();
});

app.head('/games/:id', (req, res) => {
  res.status(activeGameIds.includes(req.params.id) ? 200 : 404).end();
});

server.listen(process.env.PORT || 5000, () => {
  setInterval(() => {
    http.get('http://modi-server.herokuapp.com');
  }, 1000 * 60 * 25);
});

function createLobby() {
  const newLobbyId = uniqueId(activeLobbyIds, 4);
  console.log('created new lobby:', newLobbyId);

  const onLobbyDeleted = () => {
    activeLobbyIds.splice(
      activeLobbyIds.findIndex((lobbyId) => lobbyId === newLobbyId),
      1,
    );
  };

  const onEventStart = (usernames: string[]) => {
    const { gameId, playerIds } = createGame(usernames);
    return {
      eventId: gameId,
      authorizedUserIds: playerIds,
    };
  };

  createLobbySocket(io, newLobbyId, onEventStart, onLobbyDeleted);
  activeLobbyIds.push(newLobbyId);

  return newLobbyId;
}

function createGame(usernames: string[]) {
  const playerIds = uniqueIds(usernames.length, 10);
  const gameId = uniqueId(activeGameIds, 10);

  const players = zipArrays(playerIds, usernames).map(([id, username]) => ({
    id,
    username,
  }));

  const getPlayAgainLobbyId = (() => {
    let playAgainLobbyId: string | undefined = undefined;
    return () => {
      if (!playAgainLobbyId) {
        playAgainLobbyId = createLobby();
      }
      return playAgainLobbyId;
    };
  })();

  createGameSocket(io, gameId, players, getPlayAgainLobbyId, () => {});
  activeGameIds.push(gameId);

  return { gameId, playerIds };
}
