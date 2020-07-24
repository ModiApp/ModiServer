import { uniqueId, uniqueIds, groupSort } from '../src/util';

describe('util tests:', () => {
  describe('uniqueId()', () => {
    test('generates a string of five random digits', () => {
      const id = uniqueId();
      expect(typeof id).toBe('string');
      expect(() => Number(id)).not.toThrow();
      expect(id.length).toBe(5);
    });
  });
  describe('uniqueId(["1","2","3"], 1)', () => {
    test('generates a random digit that is not 1, 2, or 3', () => {
      const call = () => uniqueId(['0', '1', '2', '3'], 1);
      expect(call().length).toBe(1);
      for (let i = 0; i < 1000; i++) {
        expect(Number(call())).toBeGreaterThan(3);
      }
    });
  });

  describe('uniqueIds(5)', () => {
    test('generates an array of 5 unique ids of ten random digits', () => {
      const ids = uniqueIds(5);
      expect(Array.from(new Set(ids))).toEqual(ids); // All unique
      expect(ids.length).toBe(5);
      expect(ids[0].length).toBe(10);
    });
  });
  describe('uniqueIds(5, 7)', () => {
    test('generates an array of 5 unique ids of seven random digits', () => {
      const ids = uniqueIds(5, 7);
      expect(Array.from(new Set(ids))).toEqual(ids); // All unique
      expect(ids.length).toBe(5);
      expect(ids[0].length).toBe(7);
    });
  });

  describe('groupSort', () => {
    let elems: { id: string; value: number }[];
    let sortedElems: { id: string; value: number }[][];
    beforeAll(() => {
      elems = [
        { id: '1', value: 36 },
        { id: '2', value: 24 },
        { id: '3', value: 36 },
        { id: '4', value: 24 },
        { id: '5', value: 37 },
        { id: '6', value: 2 },
      ];
      sortedElems = groupSort(elems, (elem) => elem.value);
    });

    test('number of unique values is the number of groups', () => {
      const uniqueValues = Array.from(new Set(elems.map((elem) => elem.value)));
      expect(sortedElems.length).toBe(uniqueValues.length);
    });

    test('groups are ordered in ascending order by value', () => {
      const valueOrder = sortedElems.map((group) => group[0].value);
      expect(valueOrder).toEqual(valueOrder.sort());
    });
  });
});
