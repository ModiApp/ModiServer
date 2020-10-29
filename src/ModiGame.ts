import fs from 'fs';
import _ from 'lodash';
import { groupSort, getNextAlivePlayerId } from './util';

export function createInitialGameState(playerIds: string[]): GameState {
  return {
    players: Object.fromEntries(
      playerIds
        .map((id) => ({
          id,
          lives: 3,
          card: null,
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

export function reduceGameState(
  state: GameState,
  action: StateChangeAction,
): GameState {
  const newState = { ..._.cloneDeep(state), version: state.version + 1 };
  switch (action.type) {
    case 'DEALT_CARDS': {
      const { cards } = action.payload;
      return {
        ...newState,
        players: {
          ...newState.players,
          ...Object.fromEntries(
            cards.map(([card, playerId]) => [
              playerId,
              {
                ...newState.players[playerId],
                card,
              },
            ]),
          ),
        },
      };
    }
    case 'REMOVE_CARDS': {
      Object.values(newState.players).forEach((player) => {
        player.card = null;
      });
      return newState;
    }
    case 'PLAYERS_TRADED': {
      const { fromPlayerId, toPlayerId } = action.payload;
      const fromPlayer = newState.players[fromPlayerId];
      const toPlayer = newState.players[toPlayerId];
      const fromPlayersCard = fromPlayer.card;
      fromPlayer.card = toPlayer.card;
      toPlayer.card = fromPlayersCard;
      return newState;
    }
  }
  return newState;
}

export function createPersistedGameStateStore(
  gameId: string,
  initialState: GameState,
  onStateChange: StateChangeCallback,
): GameStateStore {
  const filepath = `./game-${gameId}.json`;
  fs.writeFileSync(
    filepath,
    JSON.stringify({
      initialState,
      changeActions: [],
    }),
    { encoding: 'utf-8' },
  );
  return createGameStateStore(initialState, (changeAction, version) => {
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
}

function createGameStateStore(
  initialState: GameState,
  onStateChange: StateChangeCallback,
): GameStateStore {
  const history: StateChangeAction[] = [];
  let state = initialState;
  return {
    dispatch(action: StateChangeAction) {
      history.push(action);
      state = reduceGameState(state, action);
      onStateChange(action, state.version);
      return state;
    },
    getState() {
      return state;
    },
    history,
    initialState,
  };
}

function createModiGame(
  store: GameStateStore,
  deck: IDeck,
): ModiGameController {
  function playHighcard(withPlayerIds?: string[]): string {
    const playerIdsToDeal = withPlayerIds || store.getState().orderedPlayerIds;
    store.dispatch({
      type: 'DEALT_CARDS',
      payload: {
        cards: playerIdsToDeal.map((playerId) => [deck.pop(), playerId]),
      },
    });
    const rankedPlayers = groupSort(
      Object.values(store.getState().players).filter((player) =>
        playerIdsToDeal.includes(player.id),
      ),
      (player) => player.card!.rank,
    );

    const winners = rankedPlayers[rankedPlayers.length - 1];
    const winnerIds = winners.map((player) => player.id);

    store.dispatch({
      type: 'HIGHCARD_WINNERS',
      payload: { playerIds: winnerIds },
    });

    store.dispatch({ type: 'REMOVE_CARDS' });

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
        const activePlayerId = getNextAlivePlayerId(store.getState(), dealerId);
        store.dispatch({
          type: 'START_ROUND',
          payload: { dealerId, activePlayerId },
        });
      }
    },
    handleMove(playerId: string, move: PlayerMove) {
      const currentState = store.getState();
      if (currentState.activePlayerId !== playerId) {
        return 'failed';
      }
      if (playerId === currentState.dealerId) {
        if (move === 'hit deck') {
          store.dispatch({
            type: 'PLAYER_HIT_DECK',
            payload: { playerId, card: deck.pop() },
          });
        }
      } else {
        if (move === 'swap') {
          store.dispatch({
            type: 'PLAYERS_TRADED',
            payload: {
              fromPlayerId: playerId,
              toPlayerId: getNextAlivePlayerId(store.getState(), playerId),
            },
          });
        } else {
          // store.dispatch({
          //   type: ''
          // });
        }
      }
      return 'success';
    },
  };
}

export { createGameStateStore, createModiGame };
