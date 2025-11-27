import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import type { Project } from '../types';
import './ProjectsPage.css';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectsAPI.create(formData);
      setShowModal(false);
      setFormData({ name: '', description: '', color: '#3b82f6' });
      fetchProjects();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create project');
    }
  };

  if (loading) {
    return <div className="page-loading">Loading...</div>;
  }

  return (
    <div className="projects-page">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p>Manage your projects and collaborate with your team</p>
        </div>
        <button onClick={() => setShowModal(true)} className="primary-button">
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h2>No projects yet</h2>
          <p>Create your first project to get started</p>
          <button onClick={() => setShowModal(true)} className="primary-button">
            Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <Link key={project._id} to={`/projects/${project._id}`} className="project-card">
              <div className="project-card-header">
                <div className="project-color-badge" style={{ background: project.color }}></div>
                <span className="project-status-badge" data-status={project.status}>
                  {project.status}
                </span>
              </div>
              <h3 className="project-card-title">{project.name}</h3>
              {project.description && (
                <p className="project-card-description">{project.description}</p>
              )}
              <div className="project-card-footer">
                <div className="project-members">
                  {project.members.slice(0, 3).map((member) => (
                    <div key={member.id} className="member-avatar" title={member.name}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {project.members.length > 3 && (
                    <div className="member-avatar more">+{project.members.length - 3}</div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="My Awesome Project"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Project description..."
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Color</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="secondary-button">
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

export default ProjectsPage;
