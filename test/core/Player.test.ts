import Card from '../../src/core/Card';
import Player from '../../src/core/Player';

describe('Player() Tests:', () => {
  describe('Player.contructor()', () => {
    const player = new Player('123', 'Ikey');
    const playerWithSpecifiedLives = new Player('124', 'Edward', 5);

    test('player.id is the id that was passed into constructor', () => {
      expect(player.id).toBe('123');
    });

    test('player.username is the username that was passed in', () => {
      expect(player.username).toBe('Ikey');
    });

    test('player.card is initially undefined', () => {
      expect(player.card).toBe(undefined);
    });

    test('player.lives defaults to 3 lives', () => {
      expect(player.lives).toBe(3);
    });

    test('player with speficified initial live count has that live count', () => {
      expect(playerWithSpecifiedLives.lives).toBe(5);
    });
  });

  describe('Player.loseLife()', () => {
    test('after calling player.loseLife(), player has one less life', () => {
      const player = new Player('123', 'Ikey');
      const playerLives = player.lives;
      player.loseLife();
      expect(player.lives).toBe(playerLives - 1);
    });
    test('calling player.loseLife() too many times leads to error', () => {
      const player = new Player('125', 'Ikey');
      while (player.lives) player.loseLife();

      expect(player.lives).toBe(0);
      expect(() => player.loseLife()).toThrow(
        'Player 125 has no lives left to lose.',
      );
    });
  });

  describe('Player.revive()', () => {
    const player = new Player('123', 'Ikey', 5);
    test('players lives get reset to their initial live count', () => {
      expect(player.lives).toBe(5);
      while (player.lives) player.loseLife();
      expect(player.lives).toBe(0);
      player.revive();
      expect(player.lives).toBe(5);
    });
  });

  describe('Player.tradeCardsWith(otherPlayer)', () => {
    const player1 = new Player('123', 'Ikey');
    const player2 = new Player('124', 'Pete');

    test('after calling, each players card is the others initial card', () => {
      const player1sInitialCard = new Card('spades', 1);
      const player2sInitialCard = new Card('diamonds', 2);
      player1.setCard(player1sInitialCard);
      player2.setCard(player2sInitialCard);

      expect(player1.card).toEqual(player1sInitialCard);
      expect(player2.card).toEqual(player2sInitialCard);

      player1.tradeCardsWith(player2);

      expect(player1.card).toEqual(player2sInitialCard);
      expect(player2.card).toEqual(player1sInitialCard);
    });
  });

  describe('Player.setCard(card)', () => {
    const player = new Player('245', 'Ikey');
    const card = new Card('spades', 1);

    expect(player.card).toBe(undefined);
    player.setCard(card);
    expect(player.card).toEqual(card);
  });

  describe('Player.removeCard()', () => {
    const player = new Player('245', 'Ikey');
    const card = new Card('spades', 1);

    player.setCard(card);
    expect(player.card).toEqual(card);
    player.removeCard();
    expect(player.card).toBe(undefined);
  });
});
