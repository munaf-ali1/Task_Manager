const Task = require('../models/Task');
const Project = require('../models/Project');

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, assignedTo, project } = req.body;
    
    // Verify project exists
    const projExists = await Project.findById(project);
    if (!projExists) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Member can only create task if they are part of the project
    if (req.user.role !== 'admin' && !projExists.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to create task in this project' });
    }

    const task = new Task({
      title,
      description,
      status: status || 'Todo',
      dueDate,
      assignedTo,
      project,
      createdBy: req.user._id,
    });

    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const projectId = req.query.projectId;
    let query = {};
    
    if (projectId) {
      query.project = projectId;
    }

    // Admin sees all requested tasks. Member only sees tasks from projects they belong to, or tasks assigned to them.
    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      
      if (projectId) {
         if(!projectIds.some(p => p.toString() === projectId)) {
             return res.status(403).json({ message: 'Not authorized to view tasks for this project' });
         }
      } else {
         query.project = { $in: projectIds };
      }
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('project', 'title')
      .populate('createdBy', 'name');
      
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('project', 'title members')
      .populate('createdBy', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role !== 'admin' && !task.project.members.some(m => m.toString() === req.user._id.toString())) {
       return res.status(403).json({ message: 'Not authorized to view this task' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, assignedTo } = req.body;
    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Permission check
    if (req.user.role !== 'admin' && !task.project.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status || task.status;
    task.dueDate = dueDate || task.dueDate;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Member can delete task if they created it, Admin can delete any
    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
       return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await Task.deleteOne({ _id: task._id });
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTaskSummary = async (req, res) => {
    try {
        let matchStage = {};
        
        if (req.user.role !== 'admin') {
            const userProjects = await Project.find({ members: req.user._id }).select('_id');
            const projectIds = userProjects.map(p => p._id);
            matchStage = { project: { $in: projectIds } };
        }

        const summary = await Task.aggregate([
            { $match: matchStage },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        // Also get overdue tasks
        const today = new Date();
        const overdueCount = await Task.countDocuments({
            ...matchStage,
            status: { $ne: 'Done' },
            dueDate: { $lt: today }
        });

        res.json({
            statusDistribution: summary,
            overdueCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}
