import fs from 'fs';
import _ from 'lodash';
import { createHistoryStore } from './HistoryStore';
import { groupSort, getNextAlivePlayerId, uniqueId } from './util';

export function createInitialGameState(playerIds: string[]): GameState {
  return {
    players: Object.fromEntries(
      playerIds
        .map((id) => ({
          id,
          lives: 3,
          card: false,
          move: null,
        }))
        .map((player) => [player.id, player]),
    ),
    version: 0,
    dealerId: null,
    orderedPlayerIds: [...playerIds],
    activePlayerId: null,
  };
}

// export function reduceGameState(
//   state: GameState,
//   action: StateChangeAction,
// ): GameState {
//   const newState = { ..._.cloneDeep(state), version: state.version + 1 };
//   switch (action.type) {
//     case 'DEALT_CARDS': {
//       const { cards } = action.payload;
//       return {
//         ...newState,
//         players: {
//           ...newState.players,
//           ...Object.fromEntries(
//             cards.map(([card, playerId]) => [
//               playerId,
//               {
//                 ...newState.players[playerId],
//                 card,
//               },
//             ]),
//           ),
//         },
//       };
//     }
//     case 'REMOVE_CARDS': {
//       Object.values(newState.players).forEach((player) => {
//         player.card = false;
//       });
//       return newState;
//     }
//     case 'PLAYERS_TRADED': {
//       const { fromPlayerId, toPlayerId } = action.payload;
//       const fromPlayer = newState.players[fromPlayerId];
//       const toPlayer = newState.players[toPlayerId];
//       const fromPlayersCard = fromPlayer.card;
//       fromPlayer.card = toPlayer.card;
//       toPlayer.card = fromPlayersCard;
//       return newState;
//     }
//   }
//   return newState;
// }

export function createPersistedGameStateStore(
  gameId: string,
  initialState: GameState,
  onStateChange: StateChangeCallback,
): ReturnType<typeof createGameStateStore> {
  const filepath = `./game-${gameId}.json`;
  fs.writeFileSync(
    filepath,
    JSON.stringify({
      initialState,
      changeActions: [],
    }),
    { encoding: 'utf-8' },
  );
  const store = createGameStateStore(initialState);
  store.addListener((changeAction, version) => {
    const content = JSON.parse(
      fs.readFileSync(filepath, { encoding: 'utf-8' }),
    );
    fs.writeFileSync(
      filepath,
      JSON.stringify({
        ...content,
        changeActions: [...content.changeActions, changeAction],
      }),
    );
    onStateChange(changeAction, version);
  });
  return store;
}

function createModiGame(playerIds: string[], deck: IDeck): ModiGameController {
  const state = createInitialGameState(playerIds);
  const actionHistoryStore = createHistoryStore<StateChangeAction>();

  function playHighcard(withPlayerIds?: string[]): string {
    const playerIdsToDeal = withPlayerIds || state.orderedPlayerIds;
    actionHistoryStore.push({
      type: 'DEALT_CARDS',
      payload: {
        cards: playerIdsToDeal.map((playerId) => deck.pop()),
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

    return winners[0].id;
  }

  return {
    start: playHighcard,
    setDealerId(dealerId: string, playerId: string) {
      const lastAction = store.history[store.history.length - 2];
      if (
        lastAction.type === 'HIGHCARD_WINNERS' &&
        lastAction.payload.playerIds.length === 1 &&
        lastAction.payload.playerIds[0] === playerId
      ) {
        const activePlayerId = getNextAlivePlayerId(state, dealerId);
        actionHistoryStore.push({
          type: 'START_ROUND',
          payload: { dealerId, activePlayerId },
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
    authorizedPlayerIds: store.initialState.orderedPlayerIds,
    addGameStateListener: actionHistoryStore.addListener,
    getActionHistory() {
      return store.history.slice();
    },
  };
}

export { createGameStateStore, createModiGame };
