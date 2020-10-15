import express from 'express';
import socketio from 'socket.io';

const app = express();
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log('running'));
const io = socketio(server);

const authorizedAccessTokens = ['1', '2', '3', '4'];

const testGameRoom: GameRoom = io
  .of('/games/1234')
  .on('connect', (socket: GameSocketConnection) => {
    const { accessToken, username } = socket.handshake.query;
    if (!authorizedAccessTokens.includes(accessToken)) {
      return socket.disconnect();
    }

    socket.on('get live updates', (fromVersion?: number) => {
      socket.emit('state change', '', fromVersion || 0);
    });

    socket.on('get initial state', () => {
      socket.emit('initial state', 'suck my tits bitch');
    });

    // socket.on('get subscribers');
  });

interface GameRoom extends SocketIO.Namespace {}
interface GameSocketConnection extends SocketIO.Socket {
  on: (...eventListener: GameSocketListener) => this;
}

type GameSocketListener =
  | ['connect', (socket: GameSocketConnection) => void]
  | ['disconnect', () => void]

  /** Connected clients */
  | ['get connections', () => void]

  /** The client is requesting the initial game state */
  | ['get initial state', () => void]

  /** The client wants changes from fromVersion and to subscribe to future changes */
  | ['get live updates', (fromVersion?: number) => void]

  /** Clients who are up to date and waiting for live state updates */
  | ['get subscribers', (playerIds: number[]) => void];

type GameSocketEmitArgs = ['connections'];
export { testGameRoom };
export default app;
