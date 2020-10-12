import Card from './Card';
class Deck implements IDeck {
  private _trash: Card[];
  private _cards: Card[];

  constructor(withCardsOnTop = [] as Card[]) {
    const suits: Suit[] = ['spades', 'clubs', 'hearts', 'diamonds'];
    const ranks: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    this._cards = [];
    this._trash = [];

    suits.forEach((suit) =>
      ranks.forEach((rank) => this._cards.push(new Card(suit, rank))),
    );
    this.shuffle();

    if (withCardsOnTop.length) {
      this.bubbleCardsToTop(withCardsOnTop);
    }
  }

  get cards(): Card[] {
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

  pop(): Card {
    if (this._cards.length === 0) {
      this.restock();
    }
    const cardToDeal = this._cards.pop()!;
    this._trash.push(cardToDeal);
    return cardToDeal;
  }

  popMany(n: number): Card[] {
    return Array(n)
      .fill(null)
      .map(() => this.pop());
  }

  restock() {
    while (this._trash.length) {
      this._cards.push(this._trash.pop()!);
    }
    this.shuffle();
  }

  private bubbleCardsToTop(cards: Card[]) {
    let bubbleCount = 0;
    cards.forEach((card) => {
      for (let i = 0; i < this._cards.length - bubbleCount; i++) {
        const currCard = this._cards[i];
        if (currCard.suit === card.suit && currCard.rank === card.rank) {
          const idxOfBubbleCard = this._cards.length - bubbleCount - 1;
          const lastCard = this._cards[idxOfBubbleCard];
          this._cards[idxOfBubbleCard] = currCard;
          this._cards[i] = lastCard;
          bubbleCount += 1;
        }
      }
    });
  }
}

export default Deck;
