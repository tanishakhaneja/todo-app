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

app.use((req, res, next) => {
  res.locals.alert = req.query.alert || null
  next()
})

app.get('/', async (req, res) => {
  const tasks = await Task.find({})
  res.render('index', { tasks, alert: res.locals.alert })
})

app.post('/tasks', async (req, res) => {
  const title = (req.body.title || '').trim()
  const priority = req.body.priority
  if (!title) {
    return res.redirect('/?alert=Task title cannot be empty!')
  }
  await Task.create({ title, priority })
  res.redirect('/?alert=Task added successfully!')
})

app.put('/tasks/:id', async (req, res) => {
  const title = (req.body.title || '').trim()
  const priority = req.body.priority
  if (!title) {
    return res.redirect('/?alert=Task title cannot be empty!')
  }
  await Task.findByIdAndUpdate(req.params.id, { title, priority })
  res.redirect('/?alert=Task updated successfully!')
})

app.delete('/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id)
  res.redirect('/?alert=Task deleted successfully!')
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
