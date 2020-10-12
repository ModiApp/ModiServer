import randomName from 'random-name';
import reduceGameState, { createInitialGameState } from './core/GameState';

function uniqueNumberGenerator() {
  const ids = new Set();
  return function generateUniqueId() {
    const id = String(Math.random().toPrecision(10));
    return id in ids ? generateUniqueId() : id;
  };
}

const generateUniqueId = uniqueNumberGenerator();

function createPlayer(
  config = {} as Partial<IModiPlayerStatic>,
): IModiPlayerStatic {
  return {
    id: generateUniqueId(),
    lives: 3,
    card: null,
    move: null,
    username: randomName.first(),
    ...config,
  };
}

function createMockPlayers(n: number) {
  return Array(n).fill(null).map(createPlayer);
}

function simulateGame() {
  const players = createMockPlayers(5);
  const initialGameState = createInitialGameState(players);
  console.log(JSON.stringify(initialGameState, undefined, 2));
}

simulateGame();
