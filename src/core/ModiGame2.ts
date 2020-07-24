import { groupSort } from '../util';

// Todo: separate out into multiple files, especially redux logic
class ModiGame {
  private _players: ModiPlayer[];
  private _deck: Deck;
  private gameStateStore: ModiGameStateStore;

  constructor(
    playerIds: string[],
    onGameStateChanged: (newState: ModiGameState) => void,
  ) {
    this._players = playerIds.map((id) => new ModiPlayer(id));
    this.gameStateStore = createModiGameStateStore(this.createInitialState());

    this.gameStateStore.subscribe(() => {
      const newState = this.gameStateStore.getState();
      onGameStateChanged(newState);
    });

    this._deck = new Deck();
  }

  public playHighcard(players = this.alivePlayers) {
    players.forEach((player) => {
      player.card = this._deck.pop();
    });
    this.gameStateStore.dispatch(updatePlayers(this.alivePlayers));

    const rankedPlayers = groupSort(
      this.playersWithCards,
      (player) => player.card.rank,
    );

    const winners = rankedPlayers[rankedPlayers.length - 1];
    this.removePlayersCards();

    if (winners.length > 1) {
      return this.playHighcard(winners);
    }
  }

  private createInitialState(): ModiGameState {
    return {
      round: 1,
      activePlayerIdx: 0,
      moves: [],
      orderedPlayers: this.alivePlayers,
      _stateVersion: -2, // idk, reducer fires twice on init
    };
  }

  private removePlayersCards(players = this.playersWithCards) {
    players.forEach((player) => {
      player.card = undefined;
    });
    this.gameStateStore.dispatch(updatePlayers(this.alivePlayers));
  }

  private get alivePlayers(): ModiPlayer[] {
    return this._players.filter((player) => player.isAlive);
  }

  private get playersWithCards(): ModiPlayer[] {
    return this._players.filter((player) => !!player.card);
  }

}

class ModiPlayer implements IModiPlayer {
  id: string;
  lives: number;
  card: Card | undefined;

  constructor(playerId: string) {
    this.id = playerId;
    this.lives = 3;
    this.card = undefined;
  }

  loseLife() {
    if (!this.isAlive) {
      throw new Error(`Player ${this.id} has no lives left to lose.`);
    }
    this.lives -= 1;
  }

  get isAlive() {
    return this.lives > 0;
  }
}

class Card implements ICard {
  suit: Suit;
  rank: Rank;

  constructor(suit: Suit, rank: Rank) {
    this.suit = suit;
    this.rank = rank;
  }
}

class Deck {
  private _trash: Card[];
  private _cards: Card[];

  constructor() {
    const suits: Suit[] = ['spades', 'clubs', 'hearts', 'diamonds'];
    const ranks: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    this._cards = [];
    suits.forEach((suit) =>
      ranks.forEach((rank) => this._cards.push(new Card(suit, rank))),
    );
    this.shuffle();
    this._trash = [];
  }

  get cards() {
    return this._cards;
  }

  shuffle(): void {
    let cardsLeft = this._cards.length;
    let rand;

    while (cardsLeft) {
      rand = Math.floor(Math.random() * cardsLeft--);
      [this._cards[cardsLeft], this._cards[rand]] = [
        this._cards[rand],
        this._cards[cardsLeft],
      ];
    }
  }

  pop(): Card {
    const cardToDeal = this._cards.pop();
    this._trash.push(cardToDeal);
    return cardToDeal;
  }
}

// Redux stuff
import { createStore } from 'redux';

/**
 * Creates a redux store instance to keep track of a ModiGame instance's state.
 * @param {ModiGameState} initialGameState The initial game state for the store
 * @return {Store<ModiGameState, ModiGameStateAction>} The redux store instance
 */
function createModiGameStateStore(initialGameState: ModiGameState) {
  /**
   * A function to modify a ModiGameState object using one of the ModiGameStateAction's
   * @param {ModiGameState} state The initial state for the gamestate reducer to reduce
   * @param {ModiGameStateAction} action An action type that the reducer will use to update the state
   * @return {ModiGameState} The new state after having been reduced.
   */
  function gameStateReducer(
    state = initialGameState,
    action: ModiGameStateAction,
  ): ModiGameState {
    const newState = { ...state, _stateVersion: state._stateVersion + 1 };
    switch (action.type) {
      case 'PLAYERS_UPDATED': {
        const { orderedPlayers } = action.payload;
        return { ...newState, orderedPlayers };
      }
      default:
        return newState;
    }
  }

  return createStore(gameStateReducer);
}

export const updatePlayers = (
  orderedPlayers: ModiPlayer[],
): PlayersUpdatedAction => ({
  type: 'PLAYERS_UPDATED',
  payload: { orderedPlayers },
});

export default ModiGame;
