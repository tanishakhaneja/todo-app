require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const Task = require('./task')

const app = express()
const port = process.env.PORT || 3000

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err))

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static('public'))

app.use((req, res, next) => {
  res.locals.alert = null
  next()
})

app.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({})
    res.render('index', { tasks, alert: null })
  } catch (error) {
    res.status(500).send('Server Error')
  }
})

app.post('/tasks', async (req, res) => {
  const { title, priority } = req.body
  if (!title || title.trim() === '') {
    const tasks = await Task.find({})
    return res.render('index', { tasks, alert: 'Task title cannot be empty!' })
  }
  try {
    await Task.create({ title: title.trim(), priority })
    res.redirect('/')
  } catch (error) {
    res.status(500).send('Server Error')
  }
})


app.put('/tasks/:id', async (req, res) => {
  const { title, priority } = req.body
  if (!title || title.trim() === '') {
    const tasks = await Task.find({})
    return res.render('index', { tasks, alert: 'Task title cannot be empty!' })
  }
  try {
    await Task.findByIdAndUpdate(req.params.id, { title: title.trim(), priority })
    const tasks = await Task.find({})
    res.render('index', { tasks, alert: 'Task updated successfully!' })
  } catch (error) {
    res.status(500).send('Server Error')
  }
})

app.delete('/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id)
    const tasks = await Task.find({})
    res.render('index', { tasks, alert: 'Task deleted successfully!' })
  } catch (error) {
    res.status(500).send('Server Error')
  }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
