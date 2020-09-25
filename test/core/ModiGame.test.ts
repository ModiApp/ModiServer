import ModiGame, { setState } from '../../src/core/ModiGame';
import _ from 'lodash';
import Card from '../../src/core/Card';

class TestableModiGame extends ModiGame {
  setState(state: ModiGameState) {
    // @ts-ignore
    this.gameStateStore.dispatch(setState(state));
  }
}

describe('ModiGame() Tests', () => {
  const mockPlayers = [
    { id: '1', username: 'Ikey' },
    { id: '2', username: 'Ralph' },
    { id: '3', username: 'Michael' },
    { id: '4', username: 'Peter' },
  ];
  describe('ModiGame.constructor()', () => {
    test('initial state has correct players', () => {
      let initialState: ModiGameState | null = null;
      const onStateChange = (newState: ModiGameState) => {
        initialState = newState;
      };
      new TestableModiGame(mockPlayers, onStateChange);
      const registeredPlayers = initialState!.players.map((p) => ({
        id: p.id,
        username: p.username,
      }));
      expect(registeredPlayers).toEqual(mockPlayers);
    });

    test('deck has 52 cards', () => {
      const game = new TestableModiGame(mockPlayers, () => {});
      // @ts-ignore
      expect(game._deck.cards.length).toBe(52);
    });

    test('players have no cards', () => {
      const game = new TestableModiGame(mockPlayers, () => {});
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
      const game = new TestableModiGame(mockPlayers, (stateUpdate) =>
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
        .sort((p1, p2) => p2.card!.rank - p1.card!.rank)[0];

      const dealer = lastState.players[lastState.players.length - 1];

      expect(winner.id).toBe(dealer.id);
    });
  });

  describe('ModiGame.handleMove(player, move)', () => {
    const gameStateHistory: ModiGameState[] = [];
    const game = new TestableModiGame(mockPlayers, (newState) => {
      gameStateHistory.push(_.cloneDeep(newState));
    });
    const player1sOgCard = new Card('spades', 4);
    const player2sOgCard = new Card('clubs', 5);
    const player3sOgCard = new Card('diamonds', 13);
    const player4sOgCard = new Card('hearts', 10);

    beforeEach(() => {
      const currState = game.getState();
      currState.players[0].setCard(player1sOgCard);
      currState.players[1].setCard(player2sOgCard);
      currState.players[2].setCard(player3sOgCard);
      currState.players[3].setCard(player4sOgCard);

      game.setState(currState);
    });
    test('when non-dealers swap, their card exchanges with the next player', () => {
      const stateBeforeTrade = gameStateHistory[gameStateHistory.length - 1];

      expect(stateBeforeTrade.players[0].card).toEqual(player1sOgCard);
      expect(stateBeforeTrade.players[1].card).toEqual(player2sOgCard);
      expect(stateBeforeTrade.moves.length).toBe(0);

      game.handleMove(stateBeforeTrade.players[0].id, 'swap');

      const stateAfterTrade = gameStateHistory[gameStateHistory.length - 1];
      expect(stateAfterTrade.players[0].card).toEqual(player2sOgCard);
      expect(stateAfterTrade.players[1].card).toEqual(player1sOgCard);

      expect(stateAfterTrade.moves[stateAfterTrade.moves.length - 1]).toBe(
        'swap',
      );
    });

    test('when non-dealers try to swap with a king, their card stays the same and most recent move becomes "attempted-swap"', () => {
      const stateBeforeTrade = gameStateHistory[gameStateHistory.length - 1];

      expect(stateBeforeTrade.players[1].card).toEqual(player2sOgCard);
      expect(stateBeforeTrade.players[2].card).toEqual(player3sOgCard);

      game.handleMove(stateBeforeTrade.players[1].id, 'swap');

      const stateAfterTrade = gameStateHistory[gameStateHistory.length - 1];
      expect(stateAfterTrade.players[1].card).toEqual(player2sOgCard);
      expect(stateAfterTrade.players[2].card).toEqual(player3sOgCard);

      expect(stateAfterTrade.moves[stateAfterTrade.moves.length - 1]).toBe(
        'attempted-swap',
      );
    });

    test('when dealer swaps, they get the decks top card', () => {
      const stateBeforeTrade = gameStateHistory[gameStateHistory.length - 1];
      expect(stateBeforeTrade.players[3].card).toEqual(player4sOgCard);

      // @ts-ignore
      const hitCard = game._deck.cards[game._deck.cards.length - 1];
      game.handleMove(stateBeforeTrade.players[3].id, 'swap', false);

      const stateAfterTrade = gameStateHistory[gameStateHistory.length - 1];
      expect(stateAfterTrade.players[3].card).toEqual(hitCard);

      expect(stateAfterTrade.moves[stateAfterTrade.moves.length - 1]).toBe(
        'swap',
      );
    });
  });
});
