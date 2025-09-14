require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Task = require('./task');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));

// Flash-like alerts using locals
app.use((req, res, next) => {
  res.locals.alert = null;
  next();
});

// Routes

// Get all tasks
app.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.render('index', { tasks, alert: null });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Add new task
app.post('/tasks', async (req, res) => {
  const { title, priority } = req.body;

  if (!title || title.trim() === '') {
    const tasks = await Task.find({});
    return res.render('index', { tasks, alert: 'Task title cannot be empty!' });
  }

  try {
    await Task.create({ title: title.trim(), priority });
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Update task
app.put('/tasks/:id', async (req, res) => {
  const { title, priority } = req.body;

  if (!title || title.trim() === '') {
    const tasks = await Task.find({});
    return res.render('index', { tasks, alert: 'Task title cannot be empty!' });
  }

  try {
    await Task.findByIdAndUpdate(req.params.id, { title: title.trim(), priority });
    const tasks = await Task.find({});
    res.render('index', { tasks, alert: 'Task updated successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Delete task
app.delete('/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    const tasks = await Task.find({});
    res.render('index', { tasks, alert: 'Task deleted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
