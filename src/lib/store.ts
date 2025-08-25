import { writable, type Writable } from 'svelte/store';
import type { AppState } from '../app';

function persistentWritable<T>(key: string, initial: T): Writable<T> {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  const start: T = stored ? JSON.parse(stored) : initial;
  const store = writable<T>(start);

  store.subscribe((value) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
    if (typeof indexedDB !== 'undefined') {
      const request = indexedDB.open('svelte-store', 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore('state');
      };
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('state', 'readwrite');
        tx.objectStore('state').put(value, key);
        tx.oncomplete = () => db.close();
      };
    }
  });

  return store;
}

export const appState = persistentWritable<AppState>('app-state', {} as AppState);
