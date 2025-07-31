import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Target,
  Clock,
  Award,
  Filter
} from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
)

const Analytics = () => {
  const [dateRange, setDateRange] = useState('30days')
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAnalytics({
        summary: {
          totalTasks: 145,
          completedTasks: 89,
          pendingTasks: 56,
          overdueTasks: 12,
          completionRate: 61.38,
          currentStreak: 7,
          longestStreak: 21
        },
        timeSeriesData: [
          { date: '2024-01-01', completed: 5, created: 8 },
          { date: '2024-01-02', completed: 3, created: 5 },
          { date: '2024-01-03', completed: 7, created: 6 },
          { date: '2024-01-04', completed: 4, created: 7 },
          { date: '2024-01-05', completed: 6, created: 4 },
          { date: '2024-01-06', completed: 8, created: 9 },
          { date: '2024-01-07', completed: 5, created: 6 }
        ],
        categoryBreakdown: {
          'short-term': 75,
          'long-term': 45,
          'custom': 25
        },
        priorityBreakdown: {
          'high': 30,
          'medium': 65,
          'low': 50
        },
        frequencyBreakdown: {
          'daily': 40,
          'weekly': 35,
          'monthly': 25,
          'once': 45
        }
      })
      setIsLoading(false)
    }, 1000)
  }, [dateRange])

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case '7days':
        return 'Last 7 days'
      case '30days':
        return 'Last 30 days'
      case '90days':
        return 'Last 90 days'
      case 'thisWeek':
        return 'This week'
      case 'thisMonth':
        return 'This month'
      default:
        return 'Last 30 days'
    }
  }

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151'
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
        }
      },
      y: {
        grid: {
          color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
        }
      }
    }
  }

  // Time series chart data
  const timeSeriesChartData = {
    labels: analytics?.timeSeriesData?.map(item => format(new Date(item.date), 'MMM dd')) || [],
    datasets: [
      {
        label: 'Tasks Completed',
        data: analytics?.timeSeriesData?.map(item => item.completed) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
      },
      {
        label: 'Tasks Created',
        data: analytics?.timeSeriesData?.map(item => item.created) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
    ],
  }

  // Category breakdown chart data
  const categoryChartData = {
    labels: Object.keys(analytics?.categoryBreakdown || {}),
    datasets: [
      {
        data: Object.values(analytics?.categoryBreakdown || {}),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
        ],
        borderWidth: 2,
      },
    ],
  }

  // Priority breakdown chart data
  const priorityChartData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Tasks by Priority',
        data: [
          analytics?.priorityBreakdown?.high || 0,
          analytics?.priorityBreakdown?.medium || 0,
          analytics?.priorityBreakdown?.low || 0
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.6)',
          'rgba(251, 191, 36, 0.6)',
          'rgba(34, 197, 94, 0.6)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(251, 191, 36)',
          'rgb(34, 197, 94)',
        ],
        borderWidth: 2,
      },
    ],
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading analytics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your productivity and task completion trends
          </p>
        </div>
        
        {/* Date Range Filter */}
        <div className="mt-4 sm:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="thisWeek">This week</option>
            <option value="thisMonth">This month</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {analytics?.summary?.totalTasks || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {Math.round(analytics?.summary?.completionRate || 0)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Streak</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {analytics?.summary?.currentStreak || 0} days
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Longest Streak</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {analytics?.summary?.longestStreak || 0} days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Task Activity ({getDateRangeLabel()})
            </h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Bar data={timeSeriesChartData} options={chartOptions} />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tasks by Category
            </h3>
            <Target className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Doughnut 
              data={categoryChartData} 
              options={{
                ...chartOptions,
                scales: undefined,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'bottom',
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                      color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151'
                    }
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Priority Distribution
            </h3>
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Bar data={priorityChartData} options={chartOptions} />
          </div>
        </div>

        {/* Productivity Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Productivity Insights
            </h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Most productive day
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Monday</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Average tasks per day
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">4.8</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tasks overdue
              </span>
              <span className="text-sm text-red-600 dark:text-red-400">
                {analytics?.summary?.overdueTasks || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Best completion hour
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">2:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Detailed Statistics ({getDateRangeLabel()})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {analytics?.summary?.completedTasks || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tasks Completed</p>
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {analytics?.summary?.pendingTasks || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tasks Pending</p>
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {Math.round((analytics?.summary?.completedTasks || 0) / 7)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg. per Day</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
