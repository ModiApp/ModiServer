const { default: Deck } = require("../dist/Deck");
const { default: Card, suits, ranks } = require("../dist/Card");

describe("Deck() unit tests:", () => {
  describe("Deck.constructor", () => {
    const d = new Deck();
    test("Deck has 52 cards", () => {
      expect(d.cards.length).toEqual(52);
    });
    test("Deck has 0 in trash", () => {
      expect(d.trash.length).toEqual(0);
    });
  });

  describe("Deck.shuffle", () => {
    test("Deck is close to fully random", () => {
      const d = new Deck();
      const places = [];
      for (let i = 0; i < suits.length; i++) {
        places.push([]);
        for (let j = 0; j < 13; j++) places[i].push(0);
      }

      for (let i = 0; i < 52 * 52; i++) {
        d.shuffle();
        d.cards.forEach(card => {
          places[suits.indexOf(card.suit)][ranks.indexOf(card.rank)] += 1;
        });
      }

      places.forEach(cardCounts => {
        cardCounts.forEach(count => {
          expect(count / 52 >= 0.95).toBe(true);
        });
      });
    });
  });

  describe("Deck.addToTrash", () => {
    const d = new Deck();
    const oldTrashLength = d.trash.length;
    const cardToTrash = d.dealCard();
    d.addToTrash(cardToTrash);
    test("trashed card is on top of deck.trash", () => {
      expect(d.trash[d.trash.length - 1]).toEqual(cardToTrash);
    });

    test("length of deck.trash incriments by one", () => {
      expect(d.trash.length - 1).toEqual(oldTrashLength);
    });
  });

  describe("Deck.reload", () => {
    const d = new Deck();
    const randomAmountToDeal = Math.floor(Math.random() * 52);
    const randomAmountToTrash = Math.floor(Math.random() * randomAmountToDeal);
    const dealt = [];
    for (let i = 0; i < randomAmountToDeal; i++) {
      dealt.push(d.dealCard());
    }
    test("trash is empty before adding to it", () => {
      expect(d.trash.length).toBe(0);
    });

    test("trash has correct amount in trash after trashing cards", () => {
      for (let i = 0; i < randomAmountToTrash; i++) {
        d.addToTrash(dealt.pop());
      }
      expect(d.trash.length).toBe(randomAmountToTrash);
    });

    test("before reloading deck.cards is not full", () => {
      expect(d.cards.length).toBe(52 - randomAmountToDeal);
    });

    test("after reloading all cards from deck.trash were transfered to deck.cards", () => {
      d.reload();
      expect(d.cards.length).toBe(
        52 - randomAmountToDeal + randomAmountToTrash
      );
      expect(d.trash.length).toBe(0);
    });
  });

  describe("Deck.dealCard", () => {
    const d = new Deck();
    const oldTop = d.cards[d.cards.length - 1];
    const oldLength = d.cards.length;
    const card = d.addToTrash(d.dealCard());

    test("returns card on top of stack", () => {
      expect(card instanceof Card).toBe(true);
      expect(card).toEqual(oldTop);
    });

    test("length of deck.cards decriments by one", () => {
      expect(d.cards.length + 1).toEqual(oldLength);
    });

    test("automatically reloads when empty if trash has cards", () => {
      while (d.cards.length) d.addToTrash(d.dealCard());

      expect(d.cards.length).toBe(0);
      expect(d.dealCard() instanceof Card).toBe(true);
      expect(d.cards.length).toBe(51);
    });

    test("throws an error when empty and trash is empty", () => {
      while (d.cards.length) d.dealCard();

      expect(d.cards.length).toBe(0);
      expect(d.trash.length).toBe(0);
      expect(() => {
        d.dealCard();
      }).toThrow();
      expect(d.cards.length).toBe(0);
    });
  });
});
