import { groupSort, rotateInPlace } from '../util';

// Todo: separate out into multiple files, especially redux logic
class ModiGame {
  private _players: ModiPlayer[];
  private _deck: Deck;
  private gameStateStore: ModiGameStateStore;
  private onGameEnd: () => void;

  constructor(
    playerIds: string[],
    onGameStateChanged: (newState: ModiGameState) => void,
    onGameEnd: () => void,
  ) {
    this._players = playerIds.map((id) => new ModiPlayer(id));
    this.gameStateStore = createModiGameStateStore(this.createInitialState());

    this.gameStateStore.subscribe(() => {
      const newState = this.gameStateStore.getState();
      onGameStateChanged(newState);
    });

    this._deck = new Deck();
    this.onGameEnd = () => onGameEnd();
  }

  public start() {
    this.playHighcard();
  }

  public playHighcard(players = this.alivePlayers) {
    players.forEach((player) => {
      player.setCard(this._deck.pop());
    });
    this.gameStateStore.dispatch(updatePlayers(this.alivePlayers));

    const rankedPlayers = groupSort(
      this.playersWithCards,
      (player) => player.card!.rank,
    );

    this.removePlayersCards();

    const winners = rankedPlayers[rankedPlayers.length - 1];
    if (winners.length > 1) {
      this.playHighcard(winners);
      return;
    }

    const winner = winners[0];
    this.startRound(winner.id);
  }

  public startRound(dealerId: string) {
    const currPlayerOrder = this.gameStateStore.getState().players;
    const dealerIdx = currPlayerOrder.findIndex(
      (player) => player.id === dealerId,
    );
    const numArrRotations = this.alivePlayers.length - dealerIdx + 1;

    rotateInPlace(currPlayerOrder, numArrRotations);
    this.gameStateStore.dispatch(updatePlayers(currPlayerOrder));
    this.gameStateStore.dispatch(incrementRound());

    // Kickoff round
    this.dealPlayersCards();
  }

  public handleMove(playerId: string, move: PlayerMove) {
    if (move === 'swap') {
      const players = this.gameStateStore.getState().players;
      const playerIdx = players.findIndex((player) => player.id === playerId);

      // If its the dealer
      if (playerIdx === players.length - 1) {
        const hitCard = this._deck.pop();
        players[playerIdx].setCard(hitCard);
        this.handleEndOfRound();
      } else {
        players[playerIdx].tradeCardsWith(players[playerIdx + 1]);
      }
      this.gameStateStore.dispatch(updatePlayers(players));
    }
    this.gameStateStore.dispatch(addMove(move));
  }

  private handleEndOfRound() {
    const players = this.gameStateStore.getState().players;
    const rankedPlayers = groupSort(players, (player) => player.card!.rank);
    this.removePlayersCards();

    const [losers] = rankedPlayers;
    losers.forEach((loser) => loser.loseLife());
    const playersStillAlive = players.filter((player) => player.isAlive);

    if (playersStillAlive.length >= 1) {
      const newDealerId = playersStillAlive[playersStillAlive.length - 2].id;
      this.startRound(newDealerId);
    } else if (playersStillAlive.length === 1) {
      this.onGameEnd();
    } else {
      this.handleDoubleGame();
    }
  }

  private handleDoubleGame() {}

  private createInitialState(): ModiGameState {
    return {
      round: -1, // Pre highcard
      moves: [],
      players: this.alivePlayers,
      _stateVersion: -2, // idk, reducer fires twice on init
    };
  }

  private removePlayersCards(players = this.playersWithCards) {
    players.forEach((player) => player.removeCard());
    this.gameStateStore.dispatch(updatePlayers(this.alivePlayers));
  }

  private dealPlayersCards() {
    const players = this.gameStateStore.getState().players;
    players.forEach((player) => {
      player.setCard(this._deck.pop());
    });
    this.gameStateStore.dispatch(updatePlayers(players));
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

  // Make sure there's no reference bugs here
  tradeCardsWith(otherPlayer: IModiPlayer) {
    const theirCard = otherPlayer.card;
    otherPlayer.card = this.card;
    this.card = theirCard;
  }

  setCard(card: Card) {
    this.card = card;
  }
  removeCard() {
    this.card = undefined;
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
    this._trash = [];
    suits.forEach((suit) =>
      ranks.forEach((rank) => this._cards.push(new Card(suit, rank))),
    );
    this.shuffle();
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
    if (this._cards.length === 0) {
      this.restock();
    }
    const cardToDeal = this._cards.pop()!;
    this._trash.push(cardToDeal);
    return cardToDeal;
  }

  restock() {
    this._cards = this._trash;
    this._trash = [];
    this.shuffle();
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
        const { players } = action.payload;
        return { ...newState, players };
      }
      case 'ROUND_INCREMENTED': {
        return { ...newState, round: newState.round + 1 };
      }
      case 'MOVE_ADDED': {
        const { move } = action.payload;
        return { ...newState, moves: newState.moves.concat(move) };
      }
      case 'MOVES_RESET': {
        return { ...newState, moves: [] };
      }
      default:
        return newState;
    }
  }

  return createStore(gameStateReducer);
}

export const updatePlayers = (players: ModiPlayer[]): PlayersUpdatedAction => ({
  type: 'PLAYERS_UPDATED',
  payload: { players },
});

export const incrementRound = (): RoundIncrementedAction => ({
  type: 'ROUND_INCREMENTED',
});

export const addMove = (move: PlayerMove): MoveAddedAction => ({
  type: 'MOVE_ADDED',
  payload: { move },
});

export const resetMoves = (): MovesResetAction => ({
  type: 'MOVES_RESET',
});

export default ModiGame;
