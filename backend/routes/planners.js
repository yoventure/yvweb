const express = require('express');
const router = express.Router();
const Planner = require('../models/Planner');

// 获取所有行程
router.get('/', async (req, res) => {
  try {
    const planners = await Planner.find();
    res.status(200).json(planners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 创建新行程
router.post('/', async (req, res) => {
  const { user, date, itinerary } = req.body;
  try {
    const newPlanner = new Planner({ user, date, itinerary });
    await newPlanner.save();
    res.status(201).json(newPlanner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
