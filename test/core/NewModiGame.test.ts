import randomName from 'random-name';
import Card from '../../src/core/Card';
import Deck from '../../src/core/Deck';
import createModiGame from '../../src/core/NewModiGame';

function createMockGameStateDispatch(): StateDispatch {
  return {
    dealCards: jest.fn(),
    removePlayersCards: jest.fn(),
    newRound: jest.fn(),
    playerStuck: jest.fn(),
    playerSwapped: jest.fn(),
    playerHitDeck: jest.fn(),
  };
}

function createMockStateManager(): StateMananger {
  const initialState = createInitialGameState();
  return {
    initialState,
    stateHistory: [],
    currentState: initialState,
    dispatch: createMockGameStateDispatch(),
  };
}

function createInitialGameState(): GameState {
  const players: Player[] = Array(3)
    .fill(null)
    .map((_, idx) => ({
      idx,
      username: randomName.first(),
      lives: 3,
      move: null,
      card: null,
    }));
  return {
    round: 0,
    players,
    dealerIdx: null,
  };
}
describe('ModiGame Tests', () => {
  describe('ModiGame.playHighCard()', () => {
    test('when multiples winners plays recursively', () => {
      const stateManager = createMockStateManager();
      const createDeck = () =>
        new Deck([
          new Card('spades', 6), // player idx 0 gets this
          new Card('hearts', 10), // player idx 1 gets this
          new Card('diamonds', 10), // player idx 2 gets this
          new Card('clubs', 1), // player idx 1 gets this
          new Card('spades', 4), // player idx 2 gets this
          new Card('hearts', 1),
          new Card('diamonds', 1),
          new Card('clubs', 1),
          new Card('clubs', 1),
          new Card('spades', 1),
        ]);

      const game = createModiGame(stateManager, createDeck);
      game.playHighCard();
      expect(stateManager.dispatch.dealCards).toBeCalledTimes(2);
    });
  });
});
