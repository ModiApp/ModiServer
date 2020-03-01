/**
 * The game service will be responsible for managing connections and
 * actions for every live game.
 */

import { createModiGame, createModiPlayer } from "../core";
import { uniqueId, uniqueIds } from "../util";
import Player, { PlayerMove } from "../core/Player";
import ModiGame from "../core/ModiGame";

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
    nsp.on("connect", this.onConnect);
  }

  onConnect(socket: SocketIO.Socket): void {
    const { authorizedPlayerId } = socket.handshake.query;
    if (this.authorizedPlayerIds.includes(authorizedPlayerId)) {
      return; // we dont care about this lerker
    }
    this.authorizedConnections.set(authorizedPlayerId, socket);
    if (!this.game) {
      if (
        Object.values(this.nsp.connected).length ===
        this.authorizedPlayerIds.length
      ) {
        this.createGameInstance();
      }
    } else {
      this.sendGameState();
    }
    socket.on("disconnect", () => {
      this.authorizedConnections.set(authorizedPlayerId, undefined);
    });
  }

  getAuthorizedPlayerIds() {
    return this.authorizedPlayerIds;
  }

  getNamespaceName() {
    return this.nsp.name;
  }

  sendGameState() {
    this.nsp.emit("updated game state", {
      waitingForPlayers: this.game === undefined,
      connectedPlayers: Object.values(this.authorizedConnections)
        .map(socket => {
          const { authorizedPlayerId, username } = socket.handshake.query;
          return { id: authorizedPlayerId, username };
        })
        .filter(player => player.username !== undefined)
    });
  }

  private createGameInstance(): void {
    const createPlayer = ({ username, authorizedPlayerId }): Player => {
      return createModiPlayer(username, authorizedPlayerId, {
        getMove: () =>
          new Promise(res => {
            const currConn = this.authorizedConnections[authorizedPlayerId];
            currConn.on("move", (move: PlayerMove) => res(move));
          }),
        chooseDealer: () =>
          new Promise(res => {
            const currConn = this.authorizedConnections[authorizedPlayerId];
            currConn.on("dealerId", (dealersId: string) => res(dealersId));
          })
      });
    };
    const modiPlayers = Object.values(this.nsp.connected).map(
      (s: SocketIO.Socket) => {
        return createPlayer(s.handshake.query);
      }
    );
    this.game = createModiGame(modiPlayers);
    this.listenForGameEvents();
  }

  private listenForGameEvents() {
    this.game.on(ModiGame.Events.DealtCards, () => {
      this.nsp.emit("dealt cards");
    });
  }
}

type GameId = string;

interface ModiGameService {
  gameServers: Map<GameId, ModiGameServer>;
  createGameServer(numPlayers: number): GameId;
}
class ModiGameService implements ModiGameService {
  private io: SocketIO.Server;
  public gameServers: Map<GameId, ModiGameServer>;

  constructor(io: SocketIO.Server) {
    this.io = io;
    this.gameServers = new Map();
  }

  createGameServer(numPlayers: number) {
    const id = uniqueId(Array.from(this.gameServers.keys()));
    const nsp = this.io.of(`/games/${id}`);
    const gameServer = new ModiGameServer(nsp, numPlayers);
    this.gameServers.set(id, gameServer);
    return id;
  }

  findGameServerById(id) {
    return this.gameServers.get(id);
  }
}

interface ModiGameServer {
  gamePin: string;
}

function createGameService(io: SocketIO.Server): ModiGameService {
  return new ModiGameService(io);
}

export default createGameService;
