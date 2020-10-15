interface StateManager {
  getStateAtVersion: (version: number) => GameState;
}

export function generateInitialGameState(playerIds: string[]): GameState {
  return {
    players: playerIds.map(id => ({ id, lives: 3 })),
    version: 0,
  }
}
function createGameStateManager(authorizedPlayerIds: string[]): StateManager {
  const currState = generateInitialGameState(authorizedPlayerIds);
  const stateHistory: GameState[] = [generateInitialGameState(authorizedPlayerIds)];
  return {
    getStateAtVersion(version: number) {
      if (version > stateHistory.length - 1) {
        return stateHistory[stateHistory.length - 1];
      }
      return stateHistory[version];
    }
  }
}

export default createGameStateManager;