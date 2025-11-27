import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsAPI, tasksAPI } from '../services/api';
import type { Project, Task } from '../types';
import './ProjectDetailPage.css';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'todo' as Task['status'],
    priority: 'medium' as Task['priority'],
  });

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchTasks();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectsAPI.getOne(id!);
      setProject(response.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getAll(id);
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tasksAPI.create({
        ...taskForm,
        project: id,
      });
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', status: 'todo', priority: 'medium' });
      fetchTasks();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading...</div>;
  }

  if (!project) {
    return <div className="page-loading">Project not found</div>;
  }

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === 'todo'),
    'in-progress': tasks.filter((t) => t.status === 'in-progress'),
    review: tasks.filter((t) => t.status === 'review'),
    done: tasks.filter((t) => t.status === 'done'),
  };

  return (
    <div className="project-detail-page">
      <div className="project-header">
        <Link to="/projects" className="back-link">← Back to Projects</Link>
        <div className="project-title-section">
          <div className="project-title-color" style={{ background: project.color }}></div>
          <div>
            <h1>{project.name}</h1>
            {project.description && <p>{project.description}</p>}
          </div>
        </div>
        <button onClick={() => setShowTaskModal(true)} className="primary-button">
          + New Task
        </button>
      </div>

      <div className="kanban-board">
        {(['todo', 'in-progress', 'review', 'done'] as const).map((status) => (
          <div key={status} className="kanban-column">
            <div className="column-header">
              <h3 className="column-title">{status.replace('-', ' ')}</h3>
              <span className="column-count">{tasksByStatus[status].length}</span>
            </div>
            <div className="column-tasks">
              {tasksByStatus[status].map((task) => (
                <div key={task._id} className="task-card">
                  <div className="task-card-header">
                    <span className="task-priority" data-priority={task.priority}>
                      {task.priority}
                    </span>
                  </div>
                  <h4 className="task-card-title">{task.title}</h4>
                  {task.description && (
                    <p className="task-card-description">{task.description}</p>
                  )}
                  <div className="task-card-footer">
                    {task.assignedTo && (
                      <div className="task-assignee">
                        {task.assignedTo.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value as Task['status'])}
                      className="task-status-select"
                    >
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                  placeholder="Task title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Task description..."
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as Task['priority'] })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowTaskModal(false)} className="secondary-button">
                  Cancel
                </button>
                <button type="submit" className="primary-button">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
