import { ModiGame, ConnectedUser } from '../core';

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
  const connections: IConnectedUser[] = [];

  let game: ModiGame | undefined = undefined;

  nsp.on('connect', (socket: SocketIO.Socket) => {
    const { playerId, username } = socket.handshake.query;
    console.log(username, 'connected to game!');
    if (!players.map((player) => player.id).includes(playerId)) {
      socket.emit('UNAUTHORIZED');
      return;
    }
    if (game) {
      socket.emit('GAME_STATE_UPDATED', game.getState());
    }
    connections.push(new ConnectedUser(playerId, username, socket));

    socket.on('disconnect', () => {
      connections.splice(
        connections.findIndex((conn) => conn.socket.id === socket.id),
        1,
      );
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
