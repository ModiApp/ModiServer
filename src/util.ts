/** ### GroupSort
 * Sorts an array of elements by group in ascending order.
 * @param {any[]} elems The list of elements to group sort
 * @param {function} valueExtractor a method to run on each elem to numerically evalutate them
 * @returns {any[][]} A 2-d array, of the elements grouped by value in ascending order.
 */
export function groupSort<T>(
  elems: T[],
  valueExtractor: (el: T) => number,
): T[][] {
  const groups: { [value: number]: T[] } = {};

  elems.forEach((el) => {
    const value = valueExtractor(el);
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(el);
  });

  const sortedGroups = Object.entries(groups)
    .sort(([aValue], [bValue]) => Number(aValue) - Number(bValue))
    .map(([_, el]) => el);

  return sortedGroups;
}

export function getNextAlivePlayerId(state: GameState, playerId: string) {
  const playerOrder = state.orderedPlayerIds;
  const startIdx = playerOrder.findIndex((id) => id === playerId);

  let nextAlivePlayerIdx = startIdx + 1;
  while (
    state.players[playerOrder[nextAlivePlayerIdx % playerOrder.length]]
      .lives === 0
  ) {
    nextAlivePlayerIdx += 1;
  }

  return playerOrder[nextAlivePlayerIdx];
}
