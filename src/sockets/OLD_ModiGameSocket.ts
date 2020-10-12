import { ModiGame, ConnectedPlayer } from '../core';
import { ScheduledTask } from '../util';

function createModiGameSocket(
  io: SocketIO.Server,
  gameId: string,
  players: { id: string; username: string }[],
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
  const connections: IConnectedPlayer[] = [];

  let game: ModiGame | undefined = undefined;

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
      return;
    }

    game && socket.emit('GAME_STATE_UPDATED', game.getState());

    connections.push(new ConnectedPlayer(playerId, username, socket));

    socket.on('disconnect', () => {
      connections.splice(
        connections.findIndex((conn) => conn.socket.id === socket.id),
        1,
      );

      if (connections.length === 0) {
        deleteGameTask.schedule(1000 * 60 * 60); // delete after an hour of inactivity
      }
    });

    if (!game && connections.length === players.length) {
      game = startGame();
    }

    socket.on('CHOOSE_DEALER', (dealerId: string) => {
      game!.startRound(dealerId);
    });

    socket.on('MADE_MOVE', (move: PlayerMove) => {
      game!.handleMove(playerId, move);
    });

    socket.on('PLAY_AGAIN', () => {
      socket.emit('PLAY_AGAIN_LOBBY_ID', getPlayAgainLobbyId());
    });
  });

  function startGame(): ModiGame {
    function onGameStateChanged(newGameState: ModiGameState) {
      nsp.emit('GAME_STATE_UPDATED', newGameState);
    }
    const _game = new ModiGame(players, onGameStateChanged);
    _game.start();

    return _game;
  }

  return;
}

export default createModiGameSocket;
