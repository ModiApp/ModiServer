export enum Suit {
  Spades,
  Hearts,
  Clubs,
  Diamonds
}

export enum Rank {
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

// TODO: I think this is unnecessary
export const ranks: Rank[] = [
  Rank.Ace,
  Rank.Two,
  Rank.Three,
  Rank.Four,
  Rank.Five,
  Rank.Six,
  Rank.Seven,
  Rank.Eight,
  Rank.Nine,
  Rank.Ten,
  Rank.Jack,
  Rank.Queen,
  Rank.King
];

// TODO: Also unnecessary
export const suits: Suit[] = [
  Suit.Spades,
  Suit.Hearts,
  Suit.Clubs,
  Suit.Diamonds
];

class Card {
  public rank: Rank;
  public suit: Suit;

  constructor(suit: Suit, rank: Rank) {
    this.rank = rank;
    this.suit = suit;
  }

  public value(): number {
    return this.rank + 1;
  }
}

export default Card;
