import _ from 'lodash';

export default function createGameStateManager(
  createInitialState: () => GameState,
  onStateChangeAction: (a: StateChangeAction, count: number) => void,
): StateMananger {
  const initialState = createInitialState();
  const actionHistory: StateChangeAction[] = [];
  let currentState = _.cloneDeep(initialState);

  function updateState(action: StateChangeAction) {
    actionHistory.push(_.cloneDeep(action));
    onStateChangeAction(action, actionHistory.length);
    currentState = reduceGameState(currentState, action);
  }

  return {
    initialState,
    actionHistory,
    currentState,
    dispatch: createGameStateDispatch(updateState),
  };
}

export function createInitialGameState(players = [] as Player[]): GameState {
  return {
    round: 0,
    players,
    dealerIdx: null,
  };
}

export function reduceGameState(
  state: GameState,
  action: StateChangeAction,
): GameState {
  switch (action.type) {
    case 'DEALT_CARDS': {
      const { cards } = action.payload;
      const playerIdxsToCards = Object.fromEntries(
        cards.map((card) => [card.playerIdx, card.card]),
      );
      return {
        ...state,
        players: state.players.map((player) => ({
          ...player,
          card: playerIdxsToCards[player.idx] || player.card,
        })),
      };
    }
    case 'PLAYERS_SWAPPED': {
      const { fromPlayerIdx, toPlayerIdx } = action.payload;
      const fromPlayersCard = state.players.find(
        (player) => player.idx === fromPlayerIdx,
      )!.card;
      const toPlayersCard = state.players.find(
        (player) => player.idx === toPlayerIdx,
      )!.card;
      return {
        ...state,
        players: state.players.map((player) => ({
          ...player,
          card:
            player.idx === fromPlayerIdx
              ? toPlayersCard
              : player.idx === toPlayerIdx
              ? fromPlayersCard
              : player.card,
          move: player.idx === fromPlayerIdx ? 'swap' : player.move,
        })),
      };
    }
    case 'PLAYER_HIT_DECK': {
      const { hitCard } = action.payload;
      return {
        ...state,
        players: state.players.map((player) => {
          if (player.idx === state.dealerIdx) {
            return {
              ...player,
              card: hitCard,
              move: 'hit-deck',
            };
          }
          return player;
        }),
      };
    }
    case 'PLAYER_STUCK': {
      const { playerId } = action.payload;
      return {
        ...state,
        players: state.players.map((player) => {
          if (player.idx === playerId) {
            return {
              ...player,
              move: 'stick',
            };
          }
          return player;
        }),
      };
    }
    case 'TRASHED_CARDS': {
      return {
        ...state,
        players: state.players.map((player) => ({
          ...player,
          card: null,
        })),
      };
    }
    case 'NEW_ROUND': {
      const { dealerIdx } = action.payload;
      return {
        ...state,
        round: state.round + 1,
        dealerIdx,
        players: state.players.map((player) => ({
          ...player,
          card: null,
          move: null,
        })),
      };
    }
    default:
      return state;
  }
}

export function createGameStateDispatch(
  updateState: (action: StateChangeAction) => void,
): StateDispatch {
  return {
    dealCards(cards: Card[], toPlayers: Player[]) {
      updateState(
        dealtCards(
          toPlayers.map((player, idx) => ({
            playerIdx: player.idx,
            card: cards[idx],
          })),
        ),
      );
    },
    removePlayersCards() {
      updateState(setPlayersCardsToNull());
    },
    newRound(dealerIdx: number) {
      updateState(newRound(dealerIdx));
    },
    playerStuck(playerIdx: number) {
      updateState(playerStuck(playerIdx));
    },
    playerSwapped(fromPlayerIdx: number, toPlayerIdx: number) {
      updateState(playersSwapped(fromPlayerIdx, toPlayerIdx));
    },
    playerHitDeck(playerIdx: number, hitCard: Card) {
      updateState(playerHitDeck(playerIdx, hitCard));
    },
  };
}

/** ====== Action Creators ========================== */
export const dealtCards = (
  cards: { playerIdx: number; card: Card }[],
): DealtCardsAction => ({
  type: 'DEALT_CARDS',
  payload: { cards },
});

export const setPlayersCardsToNull = (): TrashedCardsAction => ({
  type: 'TRASHED_CARDS',
  payload: {},
});

export const playerStuck = (playerId: PlayerId): PlayerStuckAction => ({
  type: 'PLAYER_STUCK',
  payload: { playerId },
});

export const playersSwapped = (
  fromPlayerIdx: number,
  toPlayerIdx: number,
): CardsSwappedAction => ({
  type: 'PLAYERS_SWAPPED',
  payload: { fromPlayerIdx, toPlayerIdx },
});

export const playerHitDeck = (
  playerIdx: number,
  hitCard: Card,
): PlayerHitDeckAction => ({
  type: 'PLAYER_HIT_DECK',
  payload: { playerIdx, hitCard },
});

/**
 * - `round++`
 * - `dealerIdx = dealerIdx`
 * - `player.card = null`
 * - `player.move = null`
 * @param dealerId The id of player who deals the cards this round
 */
export const newRound = (dealerIdx: number): NewRoundAction => ({
  type: 'NEW_ROUND',
  payload: { dealerIdx },
});
