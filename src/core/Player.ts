import Card from "./Card";

export interface IPlayerController {
  getMove(): Promise<PlayerMove>;
  chooseDealer(): Promise<Player>;
}

export enum PlayerMove {
  Stick,
  Swap
}

export default class Player {
  public username: string;
  public lives: number;
  public controller: IPlayerController;
  public card?: Card;

  constructor(name: string, controller: IPlayerController) {
    this.controller = controller;
    this.username = name;
    this.lives = 3;
  }

  public wantsToSwap(): Promise<boolean> {
    return this.controller.getMove().then(m => m === PlayerMove.Swap);
  }

  public tradeCardsWith(other: Player): Card {
    const otherCard = other.card;
    other.card = this.card;
    this.card = otherCard;
    return this.card;
  }

  public recieveCard(card: Card): Card {
    if (this.card instanceof Card) {
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

  public loseLife() {
    this.lives -= 1;
  }
  public chooseDealer(): Promise<Player> {
    return this.controller.chooseDealer();
  }
}
