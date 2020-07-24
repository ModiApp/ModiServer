import ModiGame from '../../src/core/ModiGame2';
import { groupSort } from '../../src/util';

const areAllValuesEqual = (arr: Array<any>) =>
  !![...arr].reduce((a, b) => (a === b ? a : false));

const cardsOnTable = (state: ModiGameState) =>
  state.orderedPlayers.map((player) => player.card).filter((card) => !!card);

describe('ModiGame tests', () => {
  let modiGame: ModiGame;
  let playerIds: string[];
  let gameStateHistory: ModiGameState[];
  beforeAll(() => {
    playerIds = ['1', '2', '3', '4', '5', '6'];
    gameStateHistory = [];
    modiGame = new ModiGame(playerIds, (newGameState) => {
      gameStateHistory.push(newGameState);
    });
  });

  describe('ModiGame.playHighcard', () => {
    beforeAll(() => {
      modiGame.playHighcard();
    });

    test('First state change everyone recieved a card', () => {
      console.log('first state change test', gameStateHistory[0]);
      expect(cardsOnTable(gameStateHistory[0]).length).toEqual(
        playerIds.length,
      );
    });

    test('Second state change everyones cards are undefined', () => {
      expect(cardsOnTable(gameStateHistory[1]).length).toBe(0);
    });

    test('Multiple winners have identical cards', () => {
      const winnersCards = groupSort(
        gameStateHistory[0].orderedPlayers,
        (player) => player.card.rank,
      );
      expect(areAllValuesEqual(winnersCards)).toBeTruthy();
    });

    // test('If multiple winners, they get new cards', () => {
    //   if (Object.values(gameStateHistory[0].orderedPlayers).length > 1) {
    //     expect(cardsOnTable(gameStateHistory[3]).length).toBe(0);
    //     expect(cardsOnTable(gameStateHistory[4]).length).toBe(
    //       cardsOnTable(gameStateHistory[2]).length,
    //     );
    //   }
    // });
  });
});
