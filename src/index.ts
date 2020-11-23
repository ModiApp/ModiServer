import http from 'http';
import socketio from 'socket.io';

import { createModiGame } from './ModiGame';
import { createCardDeck } from './Deck';
import { createGameServer } from './GameRoomServer';

const PORT = process.env.PORT || 5000;
const server = http.createServer().listen(PORT);
const io = socketio(server);

const playerIds = ['1', '2', '3', '4'];
const game = createModiGame(playerIds, createCardDeck());
const gameRoomServer = createGameServer(game);

io.of('/games/1234').on('connection', (socket) => {
  const connection = adaptSocketToConnection(socket);
  gameRoomServer.handleConnection(connection);

  socket.on('disconnect', () => {
    gameRoomServer.handleDisconnection(socket.handshake.query.playerId);
  });

  socket.on('deal cards', () => {
    gameRoomServer.handleDealCardsRequest(connection);
  });

  socket.on('choose dealer', (req: DealerRequestDto) => {
    gameRoomServer.handleChooseDealerRequest(connection, req);
  });

  socket.on('start game', () => {
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
      socket.emit('error message', message);
    },
    onGameStateChanged(action: StateChangeAction, version: number) {
      socket.emit('state change', action, version);
    },
    username: socket.handshake.query.username,
    playerId: socket.handshake.query.playerId,
  };
}
