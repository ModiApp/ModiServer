import { EventEmitter } from "events";
import { OnChange } from "property-watch-decorator";
import createDeckOfCards from './Deck';

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

  playersAlive: ModiPlayer[];

  //@OnChange("emitGameState")
  gameState: ModiGameState;

  //@OnChange("updateGameState")
  deck: DeckOfCards;

  //@OnChange("updateGameState")
  players: ModiPlayer[];

  //@OnChange("updateGameState")
  activePlayer: ModiPlayer | undefined;

  constructor(players: ModiPlayer[]) {
    super();
  
    this.players = players;
    this.playersAlive = players;
    this.activePlayer = undefined;

    this.deck = createDeckOfCards();
    this.deck.shuffle();
    
    this.updateGameState();
  }

  public getGameState(): ModiGameState {
    return this.gameState;
  }

  public updateGameState(): ModiGameState {
    return (this.gameState = {
      players: this.players,
      activePlayerId: this.activePlayer?.id,
      cardsInDeck: this.deck.cards
    });
  }

  public emitGameState(): void {
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

  public async playRound(): Promise<void> {
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
    losers.forEach((loser: ModiPlayer) => loser.loseLife());

    this.playersAlive.unshift(this.playersAlive.pop());
    this.playersAlive.filter(p => p.lives);
  }

  public playHighCard(players = this.playersAlive): ModiPlayer {
    this.emit(ModiGame.Events.StartingHighcard, players);
    this.clearPlayerCards(this.players);
    this.giveEachPlayerACard(players);
    const [winners, ...groupedLosers] = this.rankPlayersByCards(players);
    if (winners.length > 1) {
      return this.playHighCard(winners);
    }
    return winners[0];
  }

  public clearPlayerCards(players = this.playersAlive) {
    players.forEach((player: ModiPlayer) => {
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

  public handleCardSwap(fromPlayer: ModiPlayer, toPlayer: ModiPlayer): void {
    fromPlayer.tradeCardsWith(toPlayer);
    this.emit(ModiGame.Events.PlayerTraded, { fromPlayer, toPlayer });
  }

  public handleHitDeck(player: ModiPlayer): void {
    this.deck.addToTrash(player.removeCard());
    player.recieveCard(this.deck.dealCard());
    this.emit(ModiGame.Events.PlayerHitDeck, player);
  }

  public giveEachPlayerACard(players = this.playersAlive): void {
    players.forEach((p: ModiPlayer) => p.recieveCard(this.deck.dealCard()));
    this.emit(ModiGame.Events.DealtCards, players);
  }

  public rankPlayersByCards(players = this.playersAlive): ModiPlayer[][] {
    let rankedGroups = Array(13);
    players.forEach((player: ModiPlayer) => {
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

function createModiGame(players: ModiPlayer[]): ModiGame {
  return new ModiGame(players);
}

export default createModiGame;
