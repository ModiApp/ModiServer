declare interface GameStateStore {
  dispatch: (action: StateChangeAction) => GameState;
  getState: () => GameState;
  history: StateChangeAction[];
  initialState: GameState;
}

declare interface ModiGameController {
  start();
  handleMove(playerId: string, move: PlayerMove): 'success' | 'failed';
  setDealerId(dealerId: string, playerId);
}

interface IDeck {
  cards: Card[];
  trash: Card[];
  shuffle();
  pop(): Card;
  popMany(n: number): Card[];
}
