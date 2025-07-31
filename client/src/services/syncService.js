import { storageService } from './storageService'
import { taskService } from './taskService'

class SyncService {
  constructor() {
    this.isOnline = navigator.onLine
    this.dispatch = null
    this.userId = null
    this.syncInProgress = false
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncPendingChanges()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  init(dispatch) {
    this.dispatch = dispatch
    
    // Get user ID from localStorage
    const user = localStorage.getItem('user')
    if (user) {
      this.userId = JSON.parse(user).id
    }
    
    // Start periodic sync
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncPendingChanges()
      }
    }, 30000) // Sync every 30 seconds
  }

  async getOfflineTasks() {
    if (!this.userId) return []
    return await storageService.getTasks(this.userId)
  }

  async createOfflineTask(taskData) {
    const offlineTask = {
      ...taskData,
      _id: `offline_${Date.now()}_${Math.random()}`,
      userId: this.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOffline: true,
    }

    await storageService.saveTask(offlineTask)
    await storageService.addToSyncQueue({
      type: 'CREATE',
      taskId: offlineTask._id,
      data: taskData,
    })

    return offlineTask
  }

  async updateOfflineTask(taskId, updates) {
    const tasks = await this.getOfflineTasks()
    const task = tasks.find(t => t._id === taskId)
    
    if (task) {
      const updatedTask = {
        ...task,
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      
      await storageService.saveTask(updatedTask)
      await storageService.addToSyncQueue({
        type: 'UPDATE',
        taskId,
        data: updates,
      })
      
      return updatedTask
    }
    
    throw new Error('Task not found')
  }

  async deleteOfflineTask(taskId) {
    await storageService.deleteTask(taskId, this.userId)
    await storageService.addToSyncQueue({
      type: 'DELETE',
      taskId,
    })
  }

  async syncPendingChanges() {
    if (!this.isOnline || this.syncInProgress || !this.userId) {
      return
    }

    this.syncInProgress = true

    try {
      const syncQueue = await storageService.getSyncQueue()
      
      for (const operation of syncQueue) {
        try {
          await this.processOperation(operation)
          await storageService.removeFromSyncQueue(operation.id)
        } catch (error) {
          console.error('Failed to sync operation:', operation, error)
          // Keep the operation in queue for retry
        }
      }

      // Sync tasks from server
      await this.syncFromServer()
      
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  async processOperation(operation) {
    switch (operation.type) {
      case 'CREATE':
        const newTask = await taskService.createTask(operation.data)
        // Update local storage with server task
        await storageService.deleteTask(operation.taskId, this.userId)
        await storageService.saveTask(newTask)
        
        if (this.dispatch) {
          this.dispatch({ type: 'UPDATE_TASK', payload: newTask })
        }
        break

      case 'UPDATE':
        // Check if task still exists locally (might have been deleted)
        const localTasks = await this.getOfflineTasks()
        const localTask = localTasks.find(t => t._id === operation.taskId)
        
        if (localTask && !localTask._id.startsWith('offline_')) {
          const updatedTask = await taskService.updateTask(operation.taskId, operation.data)
          await storageService.saveTask(updatedTask)
          
          if (this.dispatch) {
            this.dispatch({ type: 'UPDATE_TASK', payload: updatedTask })
          }
        }
        break

      case 'DELETE':
        if (!operation.taskId.startsWith('offline_')) {
          await taskService.deleteTask(operation.taskId)
        }
        break

      default:
        console.warn('Unknown sync operation type:', operation.type)
    }
  }

  async syncFromServer() {
    try {
      const serverTasks = await taskService.getTasks()
      const localTasks = await this.getOfflineTasks()
      
      // Find tasks that exist on server but not locally
      const newTasks = serverTasks.filter(serverTask => 
        !localTasks.some(localTask => localTask._id === serverTask._id)
      )
      
      // Find tasks that were updated on server
      const updatedTasks = serverTasks.filter(serverTask => {
        const localTask = localTasks.find(lt => lt._id === serverTask._id)
        return localTask && 
               new Date(serverTask.updatedAt) > new Date(localTask.updatedAt)
      })
      
      // Save new and updated tasks locally
      for (const task of [...newTasks, ...updatedTasks]) {
        await storageService.saveTask(task)
      }
      
      // Update React state if needed
      if (this.dispatch && (newTasks.length > 0 || updatedTasks.length > 0)) {
        const allTasks = await this.getOfflineTasks()
        this.dispatch({ type: 'SYNC_OFFLINE_TASKS', payload: allTasks })
      }
      
    } catch (error) {
      console.error('Failed to sync from server:', error)
    }
  }

  async clearOfflineData() {
    await storageService.clearTasks(this.userId)
    await storageService.clearSyncQueue()
  }

  // Get sync status
  async getSyncStatus() {
    const queue = await storageService.getSyncQueue()
    return {
      isOnline: this.isOnline,
      pendingOperations: queue.length,
      lastSync: await storageService.getItem('lastSync'),
    }
  }
}

export const syncService = new SyncService()
