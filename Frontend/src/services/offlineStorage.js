import { openDB } from 'idb';

class OfflineStorageService {
  constructor() {
    this.dbName = 'mangroveWatchDB';
    this.version = 1;
    this.initDatabase();
  }

  async initDatabase() {
    try {
      this.db = await openDB(this.dbName, this.version, {
        upgrade(db) {
          // Reports store
          if (!db.objectStoreNames.contains('reports')) {
            const reportsStore = db.createObjectStore('reports', {
              keyPath: 'localId',
              autoIncrement: true
            });
            reportsStore.createIndex('status', 'status');
            reportsStore.createIndex('createdAt', 'createdAt');
          }

          // Offline actions store
          if (!db.objectStoreNames.contains('offlineActions')) {
            const actionsStore = db.createObjectStore('offlineActions', {
              keyPath: 'id',
              autoIncrement: true
            });
            actionsStore.createIndex('type', 'type');
            actionsStore.createIndex('timestamp', 'timestamp');
          }

          // Cache store for API responses
          if (!db.objectStoreNames.contains('apiCache')) {
            const cacheStore = db.createObjectStore('apiCache', {
              keyPath: 'url'
            });
            cacheStore.createIndex('timestamp', 'timestamp');
          }
        }
      });
    } catch (error) {
      console.error('Failed to initialize offline database:', error);
    }
  }

  // Store offline report
  async storeOfflineReport(report) {
    try {
      const tx = this.db.transaction('reports', 'readwrite');
      const store = tx.objectStore('reports');
      
      report.status = 'pending';
      report.createdAt = new Date().toISOString();
      report.isOffline = true;
      
      const id = await store.add(report);
      await tx.complete;
      
      return id;
    } catch (error) {
      console.error('Failed to store offline report:', error);
      throw error;
    }
  }

  // Get all pending offline reports
  async getPendingReports() {
    try {
      const tx = this.db.transaction('reports', 'readonly');
      const store = tx.objectStore('reports');
      const index = store.index('status');
      
      return await index.getAll('pending');
    } catch (error) {
      console.error('Failed to get pending reports:', error);
      throw error;
    }
  }

  // Cache API response
  async cacheApiResponse(url, data, maxAge = 3600000) { // default 1 hour
    try {
      const tx = this.db.transaction('apiCache', 'readwrite');
      const store = tx.objectStore('apiCache');
      
      await store.put({
        url,
        data,
        timestamp: Date.now(),
        maxAge
      });
      
      await tx.complete;
    } catch (error) {
      console.error('Failed to cache API response:', error);
    }
  }

  // Get cached API response
  async getCachedResponse(url) {
    try {
      const tx = this.db.transaction('apiCache', 'readonly');
      const store = tx.objectStore('apiCache');
      
      const cache = await store.get(url);
      
      if (!cache) return null;
      
      // Check if cache is still valid
      if (Date.now() - cache.timestamp > cache.maxAge) {
        // Cache expired, remove it
        const deleteTx = this.db.transaction('apiCache', 'readwrite');
        await deleteTx.objectStore('apiCache').delete(url);
        await deleteTx.complete;
        return null;
      }
      
      return cache.data;
    } catch (error) {
      console.error('Failed to get cached response:', error);
      return null;
    }
  }

  // Store offline action
  async storeOfflineAction(action) {
    try {
      const tx = this.db.transaction('offlineActions', 'readwrite');
      const store = tx.objectStore('offlineActions');
      
      action.timestamp = Date.now();
      
      const id = await store.add(action);
      await tx.complete;
      
      return id;
    } catch (error) {
      console.error('Failed to store offline action:', error);
      throw error;
    }
  }

  // Process pending offline actions
  async processPendingActions() {
    try {
      const tx = this.db.transaction('offlineActions', 'readonly');
      const store = tx.objectStore('offlineActions');
      const actions = await store.getAll();
      
      return actions;
    } catch (error) {
      console.error('Failed to get pending actions:', error);
      throw error;
    }
  }

  // Clear processed action
  async clearAction(id) {
    try {
      const tx = this.db.transaction('offlineActions', 'readwrite');
      await tx.objectStore('offlineActions').delete(id);
      await tx.complete;
    } catch (error) {
      console.error('Failed to clear action:', error);
    }
  }

  // Clear expired cache
  async clearExpiredCache() {
    try {
      const tx = this.db.transaction('apiCache', 'readwrite');
      const store = tx.objectStore('apiCache');
      const index = store.index('timestamp');
      const now = Date.now();
      
      let cursor = await index.openCursor();
      
      while (cursor) {
        const cache = cursor.value;
        if (now - cache.timestamp > cache.maxAge) {
          await cursor.delete();
        }
        cursor = await cursor.continue();
      }
      
      await tx.complete;
    } catch (error) {
      console.error('Failed to clear expired cache:', error);
    }
  }
}

export const offlineStorage = new OfflineStorageService();
