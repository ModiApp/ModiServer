import Card, { ranks, suits } from "./Card";

class Deck implements DeckOfCards {
  public cards: Card[];
  public trash: Card[];

  constructor() {
    this.cards = [];
    suits.forEach((suit: Suit) =>
      ranks.forEach((rank: Rank) => {
        this.cards.push(new Card(suit, rank));
      })
    );

    this.trash = [];
  }

  public shuffle() {
    let cardsLeft = this.cards.length;
    let rand;

    while (cardsLeft) {
      rand = Math.floor(Math.random() * cardsLeft--);
      [this.cards[cardsLeft], this.cards[rand]] = [
        this.cards[rand],
        this.cards[cardsLeft],
      ];
    }
  }

  public dealCard(): Card {
    if (!this.cards.length) {
      if (!this.trash.length) {
        throw new Error('No cards left in deck');
      }
      this.reload();
    }
    return this.cards.pop();
  }

  public addToTrash(card: Card): Card {
    this.trash.push(card);
    return card;
  }

  public reload(): Card[] {
    while (this.trash.length) {
      this.cards.push(this.trash.pop());
    }
    this.shuffle();
    return this.cards;
  }
}

function createDeckOfCards(): DeckOfCards {
  return new Deck();
}

export default createDeckOfCards;
