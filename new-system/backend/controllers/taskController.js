import Task from '../models/Task.js';
import Project from '../models/Project.js';

export const getTasks = async (req, res) => {
  try {
    const { projectId, status } = req.query;
    const query = {};

    if (projectId) {
      // Verify user has access to project
      const project = await Project.findOne({
        _id: projectId,
        $or: [
          { owner: req.user.id },
          { members: req.user.id },
        ],
      });

      if (!project) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this project',
        });
      }

      query.project = projectId;
    }

    if (status) {
      query.status = status;
    }

    const tasks = await Task.find(query)
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Verify user has access to project
    const project = await Project.findOne({
      _id: task.project._id,
      $or: [
        { owner: req.user.id },
        { members: req.user.id },
      ],
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task',
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createTask = async (req, res) => {
  try {
    // Verify user has access to project
    const project = await Project.findOne({
      _id: req.body.project,
      $or: [
        { owner: req.user.id },
        { members: req.user.id },
      ],
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create tasks in this project',
      });
    }

    const task = await Task.create({
      ...req.body,
      createdBy: req.user.id,
    });

    await task.populate('project', 'name color');
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Verify user has access to project
    const project = await Project.findOne({
      _id: task.project,
      $or: [
        { owner: req.user.id },
        { members: req.user.id },
      ],
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task',
      });
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Verify user has access to project
    const project = await Project.findOne({
      _id: task.project,
      $or: [
        { owner: req.user.id },
        { members: req.user.id },
      ],
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task',
      });
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
