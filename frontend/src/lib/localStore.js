import { openDB } from 'idb';

const DB_NAME = 'transitDB';
const STATIONS_STORE = 'stations';
const SYNC_QUEUE = 'syncQueue';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    // Stations store
    if (!db.objectStoreNames.contains(STATIONS_STORE)) {
      db.createObjectStore(STATIONS_STORE, { keyPath: 'id', autoIncrement: true });
    }
    // Sync queue store
    if (!db.objectStoreNames.contains(SYNC_QUEUE)) {
      db.createObjectStore(SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
    }
  },
});

export const localStore = {
  async addStation(station) {
    const db = await dbPromise;
    const tx = db.transaction(STATIONS_STORE, 'readwrite');
    const store = tx.objectStore(STATIONS_STORE);
    
    // Add to local store
    const id = await store.add({
      ...station,
      pending: true,
      timestamp: Date.now()
    });

    // Add to sync queue
    const syncTx = db.transaction(SYNC_QUEUE, 'readwrite');
    await syncTx.objectStore(SYNC_QUEUE).add({
      type: 'ADD_STATION',
      data: station,
      timestamp: Date.now()
    });

    return { id, ...station };
  },

  async getStations() {
    const db = await dbPromise;
    return db.getAll(STATIONS_STORE);
  },

  async syncWithServer() {
    const db = await dbPromise;
    const queue = await db.getAll(SYNC_QUEUE);
    
    for (const item of queue) {
      try {
        if (item.type === 'ADD_STATION') {
          const { data: station, error } = await supabase
            .from('stations')
            .insert([item.data])
            .select()
            .single();

          if (!error) {
            // Update local store with server data
            const tx = db.transaction(STATIONS_STORE, 'readwrite');
            await tx.objectStore(STATIONS_STORE).put({
              ...station,
              pending: false
            });

            // Remove from sync queue
            const syncTx = db.transaction(SYNC_QUEUE, 'readwrite');
            await syncTx.objectStore(SYNC_QUEUE).delete(item.id);
          }
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    }
  }
}; 