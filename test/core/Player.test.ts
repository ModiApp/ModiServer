import createModiPlayer from "../../src/core/Player";
import Card from '../../src/core/Card';

const createMockPlayer = (name?) => createModiPlayer(name || 'ikey', '1', {
  getMove: () => new Promise<PlayerMove>(r => r(Math.random() > 0.5 ? 'stick': 'swap')),
  chooseDealer: () => new Promise<PlayerId>(r => r('1')),
});

describe("Player() unit tests:", () => {
  describe("Player.constructor", () => {
    const p = createMockPlayer();
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
    const p = createMockPlayer();
    const pCard = new Card('spades', 13);

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

  describe("ModiPlayer.removeCard", () => {
    const p = createMockPlayer();
    const pCard = new Card('spades', 1);
    p.recieveCard(pCard);

    test("player no longer has card property", () => {
      expect(p.card).toBe(pCard);
      const returnedValue = p.removeCard();
      expect(returnedValue).toBe(pCard);
      expect(p.card).toBe(undefined);
    });
  });
  describe("ModiPlayer.tradeCardsWith", () => {
    const p1 = createMockPlayer();
    const p2 = createMockPlayer('jake');

    const p1Card = new Card('spades', 1);
    const p2Card = new Card('hearts', 12);

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
    const p = createMockPlayer();
    test("lives property decriments", () => {
      const lives = p.lives;
      p.loseLife();
      expect(lives).toEqual(p.lives + 1);
    });
  });
});
