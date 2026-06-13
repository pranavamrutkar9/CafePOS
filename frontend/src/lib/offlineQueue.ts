import { openDB } from 'idb';

const DB_NAME = 'CafePOS_OfflineDB';
const STORE_NAME = 'pendingOrders';

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export async function saveOrderOffline(orderData: any) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.add({ ...orderData, timestamp: Date.now() });
  await tx.done;
}

export async function getOfflineOrders() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

export async function clearOfflineOrder(id: number) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.delete(id);
  await tx.done;
}
