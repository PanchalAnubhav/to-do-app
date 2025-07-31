import { openDB } from 'idb'

const DB_NAME = 'TodoAppDB'
const DB_VERSION = 1
const TASKS_STORE = 'tasks'
const SYNC_STORE = 'sync_queue'

class StorageService {
  constructor() {
    this.db = null
    this.init()
  }

  async init() {
    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion, transaction) {
          // Tasks store
          if (!db.objectStoreNames.contains(TASKS_STORE)) {
            const tasksStore = db.createObjectStore(TASKS_STORE, {
              keyPath: '_id'
            })
            tasksStore.createIndex('userId', 'userId')
            tasksStore.createIndex('createdAt', 'createdAt')
            tasksStore.createIndex('completed', 'completed')
          }

          // Sync queue store
          if (!db.objectStoreNames.contains(SYNC_STORE)) {
            const syncStore = db.createObjectStore(SYNC_STORE, {
              keyPath: 'id',
              autoIncrement: true
            })
            syncStore.createIndex('type', 'type')
            syncStore.createIndex('timestamp', 'timestamp')
          }
        },
      })
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error)
      // Fallback to localStorage
      this.useLocalStorage = true
    }
  }

  // Tasks management
  async getTasks(userId) {
    if (this.useLocalStorage) {
      const tasks = localStorage.getItem(`tasks_${userId}`)
      return tasks ? JSON.parse(tasks) : []
    }

    if (!this.db) await this.init()
    const tx = this.db.transaction(TASKS_STORE, 'readonly')
    const index = tx.store.index('userId')
    return await index.getAll(userId)
  }

  async saveTask(task) {
    if (this.useLocalStorage) {
      const tasks = await this.getTasks(task.userId)
      const existingIndex = tasks.findIndex(t => t._id === task._id)
      
      if (existingIndex >= 0) {
        tasks[existingIndex] = task
      } else {
        tasks.push(task)
      }
      
      localStorage.setItem(`tasks_${task.userId}`, JSON.stringify(tasks))
      return
    }

    if (!this.db) await this.init()
    const tx = this.db.transaction(TASKS_STORE, 'readwrite')
    await tx.store.put(task)
  }

  async saveTasks(tasks, userId) {
    if (this.useLocalStorage) {
      localStorage.setItem(`tasks_${userId}`, JSON.stringify(tasks))
      return
    }

    if (!this.db) await this.init()
    const tx = this.db.transaction(TASKS_STORE, 'readwrite')
    
    for (const task of tasks) {
      await tx.store.put(task)
    }
  }

  async deleteTask(taskId, userId) {
    if (this.useLocalStorage) {
      const tasks = await this.getTasks(userId)
      const filteredTasks = tasks.filter(t => t._id !== taskId)
      localStorage.setItem(`tasks_${userId}`, JSON.stringify(filteredTasks))
      return
    }

    if (!this.db) await this.init()
    const tx = this.db.transaction(TASKS_STORE, 'readwrite')
    await tx.store.delete(taskId)
  }

  async clearTasks(userId) {
    if (this.useLocalStorage) {
      localStorage.removeItem(`tasks_${userId}`)
      return
    }

    if (!this.db) await this.init()
    const tx = this.db.transaction(TASKS_STORE, 'readwrite')
    const index = tx.store.index('userId')
    const tasks = await index.getAll(userId)
    
    for (const task of tasks) {
      await tx.store.delete(task._id)
    }
  }

  // Sync queue management
  async addToSyncQueue(operation) {
    const syncItem = {
      ...operation,
      timestamp: Date.now(),
      id: `${operation.type}_${operation.taskId || Date.now()}_${Math.random()}`
    }

    if (this.useLocalStorage) {
      const queue = this.getSyncQueue()
      queue.push(syncItem)
      localStorage.setItem('sync_queue', JSON.stringify(queue))
      return
    }

    if (!this.db) await this.init()
    const tx = this.db.transaction(SYNC_STORE, 'readwrite')
    await tx.store.add(syncItem)
  }

  async getSyncQueue() {
    if (this.useLocalStorage) {
      const queue = localStorage.getItem('sync_queue')
      return queue ? JSON.parse(queue) : []
    }

    if (!this.db) await this.init()
    const tx = this.db.transaction(SYNC_STORE, 'readonly')
    return await tx.store.getAll()
  }

  async removeFromSyncQueue(id) {
    if (this.useLocalStorage) {
      const queue = this.getSyncQueue()
      const filteredQueue = queue.filter(item => item.id !== id)
      localStorage.setItem('sync_queue', JSON.stringify(filteredQueue))
      return
    }

    if (!this.db) await this.init()
    const tx = this.db.transaction(SYNC_STORE, 'readwrite')
    await tx.store.delete(id)
  }

  async clearSyncQueue() {
    if (this.useLocalStorage) {
      localStorage.removeItem('sync_queue')
      return
    }

    if (!this.db) await this.init()
    const tx = this.db.transaction(SYNC_STORE, 'readwrite')
    await tx.store.clear()
  }

  // General storage
  async setItem(key, value) {
    if (this.useLocalStorage) {
      localStorage.setItem(key, JSON.stringify(value))
      return
    }

    // For simple key-value pairs, use localStorage even when IndexedDB is available
    localStorage.setItem(key, JSON.stringify(value))
  }

  async getItem(key) {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  }

  async removeItem(key) {
    localStorage.removeItem(key)
  }
}

export const storageService = new StorageService()
