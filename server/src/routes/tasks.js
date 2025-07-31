import express from 'express'
import Task from '../models/Task.js'
import { auth } from '../middleware/auth.js'
import { 
  validate, 
  createTaskSchema, 
  updateTaskSchema,
  bulkUpdateSchema,
  bulkDeleteSchema
} from '../middleware/validation.js'

const router = express.Router()

// Apply auth middleware to all routes
router.use(auth)

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get user tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter by completion status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [short-term, long-term, custom]
 *         description: Filter by category
 *       - in: query
 *         name: frequency
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, once]
 *         description: Filter by frequency
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by priority
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, dueDate, title, priority]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of tasks to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/', async (req, res) => {
  try {
    const {
      completed,
      category,
      frequency,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 50,
      page = 1
    } = req.query

    // Build filter query
    const filter = { userId: req.user._id }

    if (completed !== undefined) {
      filter.completed = completed === 'true'
    }

    if (category) {
      filter.category = category
    }

    if (frequency) {
      filter.frequency = frequency
    }

    if (priority) {
      filter.priority = priority
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    // Build sort query
    const sort = {}
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const total = await Task.countDocuments(filter)

    // Get tasks
    const tasks = await Task.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)

    res.json({
      success: true,
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    })
  }
})

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    res.json({
      success: true,
      task
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task'
    })
  }
})

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               category:
 *                 type: string
 *                 enum: [short-term, long-term, custom]
 *               frequency:
 *                 type: string
 *                 enum: [daily, weekly, monthly, once]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 */
router.post('/', validate(createTaskSchema), async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      userId: req.user._id
    })

    res.status(201).json({
      success: true,
      task
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating task'
    })
  }
})

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               completed:
 *                 type: boolean
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               category:
 *                 type: string
 *                 enum: [short-term, long-term, custom]
 *               frequency:
 *                 type: string
 *                 enum: [daily, weekly, monthly, once]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */
router.put('/:id', validate(updateTaskSchema), async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    res.json({
      success: true,
      task
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating task'
    })
  }
})

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting task'
    })
  }
})

/**
 * @swagger
 * /api/tasks/{id}/duplicate:
 *   post:
 *     summary: Duplicate a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID to duplicate
 *     responses:
 *       201:
 *         description: Task duplicated successfully
 *       404:
 *         description: Task not found
 */
router.post('/:id/duplicate', async (req, res) => {
  try {
    const originalTask = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    })

    if (!originalTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }

    // Create duplicate task
    const duplicateTask = await Task.create({
      title: `${originalTask.title} (Copy)`,
      description: originalTask.description,
      priority: originalTask.priority,
      category: originalTask.category,
      frequency: originalTask.frequency,
      dueDate: originalTask.dueDate,
      tags: originalTask.tags,
      userId: req.user._id
    })

    res.status(201).json({
      success: true,
      task: duplicateTask
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while duplicating task'
    })
  }
})

/**
 * @swagger
 * /api/tasks/bulk:
 *   patch:
 *     summary: Bulk update tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskIds
 *               - updates
 *             properties:
 *               taskIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               updates:
 *                 type: object
 *     responses:
 *       200:
 *         description: Tasks updated successfully
 */
router.patch('/bulk', validate(bulkUpdateSchema), async (req, res) => {
  try {
    const { taskIds, updates } = req.body

    const result = await Task.updateMany(
      { _id: { $in: taskIds }, userId: req.user._id },
      updates
    )

    res.json({
      success: true,
      message: `${result.modifiedCount} tasks updated successfully`,
      modifiedCount: result.modifiedCount
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while bulk updating tasks'
    })
  }
})

/**
 * @swagger
 * /api/tasks/bulk:
 *   delete:
 *     summary: Bulk delete tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskIds
 *             properties:
 *               taskIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Tasks deleted successfully
 */
router.delete('/bulk', validate(bulkDeleteSchema), async (req, res) => {
  try {
    const { taskIds } = req.body

    const result = await Task.deleteMany({
      _id: { $in: taskIds },
      userId: req.user._id
    })

    res.json({
      success: true,
      message: `${result.deletedCount} tasks deleted successfully`,
      deletedCount: result.deletedCount
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while bulk deleting tasks'
    })
  }
})

export default router
