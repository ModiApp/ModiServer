import io from 'socket.io-client';

import { generateInitialGameState } from '../src/GameStateManager';

const testUrl = 'http://localhost:5000/games/1234';

type StateChangeAction = '';

type GameSocketClientEmitArgs =
  | ['get connections']
  | ['get live updates', number?]
  | ['get subscribers']
  | ['get initial state']
  | ['make move', PlayerMove];

type GameSocketClientOnArgs =
  | ['connect', () => void]
  | ['disconnect', () => void]

  /** If you request or are subscribed to state changes, you'll get these */
  | ['state change', (action: StateChangeAction) => void]

  /** If you request a list of clients currently listening for live updates */
  | ['subscribers', (playerIds: string[]) => void]

  /** If you request information about who is connected */
  | ['connections', (connections: Connections) => void]

  /** If you request the initial game state */
  | ['initial state', (initialGameState: GameState) => void];

interface GameSocketClient extends SocketIOClient.Socket {
  emit: (...dispatch: GameSocketClientEmitArgs) => this;
  on: (...event: GameSocketClientOnArgs) => any; // TODO: couldnt figure out proper return type
}

const mockPlayerIds = ['1', '2', '3', '4'];

const connectedSockets: GameSocketClient[] = [];
const connectToGameServer = (accessToken: string, username: string) =>
  new Promise<GameSocketClient>((resolve, reject) => {
    const socket = io(testUrl, {
      query: { accessToken, username },
      forceNew: true,
    });
    socket.on('connect', () => {
      connectedSockets.push(socket);
      resolve(socket);
    });

    setTimeout(
      () =>
        reject(
          new Error('Request timed out. Could not connect to game socket.'),
        ),
      2000,
    );
  });
const unplugConnectedSockets = () => {
  connectedSockets.forEach((socket) => socket.disconnect());
  while (connectedSockets.length) connectedSockets.pop();
};

const getConnected = (socket: GameSocketClient) =>
  new Promise<Connections>((resolve, reject) => {
    socket.emit('get connections');
    socket.on('connections', (connections: Connections) =>
      resolve(connections),
    );
    setTimeout(
      () => reject(new Error('Request timed out. Could not get connections.')),
      2000,
    );
  });

const subscribeToLiveStateChanges = (
  socket: GameSocketClient,
  fromVersion?: number,
) => {
  let onStateChangeCb = (action: StateChangeAction) => {};
  socket.emit('get live updates', fromVersion);
  socket.on('state change', (action: StateChangeAction) =>
    onStateChangeCb(action),
  );
  return {
    onStateChange(cb: (action: StateChangeAction) => void) {
      onStateChangeCb = cb;
    },
  };
};

describe.only('ModiGameServer Tests', () => {
  afterEach(() => unplugConnectedSockets());

  test('authorized users can connect to game socket', async () => {
    const socket = await connectToGameServer('1', 'Ikey');
    expect(socket.connected).toBe(true);
  });

  test('unauthorized users cannot connect', async () => {
    const socket = await connectToGameServer('5', 'Peter');
    expect(socket.connected).toBe(false);
  });

  test('can request initial state', async () => {
    const socket = await connectToGameServer('1', 'Kate');
    const initialState = await new Promise<GameState>((resolve, reject) => {
      socket.on('initial state', (state: GameState) => resolve(state));
      socket.emit('get initial state');
      setTimeout(() => reject(new Error('request timed out')), 2000);
    });

    expect(initialState).toStrictEqual(generateInitialGameState(mockPlayerIds));
  });

  test('can subscribe to live gamestate changes', async () => {
    const socket = await connectToGameServer('1', 'William');
    const subscribersBefore = await new Promise<string[]>((resolve, reject) => {
      socket.on('subscribers', resolve);
      socket.emit('get subscribers');
      setTimeout(() => reject(new Error('request timed out')), 2000);
    });
    socket.emit('get live updates');
    const subscribersAfter = await new Promise<string[]>((resolve, reject) => {
      socket.on('subscribers', resolve);
      socket.emit('get subscribers');
    });

    expect(subscribersBefore.includes('1')).toBe(false);
    expect(subscribersAfter.includes('1')).toBe(true);
  });

  describe('when someone connects to game socket using same accessToken as a connected player', () => {
    test('the old socket gets disconnected', async () => {
      const maggie = await connectToGameServer('1', 'Maggie');
      expect(maggie.connected).toBe(true);
      const walter = await connectToGameServer('1', 'Walter');
      expect(walter.connected).toBe(true);

      // walter should have replaced maggie
      expect(maggie.connected).toBe(false);
    });
    test('if the old socket was subscribed to live state changes, new one shouldnt be', async () => {
      const maggie = await connectToGameServer('1', 'Maggie');
      // Maggie will subscribe to state changes as player whose id is 1
      maggie.emit('get live updates');

      const isPlayer1Subscribed = (socket: GameSocketClient) =>
        new Promise<boolean>((resolve, reject) => {
          socket.emit('get subscribers');
          socket.on('subscribers', (subscriberIds: string[]) =>
            resolve(subscriberIds.includes('1')),
          );
        });

      expect(await isPlayer1Subscribed(maggie)).toBe(true);

      const walter = await connectToGameServer('1', 'Walter');
      expect(await isPlayer1Subscribed(walter)).toBe(false);
    });
  });

  describe.only('when clients emit the take turn event', () => {
    const makeMove = (socket: GameSocketClient, move: PlayerMove) =>
      new Promise<boolean>((resolve, reject) => {
        socket.emit('make move', move);
      });
    test('clients whose turn it is are allow to go', () => {
      expect(false).toBe(true);
    });

    test('clients whose turn it isnt are not allowed to go', () => {
      expect(false).toBe(true);
    });
  });
});
