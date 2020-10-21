import io from 'socket.io-client';

type GameSocketClientEmitArgs =
  | ['get connections']
  | ['get live updates', number?]
  | ['get subscribers']
  | ['get initial state']
  | ['make move', PlayerMove];

type GameSocketClientOnArgs =
  | ['connect', () => void]
  | ['disconnect', () => void]
  | ['state change', StateChangeCallback]
  | ['subscribers', (playerIds: string[]) => void]
  | ['connections', (connections: Connections) => void]
  | ['initial state', (initialGameState: GameState) => void]
  | ['received move', () => void]
  | ['not your turn', () => void];

interface GameSocketClient extends SocketIOClient.Socket {
  emit: (...dispatch: GameSocketClientEmitArgs) => this;
  on: (...event: GameSocketClientOnArgs) => any; // TODO: couldnt figure out proper return type
}

class GameRoomClient {
  private nspUrl: string;
  private static connectedSockets: GameSocketClient[] = [];
  private accessToken: string;
  private username: string;
  private isConnected: boolean;
  private socket: GameSocketClient;

  private onConnect: (() => void) | null = null;

  constructor(gameId: string, accessToken: string, username: string) {
    this.nspUrl = `http://localhost:5000/games/${gameId}`;
    this.accessToken = accessToken;
    this.username = username;
    this.isConnected = false;
    this.socket = this.createInitialSocket();
  }

  private createInitialSocket() {
    const socket = io(this.nspUrl, {
      query: { accessToken: this.accessToken, username: this.username },
      autoConnect: false,
      forceNew: true,
    });
    socket.on('connect', () => {
      this.isConnected = true;
      this.onConnect && this.onConnect();
      socket.on('disconnect', () => {
        this.isConnected = false;
      });
    });
    return socket;
  }

  get connected() {
    return this.isConnected;
  }

  async getSubscriptionStatus() {
    if (!this.connected) {
      await this.connect();
    }
    return new Promise<boolean>((resolve, reject) => {
      this.socket.on('subscribers', (subscriberIds: string[]) =>
        resolve(subscriberIds.includes(this.accessToken)),
      );
      this.socket.emit('get subscribers');
    });
  }

  connect() {
    return new Promise<GameSocketClient>((resolve, reject) => {
      this.onConnect = () => {
        resolve();
        this.onConnect = null;
      };
      this.socket.connect();

      setTimeout(() => {
        reject(
          new Error('Request timed out. Could not connect to game socket.'),
        );
      }, 2000);
    });
  }

  async subscribeToLiveStateChanges(
    fromVersion: number,
    onStateChange: StateChangeCallback,
  ) {
    if (!this.connected) {
      await this.connect();
    }
    this.socket.on('state change', onStateChange);
    this.socket.emit('get live updates', fromVersion);
  }

  async getInitialGameState() {
    if (!this.connected) {
      await this.connect();
    }
    return new Promise<GameState>((resolve, reject) => {
      this.socket.on('initial state', (gamestate: GameState) =>
        resolve(gamestate),
      );
      this.socket.emit('get initial state');
      setTimeout(() => {
        reject(new Error('Request for initial game state timed out.'));
      }, 2000);
    });
  }

  async makeMove(move: PlayerMove) {
    !this.connected && (await this.connect());
    return new Promise((resolve, reject) => {
      this.socket.on('received move', () => resolve('success'));
      this.socket.on('not your turn', () => resolve('not your turn'));
      this.socket.emit('make move', move);
    });
  }

  static unplugConnectedSockets() {
    GameRoomClient.connectedSockets.forEach((socket) => socket.disconnect());
    while (GameRoomClient.connectedSockets.length)
      GameRoomClient.connectedSockets.pop();
  }
}

export default GameRoomClient;
