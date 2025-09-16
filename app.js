require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const Task = require('./task')

const app = express()
const port = process.env.PORT || 3000

mongoose
  .connect(process.env.MONGODB_URI)
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error)
  })

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static('public'))

app.use((req, res, next) => {
  res.locals.alert = req.query.alert || null
  next()
})

async function renderHome(res, alertMessage = null) {
  const tasks = await Task.find({})
  res.render('index', { tasks, alert: alertMessage })
}

app.get('/', async (req, res) => {
  await renderHome(res, res.locals.alert)
})

app.post('/tasks', async (req, res) => {
  const priority = req.body.priority
  const title = (req.body.title || '').trim()
  if (!title) {
    return res.redirect('/?alert=' + encodeURIComponent('Task title cannot be empty!'))
  }
  await Task.create({ title, priority })
  res.redirect('/?alert=' + encodeURIComponent('Task added successfully!'))
})

app.put('/tasks/:id', async (req, res) => {
  const priority = req.body.priority
  const title = (req.body.title || '').trim()
  if (!title) {
    return res.redirect('/?alert=' + encodeURIComponent('Task title cannot be empty!'))
  }
  await Task.findByIdAndUpdate(req.params.id, { title, priority })
  res.redirect('/?alert=' + encodeURIComponent('Task updated successfully!'))
})

app.delete('/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id)
  res.redirect('/?alert=' + encodeURIComponent('Task deleted successfully!'))
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
