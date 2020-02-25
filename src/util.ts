export function uniqueId(exclusions: string[] = [], len = 5): string {
  const randInt = () => Math.floor(Math.random() * 10);
  const randInts = n => (n > 0 ? randInts(n - 1) + `${randInt()}` : "");
  const id = randInts(len);
  if (exclusions.includes(id)) {
    return uniqueId(exclusions, len);
  }
  return id;
}

export function uniqueIds(count: number, len = 10): string[] {
  const ids = [];
  for (let i = 0; i < count; i++) {
    ids.push(uniqueId(ids, len));
  }
  return ids;
}
