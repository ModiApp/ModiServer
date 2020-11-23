declare interface StateStore<State, Action> {
  addListener(cb: StateChangeCallback): string;
  dispatch: (action: Action) => State;
  getState: () => State;
  history: Action[];
  initialState: State;
}

declare interface ModiGameController {
  initiateHighcard(): void;
  dealCards(playerId: string, toPlayerIds?: string[]): void;
  handleMove(playerId: string, move: PlayerMove): 'success' | 'failed';
  setDealerId(playerId: string, dealerId: string): void;
  addGameStateListener(cb: StateChangeCallback): { remove: () => void };
  getActionHistory(): [StateChangeAction, number][];
  authorizedPlayerIds: string[];
}

interface IDeck {
  cards: Card[];
  trash: Card[];
  shuffle(): Card[];
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

declare interface HistoryStore<T> {
  /** Adds an element to the history store. Returns its index. */
  push(el: T): number;

  /** The inputted callback will be called whenever a new element gets added */
  addListener(callback: HistoryListenerCallback<T>): { remove(): void };

  /** Returns a slice of the history array.
   * @return an array of [T, index]
   */
  getSlice(start?: number, end?: number): [T, number][];

  get(index: number): T;

  length: number;
}
type HistoryListenerCallback<T> = (el: T, index: number) => any;
