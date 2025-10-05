require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const Task = require('./task')

const app = express()
const port = process.env.PORT || 3000

mongoose.connect(process.env.MONGODB_URI)

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static('public'))

app.get('/', async (req, res) => {
  const tasks = await Task.find({})
  res.render('index', { tasks, alert: null })
})

app.post('/tasks', async (req, res) => {
  const title = req.body.title ? req.body.title.trim() : ''
  if (!title) {
    const tasks = await Task.find({})
    return res.render('index', { tasks, alert: 'Task title cannot be empty!' })
  }
  await Task.create({ title, priority: req.body.priority })
  res.redirect('/')
})

app.put('/tasks/:id', async (req, res) => {
  const title = req.body.title ? req.body.title.trim() : ''
  if (!title) {
    const tasks = await Task.find({})
    return res.render('index', { tasks, alert: 'Task title cannot be empty!' })
  }
  await Task.findByIdAndUpdate(req.params.id, { 
    title, 
    priority: req.body.priority 
  })
  const tasks = await Task.find({})
  res.render('index', { tasks, alert: 'Task updated successfully!' })
})

app.delete('/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id)
  const tasks = await Task.find({})
  res.render('index', { tasks, alert: 'Task deleted successfully!' })
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
