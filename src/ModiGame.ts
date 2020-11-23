import { createHistoryStore } from './HistoryStore';
import { groupSort, getNextAlivePlayerId } from './util';

export function createInitialGameState(playerIds: string[]): GameState {
  return {
    players: Object.fromEntries(
      playerIds.map((id) => [
        id,
        {
          id,
          lives: 3,
          card: false,
          move: null,
        },
      ]),
    ),
    version: 0,
    dealerId: null,
    orderedPlayerIds: [...playerIds],
    activePlayerId: null,
  };
}

export function createModiGame(
  playerIds: string[],
  deck: IDeck,
): ModiGameController {
  const state = createInitialGameState(playerIds);
  const actionHistoryStore = createHistoryStore<StateChangeAction>();

  actionHistoryStore.push({
    type: 'PLAYERS_TURN',
    payload: { playerId: playerIds[0], controls: 'Start Highcard' },
  });

  function playHighcard(withPlayerIds?: string[]): string {
    const playerIdsToDeal = withPlayerIds || state.orderedPlayerIds;
    const cardsToDeal = playerIdsToDeal.map((playerId) => {
      const card = deck.pop();
      state.players[playerId].card = card;
      return card;
    });
    actionHistoryStore.push({
      type: 'DEALT_CARDS',
      payload: {
        cards: cardsToDeal,
        dealerId: playerIdsToDeal[0],
      },
    });
    const rankedPlayers = groupSort(
      Object.values(state.players).filter(
        (player) => typeof player.card === 'object',
      ),
      (player) => (player.card as Card).rank,
    );

    const winners = rankedPlayers[rankedPlayers.length - 1];
    const winnerIds = winners.map((player) => player.id);

    actionHistoryStore.push({
      type: 'HIGHCARD_WINNERS',
      payload: { playerIds: winnerIds },
    });

    actionHistoryStore.push({ type: 'REMOVE_CARDS', payload: {} });

    if (winners.length > 1) {
      return playHighcard(winnerIds);
    }

    const winnerId = winners[0].id;

    actionHistoryStore.push({
      type: 'PLAYERS_TURN',
      payload: { playerId: winnerId, controls: 'Choose Dealer' },
    });

    return winners[0].id;
  }

  function getAlivePlayerIds() {
    return Object.entries(state.players)
      .filter(([playerId, player]) => player.lives > 0)
      .map(([playerId]) => playerId);
  }

  return {
    initiateHighcard: playHighcard,
    setDealerId(playerId: string, dealerId: string) {
      const lastAction = actionHistoryStore.get(actionHistoryStore.length - 1);
      if (
        lastAction.type === 'PLAYERS_TURN' &&
        lastAction.payload.controls === 'Choose Dealer' &&
        lastAction.payload.playerId === playerId
      ) {
        const activePlayerId = getNextAlivePlayerId(state, dealerId);
        actionHistoryStore.push({
          type: 'PLAYERS_TURN',
          payload: { playerId: dealerId, controls: 'Deal Cards' },
        });
      } else {
        throw new Error('Unauthorized');
      }
    },

    dealCards(dealerId: string, toPlayerIds?: string[]) {
      const lastAction = actionHistoryStore.get(actionHistoryStore.length - 1);
      if (
        lastAction.type === 'PLAYERS_TURN' &&
        lastAction.payload.controls === 'Deal Cards' &&
        lastAction.payload.playerId === dealerId
      ) {
        const playerIdsToDeal = toPlayerIds || getAlivePlayerIds();
        const cards = playerIdsToDeal.map(() => deck.pop());
        actionHistoryStore.push({
          type: 'DEALT_CARDS',
          payload: { dealerId, cards },
        });
        actionHistoryStore.push({
          type: 'PLAYERS_TURN',
          payload: { playerId: '2', controls: 'Stick/Swap' },
        });
      } else {
        throw new Error('Unauthorized');
      }
    },

    handleMove(playerId: string, move: PlayerMove) {
      const currentState = state;
      if (currentState.activePlayerId !== playerId) {
        return 'failed';
      }
      if (playerId === currentState.dealerId) {
        if (move === 'hit deck') {
          actionHistoryStore.push({
            type: 'PLAYER_HIT_DECK',
            payload: { playerId, card: deck.pop() },
          });
        }
      } else {
        if (move === 'swap') {
          actionHistoryStore.push({
            type: 'PLAYERS_TRADED',
            payload: {
              fromPlayerId: playerId,
              toPlayerId: getNextAlivePlayerId(state, playerId),
            },
          });
        } else {
          // actionHistoryStore.push({
          //   type: ''
          // });
        }
      }
      return 'success';
    },
    authorizedPlayerIds: state.orderedPlayerIds,
    addGameStateListener(cb: StateChangeCallback, fromVersion = 0) {
      if (fromVersion < actionHistoryStore.length) {
        actionHistoryStore
          .getSlice(fromVersion)
          .forEach(([event, version]) => cb(event, version));
      }
      return actionHistoryStore.addListener(cb);
    },
    getActionHistory() {
      return actionHistoryStore.getSlice();
    },
  };
}
