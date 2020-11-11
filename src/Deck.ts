const ranks: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const suits: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds'];

class Deck implements IDeck {
  cards: Card[] = [];
  trash: Card[] = [];
  constructor() {
    suits.forEach((suit) =>
      ranks.forEach((rank) => this.cards.push({ suit, rank })),
    );
  }
  shuffle() {}
  pop() {
    if (this.cards.length === 0) {
      this.reloadFromTrash();
    }
    const card = this.cards.pop()!;
    this.trash.push(card);
    return card;
  }
  popMany(n: number) {
    return Array(n)
      .fill(null)
      .map(() => this.pop());
  }

  reloadFromTrash() {
    while (this.trash.length) {
      this.cards.push(this.trash.pop()!);
    }
    this.shuffle();
  }
}

export function createCardDeck() {
  return new Deck();
}

export default Deck;
