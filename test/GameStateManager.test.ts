import createGameStateManager from '../src/GameStateManager';

describe('GameStateManager tests', () => {
  test('state manager creator returns non null', () => {
    expect(createGameStateManager()).toBeTruthy();
  })
});