declare type PlayerId = string;

interface ModiGameState {
  players: ModiPlayer[];
  activePlayerId: string | undefined;
  cardsInDeck: Card[];
}

declare interface PlayerController {
  getMove(): Promise<PlayerMove>;
  chooseDealer(): Promise<PlayerId>;
}

declare type PlayerMove = 'stick' | 'swap';

declare type ModiGameEvent = 
  | 'dealt cards'
  | 'game info'
  | 'players turn'
  | 'hit deck'
  | 'ranked players'
  | 'trashed cards'
  | 'updated players';

declare class ModiGame {
  static Events: object;
  deck: DeckOfCards;
  players: ModiPlayer[];
  playersAlive: ModiPlayer[];
  constructor(players: ModiPlayer[]);
  start(): Promise<void>;
  playRound(): Promise<void>;
  playHighCard(amongPlayers?: ModiPlayer[]): ModiPlayer;
  clearPlayerCards(): void;
  noOneWonYet(): boolean;
  handleCardSwap(fromPlayer: ModiPlayer, toPlayer: ModiPlayer);
  handleHitDeck(player: ModiPlayer);
  giveEachPlayerACard(players?: ModiPlayer[]): void;
  rankPlayersByCards(players?: ModiPlayer[]): ModiPlayer[][];

  on(event: ModiGameEvent, callback: (...args: unknown[]) => void)
}
declare class ModiPlayer {
  /** It is intended for the playerId to be passed in as a parameter. To enable whatever
   * service program that is dealing with them to have control over their ids.
  */
  constructor(name: string, id: PlayerId, controller: ModiPlayer);
  wantsToSwap(): Promise<boolean>;
  tradeCardsWith(other: ModiPlayer): Card;
  recieveCard(card: Card): Card;
  removeCard(): Card | undefined;
  loseLife(): void;
  username: string;
  lives: number;
  controller: PlayerController;
  card?: Card;
  id: PlayerId;
}
declare interface PlayerController {
  getMove(): Promise<PlayerMove>;
  chooseDealer(): Promise<PlayerId>;
}

declare type Suit = "spades" | "hearts" | "clubs" | "diamonds"
declare type Rank =
  | 1 /* Ace */
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11 /* Jack */
  | 12 /* Queen */
  | 13 /* King */
  
declare class Card {
  suit: Suit;
  rank: Rank;
  constructor(suit: Suit, rank: Rank);
  value(): number;
}
declare interface DeckOfCards {
  cards: Card[];
  trash: Card[];
  shuffle(): void;
  dealCard(): Card;
  addToTrash(card: Card): Card;
  reload(): Card[];
}
