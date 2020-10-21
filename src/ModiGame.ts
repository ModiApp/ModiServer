import _ from 'lodash';

export function generateInitialGameState(playerIds: string[]): GameState {
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
      return initialState;
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
  function getNextAlivePlayerId(state: GameState, playerId: string) {
    const playerOrder = state.orderedPlayerIds;
    const startIdx = playerOrder.findIndex((id) => id === playerId);

    let nextAlivePlayerIdx = startIdx + 1;
    while (state.players[playerOrder[nextAlivePlayerIdx]].lives === 0) {
      nextAlivePlayerIdx += 1;
    }

    return playerOrder[nextAlivePlayerIdx];
  }
  return {
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
    // playHighcard() {
    //   store.dispatch({
    //     type: 'DEALT_CARDS',
    //     payload: {
    //       cards: Object.values(store.getState().players).map((player) => [
    //         deck.pop(),
    //         player.id,
    //       ]),
    //     },
    //   });

    // },
    // dealCards(toPlayerIds?: string[]) {

    // }
  };
}

export { createGameStateStore, createModiGame };
