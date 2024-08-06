const mongoose = require('mongoose');

const PlannerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: Date,
    required: true
  },
  itinerary: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Planner', PlannerSchema);
