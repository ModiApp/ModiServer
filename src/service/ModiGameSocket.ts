import ModiGame from '../core/ModiGame2';

function createModiGameSocket(
  io: SocketIO.Server,
  gameId: string,
  playerIds: string[],
  onGameEnd: () => void,
  getPlayAgainLobbyId: () => string,
) {
  const nspUrl = `/games/${gameId}`;
  if (Object.keys(io.nsps).includes(nspUrl)) {
    throw new Error(
      `Unable to create game socket for gameId ${gameId}. Socket with that gameId already exists.`,
    );
  }
  const nsp = io.of(nspUrl);
  const connections: SocketConnection[] = [];

  let game: ModiGame | undefined = undefined;

  nsp.on('connection', (socket: SocketIO.Socket) => {
    const { playerId, username } = socket.handshake.query;
    if (!playerIds.includes(playerId)) {
      socket.send('Unauthorized');
      return;
    }
    connections.push(new SocketConnection(playerId, username, socket));

    socket.on('disconnect', () => {
      connections.splice(
        connections.findIndex((conn) => conn.socket.id === socket.id),
        1,
      );
    });

    if (!game && connections.length === playerIds.length) {
      game = startGame();

      socket.on('CHOOSE_DEALER', (dealerId: string) => {
        game!.startRound(dealerId);
      });

      socket.on('MADE_MOVE', (move: PlayerMove) => {
        game!.handleMove(playerId, move);
      });

      socket.on('PLAY_AGAIN', () => {
        socket.send('PLAY_AGAIN_LOBBY_ID', getPlayAgainLobbyId());
      });
    }
  });

  function startGame(): ModiGame {
    function onGameStateChanged(newGameState: ModiGameState) {
      nsp.emit('GAME_STATE_CHANGED', newGameState);
    }
    const _game = new ModiGame(playerIds, onGameStateChanged, onGameEnd);
    _game.start();

    return _game;
  }
}

class SocketConnection {
  playerId: string;
  username: string;
  socket: SocketIO.Socket;

  constructor(playerId: string, username: string, socket: SocketIO.Socket) {
    this.playerId = playerId;
    this.username = username;
    this.socket = socket;
  }
}

export default createModiGameSocket;
