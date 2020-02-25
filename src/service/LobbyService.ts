import { uniqueId, uniqueIds } from "../util";

type LobbyId = string;
type SocketId = string;
type Username = string;
type EventId = string;

type LobbyAttendee = {
  id: string;
  username: string;
};

type LobbyInfo = {
  lobbyLeader: LobbyAttendee;
  connectedPlayers: Array<LobbyAttendee>;
};

class Lobby {
  private namespace: SocketIO.Namespace;
  public connected: Map<SocketId, Username>;
  public onStartEventTriggered: (attendeeIds: string[]) => EventId;

  constructor(namespace: SocketIO.Namespace, onStartEventTriggered) {
    this.namespace = namespace;
    this.connected = new Map();
    this.onStartEventTriggered = onStartEventTriggered;
    this.namespace.on("connection", s => this.onUserConnected(s));
  }

  handleAddConnection(s: SocketIO.Socket) {
    const { username } = s.handshake.query;
    username && this.connected.set(s.id, username);
    const lobbyInfo = this.getInfo();
    this.namespace.emit("lobby info", lobbyInfo);
  }

  onUserConnected(s: SocketIO.Socket) {
    this.handleAddConnection(s);
    s.on("disconnect", () => this.handleRemoveConnection(s));
  }

  handleRemoveConnection(s: SocketIO.Socket) {
    this.connected.delete(s.id);

    const lobbyInfo = this.getInfo();
    this.namespace.emit("lobby info", lobbyInfo);
  }

  handleEventStart() {
    const userIds = uniqueIds(this.connected.size);
    const eventId = this.onStartEventTriggered(userIds);
    this.namespace.emit("event started", { eventId });
  }

  getInfo(): LobbyInfo {
    return {
      lobbyLeader: this.getLeader(),
      connectedPlayers: Array.from(this.connected.keys()).map(id => ({
        id,
        username: this.connected.get(id)
      }))
    };
  }

  getLeader(): LobbyAttendee {
    const leaderId = Array.from(this.connected.keys())[0];
    return { id: leaderId, username: this.connected.get(leaderId) };
  }

  isEmpty() {
    return this.connected.size === 0;
  }
}

interface LobbyService {
  /** A map of unique lobby ids, to active lobby instances */
  lobbies: Map<LobbyId, Lobby>;

  /** Creates a new connectable lobby instance
   * @param {function} onStartEvent A callback function to execute when the lobby leader
   * emit's the 'start event' event. It recieves a set of unique user ids as a parameter
   * and is expected to return some sort of EventId as a string.
   * @return {string} The id of the created lobby
   */
  createLobby(onStartEvent: (attendeeIds: string[]) => EventId): LobbyId;

  /** Removes a lobby with given lobby id.
   * @param {string} id The id of the intended lobby to delete
   * @return {boolean} whether or not the lobby existed and got deleted
   */
  removeLobby(id: LobbyId): boolean;

  /** Returns the LobbyInfo of the lobby with given id
   * @param {string} id The id of the lobby whose info we should be returned
   * @return The lobby information if lobby was found, otherwise undefined.
   */
  findById(id: LobbyId): LobbyInfo | undefined;
}

class LobbyService implements LobbyService {
  private io: SocketIO.Server;
  public lobbies: Map<LobbyId, Lobby>;

  constructor(io: SocketIO.Server) {
    this.io = io;
    this.lobbies = new Map();
  }

  createLobby(onStartEvent) {
    const id = uniqueId(Array.from(this.lobbies.keys()));
    const lobby = new Lobby(this.io.of(`/lobbies/${id}`), onStartEvent);
    this.lobbies.set(id, lobby);
    return id;
  }

  removeLobby(id: LobbyId): boolean {
    return this.lobbies.delete(id);
  }

  findById(id: LobbyId): LobbyInfo | undefined {
    return this.lobbies.has(id) ? this.lobbies.get(id).getInfo() : undefined;
  }
}

function createLobbyService(io: SocketIO.Server): LobbyService {
  return new LobbyService(io);
}

export default createLobbyService;
