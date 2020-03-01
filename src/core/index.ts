import ModiGame from "./ModiGame";
import Player, { PlayerController } from "./Player";

function createModiGame(players: Player[]): ModiGame {
    return new ModiGame(players);
}

function createModiPlayer(username: string, playerId: string, controller: PlayerController): Player {
    return new Player(username, playerId, controller);
}

export {
    createModiGame,
    createModiPlayer,
};
