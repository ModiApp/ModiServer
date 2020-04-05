import socketio from 'socket.io';
import http from 'http';

import createGameService from '../../src/service/GameService';

const server = http.createServer();
const io = socketio(server);

const GameService = createGameService(io);

describe('Game service tests', () => {
    describe('GameService.createGameServer(4)', () => {
        const gameId = GameService.createGameServer(4);
        test('io now has new game namespace with proper id', () => {
            expect(io.nsps[`/games/${gameId}`]).toBeDefined();
        });
        test('GameService.gameServers has new entry at new game id', () => {
            expect(GameService.gameServers.has(gameId)).toBe(true);
        });
    });
});