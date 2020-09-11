export function uniqueId(exclusions: string[] = [], len = 5): string {
  const randInt = () => Math.floor(Math.random() * 10);
  const randInts = (n) => (n > 0 ? randInts(n - 1) + `${randInt()}` : '');
  const id = randInts(len);
  if (exclusions.includes(id)) {
    return uniqueId(exclusions, len);
  }
  return id;
}

export function uniqueIds(count: number, len = 10): string[] {
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    ids.push(uniqueId(ids, len));
  }
  return ids;
}

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

export function rotateInPlace(arr: any[], num: number) {
  for (let i = 0; i < num; i++) {
    arr.unshift(arr.pop());
  }
}

export function zipArrays<T, K>(arr1: T[], arr2: K[]): [T, K][] {
  return arr1.map((el, i) => [el, arr2[i]]);
}
export class ScheduledTask {
  currTimeoutId: NodeJS.Timeout | null;
  constructor() {
    this.currTimeoutId = null;
  }
  schedule(fn: () => void, ms: number) {
    this.cancel();
    this.currTimeoutId = setTimeout(fn, ms);
  }
  cancel() {
    this.currTimeoutId && clearTimeout(this.currTimeoutId);
  }
}
