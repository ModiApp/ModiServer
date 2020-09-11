import Card, { suits, ranks } from '../../src/core/Card';

describe('Card() unit tests:', () => {
  describe('Card.constructor', () => {
    test('card.suit and card.rank have correct values', () => {
      suits.forEach((suit) =>
        ranks.forEach((rank) => {
          const c = new Card(suit, rank);
          expect(c instanceof Card).toBe(true);
          expect(c.suit).toEqual(suit);
          expect(c.rank).toEqual(rank);
        }),
      );
    });
  });
});
