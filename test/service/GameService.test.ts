import socketio from 'socket.io';
import http from 'http';

import createGameService from '../../src/service/GameService';
import ModiGameServer from '../../src/service/ModiGameServer';

const server = http.createServer();
const io = socketio(server);

const GameService = createGameService(io);

describe('Game service tests', () => {
  let gameId;
  beforeAll(() => (gameId = GameService.createGameServer(4)));
  afterAll(() => GameService.removeGameServerById(gameId));

  describe('GameService.createGameServer(4)', () => {
    test('io now has new game namespace with proper id', () => {
      expect(io.nsps[`/games/${gameId}`]).toBeDefined();
    });
    test('GameService.gameServers has new entry at new game id', () => {
      expect(GameService.gameServers.has(gameId)).toBe(true);
    });
    test(`GameService.findGameServerById(mockGameId) returns a GameServer`, () => {
      const gameServer = GameService.findGameServerById(gameId);
      expect(gameServer instanceof ModiGameServer).toBe(true);
    });
  });
});
