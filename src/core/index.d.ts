declare module "@modi/core" {
	export class ModiGame {
		static Events: Object;
		deck: Deck;
		players: Player[];
		playersAlive: Player[];
		constructor(players: Player[]);
		start(): Promise<void>;
	}
	export class Player {
		username: string;
		lives: number;
		controller: IPlayer;
		card?: Card;
		constructor(name: string, controller: IPlayer);
		wantsToSwap(): Promise<boolean>;
		tradeCardsWith(other: Player): Card;
		recieveCard(card: Card): Card;
		removeCard(): Card | undefined;
		loseLife(): void;
	}
	export interface IPlayer {
		getMove(): Promise<PlayerMove>;
	}
	export enum PlayerMove {
		Stick,
		Swap,
	}
	export enum Suit {
		Spades,
		Hearts,
		Clubs,
		Diamonds,
	}
	export enum Rank {
		Ace,
		Two,
		Three,
		Four,
		Five,
		Six,
		Seven,
		Eight,
		Nine,
		Ten,
		Jack,
		Queen,
		King,
	}
	export class Card {
		suit: Suit;
		rank: Rank;
		constructor(suit: Suit, rank: Rank);
		value(): number;
	}
	export class Deck {
		cards: Card[];
		trash: Card[];
		constructor();
		shuffle(): void;
		dealCard(): Card;
		addToTrash(card: Card): Card;
		reload(): Card[];
	}	
}