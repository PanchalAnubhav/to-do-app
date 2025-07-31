import Joi from 'joi'

export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false })
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      })
    }
    
    next()
  }
}

// User validation schemas
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  avatar: Joi.string().uri(),
  preferences: Joi.object({
    theme: Joi.string().valid('light', 'dark'),
    notifications: Joi.boolean(),
    defaultView: Joi.string().valid('list', 'grid', 'calendar')
  })
})

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
})

// Task validation schemas
export const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000),
  priority: Joi.string().valid('low', 'medium', 'high'),
  category: Joi.string().valid('short-term', 'long-term', 'custom'),
  frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'once'),
  dueDate: Joi.date(),
  tags: Joi.array().items(Joi.string().max(30))
})

export const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  description: Joi.string().max(1000),
  completed: Joi.boolean(),
  priority: Joi.string().valid('low', 'medium', 'high'),
  category: Joi.string().valid('short-term', 'long-term', 'custom'),
  frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'once'),
  dueDate: Joi.date(),
  tags: Joi.array().items(Joi.string().max(30))
})

export const bulkUpdateSchema = Joi.object({
  taskIds: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).min(1).required(),
  updates: updateTaskSchema.required()
})

export const bulkDeleteSchema = Joi.object({
  taskIds: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).min(1).required()
})
