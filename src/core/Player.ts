class ModiPlayer implements IModiPlayer {
  static initialLifeCount = 3;

  id: string;
  lives: number;
  card: ICard | undefined;
  username: string;

  constructor(playerId: string, username: string) {
    this.id = playerId;
    this.lives = ModiPlayer.initialLifeCount;
    this.card = undefined;
    this.username = username;
  }

  loseLife() {
    if (!this.isAlive) {
      throw new Error(`Player ${this.id} has no lives left to lose.`);
    }
    this.lives -= 1;
  }

  revive() {
    this.lives = ModiPlayer.initialLifeCount;
  }

  // Make sure there's no reference bugs here
  tradeCardsWith(otherPlayer: IModiPlayer) {
    const theirCard = otherPlayer.card;
    otherPlayer.card = this.card;
    this.card = theirCard;
  }

  setCard(card: ICard) {
    this.card = card;
  }
  removeCard() {
    this.card = undefined;
  }

  get isAlive() {
    return this.lives > 0;
  }
}

export default ModiPlayer;
