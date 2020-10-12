import createGame from '../core/NewModiGame';
import createGameStateManager, {
  createInitialGameState,
} from '../core/GameState';
import { ConnectedPlayer } from '../core';
import { ScheduledTask } from '../util';

function createModiGameSocket(
  io: SocketIO.Server,
  gameId: string,
  players: {
    idx: string;
    username: string;
  }[],
  getPlayAgainLobbyId: () => string,
  onGameDeleted: () => void,
) {
  const nspUrl = `/games/${gameId}`;
  if (Object.keys(io.nsps).includes(nspUrl)) {
    throw new Error(
      `Unable to create game socket for gameId ${gameId}. Socket with that gameId already exists.`,
    );
  }
  const nsp = io.of(nspUrl);
  const connections: ConnectedPlayer[] = [];

  const didStart = false;
  const gamestate = createGameStateManager(
    () =>
      createInitialGameState(
        players.map(({ username }, idx) => createPlayer({ username, idx })),
      ),
    emitStateChange,
  );
  const game = createGame(gamestate);

  function emitStateChange(action: StateChangeAction, changeCount: number) {
    // The change count is for the client to confirm they haven't missed any
    // actions, to alert them if they need to request missing pieces of the story
    nsp.emit('STATE_CHANGE_DISPATCH', action, changeCount);
  }

  const deleteGameTask = new ScheduledTask(() => {
    nsp.removeAllListeners();
    delete io.nsps['/games/' + gameId];
    onGameDeleted();
  });

  nsp.on('connect', (socket: SocketIO.Socket) => {
    deleteGameTask.cancel();
    const { playerId, username } = socket.handshake.query;

    if (!players.map((player) => player.id).includes(playerId)) {
      socket.emit('UNAUTHORIZED');
      return socket.disconnect();
    }

    connections.push(new ConnectedPlayer(playerId, username, socket));

    // When everyone first connects, set the initial game state
    if (!didStart && connections.length === players.length) {
      nsp.emit('SET_STATE', game.initialState);
      game.startRound(game.playHighCard());
    }

    socket.on('disconnect', () => {
      connections.splice(
        connections.findIndex((conn) => conn.socket.id === socket.id),
        1,
      );

      if (connections.length === 0) {
        deleteGameTask.schedule(1000 * 60 * 60); // delete after an hour of inactivity
      }
    });

    socket.on('MADE_MOVE', (move: PlayerMove) => {
      if (!game.isMyTurn(playerId)) {
        socket.emit('NOT_YOUR_TURN');
      } else {
      }
    });

    socket.on('PLAY_AGAIN', () => {
      socket.emit('PLAY_AGAIN_LOBBY_ID', getPlayAgainLobbyId());
    });
  });

  return;
}

function playersFromUsernames(usernames: string[]) {
  return usernames.map((username, idx) => createPlayer({ username, idx }));
}

function createPlayer({ idx, username }): Player {
  return {
    idx,
    lives: 3,
    card: null,
    move: null,
    username,
  };
}

export default createModiGameSocket;
