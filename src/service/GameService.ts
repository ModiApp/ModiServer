/**
 * The game service will be responsible for CRUDing ModiGameServer's
 */

import { uniqueId } from '../util';
import ModiGameServer from './ModiGameServer';

class ModiGameService {
  private io: SocketIO.Server;
  public gameServers: Map<GameId, ModiGameServer>;

  constructor(io: SocketIO.Server) {
    this.io = io;
    this.gameServers = new Map();
  }

  createGameServer(numPlayers: number): GameId {
    const id = uniqueId(Array.from(this.gameServers.keys()));
    const nsp = this.io.of(`/games/${id}`);
    const gameServer = new ModiGameServer(nsp, numPlayers);
    this.gameServers.set(id, gameServer);
    return id;
  }

  findGameServerById(id): ModiGameServer {
    return this.gameServers.get(id);
  }

  removeGameServerById(id): void {
    this.io.nsps[`/games/${id}`].removeAllListeners();
    delete this.io.nsps[`/games/${id}`];
    this.gameServers.delete(id);
  }
}

function createGameService(io: SocketIO.Server): ModiGameService {
  return new ModiGameService(io);
}

export default createGameService;
