import { reduceGameState } from '../src/GameState';
import { generateInitialGameState } from '../src/GameStateManager';

const mockPlayerIds = ['1', '2', '3', '4'];

describe('GameState Tests', () => {
  describe('reduceGameState() Tests', () => {
    test('calling reduce gamestate returns a state whose version is incremented by one', () => {
      const initialState = generateInitialGameState(mockPlayerIds);
      expect(initialState.version).toBe(0);
      const reduced = reduceGameState(initialState, 'DEALT_CARDS');
      expect(initialState.version).toBe(0); // bonus ensure it didnt mutate state
      expect(reduced.version).toBe(initialState.version + 1);
    });
    test('calling reduce gamestate with "DEAL_CARDS" means everyone gets a card', () => {
      const initialState = generateInitialGameState(mockPlayerIds);
      const newState = reduceGameState('');
    });
  });
});
