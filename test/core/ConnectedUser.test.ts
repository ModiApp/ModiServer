import SocketIOMock from 'socket.io-mock';
import ConnectedUser from '../../src/core/ConnectedUser';

describe('ConnectedUser() Tests', () => {
  describe('ConnectedUser.constructor()', () => {
    const mockPlayerId = '1';
    const mockUsername = 'Ikey';
    const mockSocket = new SocketIOMock();
    const user = new ConnectedUser(mockPlayerId, mockUsername, mockSocket);

    test('has correct properties', () => {
      expect(user.playerId).toBe(mockPlayerId);
      expect(user.username).toBe(mockUsername);
      expect(user.socket).toBe(mockSocket);
    });
  });
});
