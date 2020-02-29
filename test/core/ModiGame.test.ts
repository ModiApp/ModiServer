const { default: ModiGame } = require("../dist/ModiGame");
const { default: Player, PlayerMove } = require("../dist/Player");
const { default: Card, Suit, Rank } = require("../dist/Card");

const mockUsernames = ["Ikey", "Jake", "Louie", "Connor", "Tom"];
const mockPlayerController = {
  getMove() {
    return new Promise(resolve => {
      resolve(Math.random() > 0.5 ? PlayerMove.Swap : PlayerMove.Stick);
    });
  }
};

describe("ModiGame() unit tests:", () => {
  var game;
  beforeEach(() => {
    const players = mockUsernames.map(
      name => new Player(name, mockPlayerController)
    );
    game = new ModiGame(players);
  });

  describe("ModiGame.constructor", () => {
    test("game has correct player array of Players", () => {
      expect(Array.isArray(game.players)).toBe(true);
      const playerNames = game.players.map(p => p.username);
      expect(playerNames).toEqual(mockUsernames);
    });
  });

  describe("ModiGame.playRound", () => {
    test("doesn't crash", async () => {
      await game.playRound();
    });
  });

  // describe("ModiGame.start", () => {
  //   test("game plays until end", async () => {
  //     game.on('END', (winner) => {
  //       expect(winner).not.toBe(null);
  //     });
  //     await game.start();
  //   });
  // });

  describe("ModiGame.handleCardSwap", () => {
    test("both players end up with eachother's cards", () => {
      const player1 = game.players[0];
      const player1Card = player1.card;
      const player2 = game.players[1];
      const player2Card = player2.card;
      game.handleCardSwap(player1, player2);

      expect(player1.card).toEqual(player2Card);
      expect(player2.card).toEqual(player1Card);
    });
  });

  describe("ModiGame.handleHitDeck", () => {
    let lastPlayer, ogDeckLength, ogTopOfDeck, playersOgCard;
    beforeEach(() => {
      lastPlayer = game.players[game.players.length - 1];
      ogDeckLength = game.deck.cards.length;
      ogTopOfDeck = game.deck.cards[ogDeckLength - 1];
      playersOgCard = lastPlayer.card;
      game.handleHitDeck(lastPlayer);
    });

    test("deck loses it's top card", () => {
      expect(game.deck.cards.length + 1).toEqual(ogDeckLength);
      expect(game.deck.cards[ogDeckLength - 1]).not.toEqual(ogTopOfDeck);
    });
    test("player's new card is deck's last top card", () => {
      expect(lastPlayer.card).toBe(ogTopOfDeck);
    });
    test("player's original card is on top of deck.trash", () => {
      const newTopOfTrash = game.deck.trash[game.deck.trash.length - 1];
      expect(playersOgCard).toBe(newTopOfTrash);
    });
  });

  describe("ModiGame.playHighCard", () => {
    test("returns a Player object", () => {
      expect(game.playHighCard() instanceof Player).toEqual(true);
    });
  });

  describe("ModiGame.giveEachPlayerACard", () => {
    test("after calling every player has a card", () => {
      game.giveEachPlayerACard();
      game.players.forEach(player => {
        expect(player.card instanceof Card).toEqual(true);
      });
    });
  });

  describe("ModiGame.clearPlayerCards", () => {
    beforeEach(() => {
      game.giveEachPlayerACard();
    });
    test("removes everyones cards", () => {
      game.clearPlayerCards();
      game.players.forEach(player => {
        expect(player.card).toEqual(undefined);
      });
    });
  });

  describe("ModiGame.rankPlayersByCards", () => {
    test("properly ranks players by card", () => {
      game.players[0].card = new Card(Suit.Spades, Rank.Ace);
      game.players[1].card = new Card(Suit.Clubs, Rank.Two);
      game.players[2].card = new Card(Suit.Diamonds, Rank.Queen);
      game.players[3].card = new Card(Suit.Hearts, Rank.Eight);
      game.players[4].card = new Card(Suit.Spades, Rank.Two);

      const expectedOutput = [
        [game.players[2]], // First place
        [game.players[3]], // Second place
        [game.players[1], game.players[4]], // Third place
        [game.players[0]] // Fourth place
      ];
      const actualOutput = game.rankPlayersByCards();
      expect(expectedOutput).toEqual(actualOutput);
    });
  });
});
