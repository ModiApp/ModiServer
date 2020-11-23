import { createCardDeck } from '../src/Deck';
import { createModiGame } from '../src/ModiGame';

const mockPlayerIds = ['1', '2', '3', '4'];

describe('ModiGame Tests:', () => {
  describe('createModiGame() tests', () => {
    const game = createModiGame(mockPlayerIds, createCardDeck());
    const listener = jest.fn();

    game.addGameStateListener(listener);
    test('can initiate highcard', () => {
      game.initiateHighcard();

      const expectedDealtCards: TailoredCardMap = [
        { rank: 13, suit: 'diamonds' },
        { rank: 12, suit: 'diamonds' },
        { rank: 11, suit: 'diamonds' },
        { rank: 10, suit: 'diamonds' },
      ];
      expect(listener).toHaveBeenNthCalledWith(
        1,
        {
          type: 'PLAYERS_TURN',
          payload: { playerId: '1', controls: 'Start Highcard' },
        },
        0,
      );
      expect(listener).toHaveBeenNthCalledWith(
        2,
        {
          type: 'DEALT_CARDS',
          payload: { dealerId: '1', cards: expectedDealtCards },
        },
        1,
      );
      expect(listener).toHaveBeenNthCalledWith(
        3,
        { type: 'HIGHCARD_WINNERS', payload: { playerIds: ['1'] } },
        2,
      );

      expect(listener).toHaveBeenNthCalledWith(
        4,
        { type: 'REMOVE_CARDS', payload: {} },
        3,
      );

      expect(listener).toHaveBeenNthCalledWith(
        5,
        {
          type: 'PLAYERS_TURN',
          payload: { playerId: '1', controls: 'Choose Dealer' },
        },
        4,
      );
    });

    test('winner of highcard can choose the dealer', () => {
      game.setDealerId('1', '3');

      expect(listener).toHaveBeenNthCalledWith(
        6,
        {
          type: 'PLAYERS_TURN',
          payload: { playerId: '3', controls: 'Deal Cards' },
        },
        5,
      );
    });

    test('dealer can deal cards', () => {
      const expectedDealtCards: TailoredCardMap = [
        { rank: 9, suit: 'diamonds' },
        { rank: 8, suit: 'diamonds' },
        { rank: 7, suit: 'diamonds' },
        { rank: 6, suit: 'diamonds' },
      ];
      game.dealCards('3');
      expect(listener).toHaveBeenNthCalledWith(
        7,
        {
          type: 'DEALT_CARDS',
          payload: { dealerId: '3', cards: expectedDealtCards },
        },
        6,
      );

      expect(listener).toHaveBeenNthCalledWith(
        8,
        {
          type: 'PLAYERS_TURN',
          payload: { playerId: '2', controls: 'Stick/Swap' },
        },
        7,
      );
    });
  });
});
