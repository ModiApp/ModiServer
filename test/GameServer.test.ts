import { createModiGame } from '../src/ModiGame';
import { createCardDeck } from '../src/Deck';
import { createGameServer } from '../src/GameRoomServer';

const playerIds = ['1', '2', '3', '4'];

const AUTH_ERR_MSG = 'Authorization Error: Access token denied';

describe('GameRoomServer Tests:', () => {
  let game = createModiGame(playerIds, createCardDeck());
  let gameRoomServer = createGameServer(game);

  beforeEach(() => {
    game = createModiGame(playerIds, createCardDeck());
    gameRoomServer = createGameServer(game);
  });

  describe('Keeps track of who is connected to it and alerts on changes', () => {
    test('connections recieve updates when list of connections changes', () => {
      const mockConnection = createMockConnection('Ikey', '1');
      gameRoomServer.handleConnection(mockConnection);

      expect(mockConnection.onConnectionsChanged).toBeCalledWith([
        { username: 'Ikey', connected: true, playerId: '1' },
        { username: '', connected: false, playerId: '2' },
        { username: '', connected: false, playerId: '3' },
        { username: '', connected: false, playerId: '4' },
      ]);
    });

    test('usernames are persisted for disconnected players', () => {
      const conn1 = createMockConnection('Ikey', '1');
      const conn2 = createMockConnection('Pete', '2');

      gameRoomServer.handleConnection(conn1);
      gameRoomServer.handleConnection(conn2);
      gameRoomServer.handleDisconnection(conn1.playerId);

      expect(conn2.onConnectionsChanged).toHaveBeenCalledTimes(2);
      expect(conn2.onConnectionsChanged).toBeCalledWith([
        { username: 'Ikey', connected: false, playerId: '1' },
        { username: 'Pete', connected: true, playerId: '2' },
        { username: '', connected: false, playerId: '3' },
        { username: '', connected: false, playerId: '4' },
      ]);
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
      expect(conn.onGameStateChanged).toHaveBeenNthCalledWith(
        1,
        {
          type: 'PLAYERS_TURN',
          payload: { playerId: '1', controls: 'Start Highcard' },
        },
        0,
      );
    });

    test('players who are not first recieve errors for requesting start game', () => {
      const conn = createMockConnection('Ikey', '2');
      gameRoomServer.handleConnection(conn);
      gameRoomServer.handleStartGameRequest(conn);

      expect(conn.onError).toHaveBeenLastCalledWith(
        'Only game admin can start the game',
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

  describe('Allows connections to subscribe to state changes from past versions', () => {
    test('when player connects after game starts, they recieve past game events in order', () => {
      const firstPlayer = createMockConnection('Ikey', '1');
      const secondPlayer = createMockConnection('Pete', '2');
      gameRoomServer.handleConnection(firstPlayer);
      gameRoomServer.handleStartGameRequest(firstPlayer);

      gameRoomServer.handleConnection(secondPlayer);

      expect(secondPlayer.onGameStateChanged).toHaveNthReturnedWith(1, 0);
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
    onGameStateChanged: jest.fn((action, version) => version),
    onError: jest.fn(),
  };
}
