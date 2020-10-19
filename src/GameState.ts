export function reduceGameState(
  state: GameState,
  action: StateChangeAction,
): GameState {
  return { ...state, version: state.version + 1 };
}

/**
 * Actions that occur during a game:
 * 1. Deal Cards (to all players, in order)
 * 2. Assess highcard winners
 * 3. Remove players cards
 * 4. Winner of highcard picks dealer
 * 5. Deal cards (to all players, starting from player after dealer)
 * 6. Stick, Swap, Hit Deck, ... players make moves
 * 7. Assess Losers and remove lives of losers and cards of all
 * 9. Make next alive player dealer
 * 10. Repeat 5-9 until there is only one player with more than zero lives
 * 11. If no players remain, double game! Everyone gets a second chance
 */
