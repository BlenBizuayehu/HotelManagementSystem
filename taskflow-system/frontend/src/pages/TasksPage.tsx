import React, { useEffect, useState } from 'react';
import { tasksAPI, projectsAPI } from '../services/api';
import type { Task, Project } from '../types';
import './TasksPage.css';

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ projectId?: string; status?: string }>({});

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        tasksAPI.getAll(filter.projectId, filter.status),
        projectsAPI.getAll(),
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading...</div>;
  }

  return (
    <div className="tasks-page">
      <div className="page-header">
        <div>
          <h1>Tasks</h1>
          <p>View and manage all your tasks</p>
        </div>
      </div>

      <div className="tasks-filters">
        <select
          value={filter.projectId || ''}
          onChange={(e) => setFilter({ ...filter, projectId: e.target.value || undefined })}
          className="filter-select"
        >
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
        <select
          value={filter.status || ''}
          onChange={(e) => setFilter({ ...filter, status: e.target.value || undefined })}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h2>No tasks found</h2>
          <p>Create tasks in your projects to see them here</p>
        </div>
      ) : (
        <div className="tasks-list">
          {tasks.map((task) => (
            <div key={task._id} className="task-row">
              <div className="task-row-main">
                <div className="task-row-info">
                  <h3 className="task-row-title">{task.title}</h3>
                  <div className="task-row-meta">
                    <span className="task-project-badge" style={{ color: task.project.color }}>
                      {task.project.name}
                    </span>
                    <span className="task-priority-badge" data-priority={task.priority}>
                      {task.priority}
                    </span>
                    <span className="task-status-badge" data-status={task.status}>
                      {task.status}
                    </span>
                  </div>
                </div>
                {task.assignedTo && (
                  <div className="task-assignee-avatar" title={task.assignedTo.name}>
                    {task.assignedTo.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {task.description && (
                <p className="task-row-description">{task.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
