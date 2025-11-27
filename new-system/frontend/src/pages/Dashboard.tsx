import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI, tasksAPI } from '../services/api';
import type { Project, Task } from '../types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          projectsAPI.getAll(),
          tasksAPI.getAll(),
        ]);
        setProjects(projectsRes.data);
        setTasks(tasksRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === 'active').length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === 'done').length,
    inProgressTasks: tasks.filter((t) => t.status === 'in-progress').length,
    todoTasks: tasks.filter((t) => t.status === 'todo').length,
  };

  const recentTasks = tasks.slice(0, 5);

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening with your projects.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
            📁
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalProjects}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            ✅
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeProjects}</div>
            <div className="stat-label">Active Projects</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--secondary)' }}>
            📋
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalTasks}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            🔄
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.inProgressTasks}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Tasks</h2>
            <Link to="/tasks" className="view-all-link">View all</Link>
          </div>
          <div className="task-list">
            {recentTasks.length === 0 ? (
              <div className="empty-state">No tasks yet</div>
            ) : (
              recentTasks.map((task) => (
                <div key={task._id} className="task-item">
                  <div className="task-info">
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">
                      <span className="task-project" style={{ color: task.project.color }}>
                        {task.project.name}
                      </span>
                      <span className="task-status" data-status={task.status}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Projects</h2>
            <Link to="/projects" className="view-all-link">View all</Link>
          </div>
          <div className="project-list">
            {projects.slice(0, 5).length === 0 ? (
              <div className="empty-state">No projects yet</div>
            ) : (
              projects.slice(0, 5).map((project) => (
                <Link key={project._id} to={`/projects/${project._id}`} className="project-item">
                  <div className="project-color" style={{ background: project.color }}></div>
                  <div className="project-info">
                    <div className="project-name">{project.name}</div>
                    <div className="project-status" data-status={project.status}>
                      {project.status}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
