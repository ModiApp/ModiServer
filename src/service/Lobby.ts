import { uniqueIds, onValueChanged } from "../util";

class Lobby implements ILobby {
  private namespace: SocketIO.Namespace;

  @onValueChanged(this.sendLobbyInfoToAttendees)
  connected: Map<SocketId, Username>;

  constructor(
    namespace: SocketIO.Namespace,
    onStartEventTriggered: (connections: {
      [id: string]: SocketIO.Socket;
    }) => void
  ) {
    this.namespace = namespace;
    this.connected = new Map();

    this.namespace.on("connection", this.onUserConnected.bind(this));
    this.namespace.on("start event", () =>
      onStartEventTriggered(namespace.connected)
    );
  }

  public isEmpty() {
    return this.connected.size === 0;
  }

  public getInfo(): LobbyInfo {
    return {
      lobbyLeader: this.getLeader(),
      connectedPlayers: Array.from(this.connected.keys()).map((id: string) => ({
        id,
        username: this.connected.get(id)
      }))
    };
  }

  private handleAddConnection(s: SocketIO.Socket) {
    const { username } = s.handshake.query;
    username && this.connected.set(s.id, username);
  }

  private onUserConnected(s: SocketIO.Socket) {
    this.handleAddConnection(s);
    s.on("disconnect", () => this.connected.delete(s.id));
  }

  private getLeader(): LobbyAttendee {
    const leaderId = Array.from(this.connected.keys())[0] || "";
    return { id: leaderId, username: this.connected.get(leaderId) };
  }
}

/** Takes a socket.io namespace, and a callback function to run when the
 * leader of this lobby triggers the 'start' event. Creates a new Lobby instance.
 */
export default function createConnectableLobby(
  nsp: SocketIO.Namespace,
  onStartEventTriggered: (connected: { [id: string]: SocketIO.Socket }) => void
) {
  return new Lobby(nsp, onStartEventTriggered);
}
