import Deck from '../../src/core/Deck';
import Card, { suits, ranks } from '../../src/core/Card';

describe('Deck() unit tests:', () => {
  describe('Deck.constructor', () => {
    const d = new Deck();
    test('Deck has 52 cards', () => {
      expect(d.cards.length).toEqual(52);
    });
    test('Deck has 0 in trash', () => {
      // @ts-ignore
      expect(d._trash.length).toEqual(0);
    });
  });

  describe('Deck.constructor(withCardsOnTop)', () => {
    const initialCardsArray = [
      new Card('clubs', 2),
      new Card('diamonds', 4),
      new Card('spades', 5),
      new Card('diamonds', 10),
    ];
    const initCardsHash = JSON.stringify(initialCardsArray);
    const d = new Deck(initialCardsArray);

    test('constructor does not modify input array', () => {
      expect(JSON.stringify(initialCardsArray)).toBe(initCardsHash);
    });

    test('constructor does not add cards twice', () => {
      expect(d.cards.length).toBe(52);
    });

    test('top of deck matches the input array of cards', () => {
      expect(d.cards.slice(d.cards.length - initialCardsArray.length)).toEqual(
        initialCardsArray.reverse(),
      );
    });
  });

  describe('Deck.shuffle', () => {
    test('Deck is close to fully random', () => {
      const d = new Deck();
      const places: number[][] = [];
      for (let i = 0; i < suits.length; i++) {
        places.push([]);
        for (let j = 0; j < ranks.length; j++) places[i].push(0);
      }

      for (let i = 0; i < 52 * 52; i++) {
        d.shuffle();
        d.cards.forEach((card) => {
          places[suits.indexOf(card.suit)][ranks.indexOf(card.rank)] += 1;
        });
      }

      places.forEach((cardCounts) => {
        cardCounts.forEach((count) => {
          expect(count / 52 >= 0.95).toBe(true);
        });
      });
    });
  });

  describe('Deck.restock', () => {
    const d = new Deck();
    const randomAmountToDeal = Math.floor(Math.random() * 52);

    const dealt: Card[] = [];
    for (let i = 0; i < randomAmountToDeal; i++) {
      dealt.push(d.pop());
    }
    test('trash has same number as dealt cards', () => {
      // @ts-ignore
      expect(d._trash.length).toBe(randomAmountToDeal);
    });

    test('before reloading deck.cards is not full', () => {
      expect(d.cards.length).toBe(52 - randomAmountToDeal);
    });

    test('after reloading all cards from deck.trash were transfered to deck.cards', () => {
      d.restock();
      expect(d.cards.length).toBe(52);
      // @ts-ignore
      expect(d._trash.length).toBe(0);
    });
  });

  describe('Deck.pop', () => {
    const d = new Deck();
    const oldTop = d.cards[d.cards.length - 1];
    const oldLength = d.cards.length;
    const card = d.pop();

    test('returns card on top of stack', () => {
      expect(card instanceof Card).toBe(true);
      expect(card).toEqual(oldTop);
    });

    test('length of deck.cards decriments by one', () => {
      expect(d.cards.length + 1).toEqual(oldLength);
    });

    test('automatically reloads when empty if trash has cards', () => {
      while (d.cards.length) d.pop();

      expect(d.cards.length).toBe(0);
      expect(d.pop() instanceof Card).toBe(true);
      expect(d.cards.length).toBe(51);
    });
  });
});
