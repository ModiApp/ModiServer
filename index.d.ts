interface Card {
  rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
  suit: 'spades' | 'hearts' | 'clubs' | 'diamonds';
}
type PlayerMove = 'swap' | 'stick' | 'hit deck';
type AdjustedPlayerMove = PlayerMove | 'attempted-swap';
interface Player {
  id: string;
  lives: number;
  card?: Card;
  move?: AdjustedPlayerMove;
}
declare type GameState = {
  players: Player[];
  version: number;
}
type Connections = {
  [playerId: string]: { username: string; connected: boolean };
};

declare type StateChangeAction = 'DEALT_CARDS' | ''