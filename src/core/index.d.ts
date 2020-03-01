declare class ModiGame {
  static Events: object;
  deck: Deck;
  players: Player[];
  playersAlive: Player[];
  constructor(players: Player[]);
  start(): Promise<void>;
}
declare interface Player {
  username: string;
  lives: number;
  controller: IPlayer;
  card?: Card;
  constructor(name: string, controller: IPlayer);
  wantsToSwap(): Promise<boolean>;
  tradeCardsWith(other: Player): Card;
  recieveCard(card: Card): Card;
  removeCard(): Card | undefined;
  loseLife(): void;
}
declare interface IPlayer {
  getMove(): Promise<PlayerMove>;
}
declare enum PlayerMove {
  Stick,
  Swap
}
declare enum Suit {
  Spades,
  Hearts,
  Clubs,
  Diamonds
}
declare enum Rank {
  Ace = 1,
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
  Ten,
  Jack,
  Queen,
  King
}
declare class Card {
  suit: Suit;
  rank: Rank;
  constructor(suit: Suit, rank: Rank);
  value(): number;
}
declare class Deck {
  cards: Card[];
  trash: Card[];
  constructor();
  shuffle(): void;
  dealCard(): Card;
  addToTrash(card: Card): Card;
  reload(): Card[];
}
