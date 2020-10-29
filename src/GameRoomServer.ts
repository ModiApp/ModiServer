import express from 'express';
import socketio from 'socket.io';
import {
  createPersistedGameStateStore,
  createModiGame,
  createInitialGameState,
} from './ModiGame';
import Deck from './Deck';

const mockGameId = '1234';

function startServer() {
  const app = express();
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log('running on', PORT);
  });
  const io = socketio(server);

  const subscriberIds: string[] = [];
  const connections: { [playerId: string]: GameSocketConnection } = {};

  const authorizedAccessTokens = ['1', '2', '3', '4'];
  const gamestateStore = createPersistedGameStateStore(
    mockGameId,
    createInitialGameState(authorizedAccessTokens),
    (action: StateChangeAction, newVersion: number) => {
      subscriberIds.forEach((playerId) => {
        connections[playerId].emit('state change', action, newVersion);
      });
    },
  );
  const modiGame = createModiGame(gamestateStore, new Deck());
  modiGame.start();

  const testGameRoom: GameRoom = io
    .of(`/games/${mockGameId}`)
    .on('connect', (socket: GameSocketConnection) => {
      const { accessToken: playerId, username } = socket.handshake.query;
      if (!authorizedAccessTokens.includes(playerId)) {
        return socket.disconnect();
      }

      if (playerId in connections) {
        connections[playerId].disconnect();
      }
      connections[playerId] = socket;

      socket.on('get live updates', (fromVersion: number) => {
        const currStateVersion = gamestateStore.getState().version;
        let idxOfHistory = fromVersion;
        while (idxOfHistory < currStateVersion) {
          // send them all past states
          socket.emit(
            'state change',
            gamestateStore.history[idxOfHistory++],
            idxOfHistory,
          );
        }
        subscriberIds.push(playerId);
      });

      socket.on('get initial state', () => {
        socket.emit('initial state', gamestateStore.initialState);
      });

      socket.on('get subscribers', () => {
        socket.emit('subscribers', subscriberIds);
      });

      socket.on('make move', (move: PlayerMove) => {
        const res = modiGame.handleMove(playerId, move);
        if (res === 'success') {
          socket.emit('received move');
        } else {
          socket.emit('not your turn');
        }
      });

      socket.on('choose dealer', (dealerId: string) => {
        // Do some authorization
        socket.emit('choice for dealer received');
        modiGame.setDealerId(dealerId, playerId);
      });

      socket.on('disconnect', () => {
        if (subscriberIds.includes(playerId)) {
          subscriberIds.splice(
            subscriberIds.findIndex((id) => id === playerId),
            1,
          );
        }
      });
    });
  return testGameRoom;
}

interface GameRoom extends SocketIO.Namespace {}
interface GameSocketConnection extends SocketIO.Socket {
  on: (...eventListener: GameSocketListener) => this;
  emit: (...eventInfo: GameSocketServerEmitArgs) => any;
}

type GameSocketServerEmitArgs =
  | ['state change', StateChangeAction, number]
  | ['subscribers', string[]]
  | ['connections', Connections]
  | ['initial state', GameState]
  | ['received move']
  | ['not your turn']
  | ['choice for dealer received'];

type GameSocketListener =
  | ['connect', (socket: GameSocketConnection) => void]
  | ['disconnect', () => void]

  /** Connected clients */
  | ['get connections', () => void]

  /** The client is requesting the initial game state */
  | ['get initial state', () => void]

  /** The client wants changes from fromVersion and to subscribe to future changes */
  | ['get live updates', (fromVersion: number) => void]

  /** Clients who are up to date and waiting for live state updates */
  | ['get subscribers', (playerIds: number[]) => void]
  | ['make move', (move: PlayerMove) => void]
  | ['choose dealer', (dealerId: string) => void];

// type GameSocketEmitArgs = ['connections'];

export default startServer;
