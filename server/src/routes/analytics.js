import express from 'express'
import Task from '../models/Task.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// Apply auth middleware to all routes
router.use(auth)

/**
 * @swagger
 * /api/analytics:
 *   get:
 *     summary: Get task analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analytics (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analytics (YYYY-MM-DD)
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *         description: Group analytics by time period
 *     responses:
 *       200:
 *         description: Task analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 analytics:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalTasks:
 *                           type: integer
 *                         completedTasks:
 *                           type: integer
 *                         pendingTasks:
 *                           type: integer
 *                         completionRate:
 *                           type: number
 *                         currentStreak:
 *                           type: integer
 *                         longestStreak:
 *                           type: integer
 *                     timeSeriesData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           completed:
 *                             type: integer
 *                           created:
 *                             type: integer
 *                     categoryBreakdown:
 *                       type: object
 *                     priorityBreakdown:
 *                       type: object
 *                     frequencyBreakdown:
 *                       type: object
 */
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query

    // Set default date range (last 30 days)
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Ensure end date is end of day
    end.setHours(23, 59, 59, 999)
    start.setHours(0, 0, 0, 0)

    // Get summary statistics
    const [totalTasks, completedTasks] = await Promise.all([
      Task.countDocuments({ userId: req.user._id }),
      Task.countDocuments({ userId: req.user._id, completed: true })
    ])

    const pendingTasks = totalTasks - completedTasks
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    // Get tasks for time series analysis
    const tasksInRange = await Task.find({
      userId: req.user._id,
      $or: [
        { createdAt: { $gte: start, $lte: end } },
        { completedAt: { $gte: start, $lte: end } }
      ]
    }).sort({ createdAt: 1 })

    // Generate time series data
    const timeSeriesData = generateTimeSeriesData(tasksInRange, start, end, groupBy)

    // Calculate streaks
    const streakData = await calculateStreaks(req.user._id)

    // Get category breakdown
    const categoryBreakdown = await Task.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    // Get priority breakdown
    const priorityBreakdown = await Task.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    // Get frequency breakdown
    const frequencyBreakdown = await Task.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$frequency', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    // Get completion by category
    const completionByCategory = await Task.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$completed', 1, 0] } }
        }
      },
      {
        $project: {
          category: '$_id',
          total: 1,
          completed: 1,
          completionRate: {
            $multiply: [{ $divide: ['$completed', '$total'] }, 100]
          }
        }
      }
    ])

    // Get overdue tasks
    const overdueTasks = await Task.countDocuments({
      userId: req.user._id,
      completed: false,
      dueDate: { $lt: new Date() }
    })

    res.json({
      success: true,
      analytics: {
        summary: {
          totalTasks,
          completedTasks,
          pendingTasks,
          overdueTasks,
          completionRate: Math.round(completionRate * 100) / 100,
          currentStreak: streakData.currentStreak,
          longestStreak: streakData.longestStreak
        },
        timeSeriesData,
        categoryBreakdown: categoryBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
        priorityBreakdown: priorityBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
        frequencyBreakdown: frequencyBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
        completionByCategory: completionByCategory.reduce((acc, item) => {
          acc[item.category] = {
            total: item.total,
            completed: item.completed,
            completionRate: Math.round(item.completionRate * 100) / 100
          }
          return acc
        }, {}),
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString()
        }
      }
    })
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics'
    })
  }
})

/**
 * @swagger
 * /api/analytics/productivity:
 *   get:
 *     summary: Get productivity analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Productivity analytics data
 */
router.get('/productivity', async (req, res) => {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [todayStats, weekStats, monthStats] = await Promise.all([
      getProductivityStats(req.user._id, today, now),
      getProductivityStats(req.user._id, thisWeek, now),
      getProductivityStats(req.user._id, thisMonth, now)
    ])

    // Get most productive hours
    const hourlyData = await Task.aggregate([
      {
        $match: {
          userId: req.user._id,
          completedAt: { $exists: true }
        }
      },
      {
        $project: {
          hour: { $hour: '$completedAt' }
        }
      },
      {
        $group: {
          _id: '$hour',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    res.json({
      success: true,
      productivity: {
        today: todayStats,
        thisWeek: weekStats,
        thisMonth: monthStats,
        mostProductiveHours: hourlyData.slice(0, 5)
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching productivity analytics'
    })
  }
})

// Helper function to generate time series data
function generateTimeSeriesData(tasks, startDate, endDate, groupBy) {
  const data = []
  const current = new Date(startDate)

  while (current <= endDate) {
    const periodEnd = new Date(current)

    if (groupBy === 'day') {
      periodEnd.setDate(periodEnd.getDate() + 1)
    } else if (groupBy === 'week') {
      periodEnd.setDate(periodEnd.getDate() + 7)
    } else if (groupBy === 'month') {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    }

    const created = tasks.filter(task => 
      task.createdAt >= current && task.createdAt < periodEnd
    ).length

    const completed = tasks.filter(task => 
      task.completedAt && task.completedAt >= current && task.completedAt < periodEnd
    ).length

    data.push({
      date: current.toISOString().split('T')[0],
      created,
      completed
    })

    current.setTime(periodEnd.getTime())
  }

  return data
}

// Helper function to calculate streaks
async function calculateStreaks(userId) {
  const completedTasks = await Task.find({
    userId,
    completed: true,
    completedAt: { $exists: true }
  }).sort({ completedAt: -1 })

  if (completedTasks.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  let lastDate = null

  for (const task of completedTasks) {
    const taskDate = new Date(task.completedAt).toDateString()
    
    if (lastDate === null) {
      tempStreak = 1
      const today = new Date().toDateString()
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
      
      if (taskDate === today || taskDate === yesterday) {
        currentStreak = 1
      }
    } else if (taskDate === lastDate) {
      // Same day, don't increment
      continue
    } else {
      const daysDiff = Math.abs(new Date(lastDate) - new Date(taskDate)) / (1000 * 60 * 60 * 24)
      
      if (daysDiff === 1) {
        tempStreak++
        if (currentStreak > 0) {
          currentStreak++
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
        currentStreak = 0
      }
    }
    
    lastDate = taskDate
  }

  longestStreak = Math.max(longestStreak, tempStreak)
  
  return { currentStreak, longestStreak }
}

// Helper function to get productivity stats
async function getProductivityStats(userId, startDate, endDate) {
  const [created, completed] = await Promise.all([
    Task.countDocuments({
      userId,
      createdAt: { $gte: startDate, $lte: endDate }
    }),
    Task.countDocuments({
      userId,
      completedAt: { $gte: startDate, $lte: endDate }
    })
  ])

  return {
    created,
    completed,
    completionRate: created > 0 ? (completed / created) * 100 : 0
  }
}

export default router
