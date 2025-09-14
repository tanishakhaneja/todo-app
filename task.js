const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  priority: { type: String, enum: ['low', 'high', 'urgent'], default: 'low' },
});

module.exports = mongoose.model('Task', taskSchema);