import Deck from '../src/Deck';
import { reduceGameState } from '../src/GameState';
import { generateInitialGameState } from '../src/ModiGame';

const mockIds = ['1', '2', '3', '4'];
const cardDeck = new Deck();

describe.only('ModiGame Tests:', () => {
  describe('generateInitialGameState()', () => {
    const initialState = generateInitialGameState(mockIds);

    describe('initialState.players', () => {
      test('every player has no card and no move', () => {
        expect(
          Object.values(initialState.players)
            .map((player) => player.card)
            .every((card) => card === null),
        ).toBe(true);
        expect(
          Object.values(initialState.players)
            .map((player) => player.move)
            .every((move) => move === null),
        ).toBe(true);
      });
    });
    test('initialState.orderedPlayerIds is the same order as passed playerIds', () => {
      expect(initialState.orderedPlayerIds).toEqual(mockIds);
    });
    test('initialState.dealerId is null because it hasnt been set yet', () => {
      expect(initialState.dealerId).toBe(null);
    });
    test('initialState.version is 0', () => {
      expect(initialState.version).toBe(0);
    });
  });

  describe('reduceGameState tests', () => {
    test('DEAL_CARDS', () => {
      const initialState = generateInitialGameState(mockIds);
      const newState = reduceGameState(initialState, {
        type: 'DEALT_CARDS',
        payload: { cards: mockIds.map((id) => [cardDeck.pop(), id]) },
      });
    });
  });
});
