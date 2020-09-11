class Card implements ICard {
  suit: Suit;
  rank: Rank;

  constructor(suit: Suit, rank: Rank) {
    this.suit = suit;
    this.rank = rank;
  }
}

export const suits: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds'];
export const ranks: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export default Card;
