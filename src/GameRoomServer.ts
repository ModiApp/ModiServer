/**
 * A Game room server needs to:
 *
 * 1. Keep track of who is connected to it
 *   1a. When a player connects it adds their playerId to the list of connected ones
 *   1b. When a player disconnects it removes their playerId from the list...
 *   1c. Alert all connections when connections change
 *   1d. Only allow players who's playerIds are authorized
 *
 * 2. Keep track of gamestate
 *   2a. Record the order of playerIds as they were passed in
 *   2b. Allow players to initiate highcard
 *   2d. Allow players to make moves
 *   2c. Alert all connections when gamestate changes
 *
 */

class ModiGameServer implements GameRoomServer {
  private game: ModiGameController;
  private connected: { [playerId: string]: GameRoomConnection | null };
  private usernames: { [playerId: string]: string };

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

  handleConnection(connection: GameRoomConnection) {
    if (this.isAuthorizedPlayerId(connection.playerId)) {
      this.connected[connection.playerId] = connection;
      this.usernames[connection.playerId] = connection.username;
      this.emitConnections();
    } else {
      connection.onError('Authorization Error: Access token denied');
    }
  }

  handleStartGameRequest(connection: GameRoomConnection) {
    if (this.game.authorizedPlayerIds[0] === connection.playerId) {
      this.game.start();
    } else {
      connection.onError('Authorization Error: Access token denied');
    }
  }

  handleChooseDealerRequest(
    connection: GameRoomConnection,
    params: DealerRequestDto,
  ) {
    try {
      this.game.setDealerId(params.dealerId, connection.playerId);
    } catch (e) {
      connection.onError(e.message);
    }
  }

  handleMakeMoveRequest(connection: GameRoomConnection) {}

  handleDisconnection(playerId: string) {
    this.connected[playerId] = null;
    this.emitConnections();
  }

  private emitConnections() {
    const connections: ConnectionResponseDto = Object.fromEntries(
      Object.entries(this.connected).map(([playerId, conn]) => [
        playerId,
        { username: this.usernames[playerId], connected: !!conn },
      ]),
    );
    Object.values(this.connected)
      .filter((conn) => !!conn)
      .forEach((conn) => conn?.onConnectionsChanged(connections));
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
