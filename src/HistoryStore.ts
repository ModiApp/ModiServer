/**
 * Why is this needed?
 *
 * We need to store the state change actions in case any clients disconnect
 * and miss out on live updates. This way, when clients reconnect, they will
 * be able to send a query param of the last version they recieved, and the
 * server will be able to use this action history store to retreive all state
 * changes from that version.
 *
 * So what do we need the store to do?
 * Allow adding actions to the history
 * Allow listening for new actions
 * Allow accessing StateChangeActions by index (version)
 *
 */

import { uniqueId } from './util';

export function createHistoryStore<T>(): HistoryStore<T> {
  const elems: T[] = [];
  const listeners: { [id: string]: HistoryListenerCallback<T> } = {};
  return {
    push(el: T) {
      elems.push(el);
      const idx = elems.length - 1;
      Object.values(listeners).forEach((callback) => callback(el, idx));
      return idx;
    },
    addListener(callback: HistoryListenerCallback<T>) {
      const id = uniqueId(Object.keys(listeners));
      listeners[id] = callback;
      return {
        remove() {
          delete listeners[id];
        },
      };
    },
    getSlice(start?: number, end?: number) {
      return elems.slice(start, end).map((el, idx) => [el, idx + (start || 0)]);
    },
    get(index: number) {
      return elems[index];
    },
    get length() {
      return elems.length;
    },
  };
}
