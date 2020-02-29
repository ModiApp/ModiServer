// import { uniqueId, uniqueIds, onValueChanged } from "../util";
// import createConnectableLobby from "./Lobby";

// class LobbyService implements ILobbyService {
//   private io: SocketIO.Server;
//   public lobbies: Map<any, any>;

//   constructor(io: SocketIO.Server) {
//     this.io = io;
//     this.lobbies = new Map();
//   }

//   createLobby(onStartEvent: (usernames: string[]) => string) {
//     const id = uniqueId(Array.from(this.lobbies.keys()));
//     const lobby = createConnectableLobby(
//       this.io.of(`/lobbies/${id}`),
//       onStartEvent
//     );
//     this.lobbies.set(id, lobby);
//     return id;
//   }

//   removeLobby(id: LobbyId): boolean {
//     return this.lobbies.delete(id);
//   }

//   findById(id: LobbyId): LobbyInfo | undefined {
//     return this.lobbies.has(id) ? this.lobbies.get(id).getInfo() : undefined;
//   }
// }

// function createLobbyService(io: SocketIO.Server): LobbyService {
//   return new LobbyService(io);
// }

// export default createLobbyService;
