import Player from "../../src/core/Player";
import Card, { Rank, Suit } from "../../src/core/Card";

describe("Player() unit tests:", () => {
  describe("Player.constructor", () => {
    const p = new Player("ikey");
    test("player has correct username property", () => {
      expect(p).toHaveProperty("username");
      expect(p.username).toBe("ikey");
    });

    test("player has 3 lives", () => {
      expect(p).toHaveProperty("lives");
      expect(p.lives).toBe(3);
    });
  });

  describe("Player.recieveCard", () => {
    const p = new Player("ikey");
    const pCard = new Card(Suit.Spades, Rank.King);

    test("players card property gets set properly", () => {
      expect(p).not.toHaveProperty("card");

      const returnedValue = p.recieveCard(pCard);
      expect(returnedValue).toBe(pCard);
      expect(p).toHaveProperty("card");
      expect(p.card).toBe(pCard);
    });

    test("throws error when player already has card", () => {
      expect(() => {
        p.recieveCard(pCard);
      }).toThrow();
    });
  });

  describe("Player.removeCard", () => {
    const p = new Player("ikey");
    const pCard = new Card(Suit.Spades, Rank.King);
    p.recieveCard(pCard);

    test("player no longer has card property", () => {
      expect(p.card).toBe(pCard);
      const returnedValue = p.removeCard();
      expect(returnedValue).toBe(pCard);
      expect(p.card).toBe(undefined);
    });
  });
  describe("Player.tradeCardsWith", () => {
    const p1 = new Player("ikey");
    const p2 = new Player("jake");

    const p1Card = new Card(Suit.Spades, Rank.Ace);
    const p2Card = new Card(Suit.Hearts, Rank.Queen);

    p1.recieveCard(p1Card);
    p2.recieveCard(p2Card);

    test("players cards correctly trade", () => {
      expect(p1.card).toEqual(p1Card);
      expect(p2.card).toEqual(p2Card);

      const returnedCard = p1.tradeCardsWith(p2);

      expect(p1.card).toEqual(p2Card);
      expect(p2.card).toEqual(p1Card);

      expect(returnedCard).toBe(p2Card);
    });
  });

  describe("Player.loseLife", () => {
    const p = new Player("ikey");
    test("lives property decriments", () => {
      const lives = p.lives;
      p.loseLife();
      expect(lives).toEqual(p.lives + 1);
    });
  });
});
