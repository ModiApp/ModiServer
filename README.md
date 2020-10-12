# Modi Server

## Game Sockets

Modi Mobile needs a way of knowing when to run these animations:

1. Dealing cards to each player
2. Highlighting whose turn it is
3. Animating cards being traded with each other
4. Animating dealer hitting the deck
5. Cards being sent to trash

The way we acheive this is by sending the client an initial game state and then sending it dispatch events with information needed for updating the state.

## Lets say we have a game of two people:

```ts
// Initial State
{
  round: 1,
  players: [
    { id: 1, username: 'Ikey', lives: 3, card: null },
    { id: 2, username: 'Peter', lives: 3, card: null },
  ],
}
```

## To alert the client that cards were dealt, we dispatch an action

```ts
// First dispatch
dispatch({
  type: "DEALT_CARDS",
  payload: {
    cards: [
      { userId: 1, card: { suit: "hearts", rank: 6 } },
      { userId: 2, card: { suit: "spades", rank: 1 } },
    ],
  },
});
```

## The client recieves that and reduces the state to:

```ts
{
  round: 1,
  players: [
    {
      id: 1, username: 'Ikey', lives: 3,
      card: { suit: 'hearts', rank: 6 },
    },
    {
      id: 2, username: 'Peter', lives: 3,
      card: { suit: 'spades', rank: 1 }
    },
  ],
}
```

> ### It can also use the action type of 'DEALT_CARDS' as a que for running some sort of cards dealing animation ...

---
