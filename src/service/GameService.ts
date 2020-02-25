/**
 * The game service will be responsible for managing connections and
 * actions for every live game.
 */

import { ModiGame, Player } from "../core";
import { uniqueId } from "../util";

type GameId = string;

interface ModiGameService {
  gameServers: Map<GameId, ModiGameServer>;
  createGameServer(authorizedPlayerIds: string[]): GameId;
}
class ModiGameService implements ModiGameService {
  private io: SocketIO.Server;
  public gameServers: Map<GameId, ModiGameServer>;

  constructor(io: SocketIO.Server) {
    this.io = io;
    this.gameServers = new Map();
  }

  createGameServer(authorizedPlayerIds: string[]) {
    const id = uniqueId(Array.from(this.gameServers.keys()));
    const nsp = this.io.of(`/games/${id}`);
    const gameServer = new ModiGameServer(nsp, authorizedPlayerIds);
    this.gameServers.set(id, gameServer);
    return id;
  }
}

interface ModiGameServer {
  gamePin: string;
}

class ModiGameServer {
  private namespace: SocketIO.Namespace;
  private authorizedPlayerIds: string[];

  constructor(nsp: SocketIO.Namespace, playerIds: string[]) {
    this.authorizedPlayerIds = playerIds;
    this.namespace;
  }
}

function createGameService(io: SocketIO.Server): ModiGameService {
  return new ModiGameService(io);
}

export default createGameService;
