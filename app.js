require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const Task = require('./task')

const app = express()
const port = process.env.PORT || 3000

;(async function connect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error('MongoDB connection error:', err && err.message)
  }
})()

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static('public'))

app.use((req, res, next) => {
  res.locals.alert = req.query.alert || null
  next()
})

async function loadTasks() {
  return Task.find({})
}

app.get('/', async (req, res) => {
  try {
    const tasks = await loadTasks()
    res.render('index', { tasks })
  } catch (err) {
    console.error('Failed to load tasks', err && err.message)
    res.render('index', { tasks: [], alert: 'Unable to load tasks' })
  }
})

app.post('/tasks', async (req, res) => {
  try {
    const title = req.body.title ? req.body.title.trim() : ''
    const priority = req.body.priority || 'low'
    if (!title) {
      const tasks = await loadTasks()
      return res.render('index', { tasks, alert: 'Task title cannot be empty!' })
    }
    await Task.create({ title, priority })
    res.redirect('/?alert=Task added successfully!')
  } catch (err) {
    console.error('Failed to add task', err && err.message)
    const tasks = await loadTasks()
    res.render('index', { tasks, alert: 'Could not add task' })
  }
})

app.put('/tasks/:id', async (req, res) => {
  try {
    const title = req.body.title ? req.body.title.trim() : ''
    const priority = req.body.priority || 'low'
    if (!title) {
      const tasks = await loadTasks()
      return res.render('index', { tasks, alert: 'Task title cannot be empty!' })
    }
    await Task.findByIdAndUpdate(req.params.id, { title, priority })
    const tasks = await loadTasks()
    res.render('index', { tasks, alert: 'Task updated successfully!' })
  } catch (err) {
    console.error('Failed to update task', err && err.message)
    const tasks = await loadTasks()
    res.render('index', { tasks, alert: 'Could not update task' })
  }
})

app.delete('/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id)
    const tasks = await loadTasks()
    res.render('index', { tasks, alert: 'Task deleted successfully!' })
  } catch (err) {
    console.error('Failed to delete task', err && err.message)
    const tasks = await loadTasks()
    res.render('index', { tasks, alert: 'Could not delete task' })
  }
})

app.listen(port, () => console.log(`Server running at http://localhost:${port}`))
