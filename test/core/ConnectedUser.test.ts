import SocketIOMock from 'socket.io-mock';
import ConnectedPlayer from '../../src/core/ConnectedPlayer';

describe('ConnectedPlayer() Tests', () => {
  describe('ConnectedPlayer.constructor()', () => {
    const mockPlayerId = '1';
    const mockUsername = 'Ikey';
    const mockSocket = new SocketIOMock();
    const user = new ConnectedPlayer(mockPlayerId, mockUsername, mockSocket);

    test('has correct properties', () => {
      expect(user.playerId).toBe(mockPlayerId);
      expect(user.username).toBe(mockUsername);
      expect(user.socket).toBe(mockSocket);
    });
  });
});
