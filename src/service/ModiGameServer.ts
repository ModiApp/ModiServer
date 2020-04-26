import { createModiGame, createModiPlayer } from '../core';
import { uniqueIds } from '../util';

class ModiGameServer {
  private nsp: SocketIO.Namespace;
  private authorizedPlayerIds: string[];
  private authorizedConnections: Map<string, SocketIO.Socket>;
  private game: ModiGame | undefined; // Wait for all players to connect before creating

  constructor(nsp: SocketIO.Namespace, numPlayers: number) {
    this.authorizedPlayerIds = uniqueIds(numPlayers, 10);
    this.authorizedConnections = new Map(
      this.authorizedPlayerIds.map(id => [id, undefined])
    );
    this.nsp = nsp;
    this.game = undefined;
    nsp.on('connect', this.onConnect.bind(this));
  }

  onConnect(socket: SocketIO.Socket): void {
    const { authorizedPlayerId } = socket.handshake.query;
    if (!this.authorizedPlayerIds.includes(authorizedPlayerId)) {
      return; // we dont care about this lerker (yet...)
    }
    this.authorizedConnections.set(authorizedPlayerId, socket);
    if (!this.game) {
      const theGangsAllHere = Array.from(this.authorizedConnections.values())
                                   .filter(socket => socket !== undefined).length === this.authorizedPlayerIds.length;
      if (theGangsAllHere) {
        this.createGameInstance();
      }
    } else {
      this.sendGameState();
    }
    socket.on('disconnect', () => {
      this.authorizedConnections.set(authorizedPlayerId, undefined);
    });
  }

  getAuthorizedPlayerIds(): string[] {
    return this.authorizedPlayerIds;
  }

  getNamespaceName(): string {
    return this.nsp.name;
  }

  getConnectedPlayers(): { playerId: string, username: string }[] {
    return Array.from(this.authorizedConnections.entries())
    .filter(([_, socket]) => !!socket)
    .map(([playerId, socket]) => ({
      username: socket.handshake.query.username,
      playerId
    }));
  }

  sendGameState(): void {
    this.nsp.emit('updated game state', {
      waitingForPlayers: this.game === undefined,
      connectedPlayers: Object.values(this.authorizedConnections)
        .map(socket => {
          const { authorizedPlayerId, username } = socket.handshake.query;
          return { id: authorizedPlayerId, username };
        })
        .filter(player => player.username !== undefined),
    });
  }

  private createGameInstance(): void {
    const createPlayer = ({ username, authorizedPlayerId }): ModiPlayer => {
      return createModiPlayer(username, authorizedPlayerId, {
        getMove: () =>
          new Promise<PlayerMove>(res => {
            const currConn = this.authorizedConnections[authorizedPlayerId];
            currConn.on('move', move => res(move));
          }),
        chooseDealer: () =>
          new Promise<PlayerId>(res => {
            const currConn = this.authorizedConnections[authorizedPlayerId];
            currConn.on('dealerId', (dealersId: string) => res(dealersId));
          }),
      });
    };
    const modiPlayers = Object.values(
      this.nsp.connected
    ).map((s: SocketIO.Socket) => createPlayer(s.handshake.query));
    this.game = createModiGame(modiPlayers);
    console.log('created modigame!', this.game);
    this.listenForGameEvents();
  }

  private listenForGameEvents(): void {
    this.game.on('dealt cards', () => {
      this.nsp.emit('dealt cards');
    });
  }
}

export default ModiGameServer;
