export const ranks: Rank[] = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13
];

// TODO: Also unnecessary
export const suits: Suit[] = [
  'spades',
  'clubs',
  'hearts',
  'diamonds',
];
class Card {
  public rank: Rank;
  public suit: Suit;

  constructor(suit: Suit, rank: Rank) {
    this.rank = rank;
    this.suit = suit;
  }

  public value(): number {
    return this.rank;
  }
}

export default Card;
