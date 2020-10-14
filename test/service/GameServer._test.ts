import socketio from 'socket.io';
import ioClient from 'socket.io-client';
import http from 'http';

import { uniqueId } from '../../src/util';
import ModiGameServer from '../../src/service/ModiGameServer';
import { ModiGame } from '../../src/core/ModiGame';

describe('ModiGameSever tests', () => {
  let io: SocketIO.Server;
  let server: http.Server;
  let serverAddr;
  let mockGamePin;
  let mockGameServer: ModiGameServer;
  let socketAddr;
  beforeAll(() => {
    server = http.createServer();
    serverAddr = server.listen().address();
    io = socketio(server);
    mockGamePin = '12345';
    mockGameServer = new ModiGameServer(io.of(`/games/${mockGamePin}`), 2);
    socketAddr = `http://[${serverAddr.address}]:${serverAddr.port}/games/${mockGamePin}`;
  });

  afterAll(() => {
    io.nsps[`/games/${mockGamePin}`].removeAllListeners();
    delete io.nsps[`/games/${mockGamePin}`];
    server.close();
  });

  test('initial game server for 4 people has list of 4 authorizedPlayerIds', () => {
    expect(mockGameServer.getAuthorizedPlayerIds().length).toBe(2);
  });

  test('initial game server with no connections does not instatiate a ModiGame', () => {
    // @ts-ignore member is private
    expect(mockGameServer.game).toBe(undefined);
  });

  test('authorized connections get inserted into the authorizedConnections map', done => {
    const firstPlayerId = mockGameServer.getAuthorizedPlayerIds()[0];
    const socket = ioClient(socketAddr, {
      query: {
        username: 'ikey',
        authorizedPlayerId: firstPlayerId,
      },
    });
    socket.on('connect', () => {
      // @ts-ignore member is private
      expect(mockGameServer.authorizedConnections.get(firstPlayerId)).not.toBe(
        undefined
      );
      done();
    });
  });

  test('ignores non-authorized connections', done => {
    const authorizedIds = mockGameServer.getAuthorizedPlayerIds();
    const unauthorizedId = uniqueId(authorizedIds, 10);

    const mockClient = ioClient(socketAddr, {
      query: {
        username: 'spectator',
        authorizedPlayerId: unauthorizedId,
      },
    });

    mockClient.on('connect', () => {
      // @ts-ignore member is private
      expect(mockGameServer.authorizedConnections.has(unauthorizedId)).toBe(
        false
      );
      // @ts-ignore member is private
      expect(mockGameServer.game).toBe(undefined);
      done();
    });
  });

  test('getConnectedPlayers() returns proper array of { username, playerId }[]', () => {
    const connectedPlayers = mockGameServer.getConnectedPlayers();
    expect(connectedPlayers.length).toBe(1);
    expect(connectedPlayers[0].username).toBe('ikey');
  });

  test('game instance gets created when all authenticated players connect', (done) => {
    const secondPlayerId = mockGameServer.getAuthorizedPlayerIds()[1];
    const secondSocket = ioClient(socketAddr, {
      query: { username: 'jake', authorizedPlayerId: secondPlayerId },
    });
    secondSocket.on('connect', () => {
      // Ensure ikey and jake are both accounted for on the game server
      const connectedPlayers = mockGameServer.getConnectedPlayers();
      expect(connectedPlayers.length).toBe(2);
      expect(connectedPlayers.map(({ username }) => username)).toEqual(['ikey', 'jake']);

      // @ts-ignore .game is private
      expect(mockGameServer.game instanceof ModiGame).toBe(true);
      done();
    });
  });




});
