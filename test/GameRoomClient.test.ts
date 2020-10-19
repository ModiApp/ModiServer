import GameRoomClient from '../src/GameRoomClient';
import { generateInitialGameState } from '../src/ModiGame';

const mockPlayerIds = ['1', '2', '3', '4'];
const mockGameId = '1234';

describe('GameRoomClient Tests', () => {
  afterEach(() => GameRoomClient.unplugConnectedSockets());

  test('instantiating new game room client does not autoconnect', () => {
    const ikeySocket = new GameRoomClient(mockGameId, '1', 'Ikey');
    expect(ikeySocket.connected).toBe(false);
  });

  test('authorized users can connect to game socket', async () => {
    const ikeySocket = new GameRoomClient(mockGameId, '1', 'Ikey');
    expect(ikeySocket.connected).toBe(false);
    await ikeySocket.connect();
    expect(ikeySocket.connected).toBe(true);
  });

  test('unauthorized users cannot connect', async () => {
    const socket = new GameRoomClient(mockGameId, '5', 'Peter');
    await socket.connect();
    expect(socket.connected).toBe(false);
  });

  test('can request initial state', async () => {
    const socket = new GameRoomClient(mockGameId, '1', 'Kate');
    const initialState = await socket.getInitialGameState();

    expect(initialState).toStrictEqual(generateInitialGameState(mockPlayerIds));
  });

  test('can subscribe to live gamestate changes', async () => {
    const socket = new GameRoomClient(mockGameId, '1', 'William');

    expect(await socket.getSubscriptionStatus()).toBe(false);
    socket.subscribeToLiveStateChanges();
    expect(await socket.getSubscriptionStatus()).toBe(true);
  });

  describe('when someone connects to game socket using same accessToken as a connected player', () => {
    test('the old socket gets disconnected', async () => {
      const maggie = new GameRoomClient(mockGameId, '1', 'Maggie');
      await maggie.connect();
      expect(maggie.connected).toBe(true);

      const walter = new GameRoomClient(mockGameId, '1', 'Walter');
      await walter.connect();
      expect(walter.connected).toBe(true);

      // walter should have replaced maggie
      expect(maggie.connected).toBe(false);
    });

    test('if the old socket was subscribed to live state changes, new one shouldnt be', async () => {
      const maggie = new GameRoomClient(mockGameId, '1', 'Maggie');
      maggie.subscribeToLiveStateChanges();
      expect(await maggie.getSubscriptionStatus()).toBe(true);

      const walter = new GameRoomClient(mockGameId, '1', 'Walter');
      expect(await walter.getSubscriptionStatus()).toBe(false);
    });
  });

  describe('GameRoomClient.makeMove', () => {
    test(`if it is this players turn, every subscribed connection gets alerted`, async () => {
      const ikey = new GameRoomClient(mockGameId, '1', 'Ikey');
      const ikeyStateChangeAlerts: StateChangeAction[] = [];
      ikey
        .subscribeToLiveStateChanges()
        .onStateChange(ikeyStateChangeAlerts.push);

      const pete = new GameRoomClient(mockGameId, '2', 'Pete');
      const peteStateChangeAlerts: StateChangeAction[] = [];
      pete
        .subscribeToLiveStateChanges()
        .onStateChange(peteStateChangeAlerts.push);

      expect(ikeyStateChangeAlerts.length).toBe(0);
      expect(peteStateChangeAlerts.length).toBe(0);

      await ikey.makeMove('swap');

      expect(ikeyStateChangeAlerts.length).toBeGreaterThan(0);
      expect(peteStateChangeAlerts.length).toBeGreaterThan(0);
    });

    test('if it is not this players turn it throws an error', async () => {
      const ikey = new GameRoomClient(mockGameId, '1', 'Ikey');
    });
  });
});
