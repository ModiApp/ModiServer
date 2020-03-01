import { OnChange } from "property-watch-decorator";

import { EventEmitter } from "events";

import { ranks } from "./Card";
import Deck from "./Deck";
import Player from "./Player";

type ModiGameStatus = {
  players: Player[];
};

class ModiGame extends EventEmitter {
  public static Events = {
    DealtCards: "DealtCards",
    GameInfo: "GameInfo",
    GameStateChanged: "game state changed",
    PlayerBeginingTurn: "a player starts their turn",
    PlayerHitDeck: "a player hit the deck",
    PlayerTraded: "a player is trading cards with another player",
    RankedPlayers: "RankedPlayers",
    StartingHighcard: "StartingHighcard",
    TrashedCards: "TrashedCards",
    UpdatedPlayers: "UpdatedPlayers"
  };

  private playersAlive: Player[];
  private gameState: object;

  @OnChange("updateGameState")
  private deck: Deck;

  @OnChange("updateGameState")
  private players: Player[];

  @OnChange("updateGameState")
  private activePlayer: Player | undefined;

  constructor(players: Player[]) {
    super();

    this.players = players;
    this.playersAlive = players;
    this.deck = new Deck();
    this.deck.shuffle();

    this.updateGameState();
  }

  private updateGameState(): object {
    return (this.gameState = {
      players: this.players,
      activePlayerId: this.activePlayer.id,
      cardsInDeck: this.deck.cards
    });
  }

  private emitGameState(): void {
    this.emit(ModiGame.Events.GameStateChanged, this.gameState);
  }

  public async start(): Promise<void> {
    if (this.players.length <= 1) {
      throw new Error("Modi needs at least 2 people to play.");
    }

    while (this.noOneWonYet()) {
      await this.playRound();
    }
  }

  public async playRound() {
    this.clearPlayerCards();
    this.giveEachPlayerACard();
    for (let i = 0; i < this.playersAlive.length - 1; i++) {
      const currPlayer = this.playersAlive[i];
      const nextPlayer = this.playersAlive[i + 1];
      this.emit(ModiGame.Events.PlayerBeginingTurn, currPlayer);
      if (await currPlayer.wantsToSwap()) {
        this.handleCardSwap(currPlayer, nextPlayer);
      }
    }
    const playerThatDealt = this.playersAlive[this.playersAlive.length - 1];
    if (await playerThatDealt.wantsToSwap()) {
      this.handleHitDeck(playerThatDealt);
    }

    const losers = this.rankPlayersByCards().pop();
    losers.forEach((loser: Player) => loser.loseLife());

    this.playersAlive.unshift(this.playersAlive.pop());
    this.playersAlive.filter(p => p.lives);
  }

  public playHighCard(players = this.playersAlive): Player {
    this.emit(ModiGame.Events.StartingHighcard, players);
    this.giveEachPlayerACard(players);
    const [winners, ...groupedLosers] = this.rankPlayersByCards();
    if (winners.length > 1) {
      return this.playHighCard(winners);
    }
    return winners[0];
  }

  public clearPlayerCards() {
    this.players.forEach((player: Player) => {
      const cardToTrash = player.removeCard();
      if (cardToTrash) {
        this.deck.addToTrash(cardToTrash);
      }
    });
    this.emit(ModiGame.Events.TrashedCards);
  }

  public noOneWonYet(): boolean {
    return this.playersAlive.length > 1;
  }

  private handleCardSwap(fromPlayer, toPlayer) {
    fromPlayer.tradeCardsWith(toPlayer);
    this.emit(ModiGame.Events.PlayerTraded, { fromPlayer, toPlayer });
  }

  private handleHitDeck(player: Player): void {
    this.deck.addToTrash(player.removeCard());
    player.recieveCard(this.deck.dealCard());
    this.emit(ModiGame.Events.PlayerHitDeck, player);
  }

  private giveEachPlayerACard(players = this.playersAlive): void {
    players.forEach((p: Player) => p.recieveCard(this.deck.dealCard()));
    this.emit(ModiGame.Events.DealtCards, players);
  }

  private rankPlayersByCards(players = this.playersAlive): Player[][] {
    let rankedGroups = Array(ranks.length);
    players.forEach((player: Player) => {
      const indOfGroup = player.card.value() - 1;
      if (!rankedGroups[indOfGroup]) {
        rankedGroups[indOfGroup] = [];
      }
      rankedGroups[indOfGroup].push(player);
    });
    rankedGroups = rankedGroups.filter(rg => rg).reverse();
    this.emit(ModiGame.Events.RankedPlayers, rankedGroups);
    return rankedGroups;
  }
}

export default ModiGame;
