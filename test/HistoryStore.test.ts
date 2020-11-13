import { createHistoryStore } from '../src/HistoryStore';

describe.only('history store tests', () => {
  let store = createHistoryStore<string>();

  beforeEach(() => {
    store = createHistoryStore<string>();
  });

  test('can add elements to the store', () => {
    store.push('a');
    store.push('b');
    store.push('c');

    expect(store.get(0)).toBe('a');
    expect(store.get(1)).toBe('b');
    expect(store.get(2)).toBe('c');
  });

  test('pushing elements returns the index they were inserted at', () => {
    expect(store.push('a')).toBe(0);
    expect(store.push('a')).toBe(1);
    expect(store.push('a')).toBe(2);
  });

  test('can register store event listeners', () => {
    const listenerCallback1 = jest.fn();
    const firstListener = store.addListener(listenerCallback1);
    store.push('a');
    store.push('b');
    store.push('c');

    expect(listenerCallback1).toHaveBeenNthCalledWith(1, 'a', 0);
    expect(listenerCallback1).toHaveBeenNthCalledWith(2, 'b', 1);
    expect(listenerCallback1).toHaveBeenNthCalledWith(3, 'c', 2);

    const listenerCallback2 = jest.fn();
    store.addListener(listenerCallback2);

    store.push('d');
    expect(listenerCallback1).toHaveBeenNthCalledWith(4, 'd', 3);
    expect(listenerCallback2).toHaveBeenNthCalledWith(1, 'd', 3);

    firstListener.remove();
    store.push('e');

    expect(listenerCallback1).toHaveBeenCalledTimes(4);
    expect(listenerCallback2).toHaveBeenNthCalledWith(2, 'e', 4);
  });

  test('can access slices of the history', () => {
    const arr = ['a', 'b', 'c', 'd', 'e'];
    arr.forEach(store.push);

    const slice = store.getSlice();
    expect(slice).toStrictEqual([
      ['a', 0],
      ['b', 1],
      ['c', 2],
      ['d', 3],
      ['e', 4],
    ]);

    const slice2 = store.getSlice(2);
    expect(slice2).toStrictEqual([
      ['c', 2],
      ['d', 3],
      ['e', 4],
    ]);

    const slice3 = store.getSlice(0, 2);
    expect(slice3).toStrictEqual([
      ['a', 0],
      ['b', 1],
    ]);
  });

  test('can access elements by index', () => {
    store.push('a');
    store.push('b');
    store.push('c');

    expect(store.get(0)).toBe('a');
    expect(store.get(1)).toBe('b');
    expect(store.get(2)).toBe('c');
  });

  test('can access the length of history', () => {
    store.push('a');
    store.push('b');
    store.push('c');

    expect(store.length).toBe(3);
  });
});
