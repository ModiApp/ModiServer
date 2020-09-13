import { ModiGame } from '../../src/core';
import _ from 'lodash';

describe('ModiGame() Tests', () => {
  const mockPlayers = [
    { id: '1', username: 'Ikey' },
    { id: '2', username: 'Ralph' },
    { id: '3', username: 'Michael' },
  ];
  describe('ModiGame.constructor()', () => {
    test('initial state has correct players', () => {
      let initialState: ModiGameState | null = null;
      const onStateChange = (newState: ModiGameState) => {
        initialState = newState;
      };
      new ModiGame(mockPlayers, onStateChange);
      const registeredPlayers = initialState!.players.map((p) => ({
        id: p.id,
        username: p.username,
      }));
      expect(registeredPlayers).toEqual(mockPlayers);
    });

    test('deck has 52 cards', () => {
      const game = new ModiGame(mockPlayers, () => {});
      // @ts-ignore
      expect(game._deck.cards.length).toBe(52);
    });

    test('players have no cards', () => {
      const game = new ModiGame(mockPlayers, () => {});
      const players = game.getState().players;
      const cards = players
        .map((player) => player.card)
        .filter((card) => card !== undefined);
      expect(cards.length).toBe(0);
    });
  });

  describe('ModiGame.start()', () => {
    const stateHistory: ModiGameState[] = [];
    beforeAll(() => {
      const game = new ModiGame(mockPlayers, (stateUpdate) =>
        stateHistory.push(_.cloneDeep(stateUpdate)),
      );
      game.start();
    });
    test('first state change everyone gets dealt a card', () => {
      const firstState = stateHistory[1];
      const playerCards = firstState.players.map((p) => p.card);
      expect(playerCards).not.toContain(null);
    });
    test('second state change everyones card gets removed', () => {
      const secondState = stateHistory[2];
      const playerCards = secondState.players
        .map((p) => p.card)
        .filter((card) => card !== undefined);
      expect(playerCards.length).toBe(0);
    });
    test('winner of highcard is new rounds dealer', () => {
      const winnerRound = stateHistory[stateHistory.length - 4];
      const lastState = stateHistory[stateHistory.length - 1];

      const winner = winnerRound.players
        .filter((player) => player.card !== undefined)
        .sort((p1, p2) => p1.card!.rank - p2.card!.rank)[0];

      const dealer = lastState.players[lastState.players.length - 1];

      expect(winner.id).toBe(dealer.id);
    });
  });
});
