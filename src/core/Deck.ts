import Card from './Card';
class Deck {
  private _trash: ICard[];
  private _cards: ICard[];

  constructor() {
    const suits: Suit[] = ['spades', 'clubs', 'hearts', 'diamonds'];
    const ranks: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    this._cards = [];
    this._trash = [];
    suits.forEach((suit) =>
      ranks.forEach((rank) => this._cards.push(new Card(suit, rank))),
    );
    this.shuffle();
  }

  get cards(): ICard[] {
    return this._cards;
  }

  shuffle(): void {
    let cardsLeft = this._cards.length;
    let rand;

    while (cardsLeft) {
      rand = Math.floor(Math.random() * cardsLeft--);
      [this._cards[cardsLeft], this._cards[rand]] = [
        this._cards[rand],
        this._cards[cardsLeft],
      ];
    }
  }

  pop(): ICard {
    if (this._cards.length === 0) {
      this.restock();
    }
    const cardToDeal = this._cards.pop()!;
    this._trash.push(cardToDeal);
    return cardToDeal;
  }

  restock() {
    while (this._trash.length) {
      this._cards.push(this._trash.pop()!);
    }
    this.shuffle();
  }
}

export default Deck;
