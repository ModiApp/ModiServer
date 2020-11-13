import Deck from '../src/Deck';
import { createInitialGameState } from '../src/ModiGame';

const mockIds = ['1', '2', '3', '4'];
const cardDeck = new Deck();

describe('ModiGame Tests:', () => {
  describe('createModiGame() tests', () => {});
});

function createStateForRemoveCardsTests(
  playerIds: string[],
  cardsToDeal: Card[],
): GameState {
  return {
    version: 1,
    orderedPlayerIds: [...playerIds],
    players: Object.fromEntries(
      playerIds.map((id, idx) => [
        id,
        {
          id,
          lives: 3,
          card: cardsToDeal[idx],
          move: null,
        },
      ]),
    ),
    dealerId: null,
    activePlayerId: null,
  };
}

function cardsOnTable(state: GameState): (Card | boolean)[] {
  return Object.values(state.players)
    .filter((p) => !!p.card)
    .map((p) => p.card!);
}
