/**
 * The game service will be responsible for managing connections and
 * actions for every live game.
 */

import { ModiGame, Player } from "../core";
import { uniqueId, uniqueIds } from "../util";

type GameId = string;

interface ModiGameService {
  gameServers: Map<GameId, ModiGameServer>;
  createGameServer(numPlayers: number): ModiGameServer;
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
    return gameServer;
  }
}

interface ModiGameServer {
  gamePin: string;
}

class ModiGameServer {
  private namespace: SocketIO.Namespace;
  private authorizedPlayerIds: string[];

  constructor(nsp: SocketIO.Namespace, numPlayers: number) {
    this.authorizedPlayerIds = uniqueIds(numPlayers, 10);
    this.namespace = nsp;
  }

  getAuthorizedPlayerIds() {
    return this.authorizedPlayerIds;
  }

  getNamespaceName() {
    return this.namespace.name;
  }
}

function createGameService(io: SocketIO.Server): ModiGameService {
  return new ModiGameService(io);
}

export default createGameService;
