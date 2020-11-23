/**
 * A Game room server needs to:
 *
 * 1. Keep track of who is connected to it
 *   1a. When a player connects it adds their playerId to the list of connected ones
 *   1b. When a player disconnects it removes their playerId from the list...
 *   1c. Alert all connections when connections change
 *   1d. Only allow players who's playerIds are authorized
 *
 * 2. Communicate game events to all connected clients
 *   2a. Allow players to initiate highcard
 *   2b. Allow players to make moves
 *   2c. Alert all connections when gamestate changes
 *   2d. Tailor game events on a per client basis:
 *      For example: Let's say
 *
 * The frontend is going to recieve
 *
 */

class ModiGameServer implements GameRoomServer {
  private game: ModiGameController;
  private connected: { [playerId: string]: GameRoomConnection | null };
  private usernames: { [playerId: string]: string };
  private didStart = false;

  constructor(game: ModiGameController) {
    this.game = game;
    this.connected = Object.fromEntries(
      game.authorizedPlayerIds.map((playerId) => [playerId, null]),
    );
    this.usernames = Object.fromEntries(
      game.authorizedPlayerIds.map((playerId) => [playerId, '']),
    );

    game.addGameStateListener((action, version) => {
      this.emitGameStateChange(action, version);
    });
  }

  handleConnection(connection: GameRoomConnection, lastRecievedEvtVersion = 0) {
    if (this.isAuthorizedPlayerId(connection.playerId)) {
      this.sendPastGameEvents(connection, lastRecievedEvtVersion);
      this.connected[connection.playerId] = connection;
      this.usernames[connection.playerId] = connection.username;
      this.emitConnections();
    } else {
      connection.onError('Authorization Error: Access token denied');
    }
  }

  handleStartGameRequest(connection: GameRoomConnection) {
    if (this.didStart) {
      return connection.onError('Game already started');
    }

    if (this.game.authorizedPlayerIds[0] === connection.playerId) {
      this.game.initiateHighcard();
    } else {
      connection.onError('Only game admin can start the game');
    }
  }

  handleDealCardsRequest(connection: GameRoomConnection) {
    if (!this.didStart) {
      this.handleStartGameRequest(connection);
      this.didStart = true;
    } else {
      this.game.dealCards(connection.playerId);
    }
  }

  handleChooseDealerRequest(
    connection: GameRoomConnection,
    params: DealerRequestDto,
  ) {
    try {
      this.game.setDealerId(connection.playerId, params.dealerId);
    } catch (e) {
      connection.onError(e.message);
    }
  }

  handleMakeMoveRequest(connection: GameRoomConnection) {}

  handleDisconnection(playerId: string) {
    this.connected[playerId] = null;
    this.emitConnections();
  }

  private sendPastGameEvents(
    connection: GameRoomConnection,
    fromVersion: number,
  ) {
    this.game
      .getActionHistory()
      .slice(fromVersion)
      .forEach(([gameEvent, version]) => {
        connection.onGameStateChanged(gameEvent, version);
      });
  }

  private emitConnections() {
    const connections: ConnectionResponseDto = Object.entries(
      this.connected,
    ).map(([playerId, connection]) => ({
      username: this.usernames[playerId],
      connected: !!connection,
      playerId,
    }));
    Object.values(this.connected)
      .filter((conn) => !!conn)
      .forEach((conn) => conn!.onConnectionsChanged(connections));
  }

  private isAuthorizedPlayerId(playerId: string) {
    return this.game.authorizedPlayerIds.includes(playerId);
  }

  private emitGameStateChange(action: StateChangeAction, version: number) {
    Object.values(this.connected)
      .filter((conn) => !!conn)
      .forEach((conn) => {
        conn!.onGameStateChanged(action, version);
      });
  }
}

export function createGameServer(game: ModiGameController) {
  return new ModiGameServer(game);
}
