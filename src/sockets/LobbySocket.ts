import { zipArrays, ScheduledTask } from '../util';

function createLobbySocket(
  io: SocketIO.Server,
  lobbyId: string,

  /** Called when lobby leader requests the START event */
  onEventStart: (
    usernames: string[],
  ) => { eventId: string; authorizedUserIds: string[] },

  /** Called when the lobby has zero connections to it */
  onDelete: () => void,
) {
  const nspUrl = `/lobbies/${lobbyId}`;
  if (Object.keys(io.nsps).includes(nspUrl)) {
    throw new Error(
      `Unable to create lobby socket for lobbyId ${lobbyId}. Lobby with that lobbyId already exists`,
    );
  }

  const nsp = io.of(nspUrl);
  const attendees: { username: string; id: string }[] = [];

  const deleteLobbyTask = new ScheduledTask(() => {
    nsp.removeAllListeners();
    delete io.nsps['/lobbies/' + lobbyId];
    onDelete();
  });

  nsp.on('connect', (socket: SocketIO.Socket) => {
    deleteLobbyTask.cancel();
    const { username } = socket.handshake.query;
    attendees.push({ username, id: socket.id });
    nsp.emit('LOBBY_STATE_UPDATED', { attendees });

    socket.on('disconnect', () => {
      attendees.splice(
        attendees.findIndex((conn) => conn.id === socket.id),
        1,
      );
      nsp.emit('LOBBY_STATE_UPDATED', { attendees });

      if (attendees.length === 0) {
        deleteLobbyTask.schedule(1000 * 60 * 5);
      }
    });

    socket.on('START_GAME', () => {
      const usernames = attendees.map((conn) => conn.username);
      const { eventId, authorizedUserIds } = onEventStart(usernames);
      zipArrays(Object.values(nsp.connected), authorizedUserIds).forEach(
        ([socket, accessToken]) => {
          socket.emit('EVENT_STARTED', { eventId, accessToken });
        },
      );
    });
  });
}

export default createLobbySocket;
