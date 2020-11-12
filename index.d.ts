declare interface StateStore<State, Action> {
  addListener(cb: StateChangeCallback): string;
  dispatch: (action: Action) => State;
  getState: () => State;
  history: Action[];
  initialState: State;
}

declare interface ModiGameController {
  start();
  handleMove(playerId: string, move: PlayerMove): 'success' | 'failed';
  setDealerId(dealerId: string, playerId);
  addGameStateListener(cb: StateChangeCallback): string;
  getActionHistory(): StateChangeAction[];
  authorizedPlayerIds: string[];
}

interface IDeck {
  cards: Card[];
  trash: Card[];
  shuffle();
  pop(): Card;
  popMany(n: number): Card[];
}

// type ConnectionOnArgs = ['disconnect', () => void] | ['start'];

interface GameRoomConnection {
  onConnectionsChanged(connections: ConnectionResponseDto): any;
  onError(message: string): any;
  onGameStateChanged: StateChangeCallback;
  username: string;
  playerId: string;
}

declare interface GameRoomServer {
  handleConnection(connection: GameRoomConnection): void;
  handleDisconnection(playerId: string): void;
  handleStartGameRequest(connection: GameRoomConnection): void;
  handleMakeMoveRequest(connection: GameRoomConnection): void;
  handleChooseDealerRequest(
    connection: GameRoomConnection,
    params: DealerRequestDto,
  ): void;
}
