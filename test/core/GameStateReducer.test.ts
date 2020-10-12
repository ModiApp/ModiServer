import randomName from 'random-name';
import reduceGameState, {
  dealtCards,
  setPlayersCardsToNull,
  playerStuck,
  playersSwapped,
  playerHitDeck,
} from '../../src/core/GameState';
import Deck from '../../src/core/Deck';

interface MockDeck extends IDeck {
  trash: Card[];
}

function createMockDeck(): MockDeck {
  const deck = new Deck();
  return {
    ...deck,
    // @ts-ignore
    trash: deck._trash,
  };
}

function createMockPlayers(n = 5): Player[] {
  return Array(n)
    .fill(null)
    .map((_, idx) => ({
      idx,
      username: randomName.first(),
      card: null,
      move: null,
      lives: 3,
    }));
}

function createInitialGameState(): GameState {
  const players = createMockPlayers(5);
  return {
    round: 0,
    players,
    dealerIdx: players.length - 1,
  };
}

describe('Game State Reducer Tests', () => {
  describe('Test DEAL_CARDS action', () => {
    let stateBefore: GameState | null = null;
    beforeEach(() => {
      stateBefore = createInitialGameState();
    });

    test('players whose ids are in the playerId_card{} dict, recieve the card at their id', () => {
      const player1sDealtCard: Card = { suit: 'spades', rank: 5 };
      const player2sDealtCard: Card = { suit: 'hearts', rank: 4 };

      const action: DealtCardsAction = dealtCards([
        { playerIdx: 0, card: player1sDealtCard },
        { playerIdx: 1, card: player2sDealtCard },
      ]);

      const stateAfter = reduceGameState(stateBefore!, action);
      expect(stateAfter.players[0].card).toEqual(player1sDealtCard);
      expect(stateAfter.players[1].card).toEqual(player2sDealtCard);
    });

    test('players whose ids are not in the playerId_card{} dict, do not recieve a new card', () => {
      const player1sOgCard = stateBefore!.players[0].card;
      const action: DealtCardsAction = dealtCards([]); // To no one

      const stateAfter = reduceGameState(stateBefore!, action);
      expect(stateAfter.players[0].card).toEqual(player1sOgCard);
    });
  });

  describe('Test PLAYERS_TRADED action', () => {
    const stateBefore = createInitialGameState();

    const player1sOgCard: Card = { suit: 'spades', rank: 1 };
    const player2sOgCard: Card = { suit: 'hearts', rank: 2 };

    const fromPlayer = stateBefore.players[0];
    const toPlayer = stateBefore.players[1];

    fromPlayer.card = player1sOgCard;
    toPlayer.card = player2sOgCard;

    const action: CardsSwappedAction = playersSwapped(
      fromPlayer.idx,
      toPlayer.idx,
    );

    const stateBeforeBeforeReduction = JSON.stringify(stateBefore);
    const stateAfter = reduceGameState(stateBefore, action);
    const stateBeforeAfterReduction = JSON.stringify(stateBefore);

    test('action does not modify input state object', () => {
      expect(stateBeforeBeforeReduction).toBe(stateBeforeAfterReduction);
    });

    test('players cards swap successfully in new state', () => {
      expect(stateAfter.players[0].card).toEqual(stateBefore.players[1].card);
      expect(stateAfter.players[1].card).toEqual(stateBefore.players[0].card);
    });

    test('player array order is preserved', () => {
      const ogPlayerIds = stateBefore.players.map((player) => player.idx);
      const newPlayerIds = stateAfter.players.map((player) => player.idx);
      expect(ogPlayerIds).toEqual(newPlayerIds);
    });

    test("fromPlayer's .move prop gets set to 'swap'", () => {
      expect(stateAfter.players[fromPlayer.idx]!.move).toBe('swap');
    });

    test('all other players .move prop stays the same', () => {
      const allOtherMovesBefore = stateBefore.players
        .filter((player) => player.idx !== fromPlayer.idx)
        .map((player) => player.move);
      const allOtherMovesAfter = stateAfter.players
        .filter((player) => player.idx !== fromPlayer.idx)
        .map((player) => player.move);

      expect(allOtherMovesBefore).toEqual(allOtherMovesAfter);
    });
  });

  describe('Test PLAYER_HIT_DECK action', () => {
    const stateBefore = createInitialGameState();
    const deck = new Deck();
    stateBefore.players.forEach((player) => {
      player.card = deck.pop();
    });

    const action: PlayerHitDeckAction = playerHitDeck(
      stateBefore.players.length - 1, // Simulate dealer hitting deck
      deck.pop(),
    );

    const stateBeforeBeforeReduction = JSON.stringify(stateBefore);
    const stateAfter = reduceGameState(stateBefore, action);
    const stateBeforeAfterReduction = JSON.stringify(stateBefore);

    test('reducer does not modify initial state object', () => {
      expect(stateBeforeBeforeReduction).toBe(stateBeforeAfterReduction);
    });

    test(`The player at dealerIdx recieved the card at the top of the deck`, () => {
      const topOfDeckTrack = deck.trash[deck.trash.length - 1];
      const dealer = stateAfter.players[stateAfter.dealerIdx!];
      expect(dealer.card).toEqual(topOfDeckTrack);
    });

    test(`The player at dealerIdx's .move prop got set to 'hit-deck'`, () => {
      const dealer = stateAfter.players[stateAfter.dealerIdx!];
      expect(dealer.move).toBe('hit-deck');
    });
  });

  describe('Test PLAYER_STUCK action', () => {
    const stateBefore = createInitialGameState();
    const playerWhoStuckIdx = 1;
    const action = playerStuck(playerWhoStuckIdx);
    const stateAfter = reduceGameState(stateBefore, action);

    test('player whose playerId matches the payload gets their .move prop set to stick', () => {
      expect(stateAfter.players[playerWhoStuckIdx].move).toBe('stick');
    });
  });

  describe('Test CARDS_TRASHED action', () => {
    const initialState = createInitialGameState();
    const deck = createMockDeck();
    const dealtCardsAction = dealtCards(
      initialState.players.map((player) => ({
        playerIdx: player.idx,
        card: deck.pop(),
      })),
    );

    const stateBefore = reduceGameState(initialState, dealtCardsAction);
    const stateAfter = reduceGameState(stateBefore, setPlayersCardsToNull());

    test('all players in state have no cards after calling action', () => {
      expect(stateBefore.players.every((player) => player.card === null)).toBe(
        false,
      );
      expect(stateAfter.players.every((player) => player.card === null)).toBe(
        true,
      );
    });
  });
});
