import { apiService } from './apiService'

class TaskService {
  async getTasks(filters = {}) {
    const queryParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value)
      }
    })
    
    const endpoint = queryParams.toString() ? `/tasks?${queryParams}` : '/tasks'
    return await apiService.get(endpoint)
  }

  async getTask(taskId) {
    return await apiService.get(`/tasks/${taskId}`)
  }

  async createTask(taskData) {
    return await apiService.post('/tasks', taskData)
  }

  async updateTask(taskId, updates) {
    return await apiService.put(`/tasks/${taskId}`, updates)
  }

  async deleteTask(taskId) {
    return await apiService.delete(`/tasks/${taskId}`)
  }

  async getAnalytics(dateRange = {}) {
    const queryParams = new URLSearchParams()
    
    if (dateRange.startDate) {
      queryParams.append('startDate', dateRange.startDate)
    }
    if (dateRange.endDate) {
      queryParams.append('endDate', dateRange.endDate)
    }
    
    const endpoint = queryParams.toString() ? `/analytics?${queryParams}` : '/analytics'
    return await apiService.get(endpoint)
  }

  async bulkUpdate(taskIds, updates) {
    return await apiService.patch('/tasks/bulk', {
      taskIds,
      updates,
    })
  }

  async bulkDelete(taskIds) {
    return await apiService.delete('/tasks/bulk', {
      body: { taskIds }
    })
  }

  async duplicateTask(taskId) {
    return await apiService.post(`/tasks/${taskId}/duplicate`)
  }
}

export const taskService = new TaskService()
