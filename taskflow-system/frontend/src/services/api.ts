import axios from 'axios';
import type { AuthResponse, Project, Task, User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register', { name, email, password });
    if (data.success && data.data.token) {
      localStorage.setItem('token', data.data.token);
    }
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success && data.data.token) {
      localStorage.setItem('token', data.data.token);
    }
    return data;
  },

  getMe: async (): Promise<{ success: boolean; data: { user: User } }> => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

// Projects API
export const projectsAPI = {
  getAll: async (): Promise<{ success: boolean; data: Project[] }> => {
    const { data } = await api.get('/projects');
    return data;
  },

  getOne: async (id: string): Promise<{ success: boolean; data: Project }> => {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  },

  create: async (project: Partial<Project>): Promise<{ success: boolean; data: Project }> => {
    const { data } = await api.post('/projects', project);
    return data;
  },

  update: async (id: string, project: Partial<Project>): Promise<{ success: boolean; data: Project }> => {
    const { data } = await api.put(`/projects/${id}`, project);
    return data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.delete(`/projects/${id}`);
    return data;
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (projectId?: string, status?: string): Promise<{ success: boolean; data: Task[] }> => {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (status) params.append('status', status);
    const { data } = await api.get(`/tasks?${params.toString()}`);
    return data;
  },

  getOne: async (id: string): Promise<{ success: boolean; data: Task }> => {
    const { data } = await api.get(`/tasks/${id}`);
    return data;
  },

  create: async (task: Partial<Task>): Promise<{ success: boolean; data: Task }> => {
    const { data } = await api.post('/tasks', task);
    return data;
  },

  update: async (id: string, task: Partial<Task>): Promise<{ success: boolean; data: Task }> => {
    const { data } = await api.put(`/tasks/${id}`, task);
    return data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
  },
};

export default api;
