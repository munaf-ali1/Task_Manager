const express = require('express');
const router = express.Router();
const { createTask, getTasks, getTaskById, updateTask, deleteTask, getTaskSummary } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getTaskSummary);

router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;
