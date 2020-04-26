export function uniqueId(exclusions: string[] = [], len = 5): string {
  const randInt = () => Math.floor(Math.random() * 10);
  const randInts = n => (n > 0 ? randInts(n - 1) + `${randInt()}` : '');
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

/** A property decorator that fires the callback fn with the new value of said property.
 *
 * ### Usage:
 * ```js
 * const fnToRunOnMyPropChange = (propVal) => {
 *    console.log("myProperty's value chaned:", propVal);
 * }
 *
 * @onValueChanged(fnToRunOnMyPropChange);
 * const myProperty = 5;
 *
 * myProperty = 6;
 * // Prints "myProperty's value changed: 6";
 * ```
 */
// export const onValueChanged = (fn: (value: any) => void) => {
//   return <T>(target: T, key: keyof T) => {
//     const actualSet = Object.getOwnPropertyDescriptor(target, key).set;
//     Object.defineProperty(target, key, {
//       set(val) {
//         actualSet(val);
//         if (fn) fn(val);
//       }
//     });
//   };
// };
