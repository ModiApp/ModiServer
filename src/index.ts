import http from 'http';
import socketio from 'socket.io';

import {
  createModiGame,
  createGameStateStore,
  createInitialGameState,
} from './ModiGame';
import { createCardDeck } from './Deck';
import { createGameServer } from './GameRoomServer';

const PORT = process.env.PORT || 5000;
const server = http.createServer().listen(PORT);
const io = socketio(server);

const playerIds = ['1', '2', '3', '4'];
const gameStateStore = createGameStateStore(createInitialGameState(playerIds));
const game = createModiGame(gameStateStore, createCardDeck());
const gameRoomServer = createGameServer(game);

io.of('/games/1234').on('connection', (socket) => {
  const connection = adaptSocketToConnection(socket);
  console.log('connection', JSON.stringify(connection, undefined, 2));
  gameRoomServer.handleConnection(connection);
  socket.on('disconnect', () => {
    gameRoomServer.handleDisconnection(socket.handshake.query.playerId);
  });
  socket.on('choose dealer', (req: DealerRequestDto) => {
    gameRoomServer.handleChooseDealerRequest(connection, req);
  });
  socket.on('start game', () => {
    console.log('recieved start game request!', connection.username);
    gameRoomServer.handleStartGameRequest(connection);
  });
});

// Adapters
function adaptSocketToConnection(socket: SocketIO.Socket): GameRoomConnection {
  return {
    onConnectionsChanged(connections: ConnectionResponseDto) {
      socket.emit('connections', connections);
    },
    onError(message: string) {
      socket.emit('error', message);
    },
    onGameStateChanged(action: StateChangeAction, version: number) {
      socket.emit('state change', action, version);
    },
    username: socket.handshake.query.username,
    playerId: socket.handshake.query.playerId,
  };
}
