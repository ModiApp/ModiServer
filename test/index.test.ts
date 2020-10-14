import io from 'socket.io-client';
import server from '../src';

const testUrl = 'http://localhost:5000/games/1234';

type StateChangeAction = '';

const connectToGameServer = (accessToken: string, username: string) => new Promise<SocketIOClient.Socket>((resolve, reject) => {
  const socket = io(testUrl, { query: { accessToken, username }, forceNew: true });
  socket.on('connect', () => {
    resolve(socket);
  });

  setTimeout(() => reject(new Error("Request timed out. Could not connect to game socket.")), 2000);
})

type Connections = { [username: string]: boolean };
const getConnected = (socket: SocketIOClient.Socket) => new Promise<Connections>((resolve, reject) => {
  socket.emit('get connections');
  socket.on('connections', (connections: Connections) => resolve(connections));
  setTimeout(() => reject(new Error('Request timed out. Could not get connections.')), 2000);
});

const subscribeToLiveStateChanges = (socket: SocketIOClient.Socket, fromVersion?: number) => {
  let onStateChangeCb = (action: StateChangeAction, version: number) => { };
  socket.emit('get live updates', fromVersion);
  socket.on('state change', (action: StateChangeAction, version: number) => onStateChangeCb(action, version));
  return {
    onStateChange(cb: (action: StateChangeAction, version: number) => void) { onStateChangeCb = cb }
  }
}

describe.skip('ModiGameServer Tests', () => {
  test('authorized users can connect to game socket', async () => {
    const socket = await connectToGameServer('1', 'Ikey');
    expect(socket.connected).toBe(true);
  });

  test('unauthorized users cannot connect', async () => {
    const socket = await connectToGameServer('5', 'Peter');
    expect(socket.connected).toBe(false);
  });

  describe('can subscribe to live state changes from any index', () => {
    test('when fromVersion is not passed, first version is zero', async () => {

      const socket = await connectToGameServer('1', 'Philip');
      const firstVersion = await new Promise((resolve, reject) => {
        subscribeToLiveStateChanges(socket).onStateChange((action, version) => {
          resolve(version);
        });
      });
      
      expect(firstVersion).toBe(0);
    })

    test('when fromVersion is passed, first version is fromVersion', async () => {
      const socket = await connectToGameServer('1', 'Henry');
      const firstVersion = await new Promise((resolve, reject) => {
        subscribeToLiveStateChanges(socket, 2).onStateChange((action, version) => {
          resolve(version);
        });
      });
      expect(firstVersion).toBe(2);
    });

  });
});