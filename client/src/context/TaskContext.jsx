import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { taskService } from '../services/taskService'
import { syncService } from '../services/syncService'
import { useAuth } from './AuthContext'

const TaskContext = createContext()

const initialState = {
  tasks: [],
  isLoading: false,
  filter: 'all', // all, completed, pending, daily, weekly, monthly
  sortBy: 'createdAt', // createdAt, dueDate, priority, title
  sortOrder: 'desc', // asc, desc
  searchQuery: '',
  selectedCategory: 'all', // all, short-term, long-term, custom
}

function taskReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
        isLoading: false,
      }
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
      }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task._id === action.payload._id ? action.payload : task
        ),
      }
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task._id !== action.payload),
      }
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload,
      }
    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder,
      }
    case 'SET_SEARCH':
      return {
        ...state,
        searchQuery: action.payload,
      }
    case 'SET_CATEGORY':
      return {
        ...state,
        selectedCategory: action.payload,
      }
    case 'SYNC_OFFLINE_TASKS':
      return {
        ...state,
        tasks: action.payload,
      }
    default:
      return state
  }
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState)
  const { isAuthenticated, token } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      loadTasks()
      // Set up sync service
      syncService.init(dispatch)
    }
  }, [isAuthenticated])

  const loadTasks = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const tasks = await taskService.getTasks()
      dispatch({ type: 'SET_TASKS', payload: tasks })
    } catch (error) {
      console.error('Error loading tasks:', error)
      // Try to load from offline storage
      const offlineTasks = await syncService.getOfflineTasks()
      dispatch({ type: 'SET_TASKS', payload: offlineTasks })
    }
  }

  const createTask = async (taskData) => {
    try {
      const newTask = await taskService.createTask(taskData)
      dispatch({ type: 'ADD_TASK', payload: newTask })
      return newTask
    } catch (error) {
      // Store offline if network fails
      const offlineTask = await syncService.createOfflineTask(taskData)
      dispatch({ type: 'ADD_TASK', payload: offlineTask })
      throw error
    }
  }

  const updateTask = async (taskId, updates) => {
    try {
      const updatedTask = await taskService.updateTask(taskId, updates)
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask })
      return updatedTask
    } catch (error) {
      // Store offline if network fails
      const offlineTask = await syncService.updateOfflineTask(taskId, updates)
      dispatch({ type: 'UPDATE_TASK', payload: offlineTask })
      throw error
    }
  }

  const deleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId)
      dispatch({ type: 'DELETE_TASK', payload: taskId })
    } catch (error) {
      // Store offline if network fails
      await syncService.deleteOfflineTask(taskId)
      dispatch({ type: 'DELETE_TASK', payload: taskId })
      throw error
    }
  }

  const toggleTaskComplete = async (taskId) => {
    const task = state.tasks.find(t => t._id === taskId)
    if (task) {
      await updateTask(taskId, { completed: !task.completed })
    }
  }

  const setFilter = (filter) => {
    dispatch({ type: 'SET_FILTER', payload: filter })
  }

  const setSort = (sortBy, sortOrder) => {
    dispatch({ type: 'SET_SORT', payload: { sortBy, sortOrder } })
  }

  const setSearch = (query) => {
    dispatch({ type: 'SET_SEARCH', payload: query })
  }

  const setCategory = (category) => {
    dispatch({ type: 'SET_CATEGORY', payload: category })
  }

  // Filter and sort tasks
  const filteredTasks = state.tasks
    .filter(task => {
      // Category filter
      if (state.selectedCategory !== 'all') {
        if (state.selectedCategory !== task.category) return false
      }
      
      // Status filter
      if (state.filter === 'completed') return task.completed
      if (state.filter === 'pending') return !task.completed
      if (state.filter === 'daily') return task.frequency === 'daily'
      if (state.filter === 'weekly') return task.frequency === 'weekly'
      if (state.filter === 'monthly') return task.frequency === 'monthly'
      
      // Search filter
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase()
        return task.title.toLowerCase().includes(query) ||
               (task.description && task.description.toLowerCase().includes(query))
      }
      
      return true
    })
    .sort((a, b) => {
      const aValue = a[state.sortBy]
      const bValue = b[state.sortBy]
      
      if (state.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const value = {
    ...state,
    filteredTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    setFilter,
    setSort,
    setSearch,
    setCategory,
    loadTasks,
  }

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTask() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider')
  }
  return context
}
