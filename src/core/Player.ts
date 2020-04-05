class ModiPlayer {
  public username: string;
  public lives: number;
  public id: string;
  public controller: PlayerController;
  public card?: Card;

  constructor(name: string, id: string, controller: PlayerController) {
    this.controller = controller;
    this.username = name;
    this.lives = 3;
    this.id = id;
  }

  public wantsToSwap(): Promise<boolean> {
    return this.controller.getMove().then((m: PlayerMove) => m === 'swap');
  }

  public tradeCardsWith(other: ModiPlayer): Card {
    const otherCard = other.card;
    other.card = this.card;
    this.card = otherCard;
    return this.card;
  }

  public recieveCard(card: Card): Card {
    if (this.card !== undefined) {
      throw new Error(`${this.username} already has a card: ${this.card}`);
    }
    this.card = card;
    return this.card;
  }

  public removeCard(): Card | undefined {
    const card = this.card;
    this.card = undefined;
    return card;
  }

  public loseLife(): void {
    this.lives -= 1;
  }
  public chooseDealer(): Promise<PlayerId> {
    return this.controller.chooseDealer();
  }
}

function createModiPlayer(username: string, id: PlayerId, controller: PlayerController): ModiPlayer {
  return new ModiPlayer(username, id, controller);
}

export { ModiPlayer };
export default createModiPlayer;