declare type Suit = 'spades' | 'hearts' | 'clubs' | 'diamonds';
declare type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
declare interface Card {
  suit: Suit;
  rank: Rank;
}
declare interface IDeck {
  cards: Card[];
  shuffle: () => void;
  pop: () => Card;
  popMany: (n: number) => Card[];
  restock: () => void;
}

type PlayerId = number;
declare interface PlayerBase {
  idx: number;
  username: string;
}

declare type PlayerMove = 'stick' | 'swap' | 'attempted-swap' | 'hit-deck';
declare interface Player extends PlayerBase {
  lives: number;
  card: Card | null;
  move: PlayerMove | null;
}
declare interface ActivePlayer extends Player {
  move: PlayerMove;
  card: Card;
}

declare interface ModiGame {
  playHighCard: () => PlayerId;
  startRound: (dealerId: PlayerId) => void;
  handleMove: (playerIdx, move: PlayerMove) => void;
  isMyTurn: (playerId: PlayerId) => boolean;
  initialState: GameState;
  stateHistory: GameState[];
  state: GameState;
}