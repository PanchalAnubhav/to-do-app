import mongoose from 'mongoose'

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated task ID
 *         title:
 *           type: string
 *           description: Task title
 *         description:
 *           type: string
 *           description: Task description
 *         completed:
 *           type: boolean
 *           default: false
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           default: medium
 *         category:
 *           type: string
 *           enum: [short-term, long-term, custom]
 *           default: short-term
 *         frequency:
 *           type: string
 *           enum: [daily, weekly, monthly, once]
 *           default: once
 *         dueDate:
 *           type: string
 *           format: date-time
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         userId:
 *           type: string
 *           description: Reference to the user who owns this task
 *         completedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['short-term', 'long-term', 'custom'],
    default: 'short-term'
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'once'],
    default: 'once'
  },
  dueDate: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot be more than 30 characters']
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Index for better query performance
taskSchema.index({ userId: 1, createdAt: -1 })
taskSchema.index({ userId: 1, completed: 1 })
taskSchema.index({ userId: 1, dueDate: 1 })
taskSchema.index({ userId: 1, category: 1 })

// Update completedAt when task is marked as completed
taskSchema.pre('save', function(next) {
  if (this.isModified('completed')) {
    if (this.completed) {
      this.completedAt = new Date()
    } else {
      this.completedAt = null
    }
  }
  next()
})

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.completed) {
    return false
  }
  return new Date() > this.dueDate
})

// Ensure virtual fields are serialized
taskSchema.set('toJSON', { virtuals: true })

export default mongoose.model('Task', taskSchema)
