import { groupSort } from '../util';
import Deck from './Deck';

function createNewDeck(): IDeck {
  return new Deck();
}

export default function createModiGame(
  stateManager: StateMananger,
  createDeck = createNewDeck,
): ModiGame {
  const deck = createDeck();

  /** @return Idx of winner */
  function playHighCard(withPlayers?: Player[]): number {
    const players = withPlayers || getAlivePlayers();

    stateManager.dispatch.dealCards(deck.popMany(players.length), players);

    const rankedPlayers = rankPlayersWithCards();
    const winners = rankedPlayers[rankedPlayers.length - 1];

    stateManager.dispatch.removePlayersCards();

    if (winners.length > 1) {
      return playHighCard(winners);
    }

    return winners[0].idx;
  }

  function startRound() {
    const dealerIdx = playHighCard();
    stateManager.dispatch.newRound(dealerIdx);
  }

  function handleMove(playerIdx: number, move: PlayerMove) {
    switch (move) {
      case 'stick':
        stateManager.dispatch.playerStuck(playerIdx);
      case 'swap':
        stateManager.dispatch.playerSwapped(playerIdx, playerIdx + 1);
      case 'hit-deck':
        stateManager.dispatch.playerHitDeck(playerIdx, deck.pop());
    }
  }

  function rankPlayersWithCards() {
    return groupSort(
      stateManager.currentState.players.filter((player) => !!player.card),
      (player) => player.card!.rank,
    );
  }

  function getAlivePlayers() {
    return stateManager.currentState.players.filter(
      (player) => player.lives > 0,
    );
  }

  function isMyTurn(playerIdx: number) {
    const alivePlayers = getAlivePlayers();
    const playersWhoWent = alivePlayers.filter(
      (player) => player.move !== null,
    );
    const currPlayer = alivePlayers[playersWhoWent.length] || null;
    return currPlayer && currPlayer.idx === playerIdx;
  }

  return {
    playHighCard,
    startRound,
    handleMove,
    isMyTurn,
    initialState: stateManager.initialState,
    stateHistory: stateManager.stateHistory,
    state: stateManager.currentState,
  };
}
