declare type GameState = {
  round: number;
  players: Player[];
  dealerIdx: number | null;
};

type DealtCardsAction = {
  type: 'DEALT_CARDS';
  payload: {
    cards: { playerIdx: number; card: Card }[];
  };
};

type TrashedCardsAction = {
  type: 'TRASHED_CARDS';
  payload: {},
}

type PlayerStuckAction = {
  type: 'PLAYER_STUCK';
  payload: { playerId: number };
};

type CardsSwappedAction = {
  type: 'PLAYERS_SWAPPED';
  payload: {
    fromPlayerIdx: number;
    toPlayerIdx: number;
  };
};

type PlayerHitDeckAction = {
  type: 'PLAYER_HIT_DECK';
  payload: {
    playerIdx: number;
    hitCard: Card;
  };
};

type NewRoundAction = {
  type: 'NEW_ROUND';
  payload: { dealerIdx: number };
}

type StateChangeAction =
  | DealtCardsAction
  | TrashedCardsAction
  | PlayerStuckAction
  | CardsSwappedAction
  | PlayerHitDeckAction
  | NewRoundAction;

interface StateMananger {
  initialState: GameState;
  actionHistory: StateChangeAction[];
  currentState: GameState;
  dispatch: StateDispatch;
}

interface StateDispatch {
  dealCards: (cards: Card[], toPlayers: Player[]) => void;
  removePlayersCards: () => void;
  newRound: (dealerIdx: number) => void;
  playerStuck: (playerIdx: number) => void;
  playerSwapped: (fromPlayerIdx: number, toPlayerIdx: number) => void;
  playerHitDeck: (playerIdx: number, hitCard: Card) => void;
}