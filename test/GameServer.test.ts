import {
  createModiGame,
  createGameStateStore,
  createInitialGameState,
} from '../src/ModiGame';
import { createCardDeck } from '../src/Deck';
import { createGameServer } from '../src/GameRoomServer';

const playerIds = ['1', '2', '3', '4'];

const AUTH_ERR_MSG = 'Authorization Error: Access token denied';

describe.only('GameRoomServer Tests:', () => {
  let gameStateStore = createGameStateStore(createInitialGameState(playerIds));
  let game = createModiGame(gameStateStore, createCardDeck());
  let gameRoomServer = createGameServer(game);

  beforeEach(() => {
    gameStateStore = createGameStateStore(createInitialGameState(playerIds));
    game = createModiGame(gameStateStore, createCardDeck());
    gameRoomServer = createGameServer(game);
  });

  describe('Keeps track of who is connected to it and alerts on changes', () => {
    test('connections recieve updates when list of connections changes', () => {
      const mockConnection = createMockConnection('Ikey', '1');
      gameRoomServer.handleConnection(mockConnection);

      expect(mockConnection.onConnectionsChanged).toBeCalledWith({
        '1': { username: 'Ikey', connected: true },
        '2': { username: '', connected: false },
        '3': { username: '', connected: false },
        '4': { username: '', connected: false },
      });
    });

    test('usernames are persisted for disconnected players', () => {
      const conn1 = createMockConnection('Ikey', '1');
      const conn2 = createMockConnection('Pete', '2');

      gameRoomServer.handleConnection(conn1);
      gameRoomServer.handleConnection(conn2);
      gameRoomServer.handleDisconnection(conn1.playerId);

      expect(conn2.onConnectionsChanged).toHaveBeenCalledTimes(2);
      expect(conn2.onConnectionsChanged).toBeCalledWith({
        '1': { username: 'Ikey', connected: false },
        '2': { username: 'Pete', connected: true },
        '3': { username: '', connected: false },
        '4': { username: '', connected: false },
      });
    });

    test('unauthorized connections recieve proper error message', () => {
      const conn = createMockConnection('Pete', '5');
      gameRoomServer.handleConnection(conn);

      expect(conn.onConnectionsChanged).toHaveBeenCalledTimes(0);
      expect(conn.onError).toHaveBeenCalledWith(AUTH_ERR_MSG);
    });
  });

  describe('Handles remote game state dispatches and alerts on change', () => {
    test('first player is allowed to make a start game request', () => {
      const conn = createMockConnection('Ikey', '1');
      gameRoomServer.handleConnection(conn);
      gameRoomServer.handleStartGameRequest(conn);

      expect(conn.onGameStateChanged).toHaveBeenCalled();
    });

    test('players who are not first recieve errors for requesting start game', () => {
      const conn = createMockConnection('Ikey', '2');
      gameRoomServer.handleConnection(conn);
      gameRoomServer.handleStartGameRequest(conn);

      expect(conn.onError).toHaveBeenLastCalledWith(AUTH_ERR_MSG);
    });

    test('all connections receive correct state change alerts for highcard', () => {
      const ikey = createMockConnection('Ikey', '1');
      const pete = createMockConnection('Pete', '2');
      const jake = createMockConnection('Jake', '3');

      [ikey, pete, jake].forEach((conn) =>
        gameRoomServer.handleConnection(conn),
      );
      gameRoomServer.handleStartGameRequest(ikey);

      expect(ikey.onError).not.toHaveBeenCalled();

      const expectedDealtCards: TailoredCardMap = [
        { rank: 13, suit: 'diamonds' },
        { rank: 12, suit: 'diamonds' },
        { rank: 11, suit: 'diamonds' },
        { rank: 10, suit: 'diamonds' },
      ];

      const expectedArgs: [number, any, number] = [
        1,
        { type: 'DEALT_CARDS', payload: { cards: expectedDealtCards } },
        1,
      ];
      expect(ikey.onGameStateChanged).toHaveBeenNthCalledWith(...expectedArgs);
      expect(pete.onGameStateChanged).toHaveBeenNthCalledWith(...expectedArgs);
      expect(jake.onGameStateChanged).toHaveBeenNthCalledWith(...expectedArgs);

      expect(ikey.onGameStateChanged).toHaveBeenNthCalledWith(
        2,
        { type: 'HIGHCARD_WINNERS', payload: { playerIds: ['1'] } },
        2,
      );

      expect(ikey.onGameStateChanged).toHaveBeenNthCalledWith(
        3,
        { type: 'REMOVE_CARDS', payload: {} },
        3,
      );
    });
    test('winner of highcard can request to choose the dealer', () => {
      const ikey = createMockConnection('Ikey', '1');
      const pete = createMockConnection('Pete', '2');
      const jake = createMockConnection('Jake', '3');

      [ikey, pete, jake].forEach((conn) =>
        gameRoomServer.handleConnection(conn),
      );
      gameRoomServer.handleStartGameRequest(ikey);

      // We know ikey is going to win highcard since mock deck deals highest card first
      gameRoomServer.handleChooseDealerRequest(ikey, { dealerId: '2' });
      expect(ikey.onError).not.toHaveBeenCalled();
    });

    test('players who are not winner of highcard cannot choose the dealer', () => {
      const ikey = createMockConnection('Ikey', '1');
      const pete = createMockConnection('Pete', '2');

      gameRoomServer.handleConnection(ikey);
      gameRoomServer.handleConnection(pete);

      gameRoomServer.handleStartGameRequest(ikey);
      gameRoomServer.handleChooseDealerRequest(pete, { dealerId: '2' });

      expect(pete.onError).toHaveBeenCalledWith('Unauthorized');
    });
  });
});

function createMockConnection(
  username: string,
  playerId: string,
): GameRoomConnection {
  return {
    username,
    playerId,
    onConnectionsChanged: jest.fn() as (c: ConnectionResponseDto) => void,
    onGameStateChanged: jest.fn(),
    onError: jest.fn(),
  };
}
