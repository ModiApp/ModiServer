class ConnectedUser implements IConnectedUser {
  playerId: string;
  username: string;
  socket: SocketIO.Socket;

  constructor(playerId: string, username: string, socket: SocketIO.Socket) {
    this.playerId = playerId;
    this.username = username;
    this.socket = socket;
  }
}

export default ConnectedUser;
