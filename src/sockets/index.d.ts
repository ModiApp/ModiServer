declare type LobbyId = string;
declare type SocketId = string;
declare type Username = string;
declare type EventId = string;

declare type LobbyAttendee = {
  id: string;
  username: string;
};

declare type LobbyInfo = {
  lobbyLeader: LobbyAttendee;
  connectedPlayers: Array<LobbyAttendee>;
};

/** The lobby interface */
declare interface ILobby {
  getInfo(): LobbyInfo;
}

/**
 * A callback function that gets fired when the leader of [the lobby being created]
 * triggers the start event function. It is intended to take a list of usernames as
 * a param (so the event being created knows who's in it) and to return an EventId
 * (so the Lobby instance can tell its attendees where to find the event)
 * @param {string[]} usernames The usernames in the lobby at time of event begining
 * @return {string} The id of the event being created as a result of the lobby's 'start'
 * method being triggered.
 */
declare type LobbyStartCB = (usernames: Username[]) => EventId;

declare interface ILobbyService {
  /** A map of unique lobby ids, to active lobby instances */
  lobbies: Map<LobbyId, ILobby>;

  /** Creates a new connectable lobby instance
   * @param {function} onStartEvent A callback function to execute when the lobby leader
   * emit's the 'start event' event. It recieves a set of unique user ids as a parameter
   * and is expected to return some sort of EventId as a string.
   * @return {string} The id of the created lobby
   */
  createLobby(onStartEventTriggered: LobbyStartCB): LobbyId;

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
