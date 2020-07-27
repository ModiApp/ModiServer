declare type Suit = 'spades' | 'clubs' | 'hearts' | 'diamonds';
declare type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
declare interface ICard {
  suit: Suit;
  rank: Rank;
}
declare interface IModiPlayer {
  id: string;
  lives: number;
  card: ICard | undefined;
  isAlive: boolean;
  loseLife: () => void;
  setCard: (card: ICard) => void;
  removeCard: () => void;
  tradeCardsWith: (otherPlayer: IModiPlayer) => void;
}
declare type PlayerId = string;

declare type CardMap = { [playerId: string]: ICard | undefined };

/** When the adjacent player has a king, this player's swap will be an
 * attempted-swap */
declare type PlayerMove = 'stick' | 'swap' | 'attempted-swap';

declare type ModiGameState = {
  /** What round the game is currently up to */
  round: number;

  /** The id of this round's dealer */
  // dealerId: PlayerId;

  /** The ```ModiGameState.playerOrder[activePlayerIdx]``` is the player whose
   * turn it is. */
  // activePlayerIdx: number | undefined;

  /** A map of player ids to whether or not they have a card */
  // playersCards: CardMap;

  /** An array of playerIds and their moves for this round */
  moves: PlayerMove[];

  /** A map of player ids and their live counts */
  // liveCounts: { [playerId: string]: number };

  /** Changes each round, as dealer moves left. Dealer is last. */
  // playerOrder: PlayerId[];

  players: IModiPlayer[];

  _stateVersion: number;
};

type PlayersUpdatedAction = {
  type: 'PLAYERS_UPDATED';
  payload: { players: IModiPlayer[] };
};
type ActivePlayerIdxChangedAction = {
  type: 'ACTIVE_PLAYER_CHANGED';
  payload: { activePlayerIdx: number };
};
type RoundIncrementedAction = {
  type: 'ROUND_INCREMENTED';
};
type MoveAddedAction = {
  type: 'MOVE_ADDED';
  payload: { move: PlayerMove };
};
type MovesResetAction = {
  type: 'MOVES_RESET';
};

type ActivePlayerChangedAction = {};

type ModiGameStateAction =
  | PlayersUpdatedAction
  | ActivePlayerIdxChangedAction
  | RoundIncrementedAction
  | MoveAddedAction
  | MovesResetAction;

type ModiGameStateStore = import('redux').Store<
  ModiGameState,
  ModiGameStateAction
>;
