const { uniqueId } = require('../util');

class Lobby {
  constructor(namespace) {
    this.namespace = namespace;
    this.connected = {}
    this.leaderId = undefined;

    this.namespace.on('connection', (s) => this.onUserConnected(s));
  }

  handleAddConnection(socket) {
    const { username } = socket.handshake.query;
    this.connected[socket.id] = username;
    const lobbyInfo = this.getInfo();
    this.namespace.emit('lobby info', lobbyInfo);
  }

  onUserConnected(socket) {
    this.handleAddConnection(socket);
    socket.on('disconnect', () => this.handleRemoveConnection(socket));
  }

  handleRemoveConnection(socket) {
    delete this.connected[socket.id];
    const lobbyInfo = this.getInfo();
    this.namespace.emit('lobby info', lobbyInfo);
  }

  getInfo() {
    return {
      lobbyLeader: connectedPlayers[0],
      connectedPlayers: Object.keys(this.connected).map(id => ({
        id, username: this.connected[id],
      })),
    }
  }
}

class LobbyService {
  constructor (io) {
    this.io = io;
    this.lobbies = {}
  }

  createLobby() {
    const id = uniqueId(Object.keys(this.lobbies));
    this.lobbies[id] = new Lobby(this.io.of(`/lobbies/${id}`));
    return id;
  }
}


module.exports = function createLobbyService (io) {
  return new LobbyService(io);
}