declare type GameId = string;
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
  username: string;
  isAlive: boolean;
  initialLiveCount: number;
  loseLife: () => void;
  setCard: (card: ICard) => void;
  removeCard: () => void;
  tradeCardsWith: (otherPlayer: IModiPlayer) => void;

  /** Resets a players lives prop to its initial value */
  revive: () => void;
}

declare interface IConnectedUser {
  playerId: string;
  username: string;
  socket: SocketIO.Socket;
}

declare type PlayerId = string;

declare type CardMap = { [playerId: string]: ICard | undefined };

/** When the adjacent player has a king, this player's swap will be an
 * attempted-swap */
declare type PlayerMove = 'swap' | 'stick' | 'attempted-swap';

declare type ModiGameState = {
  round: number;
  moves: PlayerMove[];
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
