class ConnectedPlayer implements PlayerBase {
  idx: number;
  username: string;
  socket: SocketIO.Socket;

  constructor(idx: number, username: string, socket: SocketIO.Socket) {
    this.idx = idx;
    this.username = username;
    this.socket = socket;
  }
}

export default ConnectedPlayer;
