import createGameStateManager, {
  generateInitialGameState,
} from '../src/GameStateManager';

function generateAuthorizedPlayerIds() {
  return ['1', '2', '3', '4', '5'];
}

describe.skip('GameStateManager tests', () => {
  test('state manager creator returns non null', () => {
    const playerIds = generateAuthorizedPlayerIds();
    const stateManager = createGameStateManager(playerIds);
    expect(stateManager).toBeTruthy();
  });

  test('can get state at any valid index', () => {
    const playerIds = generateAuthorizedPlayerIds();
    const stateManager = createGameStateManager(playerIds);
    const firstState = stateManager.getStateAtVersion(0);
    expect(firstState).toStrictEqual(generateInitialGameState(playerIds));
  });

  test('when requested version is out of bounds, returns latest version', () => {
    const playerIds = generateAuthorizedPlayerIds();
    const stateManager = createGameStateManager(playerIds);
    const requestOutOfBoundsState = () => stateManager.getStateAtVersion(4);
    expect(requestOutOfBoundsState).not.toThrow();
    expect(requestOutOfBoundsState()).toStrictEqual(
      generateInitialGameState(playerIds),
    );
  });
});
