import GameRoomClient from '../src/GameRoomClient';
import { createInitialGameState } from '../src/ModiGame';

const mockPlayerIds = ['1', '2', '3', '4'];
const mockGameId = '1234';

describe('GameRoomClient Tests', () => {
  afterEach(() => GameRoomClient.unplugConnectedSockets());

  describe('connection tests:', () => {
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

      expect(initialState).toStrictEqual(createInitialGameState(mockPlayerIds));
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
        await maggie.subscribeToLiveStateChanges(0, () => {});
        expect(await maggie.getSubscriptionStatus()).toBe(true);

        const walter = new GameRoomClient(mockGameId, '1', 'Walter');
        expect(await walter.getSubscriptionStatus()).toBe(false);
      });
    });
  });

  describe.only('gamestate tests:', () => {
    test('first state change actions play highcard', async () => {
      const socket = new GameRoomClient(mockGameId, '1', 'Walter');

      const recordedActions = await new Promise<StateChangeAction[]>(
        (resolve, reject) => {
          const actions: StateChangeAction[] = [];
          socket.subscribeToLiveStateChanges(
            0,
            (action: StateChangeAction, version: number) => {
              actions.push(action);
              if (action.type === 'HIGHCARD_WINNERS') {
                if (action.payload.playerIds.length === 1) {
                  const winnerId = action.payload.playerIds[0];
                  const winner = new GameRoomClient(
                    mockGameId,
                    winnerId,
                    'I won bihh',
                  );

                  const dealerId = pickRandomDealerId(winnerId);

                  winner.chooseDealer(dealerId).then(() => {
                    resolve(actions);
                  });
                }
              }
            },
          );

          setTimeout(() => {
            reject(
              new Error('request for state changes of highcard timed out'),
            );
          }, 3000);
        },
      );

      expect(recordedActions[0].type).toBe('DEALT_CARDS');
    });
  });
});

function pickRandomDealerId(whoIsntThisId: string) {
  const candidates = [...mockPlayerIds].splice(
    mockPlayerIds.indexOf(whoIsntThisId),
    1,
  );
  return candidates[Math.floor(Math.random() * candidates.length)];
}
