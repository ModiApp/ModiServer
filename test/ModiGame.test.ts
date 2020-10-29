import Deck from '../src/Deck';
import { createInitialGameState, reduceGameState } from '../src/ModiGame';

const mockIds = ['1', '2', '3', '4'];
const cardDeck = new Deck();

describe('ModiGame Tests:', () => {
  describe('createInitialGameState()', () => {
    const initialState = createInitialGameState(mockIds);

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

  describe('reduceGameState() tests', () => {
    test('DEAL_CARDS', () => {
      const initialState = createInitialGameState(mockIds);

      const playerIdsToDealTo = mockIds;
      const cardsToDeal = Array(playerIdsToDealTo.length)
        .fill(null)
        .map(() => cardDeck.pop());

      const newState = reduceGameState(initialState, {
        type: 'DEALT_CARDS',
        payload: {
          cards: playerIdsToDealTo.map((id, idx) => [cardsToDeal[idx], id]),
        },
      });

      const players = Object.values(newState.players);
      const cardsOnTable = players.filter((p) => !!p.card).map((p) => p.card);
      const playerIdsWithCards = players
        .filter((p) => !!p.card)
        .map((p) => p.id);

      expect(players.length).toBe(4);
      expect(playerIdsWithCards).toStrictEqual(playerIdsToDealTo);
      expect(cardsOnTable).toStrictEqual(cardsToDeal);
    });

    test('REMOVE_CARDS', () => {
      const playersToDealTo = mockIds;
      const cardsToDeal = Array(playersToDealTo.length)
        .fill(null)
        .map(() => cardDeck.pop());
      const stateBefore = createStateForRemoveCardsTests(
        playersToDealTo,
        cardsToDeal,
      );
      const stateAfter = reduceGameState(stateBefore, { type: 'REMOVE_CARDS' });

      expect(cardsOnTable(stateBefore)).toStrictEqual(cardsToDeal);
      expect(cardsOnTable(stateAfter)).toStrictEqual([]);
    });
  });

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

function cardsOnTable(state: GameState): Card[] {
  return Object.values(state.players)
    .filter((p) => p.card !== null)
    .map((p) => p.card!);
}
